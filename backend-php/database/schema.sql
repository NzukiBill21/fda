-- MySQL Database Schema for Monda Food Delivery App
-- Converted from Prisma Schema

SET FOREIGN_KEY_CHECKS = 0;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `isActive` BOOLEAN DEFAULT TRUE,
  `loginAttempts` INT DEFAULT 0,
  `lockedUntil` DATETIME NULL,
  `lastLogin` DATETIME NULL,
  `mustChangePassword` BOOLEAN DEFAULT FALSE,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_isActive` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles Table
CREATE TABLE IF NOT EXISTS `roles` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(50) UNIQUE NOT NULL,
  `description` TEXT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Roles Junction Table
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` VARCHAR(36) PRIMARY KEY,
  `userId` VARCHAR(36) NOT NULL,
  `roleId` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_role` (`userId`, `roleId`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_roleId` (`roleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Delivery Guy Profiles Table
CREATE TABLE IF NOT EXISTS `delivery_guy_profiles` (
  `id` VARCHAR(36) PRIMARY KEY,
  `userId` VARCHAR(36) UNIQUE NOT NULL,
  `status` VARCHAR(20) DEFAULT 'offline',
  `avatarUrl` VARCHAR(500) NULL,
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `totalDeliveries` INT DEFAULT 0,
  `successfulDeliveries` INT DEFAULT 0,
  `averageRating` DECIMAL(3, 2) NULL,
  `totalEarnings` DECIMAL(10, 2) DEFAULT 0,
  `isAvailable` BOOLEAN DEFAULT TRUE,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu Items Table
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `image` TEXT NULL,
  `rating` DECIMAL(3, 2) NULL,
  `isPopular` BOOLEAN DEFAULT FALSE,
  `isSpicy` BOOLEAN DEFAULT FALSE,
  `isVegetarian` BOOLEAN DEFAULT FALSE,
  `isAvailable` BOOLEAN DEFAULT TRUE,
  `isFeatured` BOOLEAN DEFAULT FALSE,
  `stock` INT DEFAULT 0,
  `prepTime` INT DEFAULT 15,
  `nutrition` TEXT NULL,
  `allergens` TEXT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_isAvailable` (`isAvailable`),
  INDEX `idx_isPopular` (`isPopular`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(36) PRIMARY KEY,
  `orderNumber` VARCHAR(50) UNIQUE NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `deliveryGuyId` VARCHAR(36) NULL,
  `status` VARCHAR(50) DEFAULT 'PENDING',
  `total` DECIMAL(10, 2) NOT NULL,
  `paymentMethod` VARCHAR(20) DEFAULT 'CASH',
  `deliveryAddress` TEXT NOT NULL,
  `deliveryNotes` TEXT NULL,
  `customerName` VARCHAR(255) NOT NULL,
  `customerPhone` VARCHAR(50) NOT NULL,
  `deliveryLatitude` DECIMAL(10, 8) NULL,
  `deliveryLongitude` DECIMAL(11, 8) NULL,
  `estimatedDeliveryTime` INT NULL,
  `actualDeliveryTime` DATETIME NULL,
  `confirmedAt` DATETIME NULL,
  `preparingAt` DATETIME NULL,
  `readyAt` DATETIME NULL,
  `pickedUpAt` DATETIME NULL,
  `deliveredAt` DATETIME NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
  FOREIGN KEY (`deliveryGuyId`) REFERENCES `users`(`id`),
  INDEX `idx_userId` (`userId`),
  INDEX `idx_deliveryGuyId` (`deliveryGuyId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_orderNumber` (`orderNumber`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` VARCHAR(36) PRIMARY KEY,
  `orderId` VARCHAR(36) NOT NULL,
  `menuItemId` VARCHAR(36) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`menuItemId`) REFERENCES `menu_items`(`id`),
  INDEX `idx_orderId` (`orderId`),
  INDEX `idx_menuItemId` (`menuItemId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Tracking Table
CREATE TABLE IF NOT EXISTS `order_tracking` (
  `id` VARCHAR(36) PRIMARY KEY,
  `orderId` VARCHAR(36) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `notes` TEXT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX `idx_orderId` (`orderId`),
  INDEX `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` VARCHAR(36) PRIMARY KEY,
  `userId` VARCHAR(36) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity` VARCHAR(100) NULL,
  `details` TEXT NULL,
  `ipAddress` VARCHAR(50) NULL,
  `userAgent` TEXT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_action` (`action`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Insert default roles
INSERT IGNORE INTO `roles` (`id`, `name`, `description`) VALUES
(UUID(), 'SUPER_ADMIN', 'Super Administrator with full system access'),
(UUID(), 'ADMIN', 'Administrator with management access'),
(UUID(), 'SUB_ADMIN', 'Sub Administrator with limited access'),
(UUID(), 'USER', 'Regular user'),
(UUID(), 'DELIVERY_GUY', 'Delivery personnel'),
(UUID(), 'CATERER', 'Kitchen staff');

