# Modelo de datos — diagramas de clases UML por base de datos

Diagramas de clases (UML 2.5) **derivados de las tablas, colecciones e ítems reales** de cada base de datos de Bandada U.
Cada tabla, colección o ítem es una clase con su estereotipo (`«table»`, `«collection»`, `«item»`, `«index»`);
las asociaciones llevan nombre y multiplicidad. La fuente de cada esquema es el código desplegado:

| Base | Motor | Servicio | Fuente del esquema |
|---|---|---|---|
| `identity_db` | PostgreSQL | `identity-service` | `src/main/resources/db/migration/V1..V3` (Flyway) |
| `events_db` | PostgreSQL | `events-service` | `src/main/resources/db/migration/V1..V2` (Flyway) |
| `wallet_db` | PostgreSQL | `wallet-service` | `database/migrations/2026_10_14_000001_create_wallet_tables.php` |
| `social` | MongoDB | `social-service` | repositorios Mongo e `indexes.ts` |
| `media` | MongoDB | `media-service` | `mongo-media.repository.ts` |
| `bandada-ticketing` | DynamoDB | `ticketing-service` | `dynamo-ticket.repository.ts` |
| `bandada-notifications` | DynamoDB | `notification-service` | `Dynamo*Repository.php` |
| `bandada-insights` | DynamoDB | `insights-service` | `dynamo-repositories.ts` |
| `bandada-idempotency` | DynamoDB | compartida | `@bandada/idempotency-ts` (`stores/dynamodb.ts`) |

**Convenciones.** `PK` clave primaria, `FK` clave foránea, `UQ` único, `?` nulo permitido. Los tipos van sin longitud
(`varchar`, no `varchar(160)`). En MongoDB, `_id` es la clave y los objetos incrustados se dibujan como composición
(rombo relleno). En DynamoDB, `pk`/`sk` son la clave compuesta y los índices secundarios globales (GSI) se muestran como
clases `«index»`. Las operaciones son las del dominio (ver los modelos estáticos de cada servicio). **Regla del proyecto:
una base no se lee desde otro servicio**, por eso las referencias entre bases (`user_id`, `event_id`) son identificadores
lógicos sin clave foránea y no se dibujan como asociación.

---

## Identidad — `identity_db` (PostgreSQL)

```mermaid
classDiagram
    direction TB
    class universities {
        <<table>>
        +id: uuid PK
        +name: varchar
        +enabled: bool
        +created_at: timestamptz
        +updated_at: timestamptz
    }
    class university_domains {
        <<table>>
        +domain: varchar PK
        +university_id: uuid FK
    }
    class users {
        <<table>>
        +id: uuid PK
        +email: varchar UQ
        +university_id: uuid FK
        +status: varchar
        +roles: text[]
        +locale: varchar
        +theme: varchar
        +display_name: varchar?
        +email_verified_at: timestamptz?
        +suspended_reason: varchar?
        +version: bigint
        +created_at: timestamptz
        +updated_at: timestamptz
        +verifyEmail(now) void
        +changeRoles(roles, actorId) void
        +suspend(reason) void
        +reactivate() void
    }
    class credentials {
        <<table>>
        +user_id: uuid PK FK
        +password_hash: varchar
        +failed_attempts: smallint
        +locked_until: timestamptz?
        +updated_at: timestamptz
    }
    class email_verifications {
        <<table>>
        +id: uuid PK
        +user_id: uuid FK
        +code_hash: char
        +expires_at: timestamptz
        +attempts: smallint
        +consumed_at: timestamptz?
        +created_at: timestamptz
    }
    class refresh_tokens {
        <<table>>
        +id: uuid PK
        +user_id: uuid
        +family_id: uuid
        +client: varchar
        +token_hash: char UQ
        +parent_id: uuid?
        +expires_at: timestamptz
        +used_at: timestamptz?
        +revoked_at: timestamptz?
        +created_at: timestamptz
    }
    class handoff_codes {
        <<table>>
        +code_hash: char PK
        +user_id: uuid
        +target_app: varchar
        +code_challenge: varchar
        +expires_at: timestamptz
        +used_at: timestamptz?
        +created_ip: varchar?
        +created_at: timestamptz
    }
    class signing_keys {
        <<table>>
        +kid: varchar PK
        +public_jwk: jsonb
        +private_key_enc: bytea
        +status: varchar
        +created_at: timestamptz
        +activated_at: timestamptz?
        +retired_at: timestamptz?
    }
    class role_changes {
        <<table>>
        +id: uuid PK
        +user_id: uuid FK
        +actor_id: uuid
        +old_roles: text[]
        +new_roles: text[]
        +created_at: timestamptz
    }
    class mcp_tokens {
        <<table>>
        +id: uuid PK
        +user_id: uuid FK
        +label: varchar?
        +created_at: timestamptz
        +expires_at: timestamptz
        +revoked_at: timestamptz?
    }
    class rate_limit_windows {
        <<table>>
        +limit_key: varchar PK
        +window_start: timestamptz
        +hits: int
        +expires_at: timestamptz
    }

    universities "1" --> "1..*" university_domains : permite
    universities "1" --> "0..*" users : agrupa
    users "1" --> "1" credentials : autentica con
    users "1" --> "0..*" email_verifications : verifica
    users "1" --> "0..*" role_changes : audita
    users "1" --> "0..*" mcp_tokens : emite
    users "1" ..> "0..*" refresh_tokens : renueva
    users "1" ..> "0..*" handoff_codes : traspasa
```

