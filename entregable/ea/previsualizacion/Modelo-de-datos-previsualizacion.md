---
title: "Modelo de datos: diagramas de clases UML por base de datos"
subtitle: "Previsualización de los diagramas que genera el script 08 de Enterprise Architect"
---

# Qué es este documento

Muestra cómo quedarán los **10 diagramas de clases UML 2.5** que crea el script `08-modelo-de-datos.js` en Enterprise Architect. Cada diagrama sale de las tablas, colecciones e ítems reales de una base de datos de Bandada U: una clase por tabla (`«table»`), colección (`«collection»`) o ítem de DynamoDB (`«item»`), con sus atributos, tipos, claves (`PK`, `FK`, `UQ`) y las asociaciones con nombre y multiplicidad.

**Importante.** Estas imágenes están dibujadas con Mermaid, con colores parecidos a los de EA, para revisar el *contenido*: clases, atributos y relaciones. No son una captura de EA. En EA, el script coloca las clases en una rejilla ajustada al tamaño de cada una y luego pide el autoacomodo del programa, así que la distribución exacta y el trazo de las líneas serán los de EA. Nadie ha ejecutado todavía el script en un EA real: quien lo corra primero debe revisar el resultado y avisar de lo que falle.

# Cómo generarlos en EA

1. En EA, abre una copia del proyecto y entra en *View › Scripting* (`Ctrl+Alt+8`).
2. Crea un script JScript nuevo, pega el contenido de `entregable/ea/scripts/08-modelo-de-datos.js` y pulsa *Run*.
3. En el *Project Browser* aparece el paquete **Bandada U - 08 Modelo de datos**, con un subpaquete por motor (PostgreSQL, MongoDB, DynamoDB) y los 10 diagramas.

Para regenerar el script después de cambiar `docs/02-iconix/06-modelo-estatico/modelo-datos.md`: `node entregable/ea/generar-scripts-ea.mjs`.

# Los diagramas

## 1. Identidad — identity_db (PostgreSQL)

![Diagrama de clases: Identidad — identity_db (PostgreSQL)](img/01.png){width=16.5cm}

## 2. Eventos — events_db (PostgreSQL)

![Diagrama de clases: Eventos — events_db (PostgreSQL)](img/02.png){width=16.5cm}

## 3. Billetera — wallet_db (PostgreSQL)

![Diagrama de clases: Billetera — wallet_db (PostgreSQL)](img/03.png){width=16.5cm}

## 4. Soporte común — outbox, inbox e idempotencia (PostgreSQL)

![Diagrama de clases: Soporte común — outbox, inbox e idempotencia (PostgreSQL)](img/04.png){height=20cm}

## 5. Social — social (MongoDB)

![Diagrama de clases: Social — social (MongoDB)](img/05.png){height=20cm}

## 6. Medios — media (MongoDB)

![Diagrama de clases: Medios — media (MongoDB)](img/06.png){width=16.5cm}

## 7. Entradas — bandada-ticketing (DynamoDB)

![Diagrama de clases: Entradas — bandada-ticketing (DynamoDB)](img/07.png){width=16.5cm}

## 8. Notificaciones — bandada-notifications (DynamoDB)

![Diagrama de clases: Notificaciones — bandada-notifications (DynamoDB)](img/08.png){height=20cm}

## 9. Insights — bandada-insights (DynamoDB)

![Diagrama de clases: Insights — bandada-insights (DynamoDB)](img/09.png){height=20cm}

## 10. Idempotencia compartida — bandada-idempotency (DynamoDB)

![Diagrama de clases: Idempotencia compartida — bandada-idempotency (DynamoDB)](img/10.png){height=20cm}
