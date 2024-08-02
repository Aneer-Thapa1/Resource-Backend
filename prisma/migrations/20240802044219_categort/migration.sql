/*
  Warnings:

  - You are about to drop the column `product_category_id` on the `items` table. All the data in the column will be lost.
  - You are about to drop the `productcategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `items` DROP FOREIGN KEY `items_product_category_id_fkey`;

-- AlterTable
ALTER TABLE `items` DROP COLUMN `product_category_id`;

-- DropTable
DROP TABLE `productcategory`;
