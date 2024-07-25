-- AlterTable
ALTER TABLE `items` ADD COLUMN `brand_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `brand` (
    `brand_id` INTEGER NOT NULL AUTO_INCREMENT,
    `brand_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `brand_brand_name_key`(`brand_name`),
    PRIMARY KEY (`brand_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `brand`(`brand_id`) ON DELETE SET NULL ON UPDATE CASCADE;
