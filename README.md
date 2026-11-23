# Sistema de gestión de turnos

Sistema de gestión de turnos y reservas desarrollado con Node.js, Express y MongoDB.
Repositorio utilizado para el curso de Backend de Coderhouse.

## Tecnologías

| Tecnología | Uso |
|------------|-----|
| Node.js (ESM) | Entorno de ejecución |
| Express 5 | Servidor HTTP y ruteo |
| MongoDB + Mongoose 9 | Persistencia de datos y modelado |
| dotenv | Variables de entorno |

## Instalación

1. Clonar el repositorio:

```bash
   git clone <URL-del-repositorio>
   cd Sistema-de-gestion-de-turnos
```

2. Instalar las dependencias:

```bash
   npm install
```

3. Configurar las variables de entorno: copiar el archivo `.env.example` a `.env` y completar los valores.

```bash
   cp .env.example .env
```

`MONGO_URI` es obligatoria: sin ella el servidor no inicia.

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `MONGO_URI` | Sí | Cadena de conexión de MongoDB (Atlas o local) |
| `PORT` | No | Puerto del servidor. Por defecto `8080` |
| `APP_NAME` | No | Nombre mostrado al iniciar. Por defecto `Sistema de Gestión de Turnos` |
| `NODE_ENV` | No | Entorno de ejecución. Por defecto `development` |

4. Iniciar el servidor:

```bash
   npm start
```

## Estructura del proyecto

```
src/
  config/
    config.js
    database.config.js
    handlebars.js
  controllers/
    services.controller.js
    bookings.controller.js
    messages.controller.js
    view.controller.js
  services/
    services.service.js
    bookings.service.js
    messages.service.js
  validations/
    fields.js
    validate.js
    service.validation.js
    booking.validation.js
    message.validation.js
  repositories/
    services.repository.js
    bookings.repository.js
    messages.repository.js
  dao/
    models/
      service.model.js
      booking.model.js
      message.model.js
    services.dao.js
    bookings.dao.js
    messages.dao.js
  routes/
    services.router.js
    bookings.router.js
    messages.router.js
    view.router.js
  views/
    layouts/
      main.handlebars
    services.handlebars
    bookings.handlebars
  public/
    css/
      styles.css
    js/
      socket.js
  utils/
    errors.js
  app.js
  server.js
package.json
.env.example
.gitignore
README.md
```

## Arquitectura por capas

El flujo de una solicitud es:

```
routes -> controllers -> services -> repositories -> DAOs -> MongoDB (Mongoose)
```

| Capa | Responsabilidad |
|------|-----------------|
| `routes` | Define los endpoints y delega en el controller correspondiente |
| `controllers` | Recibe `req`, llama al service y arma la respuesta HTTP (códigos y formato) |
| `services` | Reglas de negocio: validaciones, valores por defecto y verificación de existencia |
| `repositories` | Operaciones de acceso a datos del dominio: buscar, crear, actualizar y eliminar registros |
| `dao` | Persistencia: única capa que consulta y escribe en MongoDB a través de los modelos |
| `models` | Schemas de Mongoose: estructura, tipos y validaciones de cada colección |

### Controllers

Ubicados en `src/controllers`, son la puerta de entrada de cada petición HTTP. Su responsabilidad es traducir entre el mundo HTTP y el dominio:

- Leen datos de `req` (`params`, `query`, `body`).
- Llaman al método correspondiente del service.
- Arman la respuesta con `res.status(...).json(...)`, usando el formato `{ status, payload }` (las operaciones de escritura agregan `message`).
- No contienen reglas de negocio ni acceso a datos.

| Archivo | Handlers | Service asociado |
|---------|----------|------------------|
| `services.controller.js` | `getServices`, `getServiceById`, `createService`, `updateService`, `deleteService` | `servicesService` |
| `bookings.controller.js` | `getBookings`, `getBookingById`, `createBooking`, `addServiceToBooking` | `bookingsService` |
| `messages.controller.js` | `getMessages`, `getMessageById`, `createMessage`, `updateMessage`, `deleteMessage` | `messagesService` |
| `view.controller.js` | `getServicesView`, `getBookingsView` | `servicesService`, `bookingsService` |

