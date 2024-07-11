-- AlterTable
ALTER TABLE `items` ADD COLUMN `Status` BOOLEAN NULL,
    ADD COLUMN `recent_purchase` DATETIME(3) NULL,
    ADD COLUMN `unit_price` INTEGER NULL;
