-- AlterTable
ALTER TABLE "Trabajo" ADD COLUMN     "apellidoRider" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nombreRider" TEXT NOT NULL DEFAULT 'Cliente',
ADD COLUMN     "valoracionRider" DOUBLE PRECISION NOT NULL DEFAULT 0;
