/*
  Warnings:

  - A unique constraint covering the columns `[telefonoNormalizado]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Trabajo" DROP CONSTRAINT "Trabajo_driverId_fkey";

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "onboardingCompleto" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telefonoNormalizado" TEXT;

-- AlterTable
ALTER TABLE "Trabajo" ALTER COLUMN "driverId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Driver_telefonoNormalizado_key" ON "Driver"("telefonoNormalizado");

-- AddForeignKey
ALTER TABLE "Trabajo" ADD CONSTRAINT "Trabajo_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
