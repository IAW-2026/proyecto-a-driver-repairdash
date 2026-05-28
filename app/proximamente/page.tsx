import Link from "next/link";

export default function ProximamentePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary px-5 text-center">
      <div className="max-w-sm">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-accent/20 bg-accent/10 text-4xl">
          🚧
        </div>

        <h1 className="mt-8 text-3xl font-black text-highlight">
          Próximamente
        </h1>

        <p className="mt-4 text-sm leading-6 text-highlight/55">
          Esta funcionalidad estará disponible cuando integremos con las demas aplicaciones de RepairDash. Estamos trabajando arduamente para ofrecerte la mejor experiencia posible. ¡Mantente atento a las actualizaciones!
        </p>

        <Link
          href="/"
          className="mt-10 inline-flex h-14 items-center justify-center rounded-2xl bg-magenta px-8 text-sm font-bold text-white shadow-lg shadow-magenta/25 transition hover:opacity-90"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
