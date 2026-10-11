ALTER TABLE `User`
ADD COLUMN `authVersion` INTEGER NOT NULL DEFAULT 0;

CREATE TABLE `PasswordResetOtp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `otpHash` CHAR(64) NOT NULL,
    `purpose` ENUM('PASSWORD_RESET') NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `verifiedAt` DATETIME(3) NULL,
    `usedAt` DATETIME(3) NULL,
    `resetTokenHash` CHAR(64) NULL,
    `resetTokenExpiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PasswordResetOtp_userId_idx`(`userId`),
    INDEX `PasswordResetOtp_expiresAt_idx`(`expiresAt`),
    INDEX `PasswordResetOtp_userId_purpose_createdAt_idx`(`userId`, `purpose`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PasswordResetOtp`
ADD CONSTRAINT `PasswordResetOtp_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;
