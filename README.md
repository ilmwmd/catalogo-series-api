# catalogo-series-api

Quiero el frontend de un catálogo de series de TV: una página donde se pueda
hacer un CRUD completo: ver las series, agregar una nueva, editar una existente
y borrarla.

El backend YA EXISTE: es una API REST publicada en
https://catalogo-series-api.onrender.com/

No crees base de datos, ni Lovable Database, ni Supabase, ni backend propio.
No uses datos de ejemplo inventados: todas las operaciones se hacen con fetch
a esta API. La lista inicial debe venir siempre de GET /series.

Rutas de la API:

- GET /series → devuelve una lista de series.
- GET /series/{id} → devuelve una serie, o 404 si no existe.
- POST /series → crea una serie. Cuerpo JSON con TODOS estos campos:
  {"titulo": "texto", "anio_estreno": 2008, "temporadas": 5,
   "genero": "Drama", "plataforma": "Netflix", "estado": "Finalizada",
   "sinopsis": "texto", "imagen_url": ""}
  anio_estreno es entero entre 1900 y 2030; temporadas es entero entre 1 y 20;
  estado solo admite "En emisión" o "Finalizada". Devuelve la serie creada con su id.
- PUT /series/{id} → edita una serie. Cuerpo JSON:
  {"estado": "Finalizada", "imagen_url": "", "temporadas": 5}
  Los tres campos son obligatorios. Devuelve la serie editada.
- DELETE /series/{id} → borra una serie. Devuelve el objeto de la serie borrada.

Serie de ejemplo real, tal como la devuelve la API:

{"id":3,"titulo":"Breaking Bad","anio_estreno":2008,"temporadas":5,"genero":"Drama","plataforma":"Netflix","estado":"Finalizada","sinopsis":"Walter White, un profesor de química, comienza a fabricar metanfetamina tras descubrir que padece cáncer.","imagen_url":null}

Usa exactamente estos nombres de campo: id, titulo, anio_estreno, temporadas,
genero, plataforma, estado, sinopsis, imagen_url.

La API está en un servidor gratuito que se duerme: la primera petición puede
tardar casi un minuto. Muestra un aviso de "Cargando series..." mientras
cualquier petición esté en curso, y no pongas un timeout corto. Si una petición
falla (incluido un 404), muestra un mensaje de error claro en la página en lugar
de dejarla en blanco. Después de crear, editar o borrar, vuelve a llamar a
GET /series para refrescar la lista.

Pantallas:

- Una cuadrícula de tarjetas, una por serie, con el título grande, y debajo
  género, plataforma, año de estreno, temporadas, estado y sinopsis. Si
  imagen_url no está vacío, muestra la imagen; si es null o "", muestra un
  placeholder sin inventar URLs.
- Un formulario para agregar una serie con los 8 campos del POST y validación
  de los rangos y del estado antes de enviar.
- En cada tarjeta, un botón "Editar" que abra el formulario rellenado con los
  datos de esa serie (id incluido) y un botón "Borrar". Antes de borrar, pide
  confirmación al usuario.

Estilo: 

Sigue un formato de estilo parecido a Netflix con colores negros y acentos azules de estilo moderno
Haz la pagina responsive en todos los formatos de pantalla (movil, tablet, pc y tv)

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d3981327-ad5c-535e-bc7b-58c1fbe63251).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
