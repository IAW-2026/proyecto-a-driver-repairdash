/*
  Warnings:

  - A unique constraint covering the columns `[clerkUserId]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerkUserId` to the `Driver` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "clerkUserId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Driver_clerkUserId_key" ON "Driver"("clerkUserId");
