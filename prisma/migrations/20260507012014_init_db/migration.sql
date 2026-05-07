/*
  Warnings:

  - You are about to drop the column `fecha_creacion` on the `Trabajo` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_finalizacion` on the `Trabajo` table. All the data in the column will be lost.
  - You are about to drop the column `id_cliente` on the `Trabajo` table. All the data in the column will be lost.
  - You are about to drop the column `id_worker` on the `Trabajo` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_servicio` on the `Trabajo` table. All the data in the column will be lost.
  - The `estado` column on the `Trabajo` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Ganancia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Worker` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `actualizadoEn` to the `Trabajo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `driverId` to the `Trabajo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `montoEstimado` to the `Trabajo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `riderId` to the `Trabajo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoServicio` to the `Trabajo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('OFFLINE', 'ONLINE', 'EN_TRABAJO');

-- CreateEnum
CREATE TYPE "TrabajoEstado" AS ENUM ('PENDIENTE', 'ACEPTADO', 'RECHAZADO', 'EN_CAMINO', 'EN_SERVICIO', 'FINALIZADO', 'CANCELADO');

-- DropForeignKey
ALTER TABLE "Ganancia" DROP CONSTRAINT "Ganancia_id_worker_fkey";

-- DropForeignKey
ALTER TABLE "Trabajo" DROP CONSTRAINT "Trabajo_id_worker_fkey";

-- AlterTable
ALTER TABLE "Trabajo" DROP COLUMN "fecha_creacion",
DROP COLUMN "fecha_finalizacion",
DROP COLUMN "id_cliente",
DROP COLUMN "id_worker",
DROP COLUMN "tipo_servicio",
ADD COLUMN     "actualizadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "driverId" TEXT NOT NULL,
ADD COLUMN     "latitud" DOUBLE PRECISION,
ADD COLUMN     "longitud" DOUBLE PRECISION,
ADD COLUMN     "montoEstimado" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "riderId" TEXT NOT NULL,
ADD COLUMN     "tipoServicio" TEXT NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "TrabajoEstado" NOT NULL DEFAULT 'PENDIENTE';

-- DropTable
DROP TABLE "Ganancia";

-- DropTable
DROP TABLE "Worker";

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "status" "DriverStatus" NOT NULL DEFAULT 'OFFLINE',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialEstado" (
    "id" TEXT NOT NULL,
    "trabajoId" TEXT NOT NULL,
    "estadoAnterior" "TrabajoEstado",
    "estadoNuevo" "TrabajoEstado" NOT NULL,
    "motivo" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialEstado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_email_key" ON "Driver"("email");

-- AddForeignKey
ALTER TABLE "Trabajo" ADD CONSTRAINT "Trabajo_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstado" ADD CONSTRAINT "HistorialEstado_trabajoId_fkey" FOREIGN KEY ("trabajoId") REFERENCES "Trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
