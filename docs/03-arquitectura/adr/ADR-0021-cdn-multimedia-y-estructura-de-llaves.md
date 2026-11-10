# ADR-0021 — CDN propio para multimedia (`media.<BASE_DOMAIN>`) y estructura de llaves de S3

- **Estado:** Propuesta (pendiente de aprobación del Grupo 24; **sin cambios de código todavía**)
- **Fecha:** 2026-10-16
- **Decisores:** Grupo 24 (media-service / infraestructura / app móvil)
- **Decisiones relacionadas:** ADR-0016 (diseño detallado), ADR-0018 (fase 1); `infraestructura.md` (buckets, CloudFront); `entornos-y-variables.md` §URLs; RNF-08 (acceso a objetos solo por URL firmada); UC-05

## Contexto

Hoy la multimedia (UC-05) funciona así:

1. La app pide `POST /media/uploads` y sube con `PUT` a una **URL prefirmada de S3** (`S3_PUBLIC_ENDPOINT`).
2. `media-service` modera el archivo y devuelve en `MediaAsset.url` una **URL prefirmada de lectura** (`GET`, TTL corto) directamente contra S3/MinIO.
3. La llave es `media/<ownerId>/<mediaId>/original` (código: `media-asset.entity.ts`).

Problemas detectados en las pruebas de esta sesión:

- **Las URLs apuntan al host de S3/MinIO.** En local salían como `http://localhost:9000/…`, inalcanzable desde un teléfono; hubo que fijar `S3_PUBLIC_ENDPOINT` a la IP LAN. En AWS apuntarían a `bandada-<env>-media.s3.<región>.amazonaws.com`: sin caché de borde, sin dominio propio y con la región/nombre del bucket filtrados al cliente.
- **Sin CDN para imágenes.** Todo el tráfico de lectura del feed va a S3 (latencia, costo por request, sin compresión/`Cache-Control` controlados). `infraestructura.md` ya usa CloudFront para API, landing, app y panel, pero **no** para multimedia.
- **Doc y código divergen.** `infraestructura.md` documenta `uploads/<ownerId>/<mediaId>/original`, `…/thumb.jpg`, `…/frames/`; el código escribe `media/<ownerId>/<mediaId>/original`. No hay convención para el *propósito* del archivo (post, avatar, portada de evento, grupo) ni para variantes (miniaturas, tamaños).
- **Contenido sin moderar y moderado conviven en el mismo prefijo.** Con un CDN delante, cualquier objeto bajo el origen sería servible; hace falta separar lo no aprobado.
- La URL cambia en cada lectura (firma distinta) → el caché de imágenes del cliente (`expo-image`) no puede reutilizarlas.

## Decisión

### 1. Dominio y CDN de multimedia

- Un dominio dedicado **`media.<BASE_DOMAIN>`** (prod `media.bandadau.com`, dev `media.dev.bandadau.com`, local `media.bandada.localhost`), siempre parametrizado con `${BASE_DOMAIN}` (regla 4 de `bandadau-infra/AGENTS.md`).
- **CloudFront** (misma PriceClass_100 que el resto) con **OAC** hacia el bucket privado `bandada-<env>-media`. El bucket sigue privado: nunca lectura anónima.
- Certificado ACM `*.BASE_DOMAIN` (ya contemplado), registro Route 53 `media` → distribución.
- **Lecturas** por CDN; **subidas** siguen siendo `PUT` prefirmado directo a S3 (`S3_PUBLIC_ENDPOINT`), porque CloudFront no aporta nada a la escritura y mantiene el flujo actual (checksum, `Content-Type`, límites).
- `MediaAsset.url` / `thumbnailUrl` pasan a ser URLs `https://media.<BASE_DOMAIN>/…`. **El contrato no cambia** (siguen siendo strings); no hay cambio en `bandadau-frontend`.

### 2. Acceso: URLs firmadas de CloudFront (no públicas)

