-- ============================================
-- Food Delivery App Database Schema
-- Converted from Prisma Schema to MySQL
-- ============================================
-- 
-- Instructions:
-- 1. Open phpMyAdmin: http://localhost/phpmyadmin
-- 2. Select your database (or create it first)
-- 3. Click on "SQL" tab
-- 4. Copy and paste this entire file
-- 5. Click "Go" to execute
--
-- Database Name: u614661615_mondas
-- ============================================

-- Create database if it doesn't exist (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS `u614661615_mondas` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `u614661615_mondas`;

-- ============================================
-- Table: User
-- ============================================
CREATE TABLE IF NOT EXISTS `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `loginAttempts` INT NOT NULL DEFAULT 0,
  `lockedUntil` DATETIME(3) NULL,
  `lastLogin` DATETIME(3) NULL,
  `mustChangePassword` BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: Role
-- ============================================
CREATE TABLE IF NOT EXISTS `Role` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Role_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: UserRole (Junction Table)
-- ============================================
CREATE TABLE IF NOT EXISTS `UserRole` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `roleId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UserRole_userId_roleId_key` (`userId`, `roleId`),
  KEY `UserRole_userId_idx` (`userId`),
  KEY `UserRole_roleId_idx` (`roleId`),
  CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: DeliveryGuyProfile
-- ============================================
CREATE TABLE IF NOT EXISTS `DeliveryGuyProfile` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'offline',
  `avatarUrl` VARCHAR(191) NULL,
  `latitude` DOUBLE NULL,
  `longitude` DOUBLE NULL,
  `totalDeliveries` INT NOT NULL DEFAULT 0,
  `successfulDeliveries` INT NOT NULL DEFAULT 0,
  `averageRating` DOUBLE NULL,
  `totalEarnings` DOUBLE NOT NULL DEFAULT 0,
  `isAvailable` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `DeliveryGuyProfile_userId_key` (`userId`),
  CONSTRAINT `DeliveryGuyProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: MenuItem
-- ============================================
CREATE TABLE IF NOT EXISTS `MenuItem` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `price` DOUBLE NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `image` VARCHAR(191) NULL,
  `rating` DOUBLE NULL,
  `isPopular` BOOLEAN NOT NULL DEFAULT false,
  `isSpicy` BOOLEAN NOT NULL DEFAULT false,
  `isVegetarian` BOOLEAN NOT NULL DEFAULT false,
  `isAvailable` BOOLEAN NOT NULL DEFAULT true,
  `isFeatured` BOOLEAN NOT NULL DEFAULT false,
  `stock` INT NOT NULL DEFAULT 0,
  `prepTime` INT NOT NULL DEFAULT 15,
  `nutrition` TEXT NULL,
  `allergens` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `MenuItem_category_idx` (`category`),
  KEY `MenuItem_isAvailable_idx` (`isAvailable`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: Order
-- ============================================
CREATE TABLE IF NOT EXISTS `Order` (
  `id` VARCHAR(191) NOT NULL,
  `orderNumber` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `deliveryGuyId` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `total` DOUBLE NOT NULL,
  `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'CASH',
  `deliveryAddress` VARCHAR(191) NOT NULL,
  `deliveryNotes` VARCHAR(191) NULL,
  `customerName` VARCHAR(191) NOT NULL,
  `customerPhone` VARCHAR(191) NOT NULL,
  `deliveryLatitude` DOUBLE NULL,
  `deliveryLongitude` DOUBLE NULL,
  `estimatedDeliveryTime` INT NULL,
  `actualDeliveryTime` DATETIME(3) NULL,
  `confirmedAt` DATETIME(3) NULL,
  `preparingAt` DATETIME(3) NULL,
  `readyAt` DATETIME(3) NULL,
  `pickedUpAt` DATETIME(3) NULL,
  `deliveredAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Order_orderNumber_key` (`orderNumber`),
  KEY `Order_userId_idx` (`userId`),
  KEY `Order_deliveryGuyId_idx` (`deliveryGuyId`),
  KEY `Order_status_idx` (`status`),
  CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Order_deliveryGuyId_fkey` FOREIGN KEY (`deliveryGuyId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: OrderItem
-- ============================================
CREATE TABLE IF NOT EXISTS `OrderItem` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `menuItemId` VARCHAR(191) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DOUBLE NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `OrderItem_orderId_idx` (`orderId`),
  KEY `OrderItem_menuItemId_idx` (`menuItemId`),
  CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `OrderItem_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `MenuItem` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: OrderTracking
-- ============================================
CREATE TABLE IF NOT EXISTS `OrderTracking` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL,
  `latitude` DOUBLE NULL,
  `longitude` DOUBLE NULL,
  `notes` VARCHAR(191) NULL,
  `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `OrderTracking_orderId_idx` (`orderId`),
  CONSTRAINT `OrderTracking_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: ActivityLog
-- ============================================
CREATE TABLE IF NOT EXISTS `ActivityLog` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `action` VARCHAR(191) NOT NULL,
  `entity` VARCHAR(191) NULL,
  `details` TEXT NULL,
  `ipAddress` VARCHAR(191) NULL,
  `userAgent` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ActivityLog_userId_idx` (`userId`),
  KEY `ActivityLog_createdAt_idx` (`createdAt`),
  CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Default Roles
-- ============================================
INSERT INTO `Role` (`id`, `name`, `description`, `createdAt`) VALUES
(UUID(), 'SUPER_ADMIN', 'Super Administrator with full system access', NOW()),
(UUID(), 'ADMIN', 'Administrator with management access', NOW()),
(UUID(), 'SUB_ADMIN', 'Sub-administrator with limited admin access', NOW()),
(UUID(), 'USER', 'Regular customer user', NOW()),
(UUID(), 'DELIVERY_GUY', 'Delivery personnel', NOW())
ON DUPLICATE KEY UPDATE `name` = `name`;

-- ============================================
-- Database Schema Created Successfully!
-- ============================================
-- 
-- Tables Created:
-- 1. User - User accounts and authentication
-- 2. Role - User roles (SUPER_ADMIN, ADMIN, etc.)
-- 3. UserRole - Many-to-many relationship between users and roles
-- 4. DeliveryGuyProfile - Delivery personnel profiles
-- 5. MenuItem - Food menu items
-- 6. Order - Customer orders
-- 7. OrderItem - Items in each order
-- 8. OrderTracking - Real-time order tracking history
-- 9. ActivityLog - System activity logs
--
-- Default Roles Inserted:
-- - SUPER_ADMIN
-- - ADMIN
-- - SUB_ADMIN
-- - USER
-- - DELIVERY_GUY
--
-- Next Steps:
-- 1. Update your .env file with database credentials
-- 2. Run: npx prisma generate
-- 3. Start your backend server
-- ============================================






