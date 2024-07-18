/*
  Warnings:

  - Added the required column `department` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `department` VARCHAR(100) NOT NULL;
