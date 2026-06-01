# RepairDash - Driver App

Modulo de trabajadores de RepairDash, una aplicacion web orientada a gestionar disponibilidad, solicitudes, estados de servicio, historial, perfil e ingresos de drivers/trabajadores tecnicos.

Proyecto desarrollado en Next.js para la materia Ingenieria de Aplicaciones Web - UNS, 2026.

Deploy:

```txt
https://driver-repairdash.vercel.app
```

El proyecto se encuentra actualizado en rama `main`.

## Indice

- [Descripcion general](#descripcion-general)
- [Stack](#stack)
- [Arquitectura](#arquitectura)
- [Flujos principales](#flujos-principales)
- [Configuracion local](#configuracion-local)
- [Datos de prueba y mocks](#datos-de-prueba-y-mocks)
- [Como probar](#como-probar)
- [APIs y pruebas manuales](#apis-y-pruebas-manuales)
- [Accesos](#accesos)
- [Scripts](#scripts)

## Descripcion general

Driver App concentra la experiencia del trabajador dentro del ecosistema RepairDash:

- registro, login y onboarding con Clerk;
- seleccion de tipos de servicio ofrecidos;
- estado online/offline;
- recepcion, aceptacion y rechazo de solicitudes;
- seguimiento de estados de trabajo;
- reportes hacia FeedbackApp/mock;
- historial, ingresos, valoracion y reportes;
- perfil editable con avatar en Supabase Storage;
- panel admin para gestionar tipos de servicio.

La app funciona de forma independiente para la Etapa 2. RiderApp, PaymentsApp y FeedbackApp se consideran servicios externos y se simulan mediante mocks locales o clientes con fallback, respetando los contratos definidos para integracion futura.

## Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- PostgreSQL
- Clerk Auth
- Tailwind CSS
- Lucide React
- Supabase Storage
- Vercel

## Arquitectura

Organizacion principal:

- `app/`: rutas, paginas, layouts, server actions y API routes.
- `components/`: UI de dashboard, trabajos, perfil y onboarding.
- `lib/actions/`: server actions del dominio.
- `lib/services/`: logica de negocio, historial, drivers e integraciones.
- `lib/services/external/`: clientes para RiderApp, PaymentsApp y FeedbackApp.
- `lib/mocks/`: respuestas simuladas de servicios externos.
- `lib/auth/`: roles, admin y validacion de API keys.
- `lib/state-machine/`: reglas de transicion de trabajos.
- `prisma/`: schema, migraciones y seed.
- `docs/`: documentacion de APIs y comandos de prueba.

Reglas:

- DriverApp es duena de su propia base PostgreSQL.
- Los IDs compartidos entre apps son Clerk IDs.
- Los IDs internos de Prisma no se usan como identidad entre aplicaciones.
- RiderApp, PaymentsApp y FeedbackApp no se implementan internamente.
- PaymentsApp es la unica responsable de pagos reales; DriverApp solo consulta y muestra informacion.
- En Etapa 2 las integraciones se mantienen mockeadas o simuladas.

## Flujos principales

### Driver

1. El usuario entra, inicia sesion o crea cuenta.
2. Si tiene rol `driver`, accede al dashboard.
3. Si falta onboarding, completa datos y servicios ofrecidos.
4. Cambia su disponibilidad a online.
5. Recibe solicitudes compatibles.
6. Acepta o rechaza cada solicitud.

### Trabajo

1. RiderApp, o el script mock, publica un trabajo mediante `POST /api/webhooks/nuevo-trabajo`.
2. DriverApp guarda el trabajo como `PENDIENTE`.
3. El driver acepta y el trabajo pasa a `ACEPTADO`.
4. DriverApp avisa el alta del trabajo a FeedbackApp/mock.
5. El driver avanza estados: `EN_CAMINO`, `EN_SERVICIO`, `FINALIZADO`.
6. DriverApp notifica cambios de estado hacia RiderApp/mock.

### Finalizacion y liquidacion futura

En la version actual, `FINALIZADO` representa el fin del flujo operativo dentro de DriverApp: el driver termino el servicio y ya no debe seguir manipulando ese trabajo desde esta app.

Para la integracion real, esto no necesariamente significa que el trabajo este liquidado o cerrado en todo el ecosistema. Luego de que el driver finaliza, el flujo continua en RiderApp: el rider podria aceptar el cierre del trabajo o iniciar un reporte. En base a esa decision, PaymentsApp deberia informar si el trabajo queda liquidado, retenido o pendiente de resolucion.

Esto probablemente requiera una evolucion del contrato:

- agregar un estado interno como `PENDIENTE_LIQUIDAR` o equivalente;
- agregar un endpoint/callback desde PaymentsApp hacia DriverApp para informar liquidacion;
- reflejar en historial e ingresos la diferencia entre "servicio finalizado" y "trabajo liquidado".

No se implementa en Etapa 2 para no modificar el alcance de entrega, pero queda documentado como ajuste necesario para la integracion.

### Cancelacion desde RiderApp

RiderApp puede cancelar un trabajo llamando a `PUT /api/trabajos/state`. Esta API solo acepta `cancelado`.

Efectos:

- el trabajo pasa a `CANCELADO`;
- si habia driver asignado, vuelve a estar `ONLINE`;
- el trabajo deja de estar visible como solicitud activa;
- el dashboard muestra aviso de cancelacion.

### Reporte iniciado por driver

Si el driver inicia un reporte:

- confirma la accion en un modal;
- el trabajo pasa a `CANCELADO`;
- se notifica a RiderApp/mock;
- se crea el reporte en FeedbackApp/mock;
- no se muestra el aviso de "rider cancelo", porque la cancelacion fue iniciada por el driver.

### Historial e ingresos

El historial muestra trabajos recientes, estados, rechazos, cancelaciones, servicios usados y metricas de aceptacion. La busqueda y paginacion usan URL params (`q` y `page`).

Los ingresos no se calculan localmente desde trabajos finalizados. DriverApp consulta PaymentsApp o su mock y cachea la respuesta con revalidacion de 60 segundos.

## Configuracion local

```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npx prisma generate
npm run db:seed
npm run dev
```

Abrir:

```txt
http://localhost:3000
```

## Datos de prueba y mocks

Para simular solicitudes entrantes desde RiderApp:

```bash
npm run mock:rider-jobs
```

El script llama al webhook real `POST /api/webhooks/nuevo-trabajo`, por lo que prueba el flujo sin escribir directo en la base.

Variables utiles:

```txt
NEXT_PUBLIC_APP_URL=http://localhost:3000
MOCK_RIDER_JOB_INTERVAL_MS=10000
```

Windows con intervalo custom:

```bat
set MOCK_RIDER_JOB_INTERVAL_MS=5000
npm run mock:rider-jobs
```

## Como probar

### Driver

1. Iniciar sesion con rol `driver`.
2. Completar onboarding.
3. Seleccionar al menos un tipo de servicio.
4. Cambiar a online.
5. Correr `npm run mock:rider-jobs`.
6. Aceptar o rechazar solicitudes.
7. Si se acepta, avanzar estados y finalizar.
8. Revisar historial e ingresos.

### Admin

1. Iniciar sesion con rol `admin`.
2. Entrar a `/admin/servicios`.
3. Crear, editar o eliminar tipos de servicio.
4. Revisar metricas de servicios.

### Rider bloqueado

1. Iniciar sesion con rol `rider`.
2. La app redirige a la pantalla de cuenta perteneciente a RiderApp.
3. Desde ahi se puede volver al login o ir a RiderApp.

## APIs y pruebas manuales

Documentacion completa:

```txt
docs/APIs.md
```

APIs principales de DriverApp:

- `POST /api/webhooks/nuevo-trabajo`
- `PUT /api/trabajos/state`
- `GET /api/tipos-servicios`
- `GET /api/drivers/[id]`
- `POST /api/webhooks/clerk`

Mocks locales:

- `/api/mocks/repairdash/statetravel`
- `/api/mocks/payments/wallet/[driverId]`
- `/api/mocks/feedback/*`

Consultar tipos de servicio:

```bat
curl.exe -i "http://localhost:3000/api/tipos-servicios" ^
  -H "x-api-key: driver-secret-key"
```

Publicar trabajo:

```bat
curl.exe -i -X POST "http://localhost:3000/api/webhooks/nuevo-trabajo" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: driver-secret-key" ^
  -d "{ \"id_trabajo\": \"trabajo-terminal-001\", \"riderId\": \"rider_demo_001\", \"nombreRider\": \"Lucia\", \"apellidoRider\": \"Ramos\", \"valoracionRider\": 4.8, \"tipoServicioId\": \"REEMPLAZAR_TIPO_SERVICIO_ID\", \"direccion\": \"Av. Corrientes 1234\", \"descripcion\": \"Perdida de agua bajo la cocina\", \"fotos\": [] }"
```

Cancelar desde RiderApp/mock:

```bat
curl.exe -i -X PUT "http://localhost:3000/api/trabajos/state" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: driver-secret-key" ^
  -d "{ \"id_trabajo\": \"trabajo-terminal-001\", \"estado\": \"cancelado\" }"
```

Consultar driver por Clerk ID:

```bat
curl.exe -i "http://localhost:3000/api/drivers/CLERK_USER_ID_DEL_DRIVER" ^
  -H "x-api-key: driver-secret-key"
```

## Accesos

Login: `/login`

Registro: `/sign-up`

| Rol | Acceso |
|---|---|
| Administrador | `publicMetadata.role = "admin"` |
| Driver / trabajador | `publicMetadata.role = "driver"` |
| Rider / usuario final | `publicMetadata.role = "rider"`; acceso bloqueado en DriverApp |

No se incluyen contrasenas reales ni secretos en el repositorio. Para la defensa, compartir por fuera del repo un usuario admin, un driver y un rider.

## Scripts

```bash
npm run dev              # Desarrollo
npm run build            # Build de produccion
npm run start            # Servidor de produccion
npm run lint             # ESLint
npm run db:seed          # Datos base
npm run mock:rider-jobs  # Solicitudes simuladas
```

