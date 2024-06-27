/*
  Warnings:

  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `products`;

-- CreateTable
CREATE TABLE `bills` (
    `bill_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `entry_date` DATE NULL,
    `bill_no` VARCHAR(255) NULL,
    `bill_amount` FLOAT NULL,
    `TDS` FLOAT NULL,
    `bill_date` DATE NULL,
    `vendor_ID` INTEGER NULL,
    `invoice_no` VARCHAR(255) NULL,
    `actual_amount` FLOAT NULL,
    `paid_amount` FLOAT NULL,
    `left_amount` FLOAT NULL,

    INDEX `vendor_ID`(`vendor_ID`),
    PRIMARY KEY (`bill_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_name` VARCHAR(255) NULL,
    `measuring_unit` VARCHAR(50) NULL,
    `total_purchased` INTEGER NULL,
    `item_category` VARCHAR(255) NULL,
    `category` VARCHAR(255) NULL,
    `quantity` INTEGER NULL,
    `low_limit` INTEGER NULL,

    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(95) NOT NULL,
    `user_email` VARCHAR(65) NOT NULL,
    `password` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendors` (
    `vendor_id` INTEGER NOT NULL,
    `vendor_name` VARCHAR(255) NULL,
    `vat_number` VARCHAR(255) NULL,
    `total_payment` FLOAT NULL,
    `pending_payment` FLOAT NULL,
    `last_purchase_date` DATE NULL,
    `last_paid` DATE NULL,
    `payment_duration` INTEGER NULL,
    `next_payment_date` DATE NULL,

    PRIMARY KEY (`vendor_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bills` ADD CONSTRAINT `bills_ibfk_1` FOREIGN KEY (`vendor_ID`) REFERENCES `vendors`(`vendor_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
