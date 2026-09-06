# Prompts — TP 1

El registro del proceso, en orden. Dos prompts en una sola conversación de Gemini Canvas. El artefacto quedó terminado en el segundo.

---

## 1 — Prompt inicial

```
Construí un banner de consentimiento de cookies donde la única forma de rechazar el rastreo es destruir un muro de cookies jugando una partida de Arkanoid (Breakout).

Estructura:
- Una página web de fondo simulada: un artículo de blog o noticias con titular ("El futuro de la privacidad digital"), fecha, autor y un par de párrafos de texto con tipografía de lectura, bloqueado por un overlay oscuro.
- Un modal centrado (<div id="cookie-modal">) con:
  - <header>: título "Valoramos tu privacidad", un texto formal que explique que para rechazar las cookies se debe desmantelar manualmente cada módulo de seguimiento, y un botón bien visible: "Aceptar todas las cookies (Recomendado)".
  - <main>: el área de juego (la arena de Arkanoid, tamaño fijo rectangular, ej. 480x360px) que contiene:
    - En el extremo superior: una barra objetivo que dice "RECHAZAR TODO".
    - Debajo del objetivo: 3 filas de 5 bloques de cookies cada una (15 bloques en total). Cada bloque muestra un texto corto: "Rastreo", "Terceros", "Telemetría", "Ubicación", "Perfilado".
    - Una paleta rectangular controlable horizontalmente.
    - Una bola circular.
  - <footer>: contador de "Cookies activas restantes", instrucciones breves ("Mové el mouse para la paleta. Click para lanzar.") y un área de mensajes de estado.

Estilo:
- Estética de banner corporativo formal y limpio: tonos grises y blancos, tipografía sans-serif de sistema (Inter, Roboto o Arial).
- El botón de "Aceptar todas" debe ser verde, grande, moderno y con cursor pointer.
- Los bloques de cookies: rectángulos con bordes suaves, fondo azul/pizarra y tipografía pequeña blanca.
- La barra objetivo "RECHAZAR TODO": fondo gris apagado con candado/borde discontinuo mientras haya cookies; cuando se destruyen todas, cambia a color amarillo/dorado destellante.
- La paleta: barra oscura con extremos redondeados. La bola: círculo blanco o amarillo con leve sombra.
- El área de juego debe tener un borde definido y fondo oscuro para contrastar con la bola y los bloques.

Comportamiento:
- Estado: jugando (booleano), bolaLanzada (booleano), cookiesRestantes (número, inicia en 15), bolaPos ({x, y}), bolaVel ({vx, vy}), paletaX (número).
- Control de la paleta: el evento mousemove sobre el contenedor de la arena actualiza paletaX centrado en el cursor, restringido a los límites izquierdo y derecho del área.
- Lanzamiento: al hacer click en la arena, si bolaLanzada es false, la bola adquiere velocidad vertical hacia arriba (-vy) y arranca el loop de animación (requestAnimationFrame).
- Físicas y Colisiones:
  - La bola rebota en las paredes izquierda, derecha y techo del área de juego.
  - Rebote en la paleta: si la bola impacta la paleta, invierte vy y ajusta vx según la distancia relativa al centro de la paleta (más abierto hacia los extremos).
  - Colisión con bloques de cookies: si la bola solapa un bloque activo, dicho bloque se elimina del DOM (o se oculta), la bola invierte su dirección vertical (vy), y cookiesRestantes disminuye en 1.
  - Bloque objetivo "RECHAZAR TODO": mientras queden cookies, actúa como pared indestructible y hace rebotar la bola. Cuando cookiesRestantes llega a 0, impactar este bloque declara la victoria: el modal muestra "Has rechazado todas las cookies exitosamente" y se cierra tras 1.5s, permitiendo leer el artículo.
- La trampa hostil (derrota por caída):
  - Si la bola supera el borde inferior de la paleta, cae al vacío.
  - En ese instante la bola se detiene y se dispara el mensaje: "¡Pelota perdida! Por inacción se asume tu consentimiento tácito (Art. 404 RGPD). Todas las cookies han sido aceptadas."
  - El modal se cierra automáticamente tras 2 segundos y el artículo queda desbloqueado.
- Botón "Aceptar todas las cookies": al clickearlo, cierra el modal inmediatamente sin jugar.

Constraints:
- Un solo archivo HTML, con el CSS dentro de <style> y el JS dentro de <script>.
- Vanilla JS puro, sin frameworks ni dependencias externas.
- Todos los elementos del juego (arena, paleta, bola, bloques y objetivo) deben ser elementos del DOM (divs posicionados con absolute/transform). No usar <canvas>: el estado y la destrucción de bloques deben verse reflejados directamente en el árbol del DOM.
```

