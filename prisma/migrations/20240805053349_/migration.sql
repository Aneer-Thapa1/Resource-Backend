-- CreateTable
CREATE TABLE `vendors` (
    `vendor_id` INTEGER NOT NULL AUTO_INCREMENT,
    `vendor_name` VARCHAR(255) NULL,
    `vat_number` VARCHAR(255) NULL,
    `vendor_contact` INTEGER NULL,
    `last_purchase_date` DATE NULL,
    `last_paid` DATE NULL,
    `payment_duration` INTEGER NULL,
    `next_payment_date` DATE NULL,
    `black_list` BOOLEAN NULL,

    PRIMARY KEY (`vendor_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bills` (
    `bill_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `entry_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `bill_no` VARCHAR(255) NULL,
    `bill_amount` FLOAT NULL,
    `TDS` FLOAT NULL,
    `bill_date` DATE NULL,
    `invoice_no` VARCHAR(255) NULL,
    `actual_amount` FLOAT NULL,
    `paid_amount` FLOAT NULL,
    `left_amount` FLOAT NULL,
    `unit_price` INTEGER NULL,
    `quantity` INTEGER NULL,
    `vendor_ID` INTEGER NULL,
    `item_id` INTEGER NULL,

    INDEX `bills_vendor_ID_item_id_idx`(`vendor_ID`, `item_id`),
    PRIMARY KEY (`bill_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(95) NOT NULL,
    `user_email` VARCHAR(65) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'user',
    `otp` VARCHAR(191) NULL,
    `otp_expiry` DATETIME(3) NULL,
    `department` VARCHAR(100) NULL,

    UNIQUE INDEX `users_user_email_key`(`user_email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feature` (
    `feature_id` INTEGER NOT NULL AUTO_INCREMENT,
    `feature_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`feature_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_name` VARCHAR(255) NULL,
    `measuring_unit` VARCHAR(50) NULL,
    `quantity` INTEGER NULL,
    `low_limit` INTEGER NULL,
    `recent_purchase` DATETIME(3) NULL,
    `unit_price` INTEGER NULL,
    `Status` BOOLEAN NULL,
    `category_id` INTEGER NULL,
    `item_category_id` INTEGER NULL,

    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itemsOnFeatures` (
    `item_id` INTEGER NOT NULL,
    `feature_id` INTEGER NOT NULL,
    `value` VARCHAR(191) NULL,

    PRIMARY KEY (`item_id`, `feature_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `request` (
    `request_id` INTEGER NOT NULL AUTO_INCREMENT,
    `request_item_name` VARCHAR(191) NOT NULL,
    `request_quantity` INTEGER NOT NULL,
    `purpose` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `request_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL,
    `isReturned` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`request_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `category_category_name_key`(`category_name`),
    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itemCategory` (
    `item_category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_category_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `itemCategory_item_category_name_key`(`item_category_name`),
    PRIMARY KEY (`item_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `notification_id` INTEGER NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(191) NOT NULL,
    `state` BOOLEAN NOT NULL DEFAULT false,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`notification_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bills` ADD CONSTRAINT `bills_vendor_ID_fkey` FOREIGN KEY (`vendor_ID`) REFERENCES `vendors`(`vendor_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bills` ADD CONSTRAINT `bills_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category`(`category_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_item_category_id_fkey` FOREIGN KEY (`item_category_id`) REFERENCES `itemCategory`(`item_category_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itemsOnFeatures` ADD CONSTRAINT `itemsOnFeatures_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itemsOnFeatures` ADD CONSTRAINT `itemsOnFeatures_feature_id_fkey` FOREIGN KEY (`feature_id`) REFERENCES `feature`(`feature_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request` ADD CONSTRAINT `request_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request` ADD CONSTRAINT `request_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
