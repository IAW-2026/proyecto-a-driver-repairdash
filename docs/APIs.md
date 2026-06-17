# APIs y Webhooks de DriverApp

Este documento describe las APIs que expone DriverApp y los contratos que consume de RiderApp, PaymentsApp y FeedbackApp.

## Estado Actual

- DriverApp funciona de forma independiente.
- En desarrollo se pueden generar solicitudes con `npm run dev:simulate-rider-jobs`.
- Ese script no escribe directo en la base: llama al webhook `POST /api/webhooks/nuevo-trabajo`, igual que haria RiderApp.
- Los cambios de estado salientes hacia RiderApp se envian a `/api/repairdash/statetravel`.
- `RIDER_APP_URL` puede ser la base de RiderApp, terminar en `/api`, terminar en `/api/repairdash` o ser el endpoint completo.
- Si `RIDER_APP_URL` no esta configurada, DriverApp omite la notificacion externa y registra un warning.
- Los IDs de usuarios que cruzan apps son Clerk IDs.
- Los IDs internos de Prisma solo se usan dentro de DriverApp.

## Variables

| Variable | Uso |
|---|---|
| `DRIVER_API_KEY` | Clave esperada por las APIs expuestas por DriverApp. Header: `x-api-key`. |
| `RIDER_APP_URL` | URL de RiderApp. Puede ser base, `/api`, `/api/repairdash` o el endpoint completo; DriverApp la normaliza. |
| `RIDER_INTERNAL_API_KEY` | Clave enviada a RiderApp. Headers: `x-api-key` y `x-internal-api-key`. |
| `FEEDBACK_APP_URL` | URL de FeedbackApp real. Puede ser base o terminar en `/api`; si no esta configurada o falla, se usa fallback seguro no ficticio. |
| `FEEDBACK_INTERNAL_API_KEY` | Clave enviada a FeedbackApp. Header: `x-api-key`. |
| `PAYMENTS_APP_URL` | Base URL de PaymentsApp real. |
| `PAYMENTS_INTERNAL_API_KEY` | Clave enviada a PaymentsApp. |

## Setup Local

Instalar dependencias:

```bat
npm install
```

Aplicar migraciones y regenerar Prisma:

```bat
npx prisma migrate deploy
npx prisma generate
```

Iniciar DriverApp:

```bat
npm run dev
```

Opcional: crear datos base de servicios/driver demo, sin trabajos:

```bat
npm run db:seed
```

## Script de Solicitudes de Desarrollo

Comando:

```bat
npm run dev:simulate-rider-jobs
```

Que hace:

- Consulta `GET /api/tipos-servicios` para obtener IDs reales de tipos de servicio.
- Cada `SIMULATED_RIDER_JOB_INTERVAL_MS` milisegundos publica una solicitud nueva.
- Publica usando `POST /api/webhooks/nuevo-trabajo`.
- Envia `riderId`, `nombreRider`, `apellidoRider`, `valoracionRider`, direccion, descripcion y fotos.
- Genera un `id_trabajo` unico por solicitud.

Variables opcionales:

| Variable | Default | Uso |
|---|---:|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Base URL contra la que corre el script. |
| `SIMULATED_RIDER_JOB_INTERVAL_MS` | `10000` | Intervalo entre solicitudes. |

Ejemplo con intervalo custom:

```bat
set SIMULATED_RIDER_JOB_INTERVAL_MS=5000
npm run dev:simulate-rider-jobs
```

## APIs Expuestas por DriverApp

### POST `/api/webhooks/nuevo-trabajo`

Origen esperado: RiderApp o script `dev:simulate-rider-jobs`.

Objetivo: publicar un trabajo nuevo en DriverApp.

Auth: `x-api-key` contra `DRIVER_API_KEY`.

Request:

```json
{
  "id_trabajo": "trabajo_id_compartido",
  "riderId": "clerk_user_id_del_rider",
  "nombreRider": "Lucia",
  "apellidoRider": "Ramos",
  "valoracionRider": 4.8,
  "tipoServicioId": "tipo_servicio_id",
  "direccion": "Av. Corrientes 1234",
  "descripcion": "Perdida de agua bajo la cocina",
  "fotos": ["https://..."]
}
```

Obligatorios:

