-- AlterTable
ALTER TABLE "Trabajo" ADD COLUMN "fotos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "TrabajoRechazado" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "trabajoId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrabajoRechazado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrabajoRechazado_driverId_trabajoId_key" ON "TrabajoRechazado"("driverId", "trabajoId");

-- CreateIndex
CREATE INDEX "TrabajoRechazado_driverId_idx" ON "TrabajoRechazado"("driverId");

-- CreateIndex
CREATE INDEX "TrabajoRechazado_trabajoId_idx" ON "TrabajoRechazado"("trabajoId");

-- AddForeignKey
ALTER TABLE "TrabajoRechazado" ADD CONSTRAINT "TrabajoRechazado_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrabajoRechazado" ADD CONSTRAINT "TrabajoRechazado_trabajoId_fkey" FOREIGN KEY ("trabajoId") REFERENCES "Trabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
