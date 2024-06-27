/*
  Warnings:

  - You are about to drop the column `vat_contact` on the `vendors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `vendors` DROP COLUMN `vat_contact`,
    ADD COLUMN `vedor_contact` INTEGER NULL;
