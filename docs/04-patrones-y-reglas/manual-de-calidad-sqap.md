# Manual de Calidad — SQAP de Bandada U

**Plan de Aseguramiento de la Calidad del Software (SQAP, *Software Quality Assurance Plan*)**
Estructura basada en **IEEE 730** · modelo de calidad de producto **ISO/IEC 25010** · metodología **ICONIX**

| Campo | Detalle |
|---|---|
| Código | MC-BU-001 |
| Proyecto | Bandada U — red social para estudiantes universitarios (Ingeniería de Software II, Grupo 24) |
| Versión | 1.0 |
| Fecha de medición de la evidencia | 2026-11-10 |
| Alcance | Los 9 repositorios del workspace (`bandadau-docs`, `-shared`, `-backend`, `-frontend`, `-admin`, `-landing`, `-infra`, `-ml`, `-brand`) |
| Integrantes | Jorge Carvajal · Cesar Caballero · Diego Yebara |
| Documentos hermanos | `definition-of-done.md`, `testing-strategy.md`, `convenciones-generales.md`, `02-iconix/08-revisiones.md`, `06-plan/deuda-tecnica.md` |

---

## 1. Introducción

Este manual define **cómo el equipo planifica, ejecuta, mide y mejora la calidad de Bandada U**: una plataforma con
9 microservicios en tres lenguajes (Spring Boot, NestJS, Laravel), una app Expo (iOS, Android, PWA), un panel de
administración con microfrontends (Angular y React), una landing, un paquete compartido `@bandada/*`, una
infraestructura Docker Compose/Traefik y notebooks de ML. No reemplaza a los documentos normativos del proyecto: los
**ordena bajo la estructura de un SQAP** y declara qué evidencia existe y cuál falta.

### 1.1. Convenciones de veracidad

- Las cifras de **resultados** provienen de ejecuciones reales del 2026-11-10 sobre los repositorios locales y se
  citan con su comando de origen (§1.2).
- Lo que es **meta o supuesto** se marca **(S)**. Una meta no es un resultado alcanzado.
- Lo que **no se pudo ejecutar** se declara como tal; no se infiere que pasa.
- Las actividades definidas en los documentos del proyecto pero **sin evidencia de ejecución** se declaran
  *definidas, no evidenciadas*.

### 1.2. Estado verificado de la evidencia (ejecución del 2026-11-10)

Comando usado en cada caso: `pnpm test` (Jest o Vitest, según el componente) desde la carpeta del componente.

| Componente | Resultado observado |
|---|---|
| `backend/social-service` | 5 suites, 19 pruebas, todas aprobadas |
| `backend/media-service` | 5 suites, 40 pruebas, todas aprobadas |
| `backend/ticketing-service` | 7 suites, 45 pruebas, todas aprobadas |
| `backend/admin-gateway` | 1 suite, 11 pruebas, todas aprobadas |
| `backend/insights-service` | 11 suites, 286 pruebas, todas aprobadas |
| `frontend` (Expo) | 15 suites, 78 pruebas, todas aprobadas; `typecheck` y `lint` sin errores |
| `landing` | 3 archivos, 22 pruebas, todas aprobadas; `typecheck` sin errores |
| `admin/shell` | 5 archivos, 12 pruebas, todas aprobadas |
| `admin/mfe-moderation` | 6 archivos, 44 pruebas, todas aprobadas |
| `admin/mfe-insights` | 10 archivos, 92 pruebas, todas aprobadas |
| `shared` (7 paquetes) | 138 aprobadas y 49 omitidas (*skipped*) entre `idempotency-ts` y `messaging-ts`; no se verificó el motivo de las omitidas |
| **Total ejecutado** | **787 pruebas aprobadas, 0 fallidas, 49 omitidas** |

**No ejecutado en esta medición** (el entorno local no lo permite; no deben leerse como aprobados):

| Componente | Motivo |
|---|---|
| `backend/identity-service`, `backend/events-service` (Java) | Gradle exige JDK 25 y solo hay JDK 17 instalado |
| `backend/wallet-service`, `backend/notification-service` (PHP) | PHP no está instalado en la máquina de medición |
| `bandadau-ml` (pytest) | `pytest` no instalado; el repo tiene 2 archivos de prueba |

