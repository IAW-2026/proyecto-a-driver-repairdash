# RepairDash - Driver App

Modulo de trabajadores de RepairDash, una aplicacion web orientada a gestionar disponibilidad, solicitudes de trabajo, estados de servicio, historial, perfil e ingresos de drivers/trabajadores tecnicos.

Proyecto desarrollado en Next.js para la materia Ingenieria de Aplicaciones Web - UNS, 2026.

Para mayor informacion sobre las APIs, webhooks y mocks se puede consultar `docs/APIs.md`.

## Deploy

```txt
https://driver-repairdash.vercel.app
```

El proyecto se encuentra actualizado en rama `main`.

## Descripcion general

Driver App concentra la experiencia del trabajador dentro del ecosistema RepairDash:

- Registro e inicio de sesion con Clerk.
- Onboarding inicial del driver.
- Seleccion de tipos de servicio ofrecidos.
- Cambio de disponibilidad online/offline.
- Recepcion de solicitudes de trabajo.
- Aceptacion y rechazo de trabajos.
- Seguimiento del estado del servicio.
- Reporte de problemas durante un trabajo.
- Historial de trabajos y estados.
- Visualizacion de ingresos consultados a PaymentsApp o su mock.
- Visualizacion de valoracion y reportes consultados a FeedbackApp o su mock.
- Panel administrativo para gestionar tipos de servicio.

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

## Enfoque arquitectonico

Organizacion principal:

- `app/`: rutas App Router, paginas, layouts, server actions y API routes.
- `components/`: componentes visuales reutilizables para dashboard, perfil, onboarding y trabajos.
- `lib/actions/`: server actions usadas por formularios y operaciones del dominio.
- `lib/services/`: logica de negocio, consultas del historial, onboarding, drivers e integraciones externas.
- `lib/services/external/`: clientes para RiderApp, PaymentsApp y FeedbackApp, actualmente con mocks/fallbacks.
- `lib/mocks/`: datos y respuestas simuladas de servicios externos.
- `lib/auth/`: helpers de roles, admin y validacion de API keys internas.
- `lib/state-machine/`: reglas de transicion de estados de trabajo.
- `prisma/`: schema, migraciones y seed de datos base.
- `docs/`: documentacion de APIs, webhooks y comandos de prueba.

Reglas de arquitectura:

- DriverApp es duena de su propia base PostgreSQL.
- Los IDs que cruzan entre apps son Clerk IDs.
- Los IDs internos de Prisma no se usan como identidad entre aplicaciones.
- RiderApp, PaymentsApp y FeedbackApp no se implementan internamente.
- PaymentsApp es la unica responsable de pagos reales; DriverApp solo consulta y muestra informacion.
- En Etapa 2 las integraciones se mantienen mockeadas o simuladas.

## Flujos principales

### Flujo de driver

1. El usuario ingresa a DriverApp.
2. Si no esta autenticado, puede iniciar sesion o crear cuenta.
3. Si su cuenta tiene rol `driver`, accede al dashboard.
4. Si todavia no completo onboarding, carga sus datos, telefono y servicios ofrecidos.
5. Desde el dashboard cambia su estado a online.
6. Al estar online, ve solicitudes compatibles con sus tipos de servicio.
7. Puede aceptar o rechazar cada solicitud.

### Flujo de trabajo

1. RiderApp, o el script mock, publica un trabajo mediante `POST /api/webhooks/nuevo-trabajo`.
2. DriverApp guarda el trabajo en estado `PENDIENTE`.
3. El driver acepta el trabajo.
4. DriverApp asigna el trabajo al driver y lo pasa a `ACEPTADO`.
5. DriverApp avisa el nuevo trabajo a FeedbackApp o a su mock.
6. El driver cambia los estados del trabajo: `EN_CAMINO`, `EN_SERVICIO` y `FINALIZADO`.
7. DriverApp notifica los cambios de estado hacia el mock de RiderApp.
8. Al finalizar, se habilita el flujo de valoracion en FeedbackApp o mock.

### Cancelacion desde RiderApp

RiderApp puede cancelar un trabajo llamando a:

```txt
PUT /api/trabajos/state
```

Esta API solo acepta el estado `cancelado`. Cuando ocurre:

- El trabajo pasa a `CANCELADO`.
- Si habia driver asignado, vuelve a estar `ONLINE`.
- El trabajo deja de estar visible como solicitud activa.
- El dashboard muestra el aviso de cancelacion correspondiente.

### Reporte iniciado por driver

Si el driver comienza un reporte:

- Se confirma la accion mediante un modal.
- El trabajo pasa a `CANCELADO`.
- Se notifica a RiderApp/mock con estado `cancelado`.
- Se crea el reporte en FeedbackApp/mock.
- El driver vuelve al flujo de la app.

Este caso no muestra el aviso de "rider cancelo" en el dashboard, porque la cancelacion fue iniciada por el driver.

### Historial e ingresos

El historial muestra trabajos recientes, estados, rechazos, cancelaciones, servicios usados y metricas de aceptacion.

