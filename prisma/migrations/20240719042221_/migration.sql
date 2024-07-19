/*
  Warnings:

  - Added the required column `request_date` to the `request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `request` ADD COLUMN `request_date` DATETIME(3) NOT NULL;