**Otras aclaraciones de honestidad técnica:**

1. **No se midió cobertura de código** en esta ejecución. Los mínimos de `testing-strategy.md` §2 (80 % en dominio y
   casos de uso del backend, 60 % en frontends) son **metas (S)**, no resultados.
2. Las pruebas de **contrato (Schemathesis/Pact), E2E (Playwright/Maestro), carga (k6) y de caos de la SAGA** están
   definidas en `testing-strategy.md`; **esta medición no las ejecutó**.
3. Las **revisiones ICONIX** (RR/PDR/CDR/DR): según `02-iconix/08-revisiones.md` (estado del 2026-10-14) solo
   UC-01, UC-02 y UC-03 tienen actas retroactivas, aprobadas por agentes y **pendientes de refrendo humano**; el
   resto figura como *Pendiente*. Es la brecha de proceso más grande del proyecto (§4.6).
4. Tamaño de la documentación normativa: 30 RF, 21 RNF, 24 casos de uso, 28 ADR (`ls adr`, contando el índice).

---

## 2. Misión, visión y valores de calidad

**Misión.** Construir una red social universitaria **verificada, tolerante a fallos y utilizable sin conexión**,
donde la inscripción pagada a un evento y los pagos sean correctos aunque falle un servicio o se repita una petición.

**Visión.** Que Bandada U sea demostrable de punta a punta (app, panel, SAGA multinube, asistente offline) con
evidencia automatizada y trazable a cada requisito.

**Valores y su expresión práctica:**

| Valor | En la práctica |
|---|---|
| Contract-first | Nada se implementa si no está en `bandadau-docs/contracts/` |
| Trazabilidad | RF → UC → contrato → componente → prueba (`07-trazabilidad.md`) |
| Idempotencia | `Idempotency-Key`, inbox y outbox en todo efecto |
| Honestidad técnica | Se documenta la deuda (`deuda-tecnica.md`) y no se declara lo no medido |
| Accesibilidad y consistencia visual | Solo tokens de diseño, modo claro/oscuro y UI bilingüe vía i18n |
| Cero secretos en git | `.env.example`, nunca `.env` |

---

## 3. Estándares aplicados

| Estándar | Cómo se aplica en Bandada U |
|---|---|
| **IEEE 730** | Estructura de este SQAP (sección 4) y de las actividades de aseguramiento |
| **ISO/IEC 25010** | Modelo de calidad del producto (§3.1) |
| **ICONIX** | Proceso de desarrollo: fases, reglas de robustez, revisiones RR/PDR/CDR/DR (`02-iconix/`) |
| **IEEE 829** | Guía de contenido para la documentación de pruebas (`testing-strategy.md`, pruebas de aceptación Given/When/Then por UC) |
| **IEEE 830 / ISO 29148** (referencia) | Guía para RF/RNF numerados (`01-requisitos/`) |
| **IEEE 1016** (referencia) | Guía para la descripción de diseño (`03-arquitectura/`, secuencias y clases por UC) |
| **ISO/IEC/IEEE 16085** (referencia) | Gestión de riesgos (§4.14) |
| **C4 + ADR** | Documentación de arquitectura y decisiones (`adr/`) |
| **OpenAPI 3 / AsyncAPI / GraphQL / CloudEvents 1.0** | Contratos técnicos |
| **RFC 9457 (Problem Details)** | Formato de errores REST |
| **OWASP Top 10** (referencia) | Lista de seguridad (§4.5.1); no se declara cumplimiento formal de ASVS |
| **Conventional Commits** (referencia) | Mensajes de commit por repositorio (`convenciones-generales.md`) |

No se declara certificación ni evaluación formal por terceros de ningún estándar.

### 3.1. ISO/IEC 25010: características, cómo se aseguran y evidencia

