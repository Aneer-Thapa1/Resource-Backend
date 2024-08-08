/*
  Warnings:

  - The primary key for the `userpool` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `userpool` table. All the data in the column will be lost.
  - You are about to drop the column `userpoolid` on the `userpool` table. All the data in the column will be lost.
  - Added the required column `userPoolId` to the `userPool` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `userpool` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `userpoolid`,
    ADD COLUMN `userPoolId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`userPoolId`);
