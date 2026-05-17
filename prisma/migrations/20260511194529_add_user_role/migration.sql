-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('DRIVER', 'ADMIN');

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'DRIVER';
