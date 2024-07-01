/*
  Warnings:

  - You are about to drop the `item_category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `items` DROP FOREIGN KEY `items_item_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `items` DROP FOREIGN KEY `items_product_category_id_fkey`;

-- DropTable
DROP TABLE `item_category`;

-- DropTable
DROP TABLE `product_category`;

-- CreateTable
CREATE TABLE `itemCategory` (
    `item_category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_category_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `itemCategory_item_category_name_key`(`item_category_name`),
    PRIMARY KEY (`item_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productCategory` (
    `product_category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_category_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `productCategory_product_category_name_key`(`product_category_name`),
    PRIMARY KEY (`product_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_item_category_id_fkey` FOREIGN KEY (`item_category_id`) REFERENCES `itemCategory`(`item_category_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_product_category_id_fkey` FOREIGN KEY (`product_category_id`) REFERENCES `productCategory`(`product_category_id`) ON DELETE SET NULL ON UPDATE CASCADE;
