
## POST `/api/webhooks/nuevo-trabajo`

Origen: RiderApp

Objetivo: publicar un nuevo trabajo en DriverApp para que quede disponible para drivers compatibles con el tipo de servicio.

Auth: `x-api-key`, validada contra `DRIVER_API_KEY`.

Request:

```json
{
  "riderId": "rider_external_id",
  "tipoServicioId": "tipo_servicio_id",
  "direccion": "Av. Siempre Viva 742",
  "descripcion": "Cambio de foco",
  "fotos": ["https://..."],
  "latitud": -34.6037,
  "longitud": -58.3816
}
```

Campos obligatorios:

| Campo | Tipo | Descripcion |
|---|---|---|
| `riderId` | `string` | ID externo del rider. No es relacion Prisma. |
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
| `500` | Error interno. |

Notas:

- El trabajo se crea en estado `PENDIENTE`.
- No se asigna driver al crearlo.
- El trabajo queda visible para drivers `ONLINE` que tengan ese tipo de servicio y no lo hayan rechazado.
- `riderId` es solo una referencia externa.

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
| `id_trabajo` | `string` | Si | ID del trabajo en DriverApp. |
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
          "driverId": "driver_id"
        }
      ],
      "trabajos": [
        {
          "id": "trabajo_id",
          "driverId": "driver_id"
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
| `id` | `string` | ID interno del `Driver`. |

Response `200 OK`:

```json
{
  "status": "success",
  "mensaje": "Datos del trabajador obtenidos correctamente",
  "data": {
    "id_driver": "driver_id",
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

- `rating_promedio` se obtiene consultando FeedbackApp mediante el cliente externo de Feedback.
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
