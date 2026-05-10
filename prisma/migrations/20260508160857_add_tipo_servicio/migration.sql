-- CreateTable
CREATE TABLE "TipoServicio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precioBase" DECIMAL(10,2) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverTipoServicio" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "tipoServicioId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverTipoServicio_pkey" PRIMARY KEY ("id")
);

-- Seed service catalog from legacy Trabajo.tipoServicio values before dropping the column.
INSERT INTO "TipoServicio" ("id", "nombre", "descripcion", "precioBase", "actualizadoEn")
SELECT
    concat('legacy_', md5("tipoServicio")) AS "id",
    "tipoServicio" AS "nombre",
    concat('Servicio migrado desde trabajos existentes: ', "tipoServicio") AS "descripcion",
    COALESCE(MIN("montoEstimado"), 0) AS "precioBase",
    CURRENT_TIMESTAMP AS "actualizadoEn"
FROM "Trabajo"
WHERE "tipoServicio" IS NOT NULL
GROUP BY "tipoServicio";

-- Add the new FK column as nullable while existing rows are backfilled.
ALTER TABLE "Trabajo" ADD COLUMN "tipoServicioId" TEXT;

UPDATE "Trabajo"
SET "tipoServicioId" = "TipoServicio"."id"
FROM "TipoServicio"
WHERE "Trabajo"."tipoServicio" = "TipoServicio"."nombre";

-- Drop legacy string column after backfill and enforce the new normalized relation.
ALTER TABLE "Trabajo" DROP COLUMN "tipoServicio";
ALTER TABLE "Trabajo" ALTER COLUMN "tipoServicioId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TipoServicio_nombre_key" ON "TipoServicio"("nombre");

-- CreateIndex
CREATE INDEX "Trabajo_driverId_idx" ON "Trabajo"("driverId");

-- CreateIndex
CREATE INDEX "Trabajo_riderId_idx" ON "Trabajo"("riderId");

-- CreateIndex
CREATE INDEX "Trabajo_tipoServicioId_idx" ON "Trabajo"("tipoServicioId");

-- CreateIndex
CREATE INDEX "Trabajo_estado_idx" ON "Trabajo"("estado");

-- CreateIndex
CREATE INDEX "HistorialEstado_trabajoId_idx" ON "HistorialEstado"("trabajoId");

-- CreateIndex
CREATE INDEX "DriverTipoServicio_driverId_idx" ON "DriverTipoServicio"("driverId");

-- CreateIndex
CREATE INDEX "DriverTipoServicio_tipoServicioId_idx" ON "DriverTipoServicio"("tipoServicioId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverTipoServicio_driverId_tipoServicioId_key" ON "DriverTipoServicio"("driverId", "tipoServicioId");

-- AddForeignKey
ALTER TABLE "Trabajo" ADD CONSTRAINT "Trabajo_tipoServicioId_fkey" FOREIGN KEY ("tipoServicioId") REFERENCES "TipoServicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverTipoServicio" ADD CONSTRAINT "DriverTipoServicio_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverTipoServicio" ADD CONSTRAINT "DriverTipoServicio_tipoServicioId_fkey" FOREIGN KEY ("tipoServicioId") REFERENCES "TipoServicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
