-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "breakeven" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "sl" SET DEFAULT 0,
ALTER COLUMN "tp" SET DEFAULT 99999999;
