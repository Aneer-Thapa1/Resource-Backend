/*
  Warnings:

  - You are about to drop the `_conversationmessages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_participatedconversations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `conversationId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_conversationmessages` DROP FOREIGN KEY `_ConversationMessages_A_fkey`;

-- DropForeignKey
ALTER TABLE `_conversationmessages` DROP FOREIGN KEY `_ConversationMessages_B_fkey`;

-- DropForeignKey
ALTER TABLE `_participatedconversations` DROP FOREIGN KEY `_ParticipatedConversations_A_fkey`;

-- DropForeignKey
ALTER TABLE `_participatedconversations` DROP FOREIGN KEY `_ParticipatedConversations_B_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_receiverId_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_senderId_fkey`;

-- AlterTable
ALTER TABLE `message` ADD COLUMN `conversationId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `_conversationmessages`;

-- DropTable
DROP TABLE `_participatedconversations`;

-- CreateTable
CREATE TABLE `ConversationParticipant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversationId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ConversationParticipant` ADD CONSTRAINT `ConversationParticipant_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationParticipant` ADD CONSTRAINT `ConversationParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