---

## Eventos — `events_db` (PostgreSQL)

```mermaid
classDiagram
    direction LR
    class events {
        <<table>>
        +id: uuid PK
        +organizer_id: uuid
        +university_id: uuid
        +title: varchar
        +description: text?
        +cover_media_id: uuid?
        +venue: varchar
        +starts_at: timestamptz
        +ends_at: timestamptz
        +capacity: int
        +seats_taken: int
        +price_credits: bigint
        +status: varchar
        +cancel_reason: varchar?
        +version: bigint
        +created_at: timestamptz
        +updated_at: timestamptz
        +published_at: timestamptz?
        +publish(now) void
        +cancel(reason) void
        +reserveSeat() void
        +releaseSeat() void
    }
    class registrations {
        <<table>>
        +id: uuid PK
        +event_id: uuid FK
        +user_id: uuid
        +status: varchar
        +price_credits: bigint
        +failure_reason: varchar?
        +ticket_id: uuid?
        +idempotency_key: uuid?
        +version: bigint
        +created_at: timestamptz
        +updated_at: timestamptz
        +confirmed_at: timestamptz?
        +cancelled_at: timestamptz?
        +confirm(ticketId) void
        +fail(reason) void
        +requestCancellation(now, deadline) void
        +markCancelled() void
    }
    class saga_instances {
        <<table>>
        +id: uuid PK
        +registration_id: uuid FK
        +type: varchar
        +status: varchar
        +step: varchar
        +attempt: smallint
        +deadline_at: timestamptz?
        +next_retry_at: timestamptz?
        +context: jsonb
        +failure_reason: varchar?
        +history: jsonb
        +version: bigint
        +started_at: timestamptz
        +updated_at: timestamptz
        +finished_at: timestamptz?
        +onReply(reply) decision
        +onTimeout(now) decision
        +isTerminal() bool
    }

    events "1" --> "0..*" registrations : recibe
    registrations "1" --> "1..2" saga_instances : orquesta
```

---

## Billetera — `wallet_db` (PostgreSQL)

```mermaid
classDiagram
    direction LR
    class wallets {
        <<table>>
        +user_id: uuid PK
        +balance_credits: bigint
        +version: bigint
        +created_at: timestamptz
        +updated_at: timestamptz
        +credit(amount, ref) ledger_entries
        +debit(amount, ref) ledger_entries
        +refund(amount, ref) ledger_entries
    }
    class ledger_entries {
        <<table>>
        +id: uuid PK
        +wallet_user_id: uuid FK
        +type: varchar
        +amount_credits: bigint
        +balance_after: bigint
        +operation_ref: varchar UQ
        +saga_id: uuid?
        +registration_id: uuid?
        +event_id: uuid?
        +top_up_id: uuid?
        +description: varchar?
        +created_at: timestamptz
    }
    class top_ups {
        <<table>>
        +id: uuid PK
        +user_id: uuid
        +package: varchar
        +amount_credits: bigint
        +price_minor: bigint
        +currency: varchar
        +status: varchar
        +gateway_ref: varchar? UQ
        +idempotency_key: uuid?
        +expires_at: timestamptz
        +paid_at: timestamptz?
        +created_at: timestamptz
        +updated_at: timestamptz
        +markPaid(gatewayRef) void
        +expire() void
    }

    wallets "1" --> "0..*" ledger_entries : registra
    wallets "1" ..> "0..*" top_ups : recarga
    top_ups "0..1" ..> "1" ledger_entries : acredita
```

---

## Soporte común — outbox, inbox e idempotencia (PostgreSQL)

Las tres bases de PostgreSQL llevan `outbox` y `processed_messages` (inbox); `identity_db` y `events_db` agregan además
`idempotency_keys`. En `wallet_db` la idempotencia de las peticiones vive en DynamoDB.

