<?php
/**
 * Database Service
 * Replicates Node.js db.service.ts logic
 */

require_once __DIR__ . '/../config/database.php';

class DatabaseService {
    
    /**
     * Get all menu items
     * Replicates getMenuItems() logic
     */
    public static function getMenuItems() {
        $sql = "SELECT * FROM menu_items ORDER BY createdAt DESC";
        return Database::queryAll($sql);
    }
    
    /**
     * Get menu item by ID
     */
    public static function getMenuItemById($id) {
        $sql = "SELECT * FROM menu_items WHERE id = ? LIMIT 1";
        return Database::queryOne($sql, [$id]);
    }
    
    /**
     * Create order
     * Replicates createOrder() logic with all validations
     */
    public static function createOrder($orderData) {
        $conn = Database::getConnection();
        $conn->beginTransaction();
        
        try {
            // Generate order number
            $orderNumber = 'ORD-' . time();
            $orderId = $orderData['id'] ?? bin2hex(random_bytes(16));
            
            // Validate required fields
            if (empty($orderData['userId']) || empty($orderData['deliveryAddress']) || 
                empty($orderData['customerName']) || empty($orderData['customerPhone'])) {
                throw new Exception('Missing required order fields');
            }
            
            // Insert order
            $sql = "INSERT INTO orders (id, orderNumber, userId, deliveryAddress, customerName, 
                    customerPhone, total, status, paymentMethod, deliveryNotes, createdAt, updatedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            
            Database::query($sql, [
                $orderId,
                $orderNumber,
                $orderData['userId'],
                $orderData['deliveryAddress'],
                $orderData['customerName'],
                $orderData['customerPhone'],
                $orderData['total'] ?? 0,
                $orderData['status'] ?? 'PENDING',
                $orderData['paymentMethod'] ?? 'CASH',
                $orderData['deliveryNotes'] ?? null
            ]);
            
            // Insert order items
            if (!empty($orderData['items'])) {
                foreach ($orderData['items'] as $item) {
                    $itemId = bin2hex(random_bytes(16));
                    $sql = "INSERT INTO order_items (id, orderId, menuItemId, quantity, price, createdAt)
                            VALUES (?, ?, ?, ?, ?, NOW())";
                    
                    Database::query($sql, [
                        $itemId,
                        $orderId,
                        $item['menuItemId'],
                        $item['quantity'],
                        $item['price']
                    ]);
                }
            }
            
            $conn->commit();
            
            // Fetch created order with items
            return self::getOrderById($orderId);
            
        } catch (Exception $e) {
            $conn->rollBack();
            throw $e;
        }
    }
    
    /**
     * Get order by ID
     */
    public static function getOrderById($id) {
        $sql = "SELECT o.*, 
                u.name as userName, u.email as userEmail, u.phone as userPhone
                FROM orders o
                LEFT JOIN users u ON o.userId = u.id
                WHERE o.id = ? LIMIT 1";
        
        $order = Database::queryOne($sql, [$id]);
        
        if ($order) {
            // Get order items
            $itemsSql = "SELECT oi.*, mi.name as menuItemName, mi.price as menuItemPrice, mi.image as menuItemImage
                        FROM order_items oi
                        LEFT JOIN menu_items mi ON oi.menuItemId = mi.id
                        WHERE oi.orderId = ?";
            
            $order['items'] = Database::queryAll($itemsSql, [$id]);
            
            // Get tracking history
            $order['trackingHistory'] = self::getOrderTracking($id);
        }
        
        return $order;
    }
    
    /**
     * Get order by order number
     */
    public static function getOrderByNumber($orderNumber) {
        $sql = "SELECT * FROM orders WHERE orderNumber = ? LIMIT 1";
        $order = Database::queryOne($sql, [$orderNumber]);
        
        if ($order) {
            return self::getOrderById($order['id']);
        }
        
        return null;
    }
    
    /**
     * Get order tracking history
     */
    public static function getOrderTracking($orderId) {
        $sql = "SELECT * FROM order_tracking WHERE orderId = ? ORDER BY timestamp DESC";
        return Database::queryAll($sql, [$orderId]);
    }
    
    /**
     * Get user by email
     */
    public static function getUserByEmail($email) {
        $sql = "SELECT u.*, GROUP_CONCAT(r.name) as roles
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.userId
                LEFT JOIN roles r ON ur.roleId = r.id
                WHERE u.email = ?
                GROUP BY u.id";
        
        $user = Database::queryOne($sql, [$email]);
        
        if ($user && $user['roles']) {
            $user['roles'] = explode(',', $user['roles']);
        } else {
            $user['roles'] = [];
        }
        
        return $user;
    }
    
    /**
     * Get all orders for admin
     */
    public static function getAdminOrders($page = 1, $limit = 20) {
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT o.*, u.name as userName, u.email as userEmail
                FROM orders o
                LEFT JOIN users u ON o.userId = u.id
                ORDER BY o.createdAt DESC
                LIMIT ? OFFSET ?";
        
        return Database::queryAll($sql, [$limit, $offset]);
    }
}


