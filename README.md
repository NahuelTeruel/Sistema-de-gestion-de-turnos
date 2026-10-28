# Sistema de gestión de turnos

Sistema de gestión de turnos y reservas desarrollado con Node.js.
Repositorio utilizado para el curso de Backend de Coderhouse.

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

## Estructura del proyecto

```
src/
  config/
    config.js
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
    services.dao.js
    bookings.dao.js
  routes/
    services.router.js
    bookings.router.js
  data/
    services.json
    bookings.json
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
routes -> controllers -> services -> repositories -> DAOs -> data/*.json
```

| Capa | Responsabilidad |
|------|-----------------|
| `routes` | Define los endpoints y delega en el controller correspondiente |
| `controllers` | Recibe `req`, llama al service y arma la respuesta HTTP (códigos y formato) |
| `services` | Reglas de negocio: validaciones, valores por defecto, generación de ids y verificación de existencia |
| `repositories` | Operaciones de acceso a datos del dominio: buscar, crear, actualizar y eliminar registros |
| `dao` | Persistencia: única capa que lee y escribe los archivos JSON |
| `data` | Almacenamiento de servicios y reservas |

### Controllers

Ubicados en `src/controllers`, son la puerta de entrada de cada petición HTTP. Su responsabilidad es traducir entre el mundo HTTP y el dominio:

- Leen datos de `req` (`params`, `query`, `body`).
- Llaman al método correspondiente del service.
- Arman la respuesta con `res.status(...).json(...)`, usando el formato `{ status, message, payload }`.
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
- Delegan cada operación en el DAO correspondiente; no manipulan archivos ni conocen el medio de persistencia.
- No validan datos: eso es responsabilidad de los services.

### DAO (Data Access Object)

Ubicados en `src/dao`, son la única capa que conoce el medio de persistencia. Hoy leen y escriben archivos JSON con `fs/promises`, pero el resto de la aplicación no depende de ese detalle.

| Archivo | Persistencia |
|---------|--------------|
| `services.dao.js` | `src/data/services.json` |
| `bookings.dao.js` | `src/data/bookings.json` |

Interfaz:

| Método | Descripción | Disponible en |
|--------|-------------|---------------|
| `getAll()` | Lee el archivo, lo parsea y devuelve el array de registros | servicios y reservas |
| `getById(id)` | Busca un registro por id comparando con `String(id)` | servicios y reservas |
| `create(record)` | Agrega el registro al array y persiste el archivo completo | servicios y reservas |
| `update(id, changes)` | Mezcla los cambios con el registro existente y persiste; devuelve `null` si no existe | servicios y reservas |
| `delete(id)` | Quita el registro del array y devuelve el eliminado; `null` si no existe | solo servicios |

`writeAll(records)` queda como helper interno de persistencia: serializa el array completo con formato legible y sobrescribe el archivo.

Las rutas no están hardcodeadas: se reciben por constructor con valor por defecto desde `config.data` (`src/config/config.js`), y se calculan de forma absoluta a partir de la ubicación del archivo fuente. Así la aplicación funciona igual sin importar el directorio desde el que se ejecute, y en pruebas se puede apuntar a un archivo temporal con `new ServicesDao('./tmp/test-services.json')`.

El DAO no aplica filtros ni reglas de negocio: solo resuelve el acceso a los registros (listar, buscar, agregar, actualizar y eliminar). Los filtros de búsqueda siguen viviendo en el service.

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
| `createService(data)` | Valida los campos obligatorios y agrega un nuevo servicio |
| `updateService(id, data)` | Actualiza los datos de un servicio |
| `deleteService(id)` | Elimina un servicio |

### BookingsService

Ubicado en `src/services/bookings.service.js`, contiene las reglas de negocio de las reservas:

| Método | Descripción |
|--------|-------------|
| `getBookings()` | Devuelve todas las reservas |
| `getBookingById(bid)` | Devuelve una reserva por su id |
| `createBooking(data)` | Valida los campos obligatorios y agrega una nueva reserva |
| `addServiceToBooking(bid, sid)` | Valida que existan la reserva y el servicio, y añade el servicio a la reserva |


### Modelo de un servicio

```json
{
  "id": 1,
  "name": "Corte de pelo",
  "description": "Corte clásico",
  "price": 5000,
  "category": "Peluquería",
  "available": true
}
```
- Campos obligatorios: `name`, `price`, `category`, `available` por defecto es `true`.
- Si se envía un `id` en el body, se ignora: siempre se genera internamente.

### Modelo de una reserva

```json
{
   "id": "2",
   "clientName": "Sofia Lorenzetti",
   "clientEmail": "sofi.201@gmail.com",
   "date": "2026-10-28",
   "time": "15:40",
   "status": "pendiente",
   "services": [
      {
         "service": 3,
         "quantity": 1
      },
      {
         "service": 2,
         "quantity": 1
      }
   ]
},
```

## Ejecución

```bash
npm start       # producción
```

El servidor queda disponible en `http://localhost:[puerto definido en `.env`]`).

## Endpoints

# Services

Ruta base: `/api/services`, cada ruta deriva la responsabilidad al método correspondiente del controlador services.controller.js

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| GET | `/api/services` | Devuelve todos los servicios. Acepta filtros por query params | `200` |
| GET | `/api/services/:sid` | Devuelve un servicio por id | `200`, `404` |
| POST | `/api/services` | Crea un servicio. El `id` se genera automáticamente | `201`, `400` |
| PUT | `/api/services/:sid` | Actualiza un servicio. No permite modificar el `id` | `200`, `404` |
| DELETE | `/api/services/:sid` | Elimina un servicio | `200`, `404` |

# Bookings

Ruta base: `/api/bookings`, cada ruta deriva la responsabilidad al método correspondiente del controlador bookings.controller.js

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| GET | `/api/bookings` | Devuelve todas las reservas. | `200` |
| GET | `/api/bookings/:sid` | Devuelve una reserva por id | `200`, `404` |
| POST | `/api/bookings` | Crea una reserva. El `id` se genera automáticamente | `201`, `400` |
| POST | `/api/bookings/:bid/services/:sid` | Añade un servicio a una reserva existente | `200`, `404` |

### Filtros (GET /api/services)

- `category`: filtra por categoría. Ej: `/api/services?category=Home`
- `available`: filtra por disponibilidad. Ej: `/api/services?available=true`
- Se pueden combinar: `/api/services?category=Home&available=true`



## Notas

- Los datos se guardan en los archivos JSON de `src/data`: se mantienen al reiniciar el servidor.
- Los ids nuevos son UUID (texto), generados con el módulo `crypto` de Node.