```mermaid
classDiagram
    direction LR
    class outbox {
        <<table>>
        +id: uuid PK
        +exchange: varchar
        +routing_key: varchar
        +payload: jsonb
        +headers: jsonb
        +aggregate_id: uuid?
        +created_at: timestamptz
        +published_at: timestamptz?
        +attempts: int
        +last_error: text?
    }
    class processed_messages {
        <<table>>
        +message_id: uuid PK
        +consumer: varchar
        +processed_at: timestamptz
    }
    class idempotency_keys {
        <<table>>
        +scope_key: varchar PK
        +status: varchar
        +request_hash: char
        +principal: varchar
        +lock_expires_at: timestamptz
        +response_status: int?
        +response_headers: jsonb?
        +response_body: text?
        +created_at: timestamptz
        +expires_at: timestamptz
    }
```

---

## Social — `social` (MongoDB)

```mermaid
classDiagram
    direction TB
    class profiles {
        <<collection>>
        +_id: uuid PK
        +displayName: string
        +universityId: uuid?
        +career: string?
        +semester: int?
        +bio: string?
        +interests: string[]
        +avatarMediaId: uuid?
        +pendingAvatarMediaId: uuid?
        +avatarStatus: string?
        +createdAt: date
        +updatedAt: date
        +update(patch) void
    }
    class posts {
        <<collection>>
        +_id: uuid PK
        +clientId: uuid UQ
        +authorId: uuid
        +authorUniversityId: uuid?
        +authorCareer: string?
        +text: string
        +hashtags: string[]
        +visibility: string
        +groupId: uuid?
        +status: string
        +hiddenReason: string?
        +hiddenAt: date?
        +mediaIds: uuid[]
        +reactionCounts: object
        +commentsCount: int
        +openReportsCount: int
        +createdAt: date
        +updatedAt: date
        +hide(reason) void
        +remove(byUserId) void
    }
    class comments {
        <<collection>>
        +_id: uuid PK
        +postId: uuid FK
        +authorId: uuid
        +parentId: uuid? FK
        +text: string
        +status: string
        +replyCount: int
        +openReportsCount: int
        +createdAt: date
    }
    class reactions {
        <<collection>>
        +postId: uuid FK
        +userId: uuid
        +type: string
        +updatedAt: date
    }
    class follows {
        <<collection>>
        +followerId: uuid
        +followeeId: uuid
        +createdAt: date
    }
    class groups {
        <<collection>>
        +_id: uuid PK
        +name: string
        +subject: string
        +privacy: string
        +ownerId: uuid
        +membersCount: int
        +createdAt: date
    }
    class groupMemberships {
        <<collection>>
        +groupId: uuid FK
        +userId: uuid
        +role: string
        +status: string
        +requestedAt: date
        +updatedAt: date
        +approve(by) void
        +reject(by) void
    }
    class contentReports {
        <<collection>>
        +_id: uuid PK
        +targetType: string
        +targetId: uuid
        +targetAuthorId: uuid
        +reporterId: uuid
        +reason: string
        +details: string?
        +status: string
        +resolution: string?
        +resolutionNote: string?
        +resolvedBy: uuid?
        +createdAt: date
        +resolvedAt: date?
        +resolve(decision, by) void
    }
    class mediaAssetViews {
        <<collection>>
        +_id: uuid PK
        +ownerId: uuid
        +kind: string
        +status: string
        +updatedAt: date
    }

    profiles "1" --> "0..*" posts : publica
    posts "1" --> "0..*" comments : tiene
    comments "0..1" --> "0..*" comments : responde a
    posts "1" --> "0..*" reactions : recibe
    profiles "1" --> "0..*" follows : sigue
    groups "1" --> "0..*" groupMemberships : integra
    groups "0..1" --> "0..*" posts : contiene
    posts "1" ..> "0..*" contentReports : denunciado en
    posts "0..*" ..> "0..*" mediaAssetViews : adjunta
```

---

## Medios — `media` (MongoDB)

```mermaid
classDiagram
    direction LR
    class media {
        <<collection>>
        +_id: uuid PK
        +ownerId: uuid
        +kind: string
        +purpose: string
        +mimeType: string
        +sizeBytes: int
        +durationSeconds: int?
        +fileName: string?
        +status: string
        +storageKey: string
        +thumbnailKey: string?
        +tags: string[]
        +ocrText: string?
        +moderationResults: ModerationResult[]
        +finalDecision: string?
        +uploadExpiresAt: date
        +createdAt: date
        +updatedAt: date
        +markUploaded(meta) void
        +applyModeration(result, thresholds) void
        +decide(decision, by) void
    }
    class ModerationResult {
        <<embedded>>
        +modelName: string
        +modelVersion: string
        +labels: object
        +maxScore: float
        +decision: string
        +frameOffsetsSec: float[]
        +createdAt: date
    }

    media "1" *-- "0..*" ModerationResult : evalua
```

---

## Entradas — `bandada-ticketing` (DynamoDB)

