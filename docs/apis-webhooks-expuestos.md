# APIs y Webhooks de DriverApp

Este documento describe las APIs que expone DriverApp y los mocks locales que usa para simular RiderApp, PaymentsApp y FeedbackApp.

Estado actual del proyecto:

- DriverApp funciona de forma independiente.
- Las solicitudes de trabajo se crean en la base local mediante `/api/webhooks/nuevo-trabajo`.
- Los cambios de estado que DriverApp deberia informar a RiderApp se envian al mock local `/api/mocks/repairdash/statetravel`.
- PaymentsApp y FeedbackApp pueden apuntar a servicios reales mediante variables de entorno, pero siguen teniendo mocks locales disponibles.
- Los IDs de usuarios que cruzan apps son siempre Clerk IDs.
- Los IDs internos de Prisma solo se usan dentro de DriverApp.

## Variables

APIs entrantes de DriverApp:

| Variable | Uso |
|---|---|
| `DRIVER_API_KEY` | Clave esperada por las APIs que DriverApp expone. Se recibe en `x-api-key`. |

Mocks y servicios externos consumidos por DriverApp:

| Variable | Uso |
|---|---|
| `RIDER_INTERNAL_API_KEY` | Clave enviada al mock local de RiderApp en `x-api-key`. |
| `FEEDBACK_APP_URL` | Base URL de FeedbackApp real. Si no esta configurada, se usa el mock local. |
| `FEEDBACK_INTERNAL_API_KEY` | Clave enviada a FeedbackApp o a sus mocks locales en `x-api-key`. |
| `PAYMENTS_APP_URL` | Base URL de PaymentsApp real. |
| `PAYMENTS_INTERNAL_API_KEY` | Clave enviada a PaymentsApp o a su mock local. |

Nota importante: `RIDER_APP_URL` no se usa en el modo actual. DriverApp vuelve a operar contra el mock local de RiderApp.

## Ejecutar Local

Iniciar la app:

```bat
npm run dev
```

Aplicar migraciones y regenerar Prisma:

```bat
npx prisma migrate deploy
npx prisma generate
```

Crear datos base:

```bat
npm run seed
```

Crear solicitudes de trabajo mock:

```bat
npm run seed:trabajos
```

Si el script no existe en tu `package.json`, ejecutar directamente:

```bat
npx tsx prisma/seeds/seed-trabajos.ts
```

## Flujo Mock de Solicitudes

1. Un trabajo nuevo se crea llamando a `POST /api/webhooks/nuevo-trabajo`.
2. DriverApp guarda ese trabajo en su propia base.
3. Si no llegan `nombreRider`, `apellidoRider` o `valoracionRider`, DriverApp los completa desde `lib/mocks/rider.mock.ts` usando `riderId`.
4. El trabajo queda visible para drivers `ONLINE` compatibles con el `tipoServicioId`.
5. Al aceptar o avanzar estados, DriverApp llama al mock local de RiderApp: `PUT /api/mocks/repairdash/statetravel`.

## POST `/api/webhooks/nuevo-trabajo`

Origen esperado: RiderApp real o seed/mock local.

Objetivo: publicar un trabajo nuevo en DriverApp.

Auth: `x-api-key`, validada contra `DRIVER_API_KEY`.

Request:

```json
{
  "id_trabajo": "trabajo_id_compartido",
  "riderId": "clerk_user_id_del_rider",
  "nombreRider": "Juan",
  "apellidoRider": "Perez",
  "valoracionRider": 4.8,
  "tipoServicioId": "tipo_servicio_id",
  "direccion": "Av. Siempre Viva 742",
  "descripcion": "Cambio de foco",
  "fotos": ["https://..."]
}
```

Campos obligatorios:

| Campo | Tipo | Descripcion |
|---|---|---|
| `id_trabajo` | `string` | ID compartido del trabajo. DriverApp lo guarda como `Trabajo.id`. |
| `riderId` | `string` | Clerk ID del rider. No es relacion Prisma. |
| `tipoServicioId` | `string` | ID de `TipoServicio` existente en DriverApp. |
| `direccion` | `string` | Direccion del trabajo. |

Campos opcionales:

| Campo | Tipo | Descripcion |
|---|---|---|
| `nombreRider` | `string` | Nombre del rider. Si no llega, se toma del mock local por `riderId`. |
| `apellidoRider` | `string` | Apellido del rider. Si no llega, se toma del mock local por `riderId`. |
| `valoracionRider` | `number` | Valoracion del rider. Si no llega, se toma del mock local por `riderId`. |
| `descripcion` | `string` | Descripcion del problema. |
| `fotos` | `string[]` | URLs de fotos del problema. |

