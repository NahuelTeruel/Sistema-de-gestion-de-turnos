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
├── config/
│   └── config.js          # Configuración
├── data/
│   └── services.json      # Persistencia de los servicios
├── managers/
│   └── ServiceManager.js  # Lógica de gestión de servicios
├── app.js
└── server.js
```

## ServiceManager

Ubicado en `src/managers/ServiceManager.js`, permite gestionar los servicios:

| Método | Descripción |
|--------|-------------|
| `getServices()` | Devuelve todos los servicios |
| `getServiceById(id)` | Devuelve un servicio por su id |
| `addService(name, description, price, category, available)` | Agrega un nuevo servicio |
| `updateService(id, data)` | Actualiza los datos de un servicio |
| `deleteService(id)` | Elimina un servicio |

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
## Ejecución

```bash
npm start       # producción
```

El servidor queda disponible en `http://localhost:[puerto definido en `.env`]`).

## Endpoints

Ruta base: `/api/services`

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| GET | `/api/services` | Devuelve todos los servicios. Acepta filtros por query params | `200` |
| GET | `/api/services/:sid` | Devuelve un servicio por id | `200`, `404` |
| POST | `/api/services` | Crea un servicio. El `id` se genera automáticamente | `201`, `400` |
| PUT | `/api/services/:sid` | Actualiza un servicio. No permite modificar el `id` | `200`, `404` |
| DELETE | `/api/services/:sid` | Elimina un servicio | `200`, `404` |

### Filtros (GET /api/services)

- `category`: filtra por categoría. Ej: `/api/services?category=Home`
- `available`: filtra por disponibilidad. Ej: `/api/services?available=true`
- Se pueden combinar: `/api/services?category=Home&available=true`



## Notas

- Los datos se guardan en memoria: al reiniciar el servidor se vuelve a la lista inicial de servicios.
- Los ids de los servicios nuevos son UUID (texto), generados con el módulo `crypto` de Node.