**Qué intentaba lograr:** El artefacto completo en una sola iteración, estructurando las cinco capas: semántica, estilo corporativo, comportamiento basado en estado y constraints de empaque (archivo único, Vanilla JS y manipulación del DOM sin canvas).

**Qué devolvió:** El minijuego funcional de Arkanoid para rechazar cookies y la página de fondo simulada bloqueada por el overlay.

**Qué hice con eso:** Lo acepté como base. Sin embargo, la página de fondo no ofrecía ninguna vía para reabrir el modal y volver a configurar las cookies una vez cerrado.

---

## 2 — Agregar la posibilidad de volver a configurar las cookies

```
Modificá el código anterior para permitir al usuario volver a abrir el gestor de cookies desde la página de fondo una vez cerrado el modal.

Estructura:
- En la página de fondo (el artículo simulado):
  - Agregar al final un <footer> con derechos de autor y un enlace/botón sutil: "Configuración de cookies".
  - Opcional: un pequeño botón flotante discreto en la esquina inferior izquierda (ícono o texto "🍪 Privacidad").
- En el modal del juego:
  - Un indicador en el <header> que muestre el "Estado actual del consentimiento": "Aceptadas (explícito)", "Aceptadas (por abandono/tácito)" o "Rechazadas".

Estilo:
- Enlace del footer del artículo: diseño típico de pie de página corporativo (texto gris claro, tamaño reducido ~12px, centrado o alineado con términos y condiciones).
- Indicador de estado en el modal: una pequeña etiqueta (badge) con color condicional:
  - Verde: si fueron aceptadas.
  - Rojo/Naranja: si fueron aceptadas por inacción/caída de bola.
  - Azul o Gris: si fueron rechazadas.

Comportamiento:
- Al hacer click en "Configuración de cookies" (o en el botón flotante):
  - Se vuelve a mostrar el overlay oscuro y el modal centrado.
  - Se reinicia el estado completo del juego de Arkanoid:
    - Se reconstruyen y vuelven a insertar en el DOM los 15 bloques de cookies originales.
    - La bola vuelve a su posición inicial sobre la paleta.
    - La variable bolaLanzada vuelve a false y cookiesRestantes a 15.
    - La barra "RECHAZAR TODO" vuelve a su estado bloqueado.
    - El área de mensajes del juego se limpia a las instrucciones iniciales.
  - Si el usuario vuelve a perder la bola o vuelve a clickear "Aceptar todas", el estado de consentimiento se actualiza nuevamente y el ciclo se repite.

Constraints:
- Mantener todo en el mismo archivo único (HTML + <style> + <script>).
- No romper la física ni los eventos existentes del juego.
- Vanilla JS, manipulación limpia del DOM para la regeneración de los bloques.
```

**Qué intentaba lograr:** Permitir reabrir la configuración de cookies desde la página de fondo tras cerrar el modal y sumar un indicador claro del estado de consentimiento previo (explícito, tácito o rechazado).

**Qué devolvió:** El enlace en el footer, el badge de estado en el modal según la resolución anterior y el reinicio íntegro del tablero en el DOM sin romper la lógica existente.

**Qué hice con eso:** Lo di por finalizado; el artefacto quedó completo y funcional según lo planificado.

---

## Conversación completa

Una sola conversación de Gemini Canvas, sin reiniciar el hilo. El artefacto final tiene 581 líneas en un archivo.
