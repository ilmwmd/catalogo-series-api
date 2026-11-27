# Arreglar el error "The string did not match the expected pattern" al borrar

## Causa
Ese mensaje lo da Safari cuando la app intenta leer como JSON una respuesta vacía. Ahora mismo solo se evita cuando la API responde exactamente 204. Si responde con otro código correcto (por ejemplo 200) pero sin contenido, o si estás viendo la versión publicada antigua (sin el arreglo anterior), falla igual.

## Cambio (solo en src/lib/series-api.ts, función request)
- Leer la respuesta como texto primero.
- Si el código es 204 o el texto está vacío, devolver sin valor.
- Si no, convertir el texto a JSON; si no es JSON válido, mostrar un error claro en español ("La API devolvió una respuesta no válida") en vez del mensaje técnico.
- Mismo tratamiento para los mensajes de error de la API.

## Pruebas
- Añadir prueba: DELETE con 200 y cuerpo vacío se resuelve sin error.
- Ejecutar todas las pruebas.

## Nota
Si lo viste en la web publicada, hay que volver a publicar para que el arreglo llegue allí.
