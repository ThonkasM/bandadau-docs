# ADR-0020 — Índice GSI3 de `bandada-ticketing` para ordenar entradas por fecha de adquisición

- **Estado:** Aceptada
- **Fecha:** 2026-10-15
- **Decisores:** Grupo 24 (backend ticketing / app móvil)
- **Decisiones relacionadas:** ADR-0004 (outbox/inbox), ADR-0018 (decisiones fase 1); `catalogo-servicios.md` §6; UC-12

## Contexto

`GET /api/v1/tickets/me` lista las entradas del usuario. Hasta ahora el contrato solo ofrecía un orden
—por fecha del evento ascendente— porque el índice GSI1 guarda `gsi1sk = STARTS#<eventStartsAt>#<id>`.
La app ahora ofrece un filtro **Recientes / Por fecha**: «Recientes» es por **fecha de adquisición**
(`issuedAt`) descendente, que no se puede derivar de `eventStartsAt` (un ticket comprado después puede ser
para un evento que ocurre antes). DynamoDB solo ordena por la *sort key* de un índice, así que el orden
global por `issuedAt` requiere un índice cuyo *sort key* contenga esa fecha.

## Decisión

Añadimos un tercer índice global secundario (GSI3) a la tabla `bandada-ticketing`:

- `gsi3pk = USER#<userId>`, `gsi3sk = ISSUED#<issuedAt ISO>#<id>`.
- `GET /tickets/me?sort=` acepta `eventDate` (**por defecto**, GSI1, `ScanIndexForward=true`) y
  `recent` (GSI3, `ScanIndexForward=false`); el cursor sigue siendo opaco y valida el índice de origen.
- El contrato sube a `ticketing-service.yaml` 1.3.0 con el enum `TicketSort` y el parámetro `sort`.

Se actualiza `catalogo-servicios.md` §6 con la descripción real de GSI1/GSI2/GSI3 de la tabla.

## Alternativas consideradas

| Alternativa | Motivo de descarte |
|---|---|
| Ordenar en memoria todas las entradas del usuario | Rompe la paginación por cursor y no acota la lectura (RNF de eficiencia); GSI3 es una consulta acotada a la partición del usuario |
| Paginación por *offset* | Inestable ante altas/bajas; DynamoDB no expone offset |
| GSI3 sobre `pk = USER#<userId>` con `sk = ISSUED#…` (elegida) | Índice limpio y aislado; no sobrecarga GSI1/GSI2 |
| Guardar `issuedAt` dentro de `gsi1sk` | El orden por evento debe seguir siendo primario en GSI1; ambos órdenes son necesarios a la vez |

## Consecuencias

- (+) Orden global por adquisición sin leer la partición completa; cursor estable; sin cambios en el dominio.
- (+) Se puede agregar `sort=recent` a futuros listados sin tocar el modelo de la entidad.
- (−) Las entradas escritas **antes** de este cambio no tienen `gsi3*` y no aparecen en `sort=recent`
  hasta ser reemitidas; en dev se resuelve recreando la tabla y re-sembrando (`make reset && make seed`).
- (−) Una GSI más por tabla (proyección `ALL`): costo de almacenamiento/escritura marginal con `PAY_PER_REQUEST`
  (mismo orden de magnitud que GSI1/GSI2).

## Referencias

- `bandadau-docs/contracts/openapi/ticketing-service.yaml` (`listMyTickets`, `TicketSort`)
- `bandadau-docs/docs/03-arquitectura/catalogo-servicios.md` §6
- `bandadau-backend/services/ticketing-service` (repositorio Dynamo, `toTicketItem`)
- `bandadau-infra/dynamodb/tables/ticketing.json`