| Característica | Cómo se asegura | Evidencia |
|---|---|---|
| Adecuación funcional | Pruebas de aceptación Given/When/Then por UC; matriz de trazabilidad; guion de defensa | 787 pruebas aprobadas (§1.2); `07-trazabilidad.md` |
| Eficiencia de desempeño | RNF-01/02 (p95 REST < 300/600 ms; SAGA < 3 s p95); métrica `saga_duration_seconds`; k6 definido | Definido, **no medido** (§1.2.2) |
| Compatibilidad | Contratos versionados; tipos generados `@bandada/contracts-ts`; compatibilidad hacia atrás de eventos | `contracts/`, `pnpm contracts:gen`, `make contracts-lint` |
| Usabilidad | UI bilingüe, tokens, modo claro/oscuro, objetivos táctiles ≥ 44 px (RNF-17); `i18n:check` | `i18n:check` en CI; WCAG con axe **definido, no evidenciado** |
| Fiabilidad | SAGA con compensaciones y timeouts; outbox/inbox; cola offline con reintentos; degradación elegante (RNF-03/04) | `saga-inscripcion-evento.md`; suite SAGA S1–S10 **definida, no ejecutada aquí** |
| Seguridad | JWT RS256/JWKS, Argon2id, tokens de servicio, `/internal` no expuesto, rate limit, bucket privado con URLs prefirmadas, roles verificados en backend | `seguridad-y-sso.md`; D-7, D-16 cerrados en `deuda-tecnica.md` |
| Mantenibilidad | Arquitectura por servicio (Hexagonal/Clean/DDD) con pruebas de arquitectura; TypeScript estricto; ESLint | Script `pnpm arch` en CI de los servicios Node; `typecheck` y `lint` limpios en `frontend` |
| Portabilidad | Todo en contenedores; configuración por variables; `make up` | `bandadau-infra/Makefile`, `.env.example` por repo |

---

## 4. Plan de Aseguramiento de la Calidad del Software

### 4.1. Propósito y alcance

Asegurar que cada incremento (caso de uso) cumpla sus requisitos, respete el catálogo y los contratos, y deje
evidencia verificable. Aplica a código, contratos, documentación e infraestructura de los 9 repositorios.

### 4.2. Documentos de referencia

| Documento | Para qué sirve en calidad |
|---|---|
| `03-arquitectura/catalogo-servicios.md` | Fuente de verdad técnica (servicios, puertos, colas, roles) |
| `03-arquitectura/decisiones-clave.md` y `adr/` | Decisiones normativas |
| `04-patrones-y-reglas/definition-of-done.md` | Criterios de aceptación de cada entrega |
| `04-patrones-y-reglas/testing-strategy.md` | Pirámide, herramientas, CI |
| `04-patrones-y-reglas/convenciones-generales.md` y guías de arquitectura | Estándares de código y estructura |
| `02-iconix/00-metodologia-iconix.md`, `08-revisiones.md` | Proceso y revisiones |
| `01-vision/cumplimiento-catedra.md` | Qué requisito de la cátedra cubre cada pieza |
| `06-plan/` (`roadmap-y-sprints`, `deuda-tecnica`, `registro-de-sesiones`) | Planificación, deuda y bitácora |

### 4.3. Gestión

#### 4.3.1. Organización y roles

Organización por **dueños de componente**: cada persona es dueña humana de sus componentes y **revisa y aprueba lo
que producen los agentes de IA** en ellos (`roadmap-y-sprints.md` §5).

| Rol | Responsabilidad de calidad | Componentes |
|---|---|---|
| Líder técnico / arquitecto ICONIX | Catálogo, ADR, contratos, revisiones RR/PDR/CDR/DR, trazabilidad; **todo cambio de contrato exige su revisión humana** | `bandadau-docs` |
| Backend Java | Calidad de identity y events; SAGA | identity, events |
| Backend PHP | Calidad de wallet y notification | wallet, notification |
| Backend TS + ML | Calidad de social, media, ticketing y modelos | social, media, ticketing, `bandadau-ml` |
| Frontend / móvil | App, panel, landing, tokens, i18n | `-frontend`, `-admin`, `-landing`, `-shared` (ui-tokens, i18n) |
| Plataforma + IA | Infra, CI/CD, observabilidad, insights, admin-gateway | `-infra`, insights, admin-gateway |

