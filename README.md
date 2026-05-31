# RepairDash - Driver App

RepairDash Driver App es la aplicacion para trabajadores tecnicos dentro del ecosistema RepairDash. Permite que un driver se registre, complete su onboarding, active su disponibilidad, reciba solicitudes de trabajo, acepte o rechace trabajos, actualice estados, reporte problemas, consulte historial e ingresos, y administre su perfil.

Esta webapp funciona de forma independiente para la Etapa 2 del proyecto. Las integraciones con RiderApp, PaymentsApp y FeedbackApp se consumen mediante mocks locales o clientes con fallback, respetando los contratos acordados para una futura integracion real.

## Deploy

Produccion:

```txt
https://driver-repairdash.vercel.app
```

## Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- PostgreSQL
- Clerk Auth
- Tailwind CSS
- Supabase Storage
- Vercel

## Roles y acceso

La autenticacion se gestiona con Clerk.

- Usuario no autenticado: ve la pantalla publica y puede iniciar sesion o crear cuenta.
- Driver: accede al dashboard, solicitudes, trabajos activos, historial, ingresos y perfil.
- Admin: accede al panel `/admin/servicios` para gestionar tipos de servicio.
- Rider: no puede ingresar a DriverApp. Se muestra una pantalla explicando que la cuenta pertenece a RiderApp, con salida hacia RiderApp o login.

Para probar roles, usar usuarios Clerk configurados con `publicMetadata.role`:

```json
{ "role": "driver" }
```

```json
{ "role": "admin" }
```

```json
{ "role": "rider" }
```

## Configuracion local

Instalar dependencias:

```bash
npm install
```

Crear `.env` a partir de `.env.example` y completar las variables necesarias:

```bash
cp .env.example .env
```

Aplicar migraciones y generar Prisma Client:

```bash
npx prisma migrate deploy
npx prisma generate
```

Cargar datos base:

```bash
npm run db:seed
```

Levantar la app:

```bash
npm run dev
```

Abrir:

```txt
http://localhost:3000
```

## Datos de prueba

La app no depende de que RiderApp publique trabajos reales. Para simular solicitudes entrantes se usa:

```bash
npm run mock:rider-jobs
```

El script llama al webhook real de DriverApp:

```txt
POST /api/webhooks/nuevo-trabajo
```

Esto permite probar el flujo como si RiderApp estuviera enviando solicitudes, sin escribir directo en la base de datos.

Variables utiles para el simulador:

```txt
NEXT_PUBLIC_APP_URL=http://localhost:3000
MOCK_RIDER_JOB_INTERVAL_MS=10000
```

## Funcionalidades principales

- Pantalla publica de bienvenida.
- Login y registro con Clerk.
- Onboarding de driver.
- Bloqueo de cuentas con rol `rider`.
- Dashboard mobile-first para el trabajador.
- Estado online/offline.
- Recepcion de solicitudes de trabajo mockeadas.
- Aceptar y rechazar trabajos.
- Cambio de estados del trabajo.
- Cancelacion recibida desde RiderApp mediante API expuesta.
- Reporte de trabajo hacia FeedbackApp mock.
- Historial con estados diferenciados.
- Ingresos consultados desde PaymentsApp o mock/fallback.
- Valoracion y reportes consultados desde FeedbackApp o mock/fallback.
- Perfil editable con avatar en Supabase Storage.
- Panel admin para CRUD de tipos de servicio.

## APIs y mocks

La documentacion completa de APIs expuestas, mocks locales y comandos `curl` esta en:

```txt
docs/APIs.md
```

Endpoints principales expuestos por DriverApp:

- `POST /api/webhooks/nuevo-trabajo`
- `PUT /api/trabajos/state`
- `GET /api/tipos-servicios`
- `GET /api/drivers/[id]`
- `POST /api/webhooks/clerk`

Mocks locales:

- `/api/mocks/repairdash/statetravel`
- `/api/mocks/payments/wallet/[driverId]`
- `/api/mocks/feedback/*`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:seed
npm run mock:rider-jobs
```

## Notas de arquitectura

- DriverApp es dueña de su propia base PostgreSQL.
- Los IDs que cruzan entre apps son Clerk IDs.
- Los IDs internos de Prisma no se exponen como identidad entre aplicaciones.
- RiderApp, PaymentsApp y FeedbackApp son servicios externos para este repositorio.
- En Etapa 2 las integraciones se mantienen mockeadas o simuladas.
- PaymentsApp es la unica responsable de pagos reales; DriverApp solo consulta y muestra informacion.