Response `201 Created`:

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

Ejemplo local:

```bat
curl.exe -i -X POST "http://localhost:3000/api/webhooks/nuevo-trabajo" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: driver-secret-key" ^
  -d "{ \"id_trabajo\": \"trabajo-test-mock-001\", \"riderId\": \"rider_demo_001\", \"tipoServicioId\": \"REEMPLAZAR_TIPO_SERVICIO_ID\", \"descripcion\": \"Cambio de toma electrica\", \"direccion\": \"San Martin 850, Microcentro\" }"
```

Errores:

| Status | Motivo |
|---|---|
| `400` | Faltan campos obligatorios. |
| `401` | API key ausente o invalida. |
| `404` | Tipo de servicio no encontrado. |
| `409` | Ya existe un trabajo con ese `id_trabajo`. |
| `500` | Error interno. |

## PUT `/api/trabajos/state`

Origen esperado: RiderApp.

Objetivo: cancelar un trabajo desde fuera de DriverApp.

Auth: `x-api-key`, validada contra `DRIVER_API_KEY`.

Request:

```json
{
  "id_trabajo": "trabajo_id_compartido",
  "estado": "cancelado"
}
```

Efectos:

- Cambia el trabajo a `CANCELADO`.
- Crea entrada en `HistorialEstado`.
- Si tenia driver asignado, libera al driver a `ONLINE`.
- Revalida `/`, `/trabajos/activo` y `/admin/servicios`.
- El trabajo cancelado deja de estar visible para todos los drivers.

Ejemplo local:

```bat
curl.exe -i -X PUT "http://localhost:3000/api/trabajos/state" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: driver-secret-key" ^
  -d "{ \"id_trabajo\": \"trabajo-test-mock-001\", \"estado\": \"cancelado\" }"
```

## GET `/api/tipos-servicios`

Origen esperado: RiderApp.

Objetivo: consultar tipos de servicio disponibles para publicar trabajos.

Auth: `x-api-key`, validada contra `DRIVER_API_KEY`.

Ejemplo local:

```bat
curl.exe -i "http://localhost:3000/api/tipos-servicios" ^
  -H "x-api-key: driver-secret-key"
```

Notas:

- `precioBase` se devuelve como `number`.
- `driverServicios[].driverId` se devuelve como Clerk ID.
- `trabajos[].driverId` se devuelve como Clerk ID cuando existe.
- `trabajos` contiene trabajos activos para el panel admin, excluyendo `FINALIZADO` y `CANCELADO`.

## GET `/api/drivers/[id]`

Origen esperado: RiderApp o FeedbackApp.

Objetivo: consultar informacion publica/operativa de un trabajador.

Auth: `x-api-key`, validada contra `DRIVER_API_KEY`.

Path params:

| Param | Tipo | Descripcion |
|---|---|---|
| `id` | `string` | Clerk ID del driver. |

Response `200 OK`:

```json
{
  "status": "success",
  "mensaje": "Datos del trabajador obtenidos correctamente",
  "data": {
    "id_driver": "clerk_user_id_del_driver",
    "nombre": "Juan Perez",
    "rating_promedio": 4.8,
    "estado": "online"
  }
}
```

Ejemplo local:

```bat
curl.exe -i "http://localhost:3000/api/drivers/CLERK_USER_ID_DEL_DRIVER" ^
  -H "x-api-key: driver-secret-key"
```

Notas:

- Busca `Driver.clerkUserId`.
- No acepta el ID interno de Prisma.
- `rating_promedio` se obtiene desde FeedbackApp o desde el mock local de Feedback.

## POST `/api/webhooks/clerk`

Origen: Clerk.

Objetivo: sincronizar usuarios Clerk con la tabla `Driver`.

Auth: firma Svix con `CLERK_WEBHOOK_SECRET`.

Eventos procesados:

| Evento | Accion |
|---|---|
| `user.updated` | Sincroniza o crea un `Driver` si el usuario tiene metadata `role: "driver"`. |

Campos sincronizados:

| Clerk | Driver |
|---|---|
| `id` | `clerkUserId` |
| primer email | `email` |
| `first_name` | `nombre` |
| primer telefono | `telefono` |
| `image_url` | `imagenURL` |

## Mock RiderApp

### PUT `/api/mocks/repairdash/statetravel`

Objetivo: simular el endpoint de RiderApp que recibe cambios de estado desde DriverApp.

Auth: `x-api-key`, validada contra `RIDER_INTERNAL_API_KEY`.

Request:

