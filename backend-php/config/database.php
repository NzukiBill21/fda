<?php
/**
 * Database Configuration
 * Replicates Node.js db.ts logic
 */

class Database {
    private static $connection = null;
    
    public static function getConnection() {
        if (self::$connection === null) {
            $host = $_ENV['DB_HOST'] ?? 'localhost';
            $dbname = $_ENV['DB_NAME'] ?? 'u614661615_mondas';
            $username = $_ENV['DB_USER'] ?? 'root';
            $password = $_ENV['DB_PASS'] ?? '';
            
            try {
                self::$connection = new PDO(
                    "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                    $username,
                    $password,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false
                    ]
                );
            } catch (PDOException $e) {
                error_log("Database connection failed: " . $e->getMessage());
                throw new Exception("Database connection failed");
            }
        }
        
        return self::$connection;
    }
    
    public static function query($sql, $params = []) {
        $conn = self::getConnection();
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
    
    public static function queryOne($sql, $params = []) {
        $stmt = self::query($sql, $params);
        return $stmt->fetch();
    }
    
    public static function queryAll($sql, $params = []) {
        $stmt = self::query($sql, $params);
        return $stmt->fetchAll();
    }
    
    public static function testConnection() {
        try {
            self::getConnection();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}


