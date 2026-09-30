# 📋 Trabajo Práctico 2: Diseño de Contrato de API (OpenAPI)

> **Modalidad:** Individual  
> **Alcance:** Creación del contrato `openapi.yaml` para una API a elección. Inicia en clase y se finaliza en casa.

---

## 🎯 Objetivo: "Dictale a una IA el contrato de tu API"

Elegir un dominio conocido y modelarlo formalmente como API REST. **No se requiere programar código ni backend en esta etapa**: el entregable es exclusivamente el contrato formal de especificación.

> [!TIP]
> **Ejemplos de dominio:** Biblioteca, gimnasio, recetario, veterinaria, torneo deportivo, etc. Cualquier contexto que involucre **al menos dos recursos relacionados entre sí**.

---

## 📌 Requisitos Técnicos del Contrato

| # | Requisito | Detalle |
| :-: | :--- | :--- |
| **1** | **Tres Métodos HTTP** | Incluir como mínimo operaciones con `GET`, `POST` y `DELETE`. |
| **2** | **Jerarquía de Recursos** | Un recurso anidado dentro de otro, explícito y visible en el path *(ej. `/autores/{autorId}/libros`)*. |
| **3** | **Respuestas de Error** | Documentar adecuadamente al menos un código de error de cliente (`400 Bad Request` o `404 Not Found`). |
| **4** | **Schemas Tipados** | Componentes/schemas con especificación de atributos: `type`, lista de `required` y `format` donde corresponda *(ej. `date`, `email`, `uuid`)*. |

---

## ⚙️ Reglas y Restricciones (*Constraints*)

* **Individual:** Cada estudiante diseña y entrega su propio contrato.
* **Una sola conversación de IA:** Todo el proceso debe realizarse dentro de un único hilo/sesión de chat con la IA, desde el primer prompt hasta el resultado final.
* **Herramienta libre:** Se puede utilizar cualquier asistente de IA (ChatGPT, Claude, Gemini, etc.).

---

## 📦 Entregables

Dentro del repositorio, crear una carpeta `tp2/` con la siguiente estructura de tres archivos:

```text
tp2/
├── openapi.yaml   # El contrato OpenAPI 3.x completo.
├── prompts.md     # Secuencia ordenada de prompts utilizados, con una breve anotación explicativa por prompt.
└── README.md      # Informe: dominio elegido, decisiones tomadas, qué falló o desvió la IA y cómo se corrigió.
```

> [!NOTE]
> En el repositorio de referencia de la materia existe una carpeta `tp2/` de ejemplo resuelta con la API de proyectos y tareas utilizada en clase.

---

## 💡 Reflexión y Próximos Pasos

> *“Ustedes no tipearon nada. Lo que dirigieron fue el contrato. Y ahora tiene archivo.*  
> *El rol — supervisor arquitectónico — sobrevivió la mudanza al servidor.”*

* **Próxima clase:** Tomaremos el archivo `openapi.yaml` resultante y se lo daremos a una IA local para generar la implementación del backend.