| Campo | Tipo | Descripcion |
|---|---|---|
| `id_trabajo` | `string` | ID compartido del trabajo. DriverApp lo guarda como `Trabajo.id`. |
| `riderId` | `string` | Clerk ID del rider. |
| `tipoServicioId` | `string` | ID de `TipoServicio`. |
| `direccion` | `string` | Direccion del trabajo. |

Aliases aceptados para integracion con RiderApp:

| Dato | Campos aceptados |
|---|---|
| ID de trabajo | `id_trabajo`, `idTrabajo`, `id_viaje` |
| Clerk ID del rider | `riderId`, `idCliente`, `IdCliente` |
| Tipo de servicio | `tipoServicioId`, `idTipoServicio` |
| Direccion | `direccion`, `ubicacion.direccion` |
| Nombre | `nombreRider`, `nombreCliente` |
| Apellido | `apellidoRider`, `apellidoCliente` |
| Valoracion | `valoracionRider`, `ratingCliente` |

Opcionales:

| Campo | Tipo | Descripcion |
|---|---|---|
| `nombreRider` | `string` | Nombre del rider. Si no llega, se guarda `No disponible`. |
| `apellidoRider` | `string` | Apellido del rider. Si no llega, se guarda string vacio. |
| `valoracionRider` | `number` | Valoracion del rider. Si no llega, se guarda `0`. |
| `descripcion` | `string` | Descripcion del problema. |
| `fotos` | `string[]` | Fotos del problema. |

Response `201`:

```json
{
  "status": "success",
  "mensaje": "Trabajo creado correctamente",
  "data": {
    "id_trabajo": "trabajo_id_compartido",
    "estado_actual": "PENDIENTE"
  }
}
```

Test por terminal:

```bat
curl.exe -i -X POST "http://localhost:3000/api/webhooks/nuevo-trabajo" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: driver-secret-key" ^
  -d "{ \"id_trabajo\": \"trabajo-terminal-001\", \"riderId\": \"rider_demo_001\", \"nombreRider\": \"Lucia\", \"apellidoRider\": \"Ramos\", \"valoracionRider\": 4.8, \"tipoServicioId\": \"REEMPLAZAR_TIPO_SERVICIO_ID\", \"direccion\": \"Av. Corrientes 1234\", \"descripcion\": \"Perdida de agua bajo la cocina\", \"fotos\": [] }"
```

### PUT `/api/trabajos/state`

Origen esperado: RiderApp.

Objetivo: cancelar un trabajo desde RiderApp.

Esta API no es una state machine publica. RiderApp solo puede usarla para informar cancelaciones. Cualquier estado distinto de `cancelado` debe responder `400`.

Auth: `x-api-key` contra `DRIVER_API_KEY`.

Request:

```json
{
  "id_trabajo": "trabajo_id_compartido",
  "estado": "cancelado"
}
```

Campos:

| Campo | Tipo | Obligatorio | Descripcion |
|---|---|---:|---|
| `id_trabajo` | `string` | Si | ID compartido del trabajo, el mismo recibido en `POST /api/webhooks/nuevo-trabajo`. |
| `estado` | `"cancelado"` | Si | Unico estado aceptado por esta API. |

Para compatibilidad con RiderApp, el ID tambien puede llegar como `idTrabajo` o `id_viaje`.

Efectos:

- Cambia el trabajo a `CANCELADO`.
- Crea entrada en `HistorialEstado`.
- Si habia driver asignado, lo libera a `ONLINE`.
- Revalida `/`, `/trabajos/activo` y `/admin/servicios`.
- El trabajo cancelado deja de estar visible para drivers.

Test por terminal:

```bat
curl.exe -i -X PUT "http://localhost:3000/api/trabajos/state" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: driver-secret-key" ^
  -d "{ \"id_trabajo\": \"trabajo-terminal-001\", \"estado\": \"cancelado\" }"
```

Test de rechazo para estados no permitidos:

```bat
curl.exe -i -X PUT "http://localhost:3000/api/trabajos/state" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: driver-secret-key" ^
  -d "{ \"id_trabajo\": \"trabajo-terminal-001\", \"estado\": \"en camino\" }"
```

La respuesta esperada es `400`.

### GET `/api/tipos-servicios`

Origen esperado: RiderApp.

Objetivo: consultar los tipos de servicio disponibles.

