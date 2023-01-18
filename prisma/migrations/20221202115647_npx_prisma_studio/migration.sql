/*
  Warnings:

  - You are about to drop the column `type` on the `orders` table. All the data in the column will be lost.
  - Added the required column `strategy` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buySlippage` to the `tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellSlippage` to the `tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "type",
ADD COLUMN     "strategy" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "buyNow" SET DEFAULT false,
ALTER COLUMN "sellNow" SET DEFAULT false;

-- AlterTable
ALTER TABLE "tokens" ADD COLUMN     "buySlippage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "sellSlippage" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
