/*
  Warnings:

  - You are about to drop the column `vedor_contact` on the `vendors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `vendors` DROP COLUMN `vedor_contact`,
    ADD COLUMN `vendor_contact` INTEGER NULL;
