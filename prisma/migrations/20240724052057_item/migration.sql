/*
  Warnings:

  - You are about to drop the column `feature_id` on the `items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `items` DROP FOREIGN KEY `items_feature_id_fkey`;

-- AlterTable
ALTER TABLE `items` DROP COLUMN `feature_id`;

-- CreateTable
CREATE TABLE `itemsOnFeatures` (
    `item_id` INTEGER NOT NULL,
    `feature_id` INTEGER NOT NULL,

    PRIMARY KEY (`item_id`, `feature_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `itemsOnFeatures` ADD CONSTRAINT `itemsOnFeatures_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itemsOnFeatures` ADD CONSTRAINT `itemsOnFeatures_feature_id_fkey` FOREIGN KEY (`feature_id`) REFERENCES `feature`(`feature_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
