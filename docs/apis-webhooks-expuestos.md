
## POST `/api/webhooks/nuevo-trabajo`

Origen: RiderApp

Objetivo: publicar un nuevo trabajo en DriverApp para que quede disponible para drivers compatibles con el tipo de servicio.

Auth: `x-api-key`, validada contra `DRIVER_API_KEY`.

Request:

```json
{
  "id_trabajo": "trabajo_id_en_riderapp",
  "riderId": "clerk_user_id_del_rider",
  "tipoServicioId": "tipo_servicio_id",
  "direccion": "Av. Siempre Viva 742",
  "descripcion": "Cambio de foco",
  "fotos": ["https://..."]
}
```

Campos obligatorios:

| Campo | Tipo | Descripcion |
|---|---|---|
| `id_trabajo` | `string` | ID del trabajo generado por RiderApp. DriverApp lo guarda como `Trabajo.id`. |
| `riderId` | `string` | Clerk ID del rider. No es relacion Prisma. |
| `tipoServicioId` | `string` | ID de `TipoServicio` existente en DriverApp. |
| `direccion` | `string` | Direccion del trabajo. |

Response `201 Created`:

```json
{
  "status": "success",
  "mensaje": "Trabajo creado correctamente",
  "data": {
    "id_trabajo": "trabajo_id",
    "estado_actual": "PENDIENTE"
  }
}
```

Errores:

| Status | Motivo |
|---|---|
| `400` | Faltan campos obligatorios. |
| `401` | API key ausente o invalida. |
| `404` | Tipo de servicio no encontrado. |
| `409` | Ya existe un trabajo con ese `id_trabajo`. |
| `500` | Error interno. |

Notas:

- El trabajo se crea en estado `PENDIENTE`.
- `id_trabajo` se persiste como `Trabajo.id`; es el mismo ID que RiderApp debe usar luego para cancelar.
- No se asigna driver al crearlo.
- El trabajo queda visible para drivers `ONLINE` que tengan ese tipo de servicio y no lo hayan rechazado.
- `riderId` es el Clerk ID del rider y se guarda solo como referencia externa.
- Todo ID de rider/driver que cruce limites entre aplicaciones debe ser un Clerk ID, no un ID interno de base de datos.

## PUT `/api/trabajos/state`

Origen: RiderApp

Objetivo: permitir que RiderApp cancele un trabajo desde su lado del flujo.

Auth: `x-api-key`, validada contra `DRIVER_API_KEY`.

Request:

```json
{
  "id_trabajo": "trabajo_id",
  "estado": "cancelado"
}
```

Campos:

| Campo | Tipo | Obligatorio | Descripcion |
|---|---|---:|---|
| `id_trabajo` | `string` | Si | ID compartido del trabajo, enviado originalmente por RiderApp y guardado como `Trabajo.id`. |
| `estado` | `string` | No | Si se envia, solo puede ser `cancelado`. |

Response `200 OK`:

```json
{
  "status": "success",
  "mensaje": "Trabajo cancelado correctamente",
  "data": {
    "id_trabajo": "trabajo_id",
    "estado_actual": "CANCELADO",
    "driver_notificado": "Nombre Driver"
  }
}
```

Errores:

| Status | Motivo |
|---|---|
| `400` | Falta `id_trabajo` o se envio un estado distinto de `cancelado`. |
| `401` | API key ausente o invalida. |
| `404` | Trabajo no encontrado. |
| `409` | No se puede cancelar un trabajo finalizado. |
| `500` | Error interno. |

Efectos internos:

- Actualiza el trabajo a `CANCELADO`.
- Agrega entrada en `HistorialEstado`.
- Si habia driver asignado, lo libera pasando su `status` a `ONLINE`.
- Revalida `/`, `/trabajos/activo` y `/admin/servicios`.
- Un trabajo `CANCELADO` deja de estar visible para todos los drivers.

## GET `/api/tipos-servicios`

Origen: RiderApp

Objetivo: obtener los tipos de servicio disponibles en DriverApp para poder publicar trabajos compatibles.

Auth: `x-api-key`, validada contra `DRIVER_API_KEY`.

Request: sin body.

Response `200 OK`:

```json
{
  "status": "success",
  "mensaje": "Tipos de servicio obtenidos correctamente",
  "data": [
    {
      "id": "tipo_servicio_id",
      "nombre": "Electricidad",
      "descripcion": "Servicios electricos generales",
      "precioBase": 15000,
      "creadoEn": "2026-05-28T00:00:00.000Z",
      "actualizadoEn": "2026-05-28T00:00:00.000Z",
      "driverServicios": [
        {
          "id": "relacion_id",
          "driverId": "clerk_user_id_del_driver"
        }
      ],
      "trabajos": [
        {
          "id": "trabajo_id",
          "driverId": "clerk_user_id_del_driver"
        }
      ]
    }
  ]
}
```

Notas:

