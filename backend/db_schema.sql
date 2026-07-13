-- Create E-Commerce Database Schema

CREATE DATABASE IF NOT EXISTS `ecommerce_db`;
USE `ecommerce_db`;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Shipping Addresses Table
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `street` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `zip` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10, 2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pre-seed Users
INSERT INTO `users` (`id`, `email`, `password`, `role`) VALUES
(1, 'admin@ecommerce.com', 'admin123', 'admin'),
(2, 'user@ecommerce.com', 'user123', 'user')
ON DUPLICATE KEY UPDATE `email` = `email`;

-- Pre-seed Products
INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `image_url`) VALUES
(1, 'Fiddle Leaf Fig', 'Premium indoor air purifying tree with glossy green leaves.', 45.00, 15, '/assets/fiddle.jpg'),
(2, 'Monstera Deliciosa', 'Stunning Swiss cheese plant featuring split heart-shaped leaves.', 32.50, 8, '/assets/Monstera Delociosa.jpg'),
(3, 'Snake Plant', 'Extremely resilient succulent ideal for low light and beginners.', 19.99, 25, '/assets/Snake Plant.jpg'),
(4, 'Golden Pothos', 'Lush trailing vine with beautiful heart-shaped green and yellow leaves.', 14.50, 12, '/assets/Golden Pothos.jpeg'),
(5, 'Echeveria Succulent', 'Beautiful rose-shaped succulent with soft dusty green leaves.', 8.99, 40, '/assets/Echeveria Succulent.jpg'),
(6, 'Boston Fern', 'Feathery light green fronds that thrive in humid environments.', 22.00, 10, '/assets/Boston Fern.jpg')
ON DUPLICATE KEY UPDATE `name` = `name`;
