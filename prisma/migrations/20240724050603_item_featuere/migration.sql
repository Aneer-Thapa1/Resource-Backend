-- AlterTable
ALTER TABLE `items` ADD COLUMN `feature_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_feature_id_fkey` FOREIGN KEY (`feature_id`) REFERENCES `feature`(`feature_id`) ON DELETE SET NULL ON UPDATE CASCADE;
