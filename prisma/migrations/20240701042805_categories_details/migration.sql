/*
  Warnings:

  - You are about to drop the column `category` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `item_category` on the `items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `items` DROP COLUMN `category`,
    DROP COLUMN `item_category`,
    ADD COLUMN `item_category_id` INTEGER NULL,
    ADD COLUMN `product_category_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `item_category` (
    `item_category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_category_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `item_category_item_category_name_key`(`item_category_name`),
    PRIMARY KEY (`item_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_category` (
    `product_category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_category_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `product_category_product_category_name_key`(`product_category_name`),
    PRIMARY KEY (`product_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_item_category_id_fkey` FOREIGN KEY (`item_category_id`) REFERENCES `item_category`(`item_category_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_product_category_id_fkey` FOREIGN KEY (`product_category_id`) REFERENCES `product_category`(`product_category_id`) ON DELETE SET NULL ON UPDATE CASCADE;
