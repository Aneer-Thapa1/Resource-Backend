/*
  Warnings:

  - Added the required column `vat_contact` to the `vendors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `vendors` ADD COLUMN `vat_contact` INTEGER NOT NULL;
