-- DropForeignKey
ALTER TABLE `bills` DROP FOREIGN KEY `bills_ibfk_1`;

-- AlterTable
ALTER TABLE `bills` ADD COLUMN `item_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `vendors` ADD COLUMN `black_list` BOOLEAN NULL;

-- CreateIndex
CREATE INDEX `bills_vendor_ID_item_id_idx` ON `bills`(`vendor_ID`, `item_id`);

-- AddForeignKey
ALTER TABLE `bills` ADD CONSTRAINT `bills_vendor_ID_fkey` FOREIGN KEY (`vendor_ID`) REFERENCES `vendors`(`vendor_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bills` ADD CONSTRAINT `bills_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`item_id`) ON DELETE SET NULL ON UPDATE CASCADE;
