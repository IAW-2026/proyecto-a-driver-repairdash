# APIs Analytics App

Este documento describe las APIs que Driver App expone para Analytics App.
La superficie es intencionalmente chica: solo devuelve metricas agregadas y no expone datos personales, tablas crudas ni detalle operacional.

## Autenticacion

Todas las requests deben enviar:

```txt
x-analytics-api-key: ANALYTICS_API_KEY
```

Variable requerida en Driver App:

```env
ANALYTICS_API_KEY=""
```

Si falta la key o no coincide, la API responde `401`.
Si Driver App no tiene configurada `ANALYTICS_API_KEY`, responde `500`.

## Fechas

Los endpoints aceptan:

```txt
from=YYYY-MM-DD
to=YYYY-MM-DD
```

Reglas:

- Si no se envian fechas, se usa el rango de los ultimos 30 dias.
- El rango maximo permitido es de 365 dias.
- Las fechas se interpretan en UTC.
- Formatos invalidos responden `400`.

## Privacidad

Analytics App no necesita PII. Por eso estas APIs no devuelven:

- emails
- telefonos
- direcciones
- nombres de riders
- nombres de drivers
- fotos
- descripciones de trabajos

Los valores economicos devueltos son estimaciones de Driver App basadas en `Trabajo.montoEstimado`.
No representan dinero liquidado real. Payments App sigue siendo la fuente de verdad financiera.

---

## GET `/api/analytics/summary`

Devuelve metricas generales agregadas.

### Ejemplo

```powershell
curl.exe -i "http://localhost:3000/api/analytics/summary?from=2026-06-01&to=2026-06-30" `
  -H "x-analytics-api-key: analytics-secret"
```

### Response 200

```json
{
  "status": "success",
  "data": {
    "app": "driver",
    "checkedAt": "2026-06-17T12:00:00.000Z",
    "range": {
      "from": "2026-06-01",
      "to": "2026-06-30"
    },
    "jobs": {
      "creados": 42,
      "activosActuales": 6,
      "finalizados": 20,
      "cancelados": 3,
      "rechazados": 8,
      "tasaAceptacion": 0.7143,
      "tasaFinalizacion": 0.4762,
      "valorEstimadoFinalizado": 450000,
      "tiempoPromedioResolucionMinutos": 82.5
    },
    "drivers": {
      "total": 12,
      "onlineActuales": 4,
      "onboardingCompleto": 10
    }
  }
}
```

Notas:

- `activosActuales` es una foto del estado actual de la app.
- Las tasas se calculan sobre trabajos creados dentro del rango.
- `rechazados` cuenta eventos de rechazo de drivers.

---

## GET `/api/analytics/jobs-timeseries`

Devuelve una serie diaria para graficos.

Query params:

- `from`
- `to`
- `bucket=day`

Por ahora solo se soporta `bucket=day`.

### Ejemplo

```powershell
curl.exe -i "http://localhost:3000/api/analytics/jobs-timeseries?from=2026-06-01&to=2026-06-07&bucket=day" `
  -H "x-analytics-api-key: analytics-secret"
```

### Response 200

```json
{
  "status": "success",
  "data": {
    "app": "driver",
    "checkedAt": "2026-06-17T12:00:00.000Z",
    "range": {
      "from": "2026-06-01",
      "to": "2026-06-07"
    },
    "bucket": "day",
    "series": [
      {
        "date": "2026-06-01",
        "creados": 4,
        "aceptados": 3,
        "finalizados": 2,
        "cancelados": 0,
        "rechazados": 1
      }
    ]
  }
}
```

---

## GET `/api/analytics/service-types`

Devuelve performance agregada por tipo de servicio.

### Ejemplo

```powershell
curl.exe -i "http://localhost:3000/api/analytics/service-types?from=2026-06-01&to=2026-06-30" `
  -H "x-analytics-api-key: analytics-secret"
```

### Response 200

```json
{
  "status": "success",
  "data": {
    "app": "driver",
    "checkedAt": "2026-06-17T12:00:00.000Z",
    "range": {
      "from": "2026-06-01",
      "to": "2026-06-30"
    },
    "serviceTypes": [
      {
        "id": "tipo_1",
        "nombre": "Electricidad",
        "trabajosCreados": 12,
        "trabajosActivos": 2,
        "trabajosFinalizados": 7,
        "trabajosCancelados": 1,
        "driversAsignados": 4,
        "valorEstimadoFinalizado": 175000,
        "tiempoPromedioResolucionMinutos": 74.3
      }
    ]
  }
}
```

---

## Codigos de error

| Codigo | Caso |
| --- | --- |
| `400` | Fechas invalidas, rango mayor a 365 dias o bucket no soportado. |
| `401` | `x-analytics-api-key` ausente o incorrecta. |
| `500` | Falta `ANALYTICS_API_KEY` o error interno. |