**Rol funcional de aseguramiento de la calidad.** No hay una persona exclusiva de QA. La **independencia** se
logra por regla de proceso: quien produce un cambio (persona o agente) **no es quien lo aprueba**; lo aprueba el
dueño del componente (§4.6). **(S)** Que esta separación se cumpla en cada PR no está medido.

#### 4.3.2. Tareas de aseguramiento por fase ICONIX

| Fase | Tarea de calidad | Responsable | Evidencia |
|---|---|---|---|
| 1 · Requisitos | Revisión RR: sustantivos en el dominio, RF/RNF enlazados | Equipo | Acta en `08-revisiones.md` |
| 2 · Robustez | Revisión PDR: reglas de robustez, tabla objeto→componente | Líder + dueños | Acta |
| 3 · Secuencia | Revisión CDR: mensajes presentes en contratos; secuencia con componentes reales | Líder + dueños | Acta; `make contracts-lint` |
| 4 · Implementación | DoD §0 + sección aplicable; pruebas de aceptación automatizadas | Dueño del componente | CI verde; PR con checklist |
| Cierre | Revisión DR; trazabilidad; entrada en registro de sesiones | Equipo | `07-trazabilidad.md`, `registro-de-sesiones.md` |

#### 4.3.3. Recursos (S)

Herramientas gratuitas o de bajo costo: GitHub y GitHub Actions, Docker, pnpm, Jest/Vitest/Pest/JUnit, Spectral,
Schemathesis, k6. Infraestructura con costo acotado (RNF-18). El tiempo dedicado a QA no está registrado.

### 4.4. Documentación

#### 4.4.1. Requisitos mínimos

| Documento | Ubicación | Estado |
|---|---|---|
| Requisitos funcionales (RF-01…RF-30) y no funcionales (RNF-01…RNF-21) | `02-iconix/01-requisitos/` | Existe |
| Modelo de dominio | `02-iconix/02-modelo-dominio.md` | Existe (normativo) |
| Casos de uso UC-01…UC-24 (narrativa, robustez, secuencia, clases, aceptación) | `02-iconix/03-casos-de-uso/` | Existe |
| Prototipos GUI | `02-iconix/05-prototipos-gui.md` | Existe |
| Contratos (OpenAPI, AsyncAPI, GraphQL, MCP) | `contracts/` | Existe; `make contracts-lint` |
| Arquitectura y ADR | `03-arquitectura/` | Existe |
| Plan de pruebas | `testing-strategy.md` | Existe |
| Trazabilidad | `02-iconix/07-trazabilidad.md` | Existe; estados P/C/I/V |
| Registro de sesiones y deuda técnica | `06-plan/` | Existe |

Control: todo está en Git por repositorio; un commit **nunca cruza repositorios**; un cambio de contrato se hace
primero en `bandadau-docs` y luego en cada consumidor con `Refs bandadau-docs@<sha>`.

### 4.5. Estándares, prácticas, convenciones y métricas

#### 4.5.1. Reglas no negociables (verificables en revisión)

1. Contract-first. 2. No implementar un UC anterior al estado «Secuencia». 3. Database per service.
4. Respetar la arquitectura asignada; el dominio no importa frameworks. 5. Idempotencia siempre.
6. Identificadores en inglés; documentación en español; UI solo vía i18n y estilos solo con tokens.
7. Sin secretos en git. 8. Verificar APIs de librerías contra la documentación oficial de la versión instalada.
9. No cambiar el catálogo sin ADR. 10. Cerrar cada sesión documentando (UC, trazabilidad, registro).

Seguridad (lista de comprobación mínima): autenticación y roles en el backend (no solo en la UI), errores sin datos
sensibles, validación de entrada que rechaza campos extra, rate limit en autenticación, secretos fuera del repo.

#### 4.5.2. Métricas

