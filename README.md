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
  controllers/
    services.controller.js
    bookings.controller.js
  services/
    services.service.js
    bookings.service.js
  repositories/
    services.repository.js
    bookings.repository.js
  dao/
    models/
      service.model.js
      booking.model.js
    services.dao.js
    bookings.dao.js
  routes/
    services.router.js
    bookings.router.js
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

El manejo de errores se apoya en los errores de negocio que lanza el service: si el error trae la propiedad `status`, el controller responde con ese código HTTP (por ejemplo `400` o `404`); si no, responde `500` o relanza el error. Un caso típico es el `404` cuando un recurso no existe.

### Repositories

Ubicados en `src/repositories`, actúan como intermediarios entre los services y los DAOs. Encapsulan las operaciones de acceso a datos propias del dominio, de modo que el service pida "buscar por id" o "crear" sin saber cómo se almacena la información.

| Archivo | Métodos |
|---------|---------|
| `services.repository.js` | `getAll`, `getById`, `create`, `update`, `delete` |
| `bookings.repository.js` | `getAll`, `getById`, `create`, `update` |

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

Interfaz:

| Método | Descripción | Disponible en |
|--------|-------------|---------------|
| `getAll()` | Devuelve todos los documentos de la colección (`find`) | servicios y reservas |
| `getById(id)` | Busca un documento por su `_id` (`findById`) | servicios y reservas |
| `create(data)` | Inserta un documento nuevo (`create`); MongoDB genera el `_id` | servicios y reservas |
| `update(id, data)` | Actualiza con `findByIdAndUpdate`, devuelve el documento actualizado y valida el schema (`runValidators`) | servicios y reservas |
| `delete(id)` | Elimina con `findByIdAndDelete` y devuelve el documento eliminado | solo servicios |

Detalles de implementación:

- En `bookings.dao.js`, `update` descarta `_id`, `id` y `__v` del body. En `services.dao.js` el body se pasa tal cual: el `id` se ignora porque no existe en el schema, y el `_id` es inmutable, así que no debe enviarse en un `PUT`.
- Los DAOs no aplican filtros ni reglas de negocio: solo resuelven el acceso a los registros. Los filtros de búsqueda viven en el service.
- El `_id` es un `ObjectId` generado automáticamente por MongoDB; no se generan ids manualmente en la aplicación.

### Modelos de Mongoose

Ubicados en `src/dao/models`, definen la estructura de cada colección:

| Archivo | Schema | Detalles |
|---------|--------|----------|
| `service.model.js` | `serviceSchema` | Servicios con validaciones y `timestamps` |
| `booking.model.js` | `bookingSchema` | Reservas con subdocumentos embebidos de servicios y `timestamps` |

- Ambos schemas usan `{ timestamps: true }`, así que Mongoose agrega `createdAt` y `updatedAt` automáticamente.
- En la reserva, `services` es un array de subdocumentos `{ service, quantity }` con `_id: false` para que cada ítem no genere un `_id` propio.
- `service` es un `ObjectId` con `ref: 'Service'`: guarda la referencia al servicio, no el objeto completo, y permite usar `populate()`.

### Utils

Ubicados en `src/utils`, agrupan utilidades transversales reutilizables por varias capas.

| Archivo | Contenido |
|---------|-----------|
| `errors.js` | `createHttpError(status, message)` |

`createHttpError` crea un `Error` común y le agrega la propiedad `status`. Esto permite que los services informen el código HTTP adecuado (`400` para datos inválidos, `404` para recursos inexistentes) sin importar Express ni acoplarse a la capa HTTP. Luego el controller lee `error.status` y responde en consecuencia.

### ServicesService

Ubicado en `src/services/services.service.js`, contiene las reglas de negocio de los servicios:

| Método | Descripción |
|--------|-------------|
| `getServices(filters)` | Devuelve los servicios, aplicando filtros de categoría y disponibilidad |
| `getServiceById(id)` | Devuelve un servicio por su id |
| `createService(data)` | Valida los campos obligatorios y crea un nuevo servicio |
| `updateService(id, data)` | Actualiza los datos de un servicio |
| `deleteService(id)` | Elimina un servicio |

### BookingsService

Ubicado en `src/services/bookings.service.js`, contiene las reglas de negocio de las reservas:

| Método | Descripción |
|--------|-------------|
| `getBookings()` | Devuelve todas las reservas |
| `getBookingById(bid)` | Devuelve una reserva por su id |
| `createBooking(data)` | Valida los campos obligatorios y crea una nueva reserva |
| `addServiceToBooking(bid, sid)` | Valida que existan la reserva y el servicio, y añade el servicio a la reserva |

`addServiceToBooking` busca el servicio por id; si ya está en la reserva incrementa su `quantity`, y si no, agrega `{ service: ObjectId, quantity: 1 }`.

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

## Ejecución

```bash
npm start       # inicia el servidor con node --watch
```

El servidor se conecta primero a MongoDB y, si la conexión es exitosa, queda disponible en `http://localhost` en el puerto definido en `.env`.

## Endpoints

Las respuestas siguen el formato `{ status, payload }` y las operaciones de escritura agregan `message`.

### Services

Ruta base: `/api/services`, cada ruta deriva la responsabilidad al método correspondiente del controlador services.controller.js

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| GET | `/api/services` | Devuelve todos los servicios. Acepta filtros por query params | `200` |
| GET | `/api/services/:sid` | Devuelve un servicio por su `_id` | `200`, `404` |
| POST | `/api/services` | Crea un servicio. El `_id` lo genera MongoDB | `201`, `400` |
| PUT | `/api/services/:sid` | Actualiza un servicio. No permite modificar el `_id` | `200`, `404` |
| DELETE | `/api/services/:sid` | Elimina un servicio | `200`, `404` |

### Filtros (GET /api/services)

- `category`: filtra por categoría. Ej: `/api/services?category=salud`
- `available`: filtra por disponibilidad. Ej: `/api/services?available=true`
- Se pueden combinar: `/api/services?category=salud&available=true`

### Bookings

Ruta base: `/api/bookings`, cada ruta deriva la responsabilidad al método correspondiente del controlador bookings.controller.js

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| GET | `/api/bookings` | Devuelve todas las reservas | `200` |
| GET | `/api/bookings/:bid` | Devuelve una reserva por su `_id` | `200`, `404` |
| POST | `/api/bookings` | Crea una reserva. El `_id` lo genera MongoDB | `201`, `400` |
| POST | `/api/bookings/:bid/services/:sid` | Añade un servicio a una reserva existente | `200`, `404` |

## Notas

- La persistencia es MongoDB a través de Mongoose. Las colecciones utilizadas son `services` y `bookings`.
- Los ids son `ObjectId` generados por MongoDB, no UUID.
- Los servicios se referencian dentro de las reservas por `ObjectId`, no como objeto completo.
- Los archivos JSON de `src/data` de la versión anterior fueron eliminados: la persistencia es exclusivamente MongoDB.
