/*
  Warnings:

  - You are about to drop the column `pending_payment` on the `vendors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `vendors` DROP COLUMN `pending_payment`;
