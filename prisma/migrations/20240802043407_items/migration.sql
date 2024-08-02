/*
  Warnings:

  - You are about to drop the column `quantity` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `total_purchased` on the `items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `items` DROP COLUMN `quantity`,
    DROP COLUMN `total_purchased`;
