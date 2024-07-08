-- DropForeignKey
ALTER TABLE `bills` DROP FOREIGN KEY `bills_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `bills` DROP FOREIGN KEY `bills_vendor_ID_fkey`;

-- AddForeignKey
ALTER TABLE `bills` ADD CONSTRAINT `bills_vendor_ID_fkey` FOREIGN KEY (`vendor_ID`) REFERENCES `vendors`(`vendor_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bills` ADD CONSTRAINT `bills_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;
