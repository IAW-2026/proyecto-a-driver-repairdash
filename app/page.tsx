export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      <div className="bg-secondary/20 p-10 rounded-2xl border border-magenta shadow-[0_0_30px_-10px_rgba(245,0,241,0.5)]">
        <h1 className="text-6xl font-bold text-magenta mb-4">
          RepairDash
        </h1>
        <p className="text-accent text-xl">
          Configuración de colores exitosa.
        </p>
        <button className="mt-8 bg-magenta text-primary font-bold py-3 px-6 rounded-full hover:bg-highlight transition-all">
          Comenzar Proyecto
        </button>
      </div>
    </main>
  );
}