Auth: `x-api-key` contra `DRIVER_API_KEY`.

Test por terminal:

```bat
curl.exe -i "http://localhost:3000/api/tipos-servicios" ^
  -H "x-api-key: driver-secret-key"
```

Notas:

- `precioBase` se devuelve como `number`.
- `driverServicios[].driverId` se devuelve como Clerk ID.
- `trabajos[].driverId` se devuelve como Clerk ID cuando existe.
- `trabajos` excluye `FINALIZADO` y `CANCELADO`.

### GET `/api/drivers/[id]`

Origen esperado: RiderApp o FeedbackApp.

Objetivo: consultar informacion publica de un trabajador por Clerk ID.

Auth: `x-api-key` contra `DRIVER_API_KEY`.

Test por terminal:

```bat
curl.exe -i "http://localhost:3000/api/drivers/CLERK_USER_ID_DEL_DRIVER" ^
  -H "x-api-key: driver-secret-key"
```

Notas:

- `[id]` es `Driver.clerkUserId`.
- No acepta el ID interno de Prisma.
- `rating_promedio` se obtiene desde FeedbackApp o fallback seguro no ficticio.

### POST `/api/webhooks/clerk`

Origen: Clerk.

Objetivo: sincronizar usuarios Clerk con `Driver`.

Auth: firma Svix con `CLERK_WEBHOOK_SECRET`.

No se recomienda testearlo con `curl` simple porque requiere headers Svix validos:

```http
svix-id: ...
svix-timestamp: ...
svix-signature: ...
```

## APIs Reales Consumidas por DriverApp

### PUT `{RIDER_APP_URL}/api/repairdash/statetravel`

Origen: DriverApp.

Objetivo: notificar a RiderApp cada cambio de estado realizado por el driver.

Auth: `x-api-key` y `x-internal-api-key` con `RIDER_INTERNAL_API_KEY`.

Request:

```json
{
  "id_viaje": "trabajo_id_compartido",
  "estado": "en camino",
  "driver": "clerk_user_id_del_driver"
}
```

Estados enviados:

| Estado DriverApp | Estado RiderApp |
|---|---|
| `ACEPTADO` | `aceptado` |
| `CANCELADO` | `cancelado` |
| `EN_CAMINO` | `en camino` |
| `EN_SERVICIO` | `ha llegado` |
| `FINALIZADO` | `finalizado` |

Si `RIDER_APP_URL` no esta configurada, DriverApp no llama a endpoints locales de prueba; registra un warning y continua el flujo interno.

## Integraciones Consumidas por DriverApp

| App | Endpoint esperado | Fallback |
|---|---|---|
| RiderApp | `PUT {RIDER_APP_URL}/api/repairdash/statetravel` | Se omite la notificacion externa y se registra warning. |
| PaymentsApp | `GET {PAYMENTS_APP_URL}/payments/wallet/[driverId]` | Resumen vacio seguro. |
| FeedbackApp | `GET {FEEDBACK_APP_URL}/reviews/user/[userId]` | Valoracion no disponible. |
| FeedbackApp | `GET {FEEDBACK_APP_URL}/reports/public/[userId]` | Reportes en cero. |
| FeedbackApp | `POST {FEEDBACK_APP_URL}/trabajos` | Respuesta local no ficticia con IDs enviados. |
| FeedbackApp | `POST {FEEDBACK_APP_URL}/reports` | Respuesta local no ficticia indicando que no fue confirmado externamente. |
| FeedbackApp | `POST {FEEDBACK_APP_URL}/reviews/user` | Respuesta local no ficticia indicando datos no disponibles. |

## Resumen de Endpoints

APIs expuestas por DriverApp:

| Endpoint | Consumidor | Proposito |
|---|---|---|
| `POST /api/webhooks/nuevo-trabajo` | RiderApp/script dev | Publicar trabajo nuevo. |
| `PUT /api/trabajos/state` | RiderApp | Cancelar trabajo. No acepta otros estados. |
| `GET /api/tipos-servicios` | RiderApp | Consultar tipos de servicio. |
| `GET /api/drivers/[id]` | RiderApp/FeedbackApp | Consultar driver por Clerk ID. |
| `POST /api/webhooks/clerk` | Clerk | Sincronizar usuarios. |

