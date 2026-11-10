// Bandada U - 08 Modelo de datos (10 diagramas)
var SCRIPT_TITLE = "Bandada U - 08 Modelo de datos";
var DIAGRAMS = [{"type":"class","title":"Clases - Identidad \u2014 identity_db (PostgreSQL)","path":["PostgreSQL"],"nodes":[{"id":"universities","kind":"class","name":"universities","attrs":[{"name":"id","type":"uuid PK","vis":"Public"},{"name":"name","type":"varchar","vis":"Public"},{"name":"enabled","type":"bool","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"},{"name":"updated_at","type":"timestamptz","vis":"Public"}],"stereo":"table"},{"id":"university_domains","kind":"class","name":"university_domains","attrs":[{"name":"domain","type":"varchar PK","vis":"Public"},{"name":"university_id","type":"uuid FK","vis":"Public"}],"stereo":"table"},{"id":"users","kind":"class","name":"users","attrs":[{"name":"id","type":"uuid PK","vis":"Public"},{"name":"email","type":"varchar UQ","vis":"Public"},{"name":"university_id","type":"uuid FK","vis":"Public"},{"name":"status","type":"varchar","vis":"Public"},{"name":"roles","type":"text[]","vis":"Public"},{"name":"locale","type":"varchar","vis":"Public"},{"name":"theme","type":"varchar","vis":"Public"},{"name":"display_name","type":"varchar?","vis":"Public"},{"name":"email_verified_at","type":"timestamptz?","vis":"Public"},{"name":"suspended_reason","type":"varchar?","vis":"Public"},{"name":"version","type":"bigint","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"},{"name":"updated_at","type":"timestamptz","vis":"Public"}],"ops":[{"name":"verifyEmail","params":"now","ret":"void","isStatic":false,"vis":"Public"},{"name":"changeRoles","params":"roles, actorId","ret":"void","isStatic":false,"vis":"Public"},{"name":"suspend","params":"reason","ret":"void","isStatic":false,"vis":"Public"},{"name":"reactivate","params":"","ret":"void","isStatic":false,"vis":"Public"}],"stereo":"table"},{"id":"credentials","kind":"class","name":"credentials","attrs":[{"name":"user_id","type":"uuid PK FK","vis":"Public"},{"name":"password_hash","type":"varchar","vis":"Public"},{"name":"failed_attempts","type":"smallint","vis":"Public"},{"name":"locked_until","type":"timestamptz?","vis":"Public"},{"name":"updated_at","type":"timestamptz","vis":"Public"}],"stereo":"table"},{"id":"email_verifications","kind":"class","name":"email_verifications","attrs":[{"name":"id","type":"uuid PK","vis":"Public"},{"name":"user_id","type":"uuid FK","vis":"Public"},{"name":"code_hash","type":"char","vis":"Public"},{"name":"expires_at","type":"timestamptz","vis":"Public"},{"name":"attempts","type":"smallint","vis":"Public"},{"name":"consumed_at","type":"timestamptz?","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"}],"stereo":"table"},{"id":"refresh_tokens","kind":"class","name":"refresh_tokens","attrs":[{"name":"id","type":"uuid PK","vis":"Public"},{"name":"user_id","type":"uuid","vis":"Public"},{"name":"family_id","type":"uuid","vis":"Public"},{"name":"client","type":"varchar","vis":"Public"},{"name":"token_hash","type":"char UQ","vis":"Public"},{"name":"parent_id","type":"uuid?","vis":"Public"},{"name":"expires_at","type":"timestamptz","vis":"Public"},{"name":"used_at","type":"timestamptz?","vis":"Public"},{"name":"revoked_at","type":"timestamptz?","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"}],"stereo":"table"},{"id":"handoff_codes","kind":"class","name":"handoff_codes","attrs":[{"name":"code_hash","type":"char PK","vis":"Public"},{"name":"user_id","type":"uuid","vis":"Public"},{"name":"target_app","type":"varchar","vis":"Public"},{"name":"code_challenge","type":"varchar","vis":"Public"},{"name":"expires_at","type":"timestamptz","vis":"Public"},{"name":"used_at","type":"timestamptz?","vis":"Public"},{"name":"created_ip","type":"varchar?","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"}],"stereo":"table"},{"id":"signing_keys","kind":"class","name":"signing_keys","attrs":[{"name":"kid","type":"varchar PK","vis":"Public"},{"name":"public_jwk","type":"jsonb","vis":"Public"},{"name":"private_key_enc","type":"bytea","vis":"Public"},{"name":"status","type":"varchar","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"},{"name":"activated_at","type":"timestamptz?","vis":"Public"},{"name":"retired_at","type":"timestamptz?","vis":"Public"}],"stereo":"table"},{"id":"role_changes","kind":"class","name":"role_changes","attrs":[{"name":"id","type":"uuid PK","vis":"Public"},{"name":"user_id","type":"uuid FK","vis":"Public"},{"name":"actor_id","type":"uuid","vis":"Public"},{"name":"old_roles","type":"text[]","vis":"Public"},{"name":"new_roles","type":"text[]","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"}],"stereo":"table"},{"id":"mcp_tokens","kind":"class","name":"mcp_tokens","attrs":[{"name":"id","type":"uuid PK","vis":"Public"},{"name":"user_id","type":"uuid FK","vis":"Public"},{"name":"label","type":"varchar?","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"},{"name":"expires_at","type":"timestamptz","vis":"Public"},{"name":"revoked_at","type":"timestamptz?","vis":"Public"}],"stereo":"table"},{"id":"rate_limit_windows","kind":"class","name":"rate_limit_windows","attrs":[{"name":"limit_key","type":"varchar PK","vis":"Public"},{"name":"window_start","type":"timestamptz","vis":"Public"},{"name":"hits","type":"int","vis":"Public"},{"name":"expires_at","type":"timestamptz","vis":"Public"}],"stereo":"table"}],"edges":[{"label":"permite","from":"universities","to":"university_domains","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"1..*"},{"label":"agrupa","from":"universities","to":"users","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"},{"label":"autentica con","from":"users","to":"credentials","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"1"},{"label":"verifica","from":"users","to":"email_verifications","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"},{"label":"audita","from":"users","to":"role_changes","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"},{"label":"emite","from":"users","to":"mcp_tokens","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"},{"label":"renueva","from":"users","to":"refresh_tokens","type":"Dependency","dir":"Source -> Destination"},{"label":"traspasa","from":"users","to":"handoff_codes","type":"Dependency","dir":"Source -> Destination"}]},{"type":"class","title":"Clases - Eventos \u2014 events_db (PostgreSQL)","path":["PostgreSQL"],"nodes":[{"id":"events","kind":"class","name":"events","attrs":[{"name":"id","type":"uuid PK","vis":"Public"},{"name":"organizer_id","type":"uuid","vis":"Public"},{"name":"university_id","type":"uuid","vis":"Public"},{"name":"title","type":"varchar","vis":"Public"},{"name":"description","type":"text?","vis":"Public"},{"name":"cover_media_id","type":"uuid?","vis":"Public"},{"name":"venue","type":"varchar","vis":"Public"},{"name":"starts_at","type":"timestamptz","vis":"Public"},{"name":"ends_at","type":"timestamptz","vis":"Public"},{"name":"capacity","type":"int","vis":"Public"},{"name":"seats_taken","type":"int","vis":"Public"},{"name":"price_credits","type":"bigint","vis":"Public"},{"name":"status","type":"varchar","vis":"Public"},{"name":"cancel_reason","type":"varchar?","vis":"Public"},{"name":"version","type":"bigint","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"},{"name":"updated_at","type":"timestamptz","vis":"Public"},{"name":"published_at","type":"timestamptz?","vis":"Public"}],"ops":[{"name":"publish","params":"now","ret":"void","isStatic":false,"vis":"Public"},{"name":"cancel","params":"reason","ret":"void","isStatic":false,"vis":"Public"},{"name":"reserveSeat","params":"","ret":"void","isStatic":false,"vis":"Public"},{"name":"releaseSeat","params":"","ret":"void","isStatic":false,"vis":"Public"}],"stereo":"table"},{"id":"registrations","kind":"class","name":"registrations","attrs":[{"name":"id","type":"uuid PK","vis":"Public"},{"name":"event_id","type":"uuid FK","vis":"Public"},{"name":"user_id","type":"uuid","vis":"Public"},{"name":"status","type":"varchar","vis":"Public"},{"name":"price_credits","type":"bigint","vis":"Public"},{"name":"failure_reason","type":"varchar?","vis":"Public"},{"name":"ticket_id","type":"uuid?","vis":"Public"},{"name":"idempotency_key","type":"uuid?","vis":"Public"},{"name":"version","type":"bigint","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"},{"name":"updated_at","type":"timestamptz","vis":"Public"},{"name":"confirmed_at","type":"timestamptz?","vis":"Public"},{"name":"cancelled_at","type":"timestamptz?","vis":"Public"}],"ops":[{"name":"confirm","params":"ticketId","ret":"void","isStatic":false,"vis":"Public"},{"name":"fail","params":"reason","ret":"void","isStatic":false,"vis":"Public"},{"name":"requestCancellation","params":"now, deadline","ret":"void","isStatic":false,"vis":"Public"},{"name":"markCancelled","params":"","ret":"void","isStatic":false,"vis":"Public"}],"stereo":"table"},{"id":"saga_instances","kind":"class","name":"saga_instances","attrs":[{"name":"id","type":"uuid PK","vis":"Public"},{"name":"registration_id","type":"uuid FK","vis":"Public"},{"name":"type","type":"varchar","vis":"Public"},{"name":"status","type":"varchar","vis":"Public"},{"name":"step","type":"varchar","vis":"Public"},{"name":"attempt","type":"smallint","vis":"Public"},{"name":"deadline_at","type":"timestamptz?","vis":"Public"},{"name":"next_retry_at","type":"timestamptz?","vis":"Public"},{"name":"context","type":"jsonb","vis":"Public"},{"name":"failure_reason","type":"varchar?","vis":"Public"},{"name":"history","type":"jsonb","vis":"Public"},{"name":"version","type":"bigint","vis":"Public"},{"name":"started_at","type":"timestamptz","vis":"Public"},{"name":"updated_at","type":"timestamptz","vis":"Public"},{"name":"finished_at","type":"timestamptz?","vis":"Public"}],"ops":[{"name":"onReply","params":"reply","ret":"decision","isStatic":false,"vis":"Public"},{"name":"onTimeout","params":"now","ret":"decision","isStatic":false,"vis":"Public"},{"name":"isTerminal","params":"","ret":"bool","isStatic":false,"vis":"Public"}],"stereo":"table"}],"edges":[{"label":"recibe","from":"events","to":"registrations","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"},{"label":"orquesta","from":"registrations","to":"saga_instances","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"1..2"}]},{"type":"class","title":"Clases - Billetera \u2014 wallet_db (PostgreSQL)","path":["PostgreSQL"],"nodes":[{"id":"wallets","kind":"class","name":"wallets","attrs":[{"name":"user_id","type":"uuid PK","vis":"Public"},{"name":"balance_credits","type":"bigint","vis":"Public"},{"name":"version","type":"bigint","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"},{"name":"updated_at","type":"timestamptz","vis":"Public"}],"ops":[{"name":"credit","params":"amount, ref","ret":"ledger_entries","isStatic":false,"vis":"Public"},{"name":"debit","params":"amount, ref","ret":"ledger_entries","isStatic":false,"vis":"Public"},{"name":"refund","params":"amount, ref","ret":"ledger_entries","isStatic":false,"vis":"Public"}],"stereo":"table"},{"id":"ledger_entries","kind":"class","name":"ledger_entries","attrs":[{"name":"id","type":"uuid PK","vis":"Public"},{"name":"wallet_user_id","type":"uuid FK","vis":"Public"},{"name":"type","type":"varchar","vis":"Public"},{"name":"amount_credits","type":"bigint","vis":"Public"},{"name":"balance_after","type":"bigint","vis":"Public"},{"name":"operation_ref","type":"varchar UQ","vis":"Public"},{"name":"saga_id","type":"uuid?","vis":"Public"},{"name":"registration_id","type":"uuid?","vis":"Public"},{"name":"event_id","type":"uuid?","vis":"Public"},{"name":"top_up_id","type":"uuid?","vis":"Public"},{"name":"description","type":"varchar?","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"}],"stereo":"table"},{"id":"top_ups","kind":"class","name":"top_ups","attrs":[{"name":"id","type":"uuid PK","vis":"Public"},{"name":"user_id","type":"uuid","vis":"Public"},{"name":"package","type":"varchar","vis":"Public"},{"name":"amount_credits","type":"bigint","vis":"Public"},{"name":"price_minor","type":"bigint","vis":"Public"},{"name":"currency","type":"varchar","vis":"Public"},{"name":"status","type":"varchar","vis":"Public"},{"name":"gateway_ref","type":"varchar? UQ","vis":"Public"},{"name":"idempotency_key","type":"uuid?","vis":"Public"},{"name":"expires_at","type":"timestamptz","vis":"Public"},{"name":"paid_at","type":"timestamptz?","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"},{"name":"updated_at","type":"timestamptz","vis":"Public"}],"ops":[{"name":"markPaid","params":"gatewayRef","ret":"void","isStatic":false,"vis":"Public"},{"name":"expire","params":"","ret":"void","isStatic":false,"vis":"Public"}],"stereo":"table"}],"edges":[{"label":"registra","from":"wallets","to":"ledger_entries","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"},{"label":"recarga","from":"wallets","to":"top_ups","type":"Dependency","dir":"Source -> Destination"},{"label":"acredita","from":"top_ups","to":"ledger_entries","type":"Dependency","dir":"Source -> Destination"}]},{"type":"class","title":"Clases - Soporte com\u00fan \u2014 outbox, inbox e idempotencia (PostgreSQL)","path":["PostgreSQL"],"nodes":[{"id":"outbox","kind":"class","name":"outbox","attrs":[{"name":"id","type":"uuid PK","vis":"Public"},{"name":"exchange","type":"varchar","vis":"Public"},{"name":"routing_key","type":"varchar","vis":"Public"},{"name":"payload","type":"jsonb","vis":"Public"},{"name":"headers","type":"jsonb","vis":"Public"},{"name":"aggregate_id","type":"uuid?","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"},{"name":"published_at","type":"timestamptz?","vis":"Public"},{"name":"attempts","type":"int","vis":"Public"},{"name":"last_error","type":"text?","vis":"Public"}],"stereo":"table"},{"id":"processed_messages","kind":"class","name":"processed_messages","attrs":[{"name":"message_id","type":"uuid PK","vis":"Public"},{"name":"consumer","type":"varchar","vis":"Public"},{"name":"processed_at","type":"timestamptz","vis":"Public"}],"stereo":"table"},{"id":"idempotency_keys","kind":"class","name":"idempotency_keys","attrs":[{"name":"scope_key","type":"varchar PK","vis":"Public"},{"name":"status","type":"varchar","vis":"Public"},{"name":"request_hash","type":"char","vis":"Public"},{"name":"principal","type":"varchar","vis":"Public"},{"name":"lock_expires_at","type":"timestamptz","vis":"Public"},{"name":"response_status","type":"int?","vis":"Public"},{"name":"response_headers","type":"jsonb?","vis":"Public"},{"name":"response_body","type":"text?","vis":"Public"},{"name":"created_at","type":"timestamptz","vis":"Public"},{"name":"expires_at","type":"timestamptz","vis":"Public"}],"stereo":"table"}],"edges":[]},{"type":"class","title":"Clases - Social \u2014 social (MongoDB)","path":["MongoDB"],"nodes":[{"id":"profiles","kind":"class","name":"profiles","attrs":[{"name":"_id","type":"uuid PK","vis":"Public"},{"name":"displayName","type":"string","vis":"Public"},{"name":"universityId","type":"uuid?","vis":"Public"},{"name":"career","type":"string?","vis":"Public"},{"name":"semester","type":"int?","vis":"Public"},{"name":"bio","type":"string?","vis":"Public"},{"name":"interests","type":"string[]","vis":"Public"},{"name":"avatarMediaId","type":"uuid?","vis":"Public"},{"name":"pendingAvatarMediaId","type":"uuid?","vis":"Public"},{"name":"avatarStatus","type":"string?","vis":"Public"},{"name":"createdAt","type":"date","vis":"Public"},{"name":"updatedAt","type":"date","vis":"Public"}],"ops":[{"name":"update","params":"patch","ret":"void","isStatic":false,"vis":"Public"}],"stereo":"collection"},{"id":"posts","kind":"class","name":"posts","attrs":[{"name":"_id","type":"uuid PK","vis":"Public"},{"name":"clientId","type":"uuid UQ","vis":"Public"},{"name":"authorId","type":"uuid","vis":"Public"},{"name":"authorUniversityId","type":"uuid?","vis":"Public"},{"name":"authorCareer","type":"string?","vis":"Public"},{"name":"text","type":"string","vis":"Public"},{"name":"hashtags","type":"string[]","vis":"Public"},{"name":"visibility","type":"string","vis":"Public"},{"name":"groupId","type":"uuid?","vis":"Public"},{"name":"status","type":"string","vis":"Public"},{"name":"hiddenReason","type":"string?","vis":"Public"},{"name":"hiddenAt","type":"date?","vis":"Public"},{"name":"mediaIds","type":"uuid[]","vis":"Public"},{"name":"reactionCounts","type":"object","vis":"Public"},{"name":"commentsCount","type":"int","vis":"Public"},{"name":"openReportsCount","type":"int","vis":"Public"},{"name":"createdAt","type":"date","vis":"Public"},{"name":"updatedAt","type":"date","vis":"Public"}],"ops":[{"name":"hide","params":"reason","ret":"void","isStatic":false,"vis":"Public"},{"name":"remove","params":"byUserId","ret":"void","isStatic":false,"vis":"Public"}],"stereo":"collection"},{"id":"comments","kind":"class","name":"comments","attrs":[{"name":"_id","type":"uuid PK","vis":"Public"},{"name":"postId","type":"uuid FK","vis":"Public"},{"name":"authorId","type":"uuid","vis":"Public"},{"name":"parentId","type":"uuid? FK","vis":"Public"},{"name":"text","type":"string","vis":"Public"},{"name":"status","type":"string","vis":"Public"},{"name":"replyCount","type":"int","vis":"Public"},{"name":"openReportsCount","type":"int","vis":"Public"},{"name":"createdAt","type":"date","vis":"Public"}],"stereo":"collection"},{"id":"reactions","kind":"class","name":"reactions","attrs":[{"name":"postId","type":"uuid FK","vis":"Public"},{"name":"userId","type":"uuid","vis":"Public"},{"name":"type","type":"string","vis":"Public"},{"name":"updatedAt","type":"date","vis":"Public"}],"stereo":"collection"},{"id":"follows","kind":"class","name":"follows","attrs":[{"name":"followerId","type":"uuid","vis":"Public"},{"name":"followeeId","type":"uuid","vis":"Public"},{"name":"createdAt","type":"date","vis":"Public"}],"stereo":"collection"},{"id":"groups","kind":"class","name":"groups","attrs":[{"name":"_id","type":"uuid PK","vis":"Public"},{"name":"name","type":"string","vis":"Public"},{"name":"subject","type":"string","vis":"Public"},{"name":"privacy","type":"string","vis":"Public"},{"name":"ownerId","type":"uuid","vis":"Public"},{"name":"membersCount","type":"int","vis":"Public"},{"name":"createdAt","type":"date","vis":"Public"}],"stereo":"collection"},{"id":"groupMemberships","kind":"class","name":"groupMemberships","attrs":[{"name":"groupId","type":"uuid FK","vis":"Public"},{"name":"userId","type":"uuid","vis":"Public"},{"name":"role","type":"string","vis":"Public"},{"name":"status","type":"string","vis":"Public"},{"name":"requestedAt","type":"date","vis":"Public"},{"name":"updatedAt","type":"date","vis":"Public"}],"ops":[{"name":"approve","params":"by","ret":"void","isStatic":false,"vis":"Public"},{"name":"reject","params":"by","ret":"void","isStatic":false,"vis":"Public"}],"stereo":"collection"},{"id":"contentReports","kind":"class","name":"contentReports","attrs":[{"name":"_id","type":"uuid PK","vis":"Public"},{"name":"targetType","type":"string","vis":"Public"},{"name":"targetId","type":"uuid","vis":"Public"},{"name":"targetAuthorId","type":"uuid","vis":"Public"},{"name":"reporterId","type":"uuid","vis":"Public"},{"name":"reason","type":"string","vis":"Public"},{"name":"details","type":"string?","vis":"Public"},{"name":"status","type":"string","vis":"Public"},{"name":"resolution","type":"string?","vis":"Public"},{"name":"resolutionNote","type":"string?","vis":"Public"},{"name":"resolvedBy","type":"uuid?","vis":"Public"},{"name":"createdAt","type":"date","vis":"Public"},{"name":"resolvedAt","type":"date?","vis":"Public"}],"ops":[{"name":"resolve","params":"decision, by","ret":"void","isStatic":false,"vis":"Public"}],"stereo":"collection"},{"id":"mediaAssetViews","kind":"class","name":"mediaAssetViews","attrs":[{"name":"_id","type":"uuid PK","vis":"Public"},{"name":"ownerId","type":"uuid","vis":"Public"},{"name":"kind","type":"string","vis":"Public"},{"name":"status","type":"string","vis":"Public"},{"name":"updatedAt","type":"date","vis":"Public"}],"stereo":"collection"}],"edges":[{"label":"publica","from":"profiles","to":"posts","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"},{"label":"tiene","from":"posts","to":"comments","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"},{"label":"responde a","from":"comments","to":"comments","type":"Association","dir":"Source -> Destination","srcCard":"0..1","dstCard":"0..*"},{"label":"recibe","from":"posts","to":"reactions","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"},{"label":"sigue","from":"profiles","to":"follows","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"},{"label":"integra","from":"groups","to":"groupMemberships","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"},{"label":"contiene","from":"groups","to":"posts","type":"Association","dir":"Source -> Destination","srcCard":"0..1","dstCard":"0..*"},{"label":"denunciado en","from":"posts","to":"contentReports","type":"Dependency","dir":"Source -> Destination"},{"label":"adjunta","from":"posts","to":"mediaAssetViews","type":"Dependency","dir":"Source -> Destination"}]},{"type":"class","title":"Clases - Medios \u2014 media (MongoDB)","path":["MongoDB"],"nodes":[{"id":"media","kind":"class","name":"media","attrs":[{"name":"_id","type":"uuid PK","vis":"Public"},{"name":"ownerId","type":"uuid","vis":"Public"},{"name":"kind","type":"string","vis":"Public"},{"name":"purpose","type":"string","vis":"Public"},{"name":"mimeType","type":"string","vis":"Public"},{"name":"sizeBytes","type":"int","vis":"Public"},{"name":"durationSeconds","type":"int?","vis":"Public"},{"name":"fileName","type":"string?","vis":"Public"},{"name":"status","type":"string","vis":"Public"},{"name":"storageKey","type":"string","vis":"Public"},{"name":"thumbnailKey","type":"string?","vis":"Public"},{"name":"tags","type":"string[]","vis":"Public"},{"name":"ocrText","type":"string?","vis":"Public"},{"name":"moderationResults","type":"ModerationResult[]","vis":"Public"},{"name":"finalDecision","type":"string?","vis":"Public"},{"name":"uploadExpiresAt","type":"date","vis":"Public"},{"name":"createdAt","type":"date","vis":"Public"},{"name":"updatedAt","type":"date","vis":"Public"}],"ops":[{"name":"markUploaded","params":"meta","ret":"void","isStatic":false,"vis":"Public"},{"name":"applyModeration","params":"result, thresholds","ret":"void","isStatic":false,"vis":"Public"},{"name":"decide","params":"decision, by","ret":"void","isStatic":false,"vis":"Public"}],"stereo":"collection"},{"id":"ModerationResult","kind":"class","name":"ModerationResult","attrs":[{"name":"modelName","type":"string","vis":"Public"},{"name":"modelVersion","type":"string","vis":"Public"},{"name":"labels","type":"object","vis":"Public"},{"name":"maxScore","type":"float","vis":"Public"},{"name":"decision","type":"string","vis":"Public"},{"name":"frameOffsetsSec","type":"float[]","vis":"Public"},{"name":"createdAt","type":"date","vis":"Public"}],"stereo":"embedded"}],"edges":[{"label":"evalua","from":"media","to":"ModerationResult","type":"Association","srcAgg":2,"srcCard":"1","dstCard":"0..*"}]},{"type":"class","title":"Clases - Entradas \u2014 bandada-ticketing (DynamoDB)","path":["DynamoDB"],"nodes":[{"id":"ticket","kind":"class","name":"ticket","attrs":[{"name":"pk","type":"string PK","vis":"Public"},{"name":"sk","type":"string PK","vis":"Public"},{"name":"entity","type":"string","vis":"Public"},{"name":"ticketId","type":"uuid","vis":"Public"},{"name":"registrationId","type":"uuid","vis":"Public"},{"name":"eventId","type":"uuid","vis":"Public"},{"name":"userId","type":"uuid","vis":"Public"},{"name":"eventTitle","type":"string","vis":"Public"},{"name":"eventStartsAt","type":"string","vis":"Public"},{"name":"eventEndsAt","type":"string?","vis":"Public"},{"name":"venue","type":"string","vis":"Public"},{"name":"organizerId","type":"uuid?","vis":"Public"},{"name":"staffUserIds","type":"uuid[]","vis":"Public"},{"name":"status","type":"string","vis":"Public"},{"name":"issuedAt","type":"string","vis":"Public"},{"name":"usedAt","type":"string?","vis":"Public"},{"name":"usedBy","type":"uuid?","vis":"Public"},{"name":"voidedAt","type":"string?","vis":"Public"}],"ops":[{"name":"use","params":"by, now","ret":"void","isStatic":false,"vis":"Public"},{"name":"void","params":"now","ret":"void","isStatic":false,"vis":"Public"}],"stereo":"item"},{"id":"GSI1","kind":"class","name":"GSI1","attrs":[{"name":"gsi1pk","type":"string","vis":"Public"},{"name":"gsi1sk","type":"string","vis":"Public"}],"stereo":"index"},{"id":"GSI2","kind":"class","name":"GSI2","attrs":[{"name":"gsi2pk","type":"string","vis":"Public"},{"name":"gsi2sk","type":"string","vis":"Public"}],"stereo":"index"},{"id":"GSI3","kind":"class","name":"GSI3","attrs":[{"name":"gsi3pk","type":"string","vis":"Public"},{"name":"gsi3sk","type":"string","vis":"Public"}],"stereo":"index"}],"edges":[{"label":"por usuario y fecha del evento","from":"ticket","to":"GSI1","type":"Dependency","dir":"Source -> Destination"},{"label":"por inscripcion","from":"ticket","to":"GSI2","type":"Dependency","dir":"Source -> Destination"},{"label":"por usuario y adquisicion","from":"ticket","to":"GSI3","type":"Dependency","dir":"Source -> Destination"}]},{"type":"class","title":"Clases - Notificaciones \u2014 bandada-notifications (DynamoDB)","path":["DynamoDB"],"nodes":[{"id":"notification","kind":"class","name":"notification","attrs":[{"name":"pk","type":"string PK","vis":"Public"},{"name":"sk","type":"string PK","vis":"Public"},{"name":"id","type":"uuid","vis":"Public"},{"name":"userId","type":"uuid","vis":"Public"},{"name":"type","type":"string","vis":"Public"},{"name":"params","type":"object","vis":"Public"},{"name":"data","type":"object","vis":"Public"},{"name":"locale","type":"string","vis":"Public"},{"name":"readAt","type":"string?","vis":"Public"},{"name":"createdAt","type":"string","vis":"Public"},{"name":"expiresAt","type":"int","vis":"Public"},{"name":"pushStatus","type":"string","vis":"Public"},{"name":"emailStatus","type":"string","vis":"Public"}],"ops":[{"name":"markRead","params":"now","ret":"void","isStatic":false,"vis":"Public"}],"stereo":"item"},{"id":"device_token","kind":"class","name":"device_token","attrs":[{"name":"pk","type":"string PK","vis":"Public"},{"name":"sk","type":"string PK","vis":"Public"},{"name":"userId","type":"uuid","vis":"Public"},{"name":"token","type":"string","vis":"Public"},{"name":"platform","type":"string","vis":"Public"},{"name":"appVersion","type":"string?","vis":"Public"},{"name":"deviceName","type":"string?","vis":"Public"},{"name":"webPush","type":"object?","vis":"Public"},{"name":"gsi1pk","type":"string","vis":"Public"},{"name":"gsi1sk","type":"string","vis":"Public"}],"stereo":"item"},{"id":"notification_preference","kind":"class","name":"notification_preference","attrs":[{"name":"pk","type":"string PK","vis":"Public"},{"name":"sk","type":"string PK","vis":"Public"},{"name":"userId","type":"uuid","vis":"Public"},{"name":"locale","type":"string","vis":"Public"},{"name":"channels","type":"object","vis":"Public"},{"name":"mutedTypes","type":"string[]","vis":"Public"},{"name":"unreadCount","type":"int","vis":"Public"},{"name":"updatedAt","type":"string","vis":"Public"}],"ops":[{"name":"allows","params":"type, channel","ret":"bool","isStatic":false,"vis":"Public"}],"stereo":"item"},{"id":"inbox_record","kind":"class","name":"inbox_record","attrs":[{"name":"pk","type":"string PK","vis":"Public"},{"name":"sk","type":"string PK","vis":"Public"},{"name":"processedAt","type":"string","vis":"Public"},{"name":"expiresAt","type":"int","vis":"Public"},{"name":"refs","type":"string[]","vis":"Public"}],"stereo":"item"}],"edges":[{"label":"filtra","from":"notification_preference","to":"notification","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"},{"label":"registra","from":"notification_preference","to":"device_token","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"}]},{"type":"class","title":"Clases - Insights \u2014 bandada-insights (DynamoDB)","path":["DynamoDB"],"nodes":[{"id":"report","kind":"class","name":"report","attrs":[{"name":"pk","type":"string PK","vis":"Public"},{"name":"sk","type":"string PK","vis":"Public"},{"name":"id","type":"uuid","vis":"Public"},{"name":"question","type":"string","vis":"Public"},{"name":"locale","type":"string","vis":"Public"},{"name":"status","type":"string","vis":"Public"},{"name":"markdown","type":"string?","vis":"Public"},{"name":"dataset","type":"object[]?","vis":"Public"},{"name":"chart","type":"object?","vis":"Public"},{"name":"audioKey","type":"string?","vis":"Public"},{"name":"fidelityWarning","type":"bool","vis":"Public"},{"name":"requestedBy","type":"uuid","vis":"Public"},{"name":"agentRunId","type":"uuid?","vis":"Public"},{"name":"createdAt","type":"string","vis":"Public"},{"name":"gsi1pk","type":"string","vis":"Public"},{"name":"gsi1sk","type":"string","vis":"Public"}],"ops":[{"name":"complete","params":"output","ret":"void","isStatic":false,"vis":"Public"},{"name":"fail","params":"code","ret":"void","isStatic":false,"vis":"Public"}],"stereo":"item"},{"id":"agent_run","kind":"class","name":"agent_run","attrs":[{"name":"pk","type":"string PK","vis":"Public"},{"name":"sk","type":"string PK","vis":"Public"},{"name":"id","type":"uuid","vis":"Public"},{"name":"agent","type":"string","vis":"Public"},{"name":"trigger","type":"string","vis":"Public"},{"name":"requestedBy","type":"uuid?","vis":"Public"},{"name":"locale","type":"string","vis":"Public"},{"name":"status","type":"string","vis":"Public"},{"name":"steps","type":"int","vis":"Public"},{"name":"toolsUsed","type":"string[]","vis":"Public"},{"name":"tokens","type":"object","vis":"Public"},{"name":"costUsdMicros","type":"int","vis":"Public"},{"name":"startedAt","type":"string","vis":"Public"},{"name":"finishedAt","type":"string?","vis":"Public"},{"name":"expiresAt","type":"int","vis":"Public"}],"ops":[{"name":"recordStep","params":"step","ret":"void","isStatic":false,"vis":"Public"}],"stereo":"item"},{"id":"agent_step","kind":"class","name":"agent_step","attrs":[{"name":"pk","type":"string PK","vis":"Public"},{"name":"sk","type":"string PK","vis":"Public"},{"name":"index","type":"int","vis":"Public"},{"name":"kind","type":"string","vis":"Public"},{"name":"toolName","type":"string?","vis":"Public"},{"name":"argsRedacted","type":"object","vis":"Public"},{"name":"resultSize","type":"int","vis":"Public"},{"name":"durationMs","type":"int","vis":"Public"},{"name":"expiresAt","type":"int","vis":"Public"}],"stereo":"item"},{"id":"alert","kind":"class","name":"alert","attrs":[{"name":"pk","type":"string PK","vis":"Public"},{"name":"sk","type":"string PK","vis":"Public"},{"name":"id","type":"uuid","vis":"Public"},{"name":"kind","type":"string","vis":"Public"},{"name":"severity","type":"string","vis":"Public"},{"name":"status","type":"string","vis":"Public"},{"name":"fingerprint","type":"string","vis":"Public"},{"name":"message","type":"string","vis":"Public"},{"name":"explanation","type":"string?","vis":"Public"},{"name":"occurrences","type":"int","vis":"Public"},{"name":"firstSeenAt","type":"string","vis":"Public"},{"name":"lastSeenAt","type":"string","vis":"Public"},{"name":"gsi1pk","type":"string","vis":"Public"},{"name":"gsi1sk","type":"string","vis":"Public"}],"ops":[{"name":"raiseOrBump","params":"now","ret":"void","isStatic":false,"vis":"Public"},{"name":"acknowledge","params":"by","ret":"void","isStatic":false,"vis":"Public"}],"stereo":"item"},{"id":"metric_point","kind":"class","name":"metric_point","attrs":[{"name":"pk","type":"string PK","vis":"Public"},{"name":"sk","type":"string PK","vis":"Public"},{"name":"name","type":"string","vis":"Public"},{"name":"date","type":"string","vis":"Public"},{"name":"value","type":"float","vis":"Public"}],"stereo":"item"}],"edges":[{"label":"registra","from":"agent_run","to":"agent_step","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"},{"label":"genera","from":"agent_run","to":"report","type":"Association","dir":"Source -> Destination","srcCard":"1","dstCard":"0..*"},{"label":"levanta","from":"agent_run","to":"alert","type":"Dependency","dir":"Source -> Destination"}]},{"type":"class","title":"Clases - Idempotencia compartida \u2014 bandada-idempotency (DynamoDB)","path":["DynamoDB"],"nodes":[{"id":"idempotency_record","kind":"class","name":"idempotency_record","attrs":[{"name":"pk","type":"string PK","vis":"Public"},{"name":"status","type":"string","vis":"Public"},{"name":"requestHash","type":"string","vis":"Public"},{"name":"principal","type":"string","vis":"Public"},{"name":"lockExpiresAt","type":"int","vis":"Public"},{"name":"responseStatus","type":"int?","vis":"Public"},{"name":"responseHeaders","type":"object?","vis":"Public"},{"name":"responseBody","type":"string?","vis":"Public"},{"name":"responseTooLarge","type":"bool?","vis":"Public"},{"name":"expiresAt","type":"int","vis":"Public"}],"stereo":"item"}],"edges":[]}];

// =============================================================================
// Bandada U - Importador de diagramas para Enterprise Architect (JScript)
// Generado por entregable/ea/generar-scripts-ea.mjs. NO editar a mano:
// edita la documentacion Mermaid y vuelve a generar.
//
// Requisitos: EA con un proyecto abierto. Se ejecuta desde
//   View > Scripting > (clic derecho en "Normal Scripts") New Script > JScript
// Pega todo este archivo y pulsa "Run". El resultado aparece en la pestana
// "Script" de la ventana System Output.
// Escrito en JScript clasico (ES3): sin let/const/flechas/forEach/indexOf.
// =============================================================================

var EA_TYPE_BY_KIND = {
  actor: "Actor",
  usecase: "UseCase",
  boundary: "Boundary",
  control: "Control",
  entity: "Entity",
  "class": "Class",
  object: "Object",
  component: "Component",
  node: "Node",
  state: "State",
  initial: "StateNode",
  final: "StateNode",
  note: "Note",
  "package": "Package"
};

var DIAGRAM_TYPE = {
  usecase: "Use Case",
  arch: "Component",
  state: "Statechart",
  "class": "Class",
  robust: "Analysis",
  seq: "Sequence",
  "package": "Package"
};

var stats = { packages: 0, elements: 0, connectors: 0, diagrams: 0, warnings: 0 };

function log(msg) {
  Session.Output(msg);
}

function warn(msg) {
  stats.warnings++;
  Session.Output("AVISO: " + msg);
}

function childPackage(parent, name) {
  var i, p;
  for (i = 0; i < parent.Packages.Count; i++) {
    p = parent.Packages.GetAt(i);
    if (p.Name == name) {
      return p;
    }
  }
  p = parent.Packages.AddNew(name, "");
  p.Update();
  parent.Packages.Refresh();
  stats.packages++;
  return p;
}

function packagePath(root, path) {
  var cur = root, i;
  for (i = 0; i < path.length; i++) {
    cur = childPackage(cur, path[i]);
  }
  return cur;
}

function addAttributes(el, attrs) {
  var i, a, parts, at;
  for (i = 0; i < attrs.length; i++) {
    a = attrs[i];
    at = el.Attributes.AddNew(a.name, a.type || "");
    if (a.vis) {
      at.Visibility = a.vis;
    }
    at.Update();
  }
  if (attrs.length > 0) {
    el.Attributes.Refresh();
  }
}

function addMethods(el, ops) {
  var i, o, m;
  for (i = 0; i < ops.length; i++) {
    o = ops[i];
    m = el.Methods.AddNew(o.name, o.ret || "");
    if (o.vis) {
      m.Visibility = o.vis;
    }
    if (o.isStatic) {
      m.IsStatic = true;
    }
    if (o.params) {
      m.Notes = "(" + o.params + ")";
    }
    m.Update();
  }
  if (ops.length > 0) {
    el.Methods.Refresh();
  }
}

// Clases: tamano segun el contenido y rejilla que respeta el alto de cada fila y el ancho de cada columna
// (una tabla con 17 atributos no se solapa con la de abajo aunque falle el autoacomodo de EA).
function layoutClasses(d) {
  var n = d.nodes.length, ncols, sizes = [], colW = [], rowH = [], i, j, k, m, len, maxLen, nodeW, nodeH, r, c, x, y, lines;
  ncols = n <= 4 ? n : Math.min(5, Math.ceil(Math.sqrt(n)));
  if (ncols < 1) {
    return;
  }
  for (i = 0; i < n; i++) {
    maxLen = (d.nodes[i].name || "").length + 4;
    lines = 0;
    if (d.nodes[i].attrs) {
      for (j = 0; j < d.nodes[i].attrs.length; j++) {
        m = d.nodes[i].attrs[j];
        len = (m.name || "").length + 3 + (m.type || "").length;
        maxLen = len > maxLen ? len : maxLen;
      }
      lines += d.nodes[i].attrs.length;
    }
    if (d.nodes[i].ops) {
      for (j = 0; j < d.nodes[i].ops.length; j++) {
        m = d.nodes[i].ops[j];
        len = (m.name || "").length + (m.params || "").length + (m.ret || "").length + 5;
        maxLen = len > maxLen ? len : maxLen;
      }
      lines += d.nodes[i].ops.length;
    }
    nodeW = Math.min(340, Math.max(190, Math.ceil(maxLen * 6.4) + 30));
    nodeH = 50 + 15 * lines + (d.nodes[i].attrs && d.nodes[i].ops ? 12 : 0);
    sizes.push({ w: nodeW, h: nodeH });
    c = i % ncols;
    r = Math.floor(i / ncols);
    colW[c] = Math.max(colW[c] || 0, nodeW);
    rowH[r] = Math.max(rowH[r] || 0, nodeH);
  }
  for (i = 0; i < n; i++) {
    c = i % ncols;
    r = Math.floor(i / ncols);
    x = 20;
    for (k = 0; k < c; k++) {
      x += colW[k] + 60;
    }
    y = 20;
    for (k = 0; k < r; k++) {
      y += rowH[k] + 50;
    }
    d.nodes[i].pos = "l=" + x + ";r=" + (x + sizes[i].w) + ";t=-" + y + ";b=-" + (y + sizes[i].h) + ";";
  }
}

// Posicion de cada nodo segun el tipo de diagrama.
function layoutNodes(d) {
  var i, n, col, row, cols = {}, counters = {}, x, y, w, h, k;
  if (d.type == "class") {
    layoutClasses(d);
  }
  var lifeIdx = 0, lifelines = 0;
  for (i = 0; i < d.nodes.length; i++) {
    if (d.nodes[i].kind != "note") {
      lifelines++;
    }
  }
  var colX = { actor: 20, boundary: 220, control: 460, entity: 700 };
  for (i = 0; i < d.nodes.length; i++) {
    n = d.nodes[i];
    w = 150;
    h = 60;
    if (d.type == "robust") {
      k = n.kind;
      counters[k] = (counters[k] || 0) + 1;
      x = colX[k] || 20;
      y = 20 + (counters[k] - 1) * 90;
    } else if (d.type == "usecase") {
      if (n.kind == "actor") {
        counters.actor = (counters.actor || 0) + 1;
        x = 20;
        y = 20 + (counters.actor - 1) * 110;
      } else {
        k = n.group || "";
        if (cols[k] === undefined) {
          cols.count = (cols.count || 0) + 1;
          cols[k] = cols.count;
        }
        counters[k] = (counters[k] || 0) + 1;
        x = 60 + cols[k] * 220;
        y = 20 + (counters[k] - 1) * 80;
        w = 190;
      }
    } else if (d.type == "seq") {
      if (n.kind == "note") {
        counters.note = (counters.note || 0) + 1;
        x = 20 + (d.nodes.length - counters.note) * 0;
        x = 20 + lifelines * 150 + 40;
        y = 20 + (counters.note - 1) * 90;
        w = 200;
        h = 70;
        n.pos = "l=" + x + ";r=" + (x + w) + ";t=-" + y + ";b=-" + (y + h) + ";";
        continue;
      }
      lifeIdx++;
      x = 20 + (lifeIdx - 1) * 150;
      y = 20;
      w = 130;
      h = 60 + 28 * (d.edges.length + 1);
    } else {
      // clase: rejilla de 4 columnas (luego se intenta autoacomodo)
      h = 50 + 15 * ((n.attrs ? n.attrs.length : 0) + (n.ops ? n.ops.length : 0));
      w = 190;
      x = 20 + (i % 4) * 240;
      y = 20 + Math.floor(i / 4) * 230;
    }
    if (n.pos) {
      continue;
    }
    n.pos = "l=" + x + ";r=" + (x + w) + ";t=-" + y + ";b=-" + (y + h) + ";";
  }
}

function buildDiagram(root, d) {
  var pkgRoot = packagePath(root, d.path);
  var diagram = pkgRoot.Diagrams.AddNew(d.title, DIAGRAM_TYPE[d.type]);
  diagram.Update();
  stats.diagrams++;

  var byId = {}, i, n, el, pk, dobj, e, src, dst, con, ctype, pos;

  layoutNodes(d);

  for (i = 0; i < d.nodes.length; i++) {
    n = d.nodes[i];
    pk = n.group && (d.type == "class" || d.type == "usecase") && n.kind != "actor"
      ? childPackage(pkgRoot, n.group) : pkgRoot;
    el = pk.Elements.AddNew(n.name, EA_TYPE_BY_KIND[n.kind] || "Class");
    if (n.kind == "initial") {
      el.Subtype = 100;
    }
    if (n.kind == "final") {
      el.Subtype = 101;
    }
    if (n.parent && byId[n.parent]) {
      el.ParentID = byId[n.parent].ElementID;
    }
    if (n.stereo) {
      el.Stereotype = n.stereo;
    }
    if (n.notes) {
      el.Notes = n.notes;
    }
    el.Update();
    stats.elements++;
    if (n.attrs) {
      addAttributes(el, n.attrs);
    }
    if (n.ops) {
      addMethods(el, n.ops);
    }
    byId[n.id] = el;
    dobj = diagram.DiagramObjects.AddNew(n.pos, "");
    dobj.ElementID = el.ElementID;
    dobj.Update();
  }

  for (i = 0; i < d.edges.length; i++) {
    e = d.edges[i];
    src = byId[e.from];
    dst = byId[e.to];
    if (!src || !dst) {
      warn(d.title + ": conector con extremo desconocido (" + e.from + " -> " + e.to + ")");
      continue;
    }
    ctype = e.type || "Association";
    con = src.Connectors.AddNew(e.label || "", ctype);
    con.SupplierID = dst.ElementID;
    if (e.stereo) {
      con.Stereotype = e.stereo;
    }
    if (e.dir) {
      con.Direction = e.dir;
    }
    if (e.seq) {
      con.SequenceNo = e.seq;
    }
    con.Update();
    if (e.srcCard || e.dstCard || e.srcAgg || e.dstAgg) {
      if (e.srcCard) { con.ClientEnd.Cardinality = e.srcCard; }
      if (e.dstCard) { con.SupplierEnd.Cardinality = e.dstCard; }
      if (e.srcAgg) { con.ClientEnd.Aggregation = e.srcAgg; }
      if (e.dstAgg) { con.SupplierEnd.Aggregation = e.dstAgg; }
      con.ClientEnd.Update();
      con.SupplierEnd.Update();
    }
    src.Connectors.Refresh();
    stats.connectors++;
  }

  diagram.DiagramObjects.Refresh();
  if (d.type == "class" || d.type == "usecase") {
    try {
      Repository.GetProjectInterface().LayoutDiagramEx(diagram.DiagramGUID, 0, 4, 20, 20, true);
    } catch (ex) {
      // Si falla el autoacomodo queda la rejilla inicial.
    }
  }
  Repository.ReloadDiagram(diagram.DiagramID);
}

function main() {
  var root, top, i, d, t0 = new Date();
  if (Repository.Models.Count == 0) {
    Session.Prompt("Abre un proyecto de EA con al menos un modelo raiz.", 0);
    return;
  }
  root = Repository.Models.GetAt(0);
  for (i = 0; i < root.Packages.Count; i++) {
    if (root.Packages.GetAt(i).Name == SCRIPT_TITLE) {
      Session.Prompt("Ya existe el paquete '" + SCRIPT_TITLE + "'. Borralo (o usa un proyecto vacio) y vuelve a ejecutar.", 0);
      return;
    }
  }
  log("== " + SCRIPT_TITLE + ": " + DIAGRAMS.length + " diagramas ==");
  Repository.EnableUIUpdates = false;
  try {
    for (i = 0; i < DIAGRAMS.length; i++) {
      d = DIAGRAMS[i];
      d.path = [SCRIPT_TITLE].concat(d.path);
      buildDiagram(root, d);
      log((i + 1) + "/" + DIAGRAMS.length + "  " + d.title);
    }
  } catch (err) {
    log("ERROR: " + (err.message || err));
  }
  Repository.EnableUIUpdates = true;
  Repository.RefreshModelView(root.PackageID);
  log("Listo en " + Math.round((new Date() - t0) / 1000) + " s: " + stats.diagrams + " diagramas, " +
      stats.elements + " elementos, " + stats.connectors + " conectores, " + stats.warnings + " avisos.");
}

main();
