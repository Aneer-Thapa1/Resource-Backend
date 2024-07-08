/*
  Warnings:

  - Made the column `entry_date` on table `bills` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `bills` MODIFY `entry_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
