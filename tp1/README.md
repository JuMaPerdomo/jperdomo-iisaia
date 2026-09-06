# TP 1 — Consentimiento de cookies por Arkanoid

Un banner corporativo de consentimiento de cookies donde la única manera de rechazar el rastreo publicitario es destruir quince módulos de seguimiento jugando una partida de Arkanoid (Breakout). Funciona a la perfección y es exasperante, que era exactamente el objetivo.

## Cómo se ejecuta

Doble click en `index.html`. Un solo archivo, sin dependencias ni librerías externas.

## Qué me propuse construir

Llevar al extremo el concepto de *dark pattern* y fatiga por consentimiento: una asimetría de fricción absurda. Para entregar todos tus datos personales basta con un solo click en un botón verde destacado ("Aceptar todas las cookies (Recomendado)"); pero para ejercer tu derecho a la privacidad tenés que demostrar destreza motriz demoliendo quince bloques de cookies ("Rastreo", "Telemetría", "Perfilado", etc.) y luego acertar en una barra superior para confirmar el rechazo.

Para coronar la hostilidad, fallar la bola no reinicia la partida: activa una trampa legalista que asume tu "consentimiento tácito por inacción (Art. 404)" y acepta todas las cookies automáticamente.

El artefacto completo se construyó en dos prompts, dentro de una única conversación de Gemini Canvas.

## Decisiones que tomé yo

**DOM en lugar de `<canvas>`.** La decisión técnica central. Un Breakout convencional suele renderizarse en un `<canvas>`, pero eso oculta el estado detrás de un lienzo gráfico opaco. Al exigir que la arena, la paleta, la bola y cada bloque sean elementos reales del DOM (`<div>` posicionados con `absolute` y `transform`), el estado y la destrucción de cada cookie se reflejan directamente en el árbol del documento y pueden ser inspeccionados con las DevTools del navegador.

**Fricción asimétrica calculada.** Quería satirizar los patrones oscuros reales donde rechazar cookies requiere navegar laberintos de opciones. Acá la metáfora es literal: aceptar toma una fracción de segundo; rechazar exige tiempo, coordinación motriz y reflejos contra una bola cuya velocidad se acelera con cada impacto.

**La trampa del consentimiento tácito.** Si la bola cae al vacío, no hay pantalla de "Game Over" ni reintento inmediato. La interfaz penaliza el error asumiendo que el usuario abandonó el proceso y cede sus datos por inacción, cerrando el modal tras un mensaje formal y desbloqueando el artículo.

**El banner bloquea contenido real.** El modal no flota en una pantalla vacía: interrumpe la lectura de un artículo de noticias sobre privacidad digital difuminado en el fondo (`filter: blur(4px)`). Esto reproduce la impaciencia y frustración habitual del usuario que solo quiere acceder al contenido.

**Ciclo de vida completo del consentimiento.** En lugar de ser una trampa de un solo uso, se incluyó la posibilidad de reabrir el gestor desde el pie de página o mediante un botón flotante, incorporando un badge visual en el modal que audita cómo fue otorgado el consentimiento previo (explícito, tácito o rechazado).

## Qué salió mal y cómo lo corregí

En el primer prompt especifiqué minuciosamente las cinco capas del artefacto (estructura semántica, estilo corporativo, estado, físicas de colisión AABB y constraints de empaque). El modelo interpretó adecuadamente la consigna y generó el juego funcional junto a la página de fondo en un solo paso.

Sin embargo, el flujo quedaba incompleto: una vez cerrado el modal (ya sea aceptando o por victoria/derrota en el juego), la página no ofrecía ninguna vía para volver a configurar la privacidad ni dejaba constancia de qué decisión se había tomado.

Lo corregí en el segundo prompt solicitando:
1. Un enlace en el footer del artículo y un botón flotante para reabrir el gestor en cualquier momento.
2. Un badge visual en el encabezado del modal con colores condicionales según el estado previo.
3. La regeneración limpia del DOM y reinicio de variables (`resetGameState`) para permitir volver a jugar desde cero sin recargar la página y sin romper los event listeners ni la física.

## Prompts

El registro completo está en [prompts.md](prompts.md). El primer prompt definió la arquitectura y la mecánica hostil de Arkanoid en el DOM, mientras que el segundo cerró la persistencia y la reconfiguración del estado.