```mermaid
classDiagram
    direction LR
    class ticket {
        <<item>>
        +pk: string PK
        +sk: string PK
        +entity: string
        +ticketId: uuid
        +registrationId: uuid
        +eventId: uuid
        +userId: uuid
        +eventTitle: string
        +eventStartsAt: string
        +eventEndsAt: string?
        +venue: string
        +organizerId: uuid?
        +staffUserIds: uuid[]
        +status: string
        +issuedAt: string
        +usedAt: string?
        +usedBy: uuid?
        +voidedAt: string?
        +use(by, now) void
        +void(now) void
    }
    class GSI1 {
        <<index>>
        +gsi1pk: string
        +gsi1sk: string
    }
    class GSI2 {
        <<index>>
        +gsi2pk: string
        +gsi2sk: string
    }
    class GSI3 {
        <<index>>
        +gsi3pk: string
        +gsi3sk: string
    }

    ticket "1" ..> "1" GSI1 : por usuario y fecha del evento
    ticket "1" ..> "1" GSI2 : por inscripcion
    ticket "1" ..> "1" GSI3 : por usuario y adquisicion
```

---

## Notificaciones — `bandada-notifications` (DynamoDB)

```mermaid
classDiagram
    direction LR
    class notification {
        <<item>>
        +pk: string PK
        +sk: string PK
        +id: uuid
        +userId: uuid
        +type: string
        +params: object
        +data: object
        +locale: string
        +readAt: string?
        +createdAt: string
        +expiresAt: int
        +pushStatus: string
        +emailStatus: string
        +markRead(now) void
    }
    class device_token {
        <<item>>
        +pk: string PK
        +sk: string PK
        +userId: uuid
        +token: string
        +platform: string
        +appVersion: string?
        +deviceName: string?
        +webPush: object?
        +gsi1pk: string
        +gsi1sk: string
    }
    class notification_preference {
        <<item>>
        +pk: string PK
        +sk: string PK
        +userId: uuid
        +locale: string
        +channels: object
        +mutedTypes: string[]
        +unreadCount: int
        +updatedAt: string
        +allows(type, channel) bool
    }
    class inbox_record {
        <<item>>
        +pk: string PK
        +sk: string PK
        +processedAt: string
        +expiresAt: int
        +refs: string[]
    }

    notification_preference "1" --> "0..*" notification : filtra
    notification_preference "1" --> "0..*" device_token : registra
```

---

## Insights — `bandada-insights` (DynamoDB)

```mermaid
classDiagram
    direction LR
    class report {
        <<item>>
        +pk: string PK
        +sk: string PK
        +id: uuid
        +question: string
        +locale: string
        +status: string
        +markdown: string?
        +dataset: object[]?
        +chart: object?
        +audioKey: string?
        +fidelityWarning: bool
        +requestedBy: uuid
        +agentRunId: uuid?
        +createdAt: string
        +gsi1pk: string
        +gsi1sk: string
        +complete(output) void
        +fail(code) void
    }
    class agent_run {
        <<item>>
        +pk: string PK
        +sk: string PK
        +id: uuid
        +agent: string
        +trigger: string
        +requestedBy: uuid?
        +locale: string
        +status: string
        +steps: int
        +toolsUsed: string[]
        +tokens: object
        +costUsdMicros: int
        +startedAt: string
        +finishedAt: string?
        +expiresAt: int
        +recordStep(step) void
    }
    class agent_step {
        <<item>>
        +pk: string PK
        +sk: string PK
        +index: int
        +kind: string
        +toolName: string?
        +argsRedacted: object
        +resultSize: int
        +durationMs: int
        +expiresAt: int
    }
    class alert {
        <<item>>
        +pk: string PK
        +sk: string PK
        +id: uuid
        +kind: string
        +severity: string
        +status: string
        +fingerprint: string
        +message: string
        +explanation: string?
        +occurrences: int
        +firstSeenAt: string
        +lastSeenAt: string
        +gsi1pk: string
        +gsi1sk: string
        +raiseOrBump(now) void
        +acknowledge(by) void
    }
    class metric_point {
        <<item>>
        +pk: string PK
        +sk: string PK
        +name: string
        +date: string
        +value: float
    }

    agent_run "1" --> "0..*" agent_step : registra
    agent_run "1" --> "0..*" report : genera
    agent_run "1" ..> "0..*" alert : levanta
```

---

## Idempotencia compartida — `bandada-idempotency` (DynamoDB)

```mermaid
classDiagram
    direction LR
    class idempotency_record {
        <<item>>
        +pk: string PK
        +status: string
        +requestHash: string
        +principal: string
        +lockExpiresAt: int
        +responseStatus: int?
        +responseHeaders: object?
        +responseBody: string?
        +responseTooLarge: bool?
        +expiresAt: int
    }
```
