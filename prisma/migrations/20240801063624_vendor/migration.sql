/*
  Warnings:

  - You are about to drop the column `total_payment` on the `vendors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `bills` ADD COLUMN `paid_amount` FLOAT NULL;

-- AlterTable
ALTER TABLE `vendors` DROP COLUMN `total_payment`;
