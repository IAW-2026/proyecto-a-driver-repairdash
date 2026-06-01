# RepairDash - Driver App

## Deploy de produccion

```txt
https://driver-repairdash.vercel.app
```

El codigo final a evaluar se encuentra en el branch `main`.

## Usuarios de prueba

Todos los usuarios usan la misma contrasena:

```txt
iawuser#
```

| Rol | Email | Uso |
|---|---|---|
| Admin | `admin+clerktest@iaw.com` | Gestionar tipos de servicio en `/admin/servicios`. |
| Driver | `driver+clerktest@iaw.com` | Usar dashboard, recibir solicitudes, gestionar trabajos, historial e ingresos. |
| Rider | `rider+clerktest@iaw.com` | Verificar que una cuenta rider no puede ingresar a Driver App. |

Los roles se configuran en Clerk mediante `publicMetadata.role` con los valores `admin`, `driver` o `rider`.

## Instrucciones para evaluar

1. Entrar al deploy de produccion.
2. Iniciar sesion con el usuario `driver+clerktest@iaw.com`.
3. Si el usuario no esta online, cambiar disponibilidad desde el dashboard.
4. Para simular solicitudes de trabajo en local, correr:

```bash
npm run mock:rider-jobs
```

5. Aceptar o rechazar solicitudes. Si se acepta una, avanzar sus estados hasta finalizar.
6. Revisar `/historial` para ver trabajos, estados, busqueda y paginacion por URL.
7. Revisar `/ingresos` para ver datos consultados desde PaymentsApp o fallback mock.
8. Iniciar sesion como admin y entrar a `/admin/servicios` para crear, editar o eliminar tipos de servicio.
9. Iniciar sesion como rider para comprobar que Driver App bloquea esa cuenta y ofrece redireccion a RiderApp.

Para correr localmente:

```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npx prisma generate
npm run db:seed
npm run dev
```

Documentacion tecnica de APIs, webhooks, mocks y comandos `curl`:

```txt
docs/APIs.md
```

## Descripcion breve

RepairDash Driver App es el modulo de trabajadores del ecosistema RepairDash. Permite que un driver complete su onboarding, elija los servicios que ofrece, se ponga online, reciba solicitudes, acepte o rechace trabajos, actualice estados, reporte problemas, consulte historial, ingresos y perfil.

La aplicacion usa Next.js App Router, TypeScript, Prisma, PostgreSQL, Clerk, Tailwind, Lucide y Supabase Storage. Cada app del ecosistema tiene su propia base de datos; por eso Driver App solo conserva datos propios y usa Clerk IDs para comunicarse con otros servicios.

Para Etapa 2, RiderApp, PaymentsApp y FeedbackApp estan simuladas mediante mocks locales o clientes con fallback. La app queda funcional de manera independiente y mantiene documentados los contratos esperados para integracion futura.

## Notas para la correccion

- La aplicacion no debe evaluarse como vacia: se incluyen seed de tipos de servicio y un script para generar solicitudes sin escribir directo en la base.
- `FINALIZADO` representa el fin del flujo operativo en Driver App. En una integracion completa, el cierre definitivo dependeria de RiderApp y PaymentsApp: el rider podria aceptar el cierre o iniciar un reporte, y PaymentsApp deberia informar si el trabajo queda liquidado, retenido o pendiente de resolucion.
- Como evolucion futura se espera agregar un estado como `PENDIENTE_LIQUIDAR` y un callback desde PaymentsApp hacia DriverApp para diferenciar "servicio finalizado" de "trabajo liquidado".
- Los ingresos mostrados no se calculan localmente desde trabajos finalizados; se consultan desde PaymentsApp o su mock/fallback con cache de 60 segundos.
- Las APIs y mocks disponibles estan documentados en `docs/APIs.md`.

