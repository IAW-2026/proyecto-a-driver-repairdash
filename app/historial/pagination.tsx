"use client";

import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type TrabajoItem = {
  id: string;
  tipoServicio: string;
  direccion: string;
  estado: string;
  tiempoMinutos: number | null;
};

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ACEPTADO: "Aceptado",
  EN_CAMINO: "En camino",
  EN_SERVICIO: "En servicio",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
  RECHAZADO: "Rechazado",
};

const ESTADO_DOT: Record<string, string> = {
  PENDIENTE: "bg-amber-500",
  ACEPTADO: "bg-blue-500",
  EN_CAMINO: "bg-cyan-500",
  EN_SERVICIO: "bg-magenta",
  FINALIZADO: "bg-green-500",
  CANCELADO: "bg-highlight/30",
  RECHAZADO: "bg-red-500",
};

function Row({ t }: { t: TrabajoItem }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-highlight/10 bg-highlight/[0.03] px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-highlight">
          {t.tipoServicio}
        </p>
        <p className="mt-0.5 truncate text-xs text-highlight/55">
          {t.direccion}
        </p>
      </div>

      <div className="ml-3 flex items-center gap-3">
        {t.tiempoMinutos !== null && (
          <span className="text-xs tabular-nums text-highlight/50">
            {t.tiempoMinutos < 60
              ? `${t.tiempoMinutos} min`
              : `${Math.floor(t.tiempoMinutos / 60)}h ${t.tiempoMinutos % 60}m`}
          </span>
        )}

        <div className="text-right">
          <p className="flex items-center gap-1 text-xs text-highlight/55">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${ESTADO_DOT[t.estado] ?? "bg-highlight/30"}`}
            />
            {ESTADO_LABELS[t.estado] ?? t.estado}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HistorialPagination({
  items,
  pageSize = 3,
}: {
  items: TrabajoItem[];
  pageSize?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      const estado = ESTADO_LABELS[item.estado] ?? item.estado;

      return [
        item.tipoServicio,
        item.direccion,
        item.estado,
        estado,
      ].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [items, query]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / pageSize),
  );

  const rawPage = Number(searchParams.get("page") ?? "1");
  const currentPage = Number.isFinite(rawPage)
    ? Math.min(
        Math.max(Math.trunc(rawPage), 1),
        totalPages,
      )
    : 1;

  const slice = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const updateUrl = useCallback(
    ({
      nextPage,
      nextQuery,
    }: {
      nextPage?: number;
      nextQuery?: string;
    }) => {
      const params =
        new URLSearchParams(
          searchParams.toString(),
        );

      const finalQuery =
        nextQuery ?? query;
      const finalPage =
        nextPage ?? currentPage;

      if (finalQuery.trim()) {
        params.set(
          "q",
          finalQuery.trim(),
        );
      } else {
        params.delete("q");
      }

      if (finalPage > 1) {
        params.set(
          "page",
          String(finalPage),
        );
      } else {
        params.delete("page");
      }

      const queryString =
        params.toString();

      router.replace(
        queryString
          ? `${pathname}?${queryString}`
          : pathname,
        { scroll: false },
      );
    },
    [
      currentPage,
      pathname,
      query,
      router,
      searchParams,
    ],
  );

  useEffect(() => {
    if (query === urlQuery) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        updateUrl({
          nextQuery: query,
          nextPage: 1,
        });
      },
      250,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query, updateUrl, urlQuery]);

  function handleQueryChange(value: string) {
    setQuery(value);
  }

  return (
    <>
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-highlight/10 bg-highlight/[0.04] px-3 py-2">
        <Search
          aria-hidden
          className="size-4 shrink-0 text-highlight/45"
        />

        <input
          value={query}
          onChange={(event) =>
            handleQueryChange(event.target.value)
          }
          placeholder="Buscar por servicio, direccion o estado"
          className="h-9 min-w-0 flex-1 bg-transparent text-sm font-medium text-highlight outline-none placeholder:text-highlight/35"
        />

        {query && (
          <button
            type="button"
            onClick={() => handleQueryChange("")}
            className="grid size-8 place-items-center rounded-xl text-highlight/50 transition hover:bg-highlight/[0.08] hover:text-highlight"
            aria-label="Limpiar busqueda"
          >
            <X
              aria-hidden
              className="size-4"
            />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {slice.map((item) => (
          <Row key={item.id} t={item} />
        ))}

        {filteredItems.length === 0 && (
          <p className="rounded-xl border border-highlight/10 bg-highlight/[0.03] px-4 py-5 text-center text-sm text-highlight/50">
            No hay trabajos para ese filtro.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() =>
              updateUrl({
                nextPage: currentPage - 1,
              })
            }
            className="grid h-8 w-8 place-items-center rounded-lg border border-highlight/10 bg-highlight/[0.06] text-xs font-bold text-highlight/70 transition hover:bg-highlight/[0.1] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Pagina anterior"
          >
            <ChevronLeft
              aria-hidden
              className="size-4"
            />
          </button>

          <span className="text-xs tabular-nums text-highlight/55">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() =>
              updateUrl({
                nextPage: currentPage + 1,
              })
            }
            className="grid h-8 w-8 place-items-center rounded-lg border border-highlight/10 bg-highlight/[0.06] text-xs font-bold text-highlight/70 transition hover:bg-highlight/[0.1] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Pagina siguiente"
          >
            <ChevronRight
              aria-hidden
              className="size-4"
            />
          </button>
        </div>
      )}
    </>
  );
}