Se mantiene RNF-08 (acceso solo por URL firmada). Se firman con **CloudFront signed URLs** (key group, clave en Secrets Manager/SSM) en lugar de S3 prefirmado:

- Los parámetros de firma (`Expires`, `Signature`, `Key-Pair-Id`) **no forman parte de la llave de caché** de CloudFront, así que firmar por lectura **no destruye el *hit ratio***.
- Los objetos de variantes son **inmutables** (la llave incluye el `mediaId`): `Cache-Control: public, max-age=31536000, immutable` en el origen.
- Para que el cliente también cachee, `media-service` firma con **ventanas de tiempo redondeadas** (p. ej. al próximo múltiplo de 1 h) de modo que la misma imagen produzca la misma URL durante la ventana; la app usa `cacheKey` = `mediaId` en `expo-image` para no depender de la firma.
- **Puerto `MediaUrlSigner`** en `media-service` con dos adaptadores: `CloudFrontUrlSigner` (dev/prod) y `S3PresignUrlSigner` (local con MinIO, que no tiene CloudFront). En local, `media.bandada.localhost` es un router de Traefik hacia MinIO.
- Variable nueva `MEDIA_CDN_ENDPOINT` (por entorno; local por defecto `${S3_PUBLIC_ENDPOINT}/bandada-media`, para que los teléfonos usen `LAN_HOST` y no `*.localhost`).

### 3. Estructura de llaves

Principios: (a) **la llave no cambia nunca** una vez escrita (permite `immutable`); (b) el **propietario va primero**, lo que da borrado por prefijo (derecho al olvido, baja de cuenta) y políticas IAM por prefijo; (c) **separar «pendiente» de «aprobado»**; (d) el nivel de «post» se expresa con `<purpose>` = `posts`, **no** con el `postId`: el archivo se sube *antes* de que exista el post y puede no publicarse nunca, así que el vínculo post↔media vive en la base de datos (`Post.media[]`); (e) la raíz `uploads/` conserva el nombre que ya documentaba `infraestructura.md` y deja espacio para otras raíces futuras (`derived/`, `exports/`), mientras `media/` conserva la palabra que usa el código hoy; (f) el prefijo del UUIDv7 (ordenado en el tiempo) no concentra carga en S3, que escala por prefijo.

```
bandada-<env>-media/
└── uploads/                                        ← raíz única del contenido de usuarios
    ├── incoming/<ownerId>/<mediaId>/original       ← subida prefirmada; NO servible por el CDN
    └── media/<ownerId>/<purpose>/<mediaId>/        ← sólo contenido aprobado; origen del CDN
        ├── original
        ├── thumb.jpg                                   (miniatura)
        ├── w640.webp  w1080.webp                       (variantes responsive, fase 2)
        ├── poster.jpg                                  (video)
        └── hls/…                                       (video, fase 2)
```

- `purpose` ∈ `posts` · `avatars` · `events` · `groups` (los mismos valores del enum `purpose` del contrato; ampliar el enum requiere cambio de contrato primero).
- **Flujo:** `create-upload` firma el `PUT` a `uploads/incoming/…`; `complete` verifica *magic bytes*/tamaño; al **aprobar** la moderación se **copia** a `uploads/media/…` (servidor a servidor) y se borra el original en `uploads/incoming/`. Un objeto rechazado nunca llega a `uploads/media/`, por lo tanto **nunca es alcanzable por el CDN**.
- **Reglas de ciclo de vida (S3):** `uploads/incoming/` expira a los 2 días (subidas abandonadas), aborta multipart incompletos a 1 día; `uploads/media/` pasa a *Intelligent-Tiering* tras 30 días.
- El CDN solo expone el *behavior* `/uploads/media/*` (el origen path del `uploads/incoming/` no está mapeado).
- `bandada-public` (modelos on-device, portadas públicas) se mantiene; si más adelante se sirve con CDN usa `media.<BASE_DOMAIN>/public/*` o su propio dominio, fuera del alcance de este ADR.