| Métrica | Fuente | Valor actual | Meta (S) |
|---|---|---|---|
| Pruebas automatizadas aprobadas | `pnpm test` por componente | 787 aprobadas, 0 fallidas (§1.2) | 0 fallidas |
| Pruebas omitidas (*skipped*) | Misma ejecución | 49 | 0 sin issue enlazado |
| Cobertura dominio/casos de uso | Jest/Vitest `--coverage`, JaCoCo, Pest | **No medida** | ≥ 80 % backend; ≥ 60 % frontends (RNF-15: ≥ 70 % dominio/aplicación) |
| Errores de lint y typecheck | `lint`, `typecheck` | 0 en `frontend` y `landing` | 0 |
| UC con revisión formal completa | `08-revisiones.md` | 3 de 24 con actas retroactivas sin refrendo humano | 24 de 24 antes de la DR |
| RF en estado **V** (verificado) | `07-trazabilidad.md` | Ver el documento (se actualiza por sesión) | 100 % de los Must en la DR |
| Hallazgos de contrato cerrados | `deuda-tecnica.md` D-1…D-17 | 17 de 17 marcados como hechos | — |
| Latencia p95, duración de SAGA | k6, `saga_duration_seconds` | **No medida** | RNF-01/02 |

### 4.6. Revisiones y auditorías

| Revisión | Cuándo | Quién | Entrada | Salida |
|---|---|---|---|---|
| RR, PDR, CDR | Fases 1–3 de ICONIX | Equipo / líder + dueños | Checklists de `08-revisiones.md` | Acta aprobada o con observaciones |
| DR | Por release y final (2026-11-09) | Equipo + docente | Todo el alcance + guion de defensa | Acta; trazabilidad sin huecos |
| Revisión de PR | Cada cambio | Dueño del componente (distinto del autor) | DoD §0 + sección aplicable | Aprobado / cambios solicitados |
| Auditoría de la app Expo | Puntual | Equipo | `auditoria-app-expo.md` | Plan de ajustes A/B/C |

**Estado real:** ver §1.2.3. Las actas formales existen solo para UC-01…UC-03 y requieren refrendo humano; el resto
de las revisiones están **definidas pero no registradas**. Para la DR final, o se registran actas, o se declara el
alcance real de la revisión.

### 4.7. Pruebas

La estrategia completa está en `testing-strategy.md`; aquí se resumen los niveles y su estado:

| Nivel | Herramientas | Estado |
|---|---|---|
| Unitarias (dominio y casos de uso) | Jest/Vitest (Node), JUnit (Java), Pest (PHP), Jest+RNTL (Expo) | **Ejecutadas parcialmente** (§1.2) |
| Integración | Testcontainers: Postgres, Mongo, DynamoDB Local, RabbitMQ, MinIO | Definida; no ejecutada en esta medición |
| Arquitectura | dependency-cruiser, ArchUnit, Deptrac (`pnpm arch`) | Configurada en CI de los servicios; resultado no capturado aquí |
| Contrato | Spectral, Schemathesis, Pact, AsyncAPI, `graphql-inspector` | `make contracts-lint` en docs; resto definido |
| Idempotencia (T8) | Batería: misma petición/mensaje N veces → un efecto | Definida |
| SAGA con fallos inyectados | `CHAOS_TICKETING_FAIL`, escenarios S1–S10 | Definida |
| E2E | Playwright (web), Maestro (móvil) | Definida; flujos Maestro por UC |
| Carga | k6: `feed`, `registration-rush` | Definida; sin resultados |
| ML/IA | Notebooks, validación ONNX, recall ≥ 0.90 (RNF-12) | Definida |

Criterios de salida de un cambio: pruebas verdes, sin *skipped* sin issue enlazado, `lint` y `typecheck` en verde, y
cobertura sobre el mínimo (cuando se mida).

### 4.8. Notificación de problemas y acción correctiva

**Registro.** Los defectos y desviaciones se registran en: (a) `06-plan/deuda-tecnica.md` (desviaciones respecto de
contrato o diseño, numeradas D-n / I-n / E-n con prioridad A/B/F2); (b) `06-plan/registro-de-sesiones.md`
(bloqueos y pendientes por sesión); (c) las actas de `08-revisiones.md`; (d) las *issues* de cada repositorio.

**Severidad (propuesta (S))**