```json
{
  "id_viaje": "trabajo_id_compartido",
  "estado": "aceptado",
  "driver": "clerk_user_id_del_driver"
}
```

Estados aceptados:

| Estado externo | Estado DriverApp |
|---|---|
| `aceptado` | `ACEPTADO` |
| `cancelado` | `CANCELADO` |
| `en camino` | `EN_CAMINO` |
| `ha llegado` | `EN_SERVICIO` |
| `finalizado` | `FINALIZADO` |

Ejemplo local:

```bat
curl.exe -i -X PUT "http://localhost:3000/api/mocks/repairdash/statetravel" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: 12345" ^
  -d "{ \"id_viaje\": \"trabajo-test-mock-001\", \"estado\": \"en camino\", \"driver\": \"CLERK_USER_ID_DEL_DRIVER\" }"
```

## Mock PaymentsApp

### GET `/api/mocks/payments/wallet/[driverId]`

Objetivo: simular wallet e ingresos del driver.

Auth: `x-api-key`, validada contra `PAYMENTS_INTERNAL_API_KEY`.

Ejemplo local:

```bat
curl.exe -i "http://localhost:3000/api/mocks/payments/wallet/CLERK_USER_ID_DEL_DRIVER" ^
  -H "x-api-key: dev-payments-key"
```

Notas:

- DriverApp consulta PaymentsApp usando Clerk ID.
- Si PaymentsApp real devuelve `404`, DriverApp interpreta que el driver todavia no tiene wallet/ingresos y muestra ceros.

## Mock FeedbackApp

Todos estos endpoints usan `x-api-key`, validada contra `FEEDBACK_INTERNAL_API_KEY`.

### GET `/api/mocks/feedback/reviews/user/[userId]`

Objetivo: obtener valoracion de un usuario.

```bat
curl.exe -i "http://localhost:3000/api/mocks/feedback/reviews/user/CLERK_USER_ID" ^
  -H "x-api-key: repairdash-feedback-secret"
```

### GET `/api/mocks/feedback/reports/public/[userId]`

Objetivo: obtener reportes publicos de un usuario.

```bat
curl.exe -i "http://localhost:3000/api/mocks/feedback/reports/public/CLERK_USER_ID" ^
  -H "x-api-key: repairdash-feedback-secret"
```

### POST `/api/mocks/feedback/trabajos`

Objetivo: simular alta de trabajo en FeedbackApp al aceptar un trabajo.

```bat
curl.exe -i -X POST "http://localhost:3000/api/mocks/feedback/trabajos" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: repairdash-feedback-secret" ^
  -d "{ \"Idtrabajo\": \"trabajo-test-mock-001\", \"IdCliente\": \"rider_demo_001\", \"IdTrabajador\": \"CLERK_USER_ID_DEL_DRIVER\", \"tipodeTrabajo\": \"Electricidad\" }"
```

### PUT `/api/mocks/feedback/reviews`

Objetivo: simular que un trabajo finalizado queda listo para recibir reviews.

```bat
curl.exe -i -X PUT "http://localhost:3000/api/mocks/feedback/reviews" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: repairdash-feedback-secret" ^
  -d "{ \"idTrabajo\": \"trabajo-test-mock-001\" }"
```

### POST `/api/mocks/feedback/reports`

Objetivo: simular reporte de un usuario hacia otro.

```bat
curl.exe -i -X POST "http://localhost:3000/api/mocks/feedback/reports" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: repairdash-feedback-secret" ^
  -d "{ \"idTrabajo\": \"trabajo-test-mock-001\", \"idReportante\": \"CLERK_USER_ID_DEL_DRIVER\", \"idReportado\": \"rider_demo_001\" }"
```

## Resumen

APIs que DriverApp expone:

| Endpoint | Consumidor principal | Proposito |
|---|---|---|
| `POST /api/webhooks/nuevo-trabajo` | RiderApp/mock | Publicar trabajo nuevo. |
| `PUT /api/trabajos/state` | RiderApp/mock | Cancelar trabajo desde fuera de DriverApp. |
| `GET /api/tipos-servicios` | RiderApp/mock | Consultar tipos de servicio. |
| `GET /api/drivers/[id]` | RiderApp/FeedbackApp | Consultar informacion publica de trabajador por Clerk ID. |
| `POST /api/webhooks/clerk` | Clerk | Sincronizar usuarios. |

Mocks locales consumidos por DriverApp:

| Endpoint | Representa |
|---|---|
| `/api/mocks/repairdash/statetravel` | RiderApp |
| `/api/mocks/payments/wallet/[driverId]` | PaymentsApp |
| `/api/mocks/feedback/*` | FeedbackApp |