### 4. Alcance de implementación (posterior a la aprobación)

No se toca código en esta sesión. Al aprobarse:

| Repo | Cambio |
|---|---|
| `bandadau-docs` | Actualizar `infraestructura.md` (bucket, llaves, CDN), `entornos-y-variables.md` (`MEDIA_CDN_ENDPOINT`, fila «Objetos»), `catalogo-servicios.md` (media-service), el UC-05 y la trazabilidad |
| `bandadau-backend/services/media-service` | `storageKey` nueva en `create-upload`, `MediaUrlSigner` (puerto + 2 adaptadores), copia `incoming → media` al aprobar, borrado por prefijo, pruebas de arquitectura/unitarias |
| `bandadau-infra` | Router Traefik `media.bandada.localhost`, `minio/init.sh` (prefijos, lifecycle), `.env.example`, plantilla CloudFormation (distribución + OAC + key group + registro DNS) |
| `bandadau-frontend` | Solo `cacheKey` por `mediaId` en las imágenes del feed (opcional) |

## Alternativas consideradas

| Alternativa | Motivo de descarte |
|---|---|
| Mantener S3 prefirmado (estado actual) | Sin caché de borde, URLs inestables (no cacheables en el cliente), bucket y región expuestos; no escala al feed |
| Bucket/CDN **público** | Rompe RNF-08 y la visibilidad `FOLLOWERS`/`GROUP`; imposible retirar contenido rechazado o privado |
| Cookies firmadas de CloudFront | Funcionan para web, pero la app nativa y `expo-image` manejan URLs mejor que cookies cross-site |
| Llave `uploads/media/<ownerId>/posts/<postId>/…` (postId en la llave) | El `postId` no existe al subir; el archivo puede reutilizarse (avatar) o no llegar a publicarse |
| Llave `<tipo>/<fecha>/<id>` (por fecha) | Borrado por usuario costoso (requiere consultar la base); política por prefijo inviable |
| Subir directo a `uploads/media/` y filtrar por estado en la base | Contenido sin moderar queda en un prefijo servible; un error de configuración lo expondría |
| Un bucket para `incoming` y otro para `media` | Más IAM/costo; un solo bucket con prefijos y política por prefijo basta |

## Consecuencias

- (+) Imágenes con dominio propio, HTTPS, caché de borde y ahorro de requests a S3; la capa gratuita de CloudFront (1 TB) cubre la demo.
- (+) El contenido no moderado no puede servirse por construcción; borrado de cuenta = borrar `uploads/media/<ownerId>/` y `uploads/incoming/<ownerId>/`.
- (+) Resuelve el problema de `localhost:9000` en dispositivos: la URL pública del origen sale de `MEDIA_CDN_ENDPOINT`, no de `S3_PUBLIC_ENDPOINT`.
- (+) Convención única, documentada y alineada con el código (corrige la divergencia `uploads/` vs `media/`).
- (−) Un paso extra (copia `incoming → media`) y una clave de firma de CloudFront que rotar/guardar.
- (−) Los objetos ya existentes (`media/<ownerId>/<id>/original`) no cambian de llave solos: en dev se reseembra (`make reset && make seed`); `storageKey` se guarda en la base, por lo que las llaves antiguas siguen resolviéndose con un adaptador de compatibilidad hasta migrarlas.
- (−) El orden de despliegue importa: infra (CDN + política) → media-service → docs/contratos.

## Referencias

- `bandadau-docs/docs/05-infraestructura/infraestructura.md` (buckets, CloudFront, estáticos con OAC)
- `bandadau-docs/docs/05-infraestructura/entornos-y-variables.md` (fila «Objetos (URLs prefirmadas)»)
- `bandadau-backend/services/media-service/src/entities/media-asset.entity.ts` (`storageKey`)
- `bandadau-infra/docker-compose.yaml` (`S3_PUBLIC_ENDPOINT`, `media-service`)