El manejo de errores es uniforme: cada handler envuelve su lógica en `try/catch` y delega en `handleControllerError`. Esa utilidad responde con el `status` del error de negocio (`400`, `404`, etc.), traduce los errores de Mongoose (`CastError` y `ValidationError`) a `400` y, ante un error inesperado, registra el detalle y responde `500` sin exponerlo al cliente.

### Repositories

Ubicados en `src/repositories`, actúan como intermediarios entre los services y los DAOs. Encapsulan las operaciones de acceso a datos propias del dominio, de modo que el service pida "buscar por id" o "crear" sin saber cómo se almacena la información.

| Archivo | Métodos |
|---------|---------|
| `services.repository.js` | `getAll`, `count`, `getById`, `create`, `update`, `delete` |
| `bookings.repository.js` | `getAll`, `getById`, `create`, `update` |
| `messages.repository.js` | `getAll`, `getById`, `create`, `update`, `delete` |

Detalles de implementación:

- Reciben el DAO por constructor (`constructor(dao = new ServicesDao())`), lo que permite inyectar otro DAO en pruebas sin tocar los datos reales.
- Delegan cada operación en el DAO correspondiente; no conocen MongoDB ni los modelos.
- No validan datos: eso es responsabilidad de los services.

### DAO (Data Access Object)

Ubicados en `src/dao`, son la única capa que conoce el medio de persistencia. Hoy trabajan contra MongoDB usando los modelos de Mongoose.

| Archivo | Modelo | Colección |
|---------|--------|-----------|
| `services.dao.js` | `serviceModel` | `services` |
| `bookings.dao.js` | `bookingModel` | `bookings` |
| `messages.dao.js` | `messageModel` | `messages` |

Interfaz:

| Método | Descripción | Disponible en |
|--------|-------------|---------------|
| `getAll()` | Devuelve todos los documentos de la colección (`find`); en reservas aplica `populate` | servicios, reservas y mensajes |
| `getAll(options)` | Devuelve documentos con `filter`, `sort`, `skip` y `limit` (paginación); en reservas aplica `populate` | servicios y reservas |
| `count(filter)` | Cuenta los documentos que cumplen el filtro (`countDocuments`) | servicios y reservas |
| `getById(id)` | Busca un documento por su `_id` (`findById`); en reservas aplica `populate` | servicios, reservas y mensajes |
| `create(data)` | Inserta un documento nuevo (`create`); MongoDB genera el `_id` | servicios, reservas y mensajes |
| `update(id, data)` | Actualiza con `findByIdAndUpdate`, devuelve el documento actualizado y valida el schema (`runValidators`) | servicios, reservas y mensajes |
| `delete(id)` | Elimina con `findByIdAndDelete` y devuelve el documento eliminado | servicios y mensajes |

Detalles de implementación:

- En `services.dao.js`, `bookings.dao.js` y `messages.dao.js`, `update` descarta `_id` y `__v` antes de enviar los cambios, porque `_id` es inmutable y `__v` lo administra Mongoose.
- Los DAOs no aplican reglas de negocio: reciben los filtros y las opciones de paginación ya construidos por el service y solo resuelven la consulta a MongoDB.
- El `_id` es un `ObjectId` generado automáticamente por MongoDB; no se generan ids manualmente en la aplicación.

### Modelos de Mongoose

Ubicados en `src/dao/models`, definen la estructura de cada colección:

| Archivo | Schema | Detalles |
|---------|--------|----------|
| `service.model.js` | `serviceSchema` | Servicios con validaciones y `timestamps` |
| `booking.model.js` | `bookingSchema` | Reservas con subdocumentos embebidos de servicios y `timestamps` |
| `message.model.js` | `messageSchema` | Mensajes con `user`, `message` y `timestamps` |