| Nivel | Criterio | Plazo objetivo |
|---|---|---|
| Crítica | Pérdida o duplicación de dinero/entradas, brecha de seguridad, caída del flujo principal | Antes de la próxima entrega |
| Alta | Un UC Must no cumple su contrato | Mismo sprint |
| Media | Desviación de contrato o diseño con rodeo | Si hay tiempo (prioridad B) |
| Baja | Cosmético, texto, deuda sin impacto | Fase 2 |

**Flujo:** detectar → registrar (con UC/RF afectado) → asignar al dueño del componente → corregir en una rama del
componente → regresión (prueba que falla antes y pasa después) → cerrar en el registro y en la trazabilidad.

**Ejemplo real.** La consolidación de contratos del 2026-10-15 produjo 17 hallazgos de cumplimiento (D-1…D-17;
p. ej. D-7: no se exigían *scopes* en `/internal/**`; D-8: `VALIDATION_FAILED` respondía 422 en vez de 400;
D-16: *rate limit* en memoria por instancia). `deuda-tecnica.md` los lista **todos como hechos**, varios con el
commit de cierre.

### 4.9. Herramientas, técnicas y metodologías

| Necesidad | Herramienta |
|---|---|
| Control de versiones | Git, un repositorio por componente (ADR-0017) |
| Integración continua | GitHub Actions, `ci.yml` en cada repositorio (lint, typecheck, test, arch, build) |
| Contratos | Spectral, AsyncAPI CLI, graphql-inspector, `pnpm contracts:gen` |
| Pruebas | Jest, Vitest, Pest, JUnit, RNTL, Testing Library, Testcontainers |
| Calidad de código | ESLint (`@bandada/eslint-config`), TypeScript estricto, formateo |
| Contenedores e infraestructura | Docker Compose, Traefik, Terraform |
| Observabilidad | OpenTelemetry (`traceparent` en toda petición), logs JSON, Grafana/LGTM |
| Documentación | Markdown en `bandadau-docs`, diagramas Mermaid y EA, generador del entregable (`entregable/build.mjs`) |

**Flujo de ramas:** una rama por cambio y por componente (`feat/<servicio>-uc-xx`); el PR a `develop` exige CI en
verde y la revisión de un dueño. **Un agente de IA = un componente = una rama** por sesión.

### 4.10. Control de medios y de configuración

- Código fuente, documentación y contratos: Git, por repositorio.
- **Sin secretos en git**; variables en `.env` locales a partir de `.env.example`.
- Contratos como interfaz única entre repositorios: se versionan y los tipos se **generan**, no se copian a mano.
- Tras recompilar `bandadau-shared`, los consumidores ejecutan `corepack pnpm install --force`.
- Modelos ONNX y artefactos grandes: fuera del bundle de la app; descarga bajo demanda.

### 4.11. Control de proveedores y software de terceros

| Aspecto | Práctica |
|---|---|
| Dependencias | `pnpm-lock.yaml` / lockfiles por repositorio; instalación con `--frozen-lockfile` en CI |
| Versiones nuevas (Next 16, Expo 57, Spring Boot 4, Laravel 12, Angular 21, NestJS 11) | Verificar documentación oficial antes de usar una API (regla 8) |
| Servicios externos (LLM, nube) | Cadena de motores con *fallback* determinista (`ADR-0022`); credenciales fuera del repo |
| Nube | Proveedores AWS, GCP y Azure para la SAGA (ADR-0024); despliegue simplificado (ADR-0025/0026) |

Definido: escaneo de vulnerabilidades y actualización automática de dependencias. **Sin evidencia de ejecución** en
esta medición.

### 4.12. Registros: recopilación, mantenimiento y retención

| Registro | Dónde | Retención |
|---|---|---|
| Historial de cambios | Git de cada repositorio | Permanente |
| Bitácora de sesiones | `registro-de-sesiones.md` (un registro por sesión y por agente) | Permanente en Git |
| Actas de revisión | `08-revisiones.md` | Permanente en Git |
| Resultados de CI | GitHub Actions | Según la retención de la plataforma |
| Trazabilidad | `07-trazabilidad.md` | Permanente en Git |

### 4.13. Capacitación

