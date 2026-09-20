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