- Los tres modelos usan `{ timestamps: true }`, así que Mongoose agrega `createdAt` y `updatedAt` automáticamente.
- En la reserva, `services` es un array de subdocumentos `{ service, quantity }` con `_id: false` para que cada ítem no genere un `_id` propio.
- `service` es un `ObjectId` con `ref: 'Service'`: guarda la referencia al servicio, no el objeto completo, y permite usar `populate()`.

### Utils

Ubicados en `src/utils`, agrupan utilidades transversales reutilizables por varias capas.

| Archivo | Contenido |
|---------|-----------|
| `errors.js` | `createHttpError(status, message)`, `handleControllerError(res, error, fallbackMessage)` |

`createHttpError` crea un `Error` común y le agrega la propiedad `status`. Esto permite que los services informen el código HTTP adecuado (`400` para datos inválidos, `404` para recursos inexistentes) sin importar Express ni acoplarse a la capa HTTP.

`handleControllerError` centraliza la respuesta de error de los controllers: usa `error.status` si existe, traduce `CastError` y `ValidationError` de Mongoose a `400`, y para cualquier error inesperado registra el detalle en consola y responde `500` con un mensaje genérico.

### Validaciones (Zod)

Ubicadas en `src/validations`, definen los esquemas de entrada con Zod y se ejecutan en la capa de services, antes de cualquier consulta a MongoDB. Todos los endpoints de escritura (services, bookings y messages) pasan por un schema. No se usan middlewares de validación: los routers solo derivan al controller y los modelos de Mongoose solo definen la estructura de persistencia, sin importar Zod.

| Archivo | Contenido |
|---------|-----------|
| `fields.js` | Builders reutilizables (`text`, `number`, `objectId`) con mensajes en español |
| `validate.js` | `validate(schema, data)`: ejecuta `safeParse` y lanza un `400` con el detalle de los campos inválidos |
| `service.validation.js` | `createServiceSchema`, `updateServiceSchema` |
| `booking.validation.js` | `createBookingSchema`, `addServiceToBookingSchema` |
| `message.validation.js` | `createMessageSchema`, `updateMessageSchema` |

Esquemas aplicados:

| Operación | Schema | Valida |
|-----------|--------|--------|
| POST `/api/services` | `createServiceSchema` | `name`, `description`, `duration`, `price` y `category` obligatorios; `duration` entero positivo; `price` ≥ 0; `available` booleano opcional |
| PUT `/api/services/:sid` | `updateServiceSchema` | Todos los campos opcionales, pero debe venir al menos uno válido |
| POST `/api/bookings` | `createBookingSchema` | `clientName`, `clientEmail` (formato email), `date` (`YYYY-MM-DD` real), `time` (`HH:mm`) y `status` opcional (`pendiente`, `confirmada`, `cancelada`) |
| POST `/api/bookings/:bid/services/:sid` | `addServiceToBookingSchema` | `bid` y `sid` con formato de ObjectId (24 caracteres hexadecimales) |
| POST `/api/messages` | `createMessageSchema` | `user` y `message` obligatorios, textos no vacíos |
| PUT `/api/messages/:mid` | `updateMessageSchema` | Todos los campos opcionales, pero debe venir al menos uno válido |

Si la validación falla, el service lanza un `400` y el controller responde con el formato de error habitual:

```json
{
  "status": "error",
  "message": "Datos inválidos: name: El nombre es obligatorio; price: El precio debe ser un número"
}
```

Los datos se validan antes de llamar al repository/DAO, por lo que una petición inválida nunca llega a MongoDB. Zod también descarta los campos desconocidos del body.

### ServicesService

Ubicado en `src/services/services.service.js`, contiene las reglas de negocio de los servicios:

| Método | Descripción |
|--------|-------------|
| `getServices(query)` | Devuelve los servicios paginados, aplicando filtros de categoría y disponibilidad, orden y paginación |
| `getServiceById(id)` | Devuelve un servicio por su id |
| `createService(data)` | Valida el body con `createServiceSchema` y crea un nuevo servicio |
| `updateService(id, data)` | Valida el body con `updateServiceSchema` y actualiza los datos de un servicio |
| `deleteService(id)` | Elimina un servicio |

### BookingsService

Ubicado en `src/services/bookings.service.js`, contiene las reglas de negocio de las reservas:

| Método | Descripción |
|--------|-------------|
| `getBookings(query)` | Devuelve las reservas paginadas, aplicando filtro por estado, orden y paginación; incluye los servicios populados (`populate`) |
| `getBookingById(bid)` | Devuelve una reserva por su id con los servicios populados (`populate`) |
| `createBooking(data)` | Valida el body con `createBookingSchema` y crea una nueva reserva |
| `addServiceToBooking(bid, sid)` | Valida los ids con `addServiceToBookingSchema`, verifica que existan la reserva y el servicio, y añade el servicio |

`addServiceToBooking` busca el servicio por id; si ya está en la reserva incrementa su `quantity`, y si no, agrega `{ service: ObjectId, quantity: 1 }`.

### MessagesService

Ubicado en `src/services/messages.service.js`, contiene las reglas de negocio de los mensajes:

| Método | Descripción |
|--------|-------------|
| `getMessages()` | Devuelve todos los mensajes en orden cronológico |
| `getMessageById(mid)` | Devuelve un mensaje por su id |
| `createMessage(data)` | Valida el body con `createMessageSchema` y crea un mensaje |
| `updateMessage(mid, data)` | Valida el body con `updateMessageSchema` y actualiza los datos de un mensaje |
| `deleteMessage(mid)` | Elimina un mensaje |

## Modelos de datos

En los ejemplos, los `_id` y las referencias se muestran como texto porque así se serializan en JSON; en MongoDB son `ObjectId`.

### Servicio

```json
{
  "_id": "6ae6497e4d32bffcdc09d146",
  "name": "Corte de pelo",
  "description": "Corte clásico",
  "duration": 30,
  "price": 5000,
  "category": "Peluquería",
  "available": true,
  "createdAt": "2026-10-31T20:03:10.383Z",
  "updatedAt": "2026-10-31T20:03:10.383Z",
  "__v": 0
}
```

- Campos obligatorios: `name`, `description`, `duration` (mínimo `1`), `price` (mínimo `0`) y `category`.
- `available` es opcional y por defecto es `true`.
- El `_id` lo genera MongoDB; si se envía un `id` en el body, se ignora.
- `createdAt` y `updatedAt` los agrega Mongoose automáticamente.

### Reserva

```json
{
  "_id": "6ae64f989addb2965d84db9a",
  "clientName": "Sofia Lorenzetti",
  "clientEmail": "sofi.201@gmail.com",
  "date": "2026-10-28",
  "time": "15:40",
  "status": "pendiente",
  "services": [
    {
      "service": "6ae64ad59c19a11fc92542bd",
      "quantity": 1
    }
  ],
  "createdAt": "2026-10-31T20:10:00.000Z",
  "updatedAt": "2026-10-31T20:10:00.000Z",
  "__v": 0
}
```

- Campos obligatorios: `clientName`, `clientEmail`, `date` y `time`.
- `status` es opcional y por defecto es `"pendiente"`.
- `date` y `time` se guardan como texto para conservar el formato `YYYY-MM-DD` y `HH:mm`.
- `services` es un array de referencias: `service` es un `ObjectId` que apunta al documento de la colección `services`, y `quantity` es un número mayor o igual a `1`.

En la base se guarda solo la referencia (`service: ObjectId`). `GET /api/bookings/:bid` aplica `populate('services.service')`, así que la respuesta reemplaza cada `ObjectId` por el documento completo del servicio, junto con los datos de la reserva:

```json
{
  "status": "success",
  "payload": {
    "_id": "6ae64f989addb2965d84db9a",
    "clientName": "Sofia Lorenzetti",
    "clientEmail": "sofi.201@gmail.com",
    "date": "2026-10-28",
    "time": "15:40",
    "status": "pendiente",
    "services": [
      {
        "service": {
          "_id": "6ae64ad59c19a11fc92542bd",
          "name": "Corte de pelo",
          "description": "Corte clásico",
          "duration": 30,
          "price": 5000,
          "category": "Peluquería",
          "available": true
        },
        "quantity": 1
      }
    ]
  }
}
```

El listado `GET /api/bookings` y el detalle `GET /api/bookings/:bid` devuelven las reservas con los servicios populados. Al actualizar una reserva, `addServiceToBooking` vuelve a guardar solo las referencias (`service: ObjectId`, `quantity`).

### Mensaje

```json
{
  "_id": "6ae65a1c9addb2965d84dc12",
  "user": "Sofia Lorenzetti",
  "message": "Hola, quisiera confirmar mi turno.",
  "createdAt": "2026-10-31T20:20:00.000Z",
  "updatedAt": "2026-10-31T20:20:00.000Z",
  "__v": 0
}
```

- Campos obligatorios: `user` y `message`.
- Ambos campos se guardan como texto y se recortan con `trim`.
- `createdAt` y `updatedAt` los agrega Mongoose automáticamente.
- El listado se devuelve en orden cronológico (más antiguos primero).

## Ejecución

```bash
npm start       # inicia el servidor con node --watch
```

El servidor se conecta primero a MongoDB y, si la conexión es exitosa, queda disponible en `http://localhost` en el puerto definido en `.env`.

## Vistas (Handlebars)