- Onboarding por `AGENTS.md` (orden de lectura obligatorio) y `01-vision/glosario.md`.
- `guia-para-agentes.md` para trabajo con agentes de IA.
- Guía de expositores (`Bandada-U-guia-expositores.docx`) y deck de la defensa.

### 4.14. Gestión de riesgos

La matriz completa está en `06-plan/roadmap-y-sprints.md` §7. Riesgos que más afectan la calidad:

| # | Riesgo | Prob. | Impacto | Mitigación | Estado |
|---|---|---|---|---|---|
| R-01 | Alcance excesivo (9 servicios, 5 frontends, 3 lenguajes) para 4 semanas | Muy alta | Alto | MoSCoW; Should se recorta primero; un agente por componente | Vigente |
| R-02 | Versiones nuevas con APIs distintas a las conocidas | Alta | Medio | Verificar documentación oficial; *spikes* | Vigente |
| R-03 | Inconsistencias de mensajes en la SAGA con 3 lenguajes | Media | Alto | AsyncAPI congelado; pruebas de contrato; caos | Vigente |
| Q-01 | Revisiones ICONIX no registradas (§1.2.3) | Alta | Alto | Registrar actas antes de la DR o declarar el alcance real | **Abierto** |
| Q-02 | Cobertura no medida; mínimos sin verificar | Alta | Medio | Ejecutar `--coverage` y registrar la línea base | **Abierto** |
| Q-03 | Pruebas Java y PHP no ejecutadas en el entorno de medición | Media | Medio | Ejecutar en CI o con JDK 25 y PHP instalados | **Abierto** |
| Q-04 | Pruebas de carga, E2E y de caos sin resultados | Media | Alto | Ejecutar y registrar antes de la defensa | **Abierto** |
| Q-05 | Autorización incompleta en cliente (p. ej. botón de escaneo visible a roles sin permiso; la comprobación real está solo en el backend) | Media | Bajo | Ocultar acciones según rol; verificar en revisión de pantalla | Mitigado en la pantalla de entradas; `/scan` sin bloqueo propio |

Seguimiento: revisar la matriz al cerrar cada sesión (regla 11) y antes de cada DR.

### 4.15. Glosario

| Término | Significado |
|---|---|
| SQAP | Plan de Aseguramiento de la Calidad del Software |
| ICONIX | Metodología guiada por casos de uso: requisitos → robustez → secuencia → código |
| RR / PDR / CDR / DR | Revisiones de requisitos, diseño preliminar, diseño crítico y entrega |
| DoD | *Definition of Done*, criterios de «hecho» |
| UC / RF / RNF | Caso de uso / requisito funcional / requisito no funcional |
| SAGA | Transacción distribuida orquestada con compensaciones (inscripción a evento) |
| Outbox / Inbox | Patrones para publicar y consumir eventos sin duplicar efectos |
| ADR | Registro de decisión de arquitectura |
| P / C / I / V | Estados de trazabilidad: Pendiente, Contratado, Implementado, Verificado |

### 4.16. Procedimiento y historial de cambios del SQAP

**Cambios.** Este manual se actualiza al cierre de una sesión cuando cambie la evidencia (§1.2), una política o un
rol, y antes de cada revisión DR. Toda actualización se confirma en `bandadau-docs` y se anota en el registro de
sesiones.

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-11-10 | Versión inicial; evidencia medida el 2026-11-10 |

---

## 5. Bibliografía

- IEEE Std 730 — *Software Quality Assurance Processes*.
- ISO/IEC 25010:2011 — *Systems and software Quality Requirements and Evaluation (SQuaRE): System and software quality models*.
- IEEE Std 829 — *Software and System Test Documentation*; IEEE Std 830 — *Software Requirements Specifications*; IEEE Std 1016 — *Software Design Descriptions*.
- ISO/IEC/IEEE 16085 — *Risk management*.
- Rosenberg, D. y Stephens, M. — *Use Case Driven Object Modeling with UML: Theory and Practice* (ICONIX).
- Documentación normativa de Bandada U: `bandadau-docs/docs/` y `bandadau-docs/contracts/`.
