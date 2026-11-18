-- DropForeignKey
ALTER TABLE `PasswordResetOtp` DROP FOREIGN KEY `PasswordResetOtp_userId_fkey`;

-- DropIndex
DROP INDEX `PasswordResetOtp_userId_key` ON `PasswordResetOtp`;

-- AlterTable: backfill existing rows with PASSWORD_RESET, then drop the temporary default
ALTER TABLE `PasswordResetOtp` ADD COLUMN `purpose` ENUM('PASSWORD_RESET') NOT NULL DEFAULT 'PASSWORD_RESET',
    ADD COLUMN `resetTokenExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `resetTokenHash` CHAR(64) NULL,
    ADD COLUMN `usedAt` DATETIME(3) NULL,
    ADD COLUMN `verifiedAt` DATETIME(3) NULL;

ALTER TABLE `PasswordResetOtp` ALTER COLUMN `purpose` DROP DEFAULT;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `authVersion` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `PasswordResetOtp_userId_idx` ON `PasswordResetOtp`(`userId`);

-- CreateIndex
CREATE INDEX `PasswordResetOtp_userId_purpose_createdAt_idx` ON `PasswordResetOtp`(`userId`, `purpose`, `createdAt`);

-- AddForeignKey
ALTER TABLE `PasswordResetOtp` ADD CONSTRAINT `PasswordResetOtp_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