- `precioBase` se devuelve como `number`.
- `trabajos` contiene trabajos activos para el panel admin, excluyendo `FINALIZADO` y `CANCELADO`.
- No usa `_count`.

## GET `/api/drivers/[id]`

Origen: RiderApp o FeedbackApp

Objetivo: consultar informacion publica/operativa de un trabajador.

Auth: `x-api-key`, validada contra `DRIVER_API_KEY`.

Request: sin body.

Path params:

| Param | Tipo | Descripcion |
|---|---|---|
| `id` | `string` | Clerk ID del `Driver`. |

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

Errores:

| Status | Motivo |
|---|---|
| `401` | API key ausente o invalida. |
| `404` | Driver no encontrado. |
| `500` | Error interno. |

Notas:

- `id_driver` se devuelve como Clerk ID.
- `rating_promedio` se obtiene consultando FeedbackApp mediante el cliente externo de Feedback usando el Clerk ID.
- En desarrollo, FeedbackApp esta mockeada en `/api/mocks/feedback/reviews/user/[userId]`.
- El valor de `estado` se devuelve en minuscula.

## POST `/api/webhooks/clerk`

Origen: Clerk

Objetivo: sincronizar usuarios Clerk con la tabla `Driver`.

Auth: firma Svix con `CLERK_WEBHOOK_SECRET`.

Headers requeridos:

```http
svix-id: ...
svix-timestamp: ...
svix-signature: ...
```

Eventos procesados:

| Evento | Accion |
|---|---|
| `user.updated` | Sincroniza/crea un `Driver` si el usuario tiene metadata `role: "driver"`. |

Eventos ignorados:

- Cualquier evento distinto de `user.updated`.
- Usuarios que no tengan `public_metadata.role === "driver"`.

Campos sincronizados:

| Clerk | Driver |
|---|---|
| `id` | `clerkUserId` |
| primer email | `email` |
| `first_name` | `nombre` |
| primer telefono | `telefono` |
| `image_url` | `imagenURL` |

Response exitoso:

```json
{
  "ok": true,
  "message": "Driver sincronizado"
}
```

Errores:

| Status | Motivo |
|---|---|
| `400` | Headers Svix ausentes o firma invalida. |
| `500` | Falta `CLERK_WEBHOOK_SECRET` o error interno. |

## Resumen de Direccion de Comunicacion

APIs que DriverApp expone:

| Endpoint | Consumidor principal | Proposito |
|---|---|---|
| `POST /api/webhooks/nuevo-trabajo` | RiderApp | Publicar trabajo nuevo en DriverApp. |
| `PUT /api/trabajos/state` | RiderApp | Cancelar trabajo desde RiderApp. |
| `GET /api/tipos-servicios` | RiderApp | Consultar tipos de servicio. |
| `GET /api/drivers/[id]` | RiderApp / FeedbackApp | Consultar informacion de trabajador. |
| `POST /api/webhooks/clerk` | Clerk | Sincronizar usuarios. |

APIs externas simuladas que DriverApp consume:

| Prefijo | Representa |
|---|---|
| `/api/mocks/repairdash/*` | RiderApp |
| `/api/mocks/payments/*` | PaymentsApp |
| `/api/mocks/feedback/*` | FeedbackApp |

Variables de integracion saliente:

| Variable | Uso |
|---|---|
| `RIDER_APP_URL` | Base URL de RiderApp para notificar cambios de estado. En desarrollo puede apuntar a `/api/mocks/repairdash`. |
| `FEEDBACK_APP_URL` | Base URL de FeedbackApp para reviews, reportes y trabajos. En desarrollo puede apuntar a `/api/mocks/feedback`. |
| `PAYMENTS_APP_URL` | Base URL de PaymentsApp para wallet/ingresos. En desarrollo puede apuntar a `/api/mocks/payments`. |
| `RIDER_INTERNAL_API_KEY` | API key en texto plano enviada por DriverApp a RiderApp. |
| `FEEDBACK_INTERNAL_API_KEY` | API key en texto plano enviada por DriverApp a FeedbackApp. |
| `PAYMENTS_INTERNAL_API_KEY` | API key en texto plano enviada por DriverApp a PaymentsApp en el header `x-internal-api-key`. |

Notas para PaymentsApp:

- DriverApp consulta `GET {PAYMENTS_APP_URL}/payments/wallet/:driverId` usando el Clerk ID del driver cuando `PAYMENTS_APP_URL` apunta a la base `/api`.
- En desarrollo, si la base apunta directamente a `/api/mocks/payments`, consulta `GET {PAYMENTS_APP_URL}/wallet/:driverId`.
- Si PaymentsApp responde `404`, DriverApp interpreta que el driver todavia no tiene wallet/ingresos y muestra ceros.
- En produccion no se usa mock local como fallback; ante error de PaymentsApp se muestra un resumen vacio para no romper la UI.
- En desarrollo, si `PAYMENTS_APP_URL` no esta configurada o el mock falla, se usa el mock local.