Los ingresos no se calculan localmente desde trabajos finalizados. DriverApp consulta PaymentsApp o su mock y cachea la respuesta con revalidacion de 60 segundos.

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

## Datos de prueba y mocks

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

Ejemplo en Windows con intervalo custom:

```bat
set MOCK_RIDER_JOB_INTERVAL_MS=5000
npm run mock:rider-jobs
```

## Como probar casos de uso

### Flujo completo vista driver

1. Iniciar sesion con una cuenta Clerk con rol `driver`.
2. Completar onboarding si la cuenta es nueva.
3. Elegir al menos un tipo de servicio.
4. Ir al dashboard.
5. Cambiar el estado a online.
6. En otra terminal correr:

```bash
npm run mock:rider-jobs
```

7. Esperar una solicitud compatible.
8. Aceptar o rechazar la solicitud.
9. Si se acepta, avanzar los estados del trabajo.
10. Finalizar el trabajo.
11. Revisar historial e ingresos.

### Flujo vista administrador

1. Iniciar sesion con una cuenta Clerk con rol `admin`.
2. Entrar a:

```txt
/admin/servicios
```

3. Crear, editar o eliminar tipos de servicio.
4. Revisar metricas de servicios, drivers asignados y trabajos activos.

### Flujo cuenta rider bloqueada

1. Iniciar sesion con una cuenta Clerk con rol `rider`.
2. La app redirige a la pantalla de cuenta perteneciente a RiderApp.
3. Desde esa pantalla se puede volver al login o ir a RiderApp.

## Pruebas manuales rapidas

Consultar tipos de servicio:

```bat
curl.exe -i "http://localhost:3000/api/tipos-servicios" ^
  -H "x-api-key: driver-secret-key"
```

Publicar un trabajo nuevo:

```bat
curl.exe -i -X POST "http://localhost:3000/api/webhooks/nuevo-trabajo" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: driver-secret-key" ^
  -d "{ \"id_trabajo\": \"trabajo-terminal-001\", \"riderId\": \"rider_demo_001\", \"nombreRider\": \"Lucia\", \"apellidoRider\": \"Ramos\", \"valoracionRider\": 4.8, \"tipoServicioId\": \"REEMPLAZAR_TIPO_SERVICIO_ID\", \"direccion\": \"Av. Corrientes 1234\", \"descripcion\": \"Perdida de agua bajo la cocina\", \"fotos\": [] }"
```

Cancelar un trabajo desde RiderApp/mock:

```bat
curl.exe -i -X PUT "http://localhost:3000/api/trabajos/state" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: driver-secret-key" ^
  -d "{ \"id_trabajo\": \"trabajo-terminal-001\", \"estado\": \"cancelado\" }"
```

Consultar informacion publica de un driver por Clerk ID:

```bat
curl.exe -i "http://localhost:3000/api/drivers/CLERK_USER_ID_DEL_DRIVER" ^
  -H "x-api-key: driver-secret-key"
```

Consultar wallet mock de PaymentsApp:

```bat
curl.exe -i "http://localhost:3000/api/mocks/payments/wallet/CLERK_USER_ID_DEL_DRIVER" ^
  -H "x-api-key: dev-payments-key"
```

La documentacion completa de APIs y todos los comandos `curl` esta en `docs/APIs.md`.

## APIs y mocks

APIs principales expuestas por DriverApp:

- `POST /api/webhooks/nuevo-trabajo`
- `PUT /api/trabajos/state`
- `GET /api/tipos-servicios`
- `GET /api/drivers/[id]`
- `POST /api/webhooks/clerk`

Mocks locales:

- `/api/mocks/repairdash/statetravel`
- `/api/mocks/payments/wallet/[driverId]`
- `/api/mocks/feedback/*`

## Accesos

El login se realiza desde `/login`. El registro se realiza desde `/sign-up`.

La autenticacion usa Clerk y la app redirige segun el rol del usuario.

Roles disponibles:

| Rol | Acceso |
|---|---|
| Administrador | Cuenta con `publicMetadata.role = "admin"` |
| Driver / trabajador | Cuenta con `publicMetadata.role = "driver"` |
| Rider / usuario final | Cuenta con `publicMetadata.role = "rider"`; acceso bloqueado en DriverApp |

Para probar roles, configurar en Clerk:

```json
{ "role": "driver" }
```

```json
{ "role": "admin" }
```

```json
{ "role": "rider" }
```

## Usuarios de prueba

No se incluyen contrasenas reales ni secretos en el repositorio.

Para la defensa, configurar o compartir por fuera del repositorio:

- Usuario admin con rol `admin`.
- Usuario driver con rol `driver`.
- Usuario rider con rol `rider`, para demostrar bloqueo de acceso.

## Scripts utiles

```bash
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Compilar para produccion
npm run start            # Iniciar servidor de produccion
npm run lint             # Ejecutar ESLint
npm run db:seed          # Cargar datos base
npm run mock:rider-jobs  # Simular solicitudes de RiderApp
```