Las vistas usan `express-handlebars` con el layout `main.handlebars` y comparten los estilos de `src/public/css/styles.css`. Los datos se leen de MongoDB a través de las mismas capas del backend (`view.controller.js` → service → repository → DAO).

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/services` | Lista los servicios paginados con su disponibilidad y controles de anterior/siguiente |
| GET | `/bookings` | Lista las reservas paginadas con sus servicios populados y controles de anterior/siguiente |

Las mismas rutas también están disponibles con el prefijo `/views` (por ejemplo `/views/services` o `/views/bookings`).

La vista `/services` usa la misma paginación que la API: acepta los query params `category`, `available`, `page`, `limit`, `sortBy` y `order`, y muestra controles de **Anterior / Siguiente** que conservan los filtros y el orden seleccionados. Por ejemplo: `/services?category=salud&page=2&limit=5`.

La vista `/bookings` también usa la paginación de la API: acepta `status`, `page`, `limit`, `sortBy` y `order`, y muestra los mismos controles de **Anterior / Siguiente**. Por ejemplo: `/bookings?status=pendiente&page=2&limit=9`.

`server.js` también expone actualizaciones en vivo por Socket.IO:

- `services_updated`: envía la lista de servicios al conectarse y en cada cambio de la colección.
- `bookings_updated`: envía la lista de reservas (con los servicios populados) al conectarse y en cada cambio de la colección.

El cliente está centralizado en `src/public/js/socket.js` y se sirve como `/js/socket.js`. Las vistas solo incluyen los scripts; la conexión, el escapado de HTML y el renderizado de las tarjetas en vivo viven en ese archivo.

## Endpoints

Las respuestas siguen el formato `{ status, payload }` y las operaciones de escritura agregan `message`. Los listados paginados de servicios y reservas agregan además los metadatos en el primer nivel (`totalDocs`, `totalPages`, `page`, `limit`, `hasPrevPage`, `hasNextPage`, `prevPage`, `nextPage`).

### Services

Ruta base: `/api/services`, cada ruta deriva la responsabilidad al método correspondiente del controlador services.controller.js

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| GET | `/api/services` | Devuelve los servicios paginados. Acepta filtros, orden y paginación por query params | `200`, `400` |
| GET | `/api/services/:sid` | Devuelve un servicio por su `_id` | `200`, `404` |
| POST | `/api/services` | Crea un servicio. El `_id` lo genera MongoDB | `201`, `400` |
| PUT | `/api/services/:sid` | Actualiza un servicio. No permite modificar el `_id` | `200`, `400`, `404` |
| DELETE | `/api/services/:sid` | Elimina un servicio | `200`, `404` |

### Filtros, orden y paginación (GET /api/services)

| Query param | Tipo | Por defecto | Descripción |
|-------------|------|-------------|-------------|
| `category` | texto | — | Filtra por categoría (exacta, sin distinguir mayúsculas/minúsculas). Ej: `category=salud` |
| `available` | `true` / `false` | — | Filtra por disponibilidad. Ej: `available=true` |
| `page` | entero ≥ 1 | `1` | Página a devolver |
| `limit` | entero entre 1 y 100 | `9` | Cantidad de resultados por página |
| `sortBy` | texto | `createdAt` | Campo de orden: `name`, `price`, `duration`, `category`, `available`, `createdAt` o `updatedAt` |
| `order` | `asc` / `desc` | `asc` | Sentido del orden |

Se pueden combinar todos los parámetros. Ejemplos:

- Filtro por categoría: `GET /api/services?category=salud`
- Filtro por disponibilidad: `GET /api/services?available=true`
- Paginación: `GET /api/services?page=2&limit=5`
- Ordenamiento: `GET /api/services?sortBy=price&order=desc`
- Combinado: `GET /api/services?category=salud&available=true&page=2&limit=5&sortBy=price&order=desc`

Los valores inválidos (por ejemplo `page=0`, `limit=abc`, `sortBy=password` u `order=up`) responden `400`.

La respuesta incluye el listado en `payload` y los metadatos de paginación en el primer nivel:

```json
{
  "status": "success",
  "payload": [
    {
      "_id": "6ae6497e4d32bffcdc09d146",
      "name": "Corte de pelo",
      "description": "Corte clásico",
      "duration": 30,
      "price": 5000,
      "category": "Peluquería",
      "available": true
    }
  ],
  "totalDocs": 25,
  "totalPages": 3,
  "page": 2,
  "limit": 9,
  "hasPrevPage": true,
  "hasNextPage": true,
  "prevPage": 1,
  "nextPage": 3
}
```

- `totalDocs`: cantidad total de resultados que cumplen los filtros.
- `totalPages`: total de páginas (`0` si no hay resultados).
- `page`: página actual.
- `limit`: cantidad de resultados por página.
- `hasPrevPage` / `hasNextPage`: indican si existe página anterior o siguiente.
- `prevPage` / `nextPage`: número de la página anterior o siguiente, o `null` si no existe.

### Bookings

Ruta base: `/api/bookings`, cada ruta deriva la responsabilidad al método correspondiente del controlador bookings.controller.js

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| GET | `/api/bookings` | Devuelve las reservas paginadas con los datos completos de cada servicio asociado (`populate`). Acepta filtro por estado, orden y paginación por query params | `200`, `400` |
| GET | `/api/bookings/:bid` | Devuelve una reserva por su `_id` con los datos completos de cada servicio asociado (`populate`) | `200`, `404` |
| POST | `/api/bookings` | Crea una reserva. El `_id` lo genera MongoDB | `201`, `400` |
| POST | `/api/bookings/:bid/services/:sid` | Añade un servicio a una reserva existente | `200`, `400`, `404` |

### Filtros, orden y paginación (GET /api/bookings)

| Query param | Tipo | Por defecto | Descripción |
|-------------|------|-------------|-------------|
| `status` | texto | — | Filtra por estado: `pendiente`, `confirmada` o `cancelada`. Ej: `status=pendiente` |
| `page` | entero ≥ 1 | `1` | Página a devolver |
| `limit` | entero entre 1 y 100 | `9` | Cantidad de resultados por página |
| `sortBy` | texto | `createdAt` | Campo de orden: `clientName`, `clientEmail`, `date`, `time`, `status`, `createdAt` o `updatedAt` |
| `order` | `asc` / `desc` | `asc` | Sentido del orden |

Se pueden combinar todos los parámetros. Ejemplos:

- Filtro por estado: `GET /api/bookings?status=confirmada`
- Paginación: `GET /api/bookings?page=2&limit=9`
- Ordenamiento: `GET /api/bookings?sortBy=date&order=desc`
- Combinado: `GET /api/bookings?status=pendiente&page=2&limit=9&sortBy=date&order=desc`

Los valores inválidos (por ejemplo `page=0`, `limit=abc`, `status=otro` o `sortBy=password`) responden `400`.

La respuesta incluye el listado en `payload` y los metadatos de paginación en el primer nivel, con el mismo formato que `/api/services`:

```json
{
  "status": "success",
  "payload": [
    {
      "_id": "6ae64f989addb2965d84db9a",
      "clientName": "Sofia Lorenzetti",
      "clientEmail": "sofi.201@gmail.com",
      "date": "2026-10-28",
      "time": "15:40",
      "status": "pendiente",
      "services": [
        {
          "service": {
            "_id": "6ae64ad59c19a11fc92542bd",
            "name": "Corte de pelo",
            "description": "Corte clásico",
            "duration": 30,
            "price": 5000,
            "category": "Peluquería",
            "available": true
          },
          "quantity": 1
        }
      ]
    }
  ],
  "totalDocs": 18,
  "totalPages": 2,
  "page": 1,
  "limit": 9,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevPage": null,
  "nextPage": 2
}
```

### Consultar una reserva con servicios completos

`GET /api/bookings/:bid` aplica `populate('services.service')`: en la respuesta, cada `services[].service` es el documento completo del servicio (nombre, descripción, precio, duración, categoría y disponibilidad) en lugar de su `ObjectId`.

```http
GET /api/bookings/6ae64f989addb2965d84db9a
```

```json
{
  "status": "success",
  "payload": {
    "_id": "6ae64f989addb2965d84db9a",
    "clientName": "Sofia Lorenzetti",
    "clientEmail": "sofi.201@gmail.com",
    "date": "2026-10-28",
    "time": "15:40",
    "status": "pendiente",
    "services": [
      {
        "service": {
          "_id": "6ae64ad59c19a11fc92542bd",
          "name": "Corte de pelo",
          "description": "Corte clásico",
          "duration": 30,
          "price": 5000,
          "category": "Peluquería",
          "available": true
        },
        "quantity": 1
      }
    ]
  }
}
```

Si la reserva no existe responde `404`; si el `bid` no tiene formato de ObjectId, `handleControllerError` responde `400`.

### Messages

Ruta base: `/api/messages`, cada ruta deriva la responsabilidad al método correspondiente del controlador messages.controller.js

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| GET | `/api/messages` | Devuelve todos los mensajes en orden cronológico | `200` |
| GET | `/api/messages/:mid` | Devuelve un mensaje por su `_id` | `200`, `404` |
| POST | `/api/messages` | Crea un mensaje. El `_id` lo genera MongoDB | `201`, `400` |
| PUT | `/api/messages/:mid` | Actualiza un mensaje | `200`, `400`, `404` |
| DELETE | `/api/messages/:mid` | Elimina un mensaje | `200`, `404` |

## Notas

- La persistencia es MongoDB a través de Mongoose. Las colecciones utilizadas son `services`, `bookings` y `messages`.
- Los ids son `ObjectId` generados por MongoDB, no UUID.
- Los servicios se referencian dentro de las reservas por `ObjectId`, no como objeto completo.
- Los archivos JSON de `src/data` de la versión anterior fueron eliminados: la persistencia es exclusivamente MongoDB.
