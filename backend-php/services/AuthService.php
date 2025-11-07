<?php
/**
 * Authentication Service
 * Handles user authentication, registration, and token management
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/JWT.php';

class AuthService {
    private $db;
    private $jwt;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->jwt = new JWT();
    }
    
    public function login($email, $password) {
        // Find user with roles
        $stmt = $this->db->prepare("
            SELECT u.*, 
                   GROUP_CONCAT(r.name) as roles
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.userId
            LEFT JOIN roles r ON ur.roleId = r.id
            WHERE u.email = ?
            GROUP BY u.id
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            throw new Exception('Invalid credentials');
        }
        
        // Check if account is locked
        if ($user['lockedUntil'] && strtotime($user['lockedUntil']) > time()) {
            $minutesLeft = ceil((strtotime($user['lockedUntil']) - time()) / 60);
            throw new Exception("Account locked. Try again in {$minutesLeft} minutes");
        }
        
        // Verify password
        if (!password_verify($password, $user['password'])) {
            // Increment login attempts
            $loginAttempts = $user['loginAttempts'] + 1;
            $updates = ['loginAttempts' => $loginAttempts];
            
            // Lock account after 5 failed attempts
            if ($loginAttempts >= 5) {
                $updates['lockedUntil'] = date('Y-m-d H:i:s', time() + (15 * 60)); // 15 minutes
            }
            
            $updateStmt = $this->db->prepare("
                UPDATE users 
                SET loginAttempts = ?, lockedUntil = ?
                WHERE id = ?
            ");
            $updateStmt->execute([
                $updates['loginAttempts'],
                $updates['lockedUntil'] ?? null,
                $user['id']
            ]);
            
            throw new Exception('Invalid credentials');
        }
        
        // Reset login attempts on successful login
        $resetStmt = $this->db->prepare("
            UPDATE users 
            SET loginAttempts = 0, lockedUntil = NULL, lastLogin = NOW()
            WHERE id = ?
        ");
        $resetStmt->execute([$user['id']]);
        
        // Get user roles
        $roles = $user['roles'] ? explode(',', $user['roles']) : [];
        
        // Generate JWT token
        $token = $this->jwt->encode([
            'userId' => $user['id'],
            'email' => $user['email'],
            'roles' => $roles
        ]);
        
        // Log activity
        $this->logActivity($user['id'], 'LOGIN', 'AUTH', 'User logged in successfully');
        
        return [
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'phone' => $user['phone'],
                'roles' => $roles,
                'mustChangePassword' => (bool)$user['mustChangePassword']
            ]
        ];
    }
    
    public function register($data) {
        // Check if user already exists
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            throw new Exception('Email already registered');
        }
        
        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Generate UUID
        $userId = $this->generateUUID();
        
        // Create user
        $stmt = $this->db->prepare("
            INSERT INTO users (id, email, password, name, phone)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $userId,
            $data['email'],
            $hashedPassword,
            $data['name'],
            $data['phone'] ?? null
        ]);
        
        // Assign USER role by default
        $roleStmt = $this->db->prepare("SELECT id FROM roles WHERE name = 'USER'");
        $roleStmt->execute();
        $role = $roleStmt->fetch();
        
        if ($role) {
            $userRoleStmt = $this->db->prepare("
                INSERT INTO user_roles (id, userId, roleId)
                VALUES (?, ?, ?)
            ");
            $userRoleStmt->execute([
                $this->generateUUID(),
                $userId,
                $role['id']
            ]);
        }
        
        // Log activity
        $this->logActivity($userId, 'REGISTER', 'AUTH', 'New user registered');
        
        // Auto-login
        return $this->login($data['email'], $data['password']);
    }
    
    public function verifyToken($token) {
        try {
            $decoded = $this->jwt->decode($token);
            
            // Check if user still exists and is active
            $stmt = $this->db->prepare("
                SELECT u.*, 
                       GROUP_CONCAT(r.name) as roles
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.userId
                LEFT JOIN roles r ON ur.roleId = r.id
                WHERE u.id = ? AND u.isActive = 1
                GROUP BY u.id
            ");
            $stmt->execute([$decoded['userId']]);
            $user = $stmt->fetch();
            
            if (!$user) {
                throw new Exception('Invalid token');
            }
            
            $roles = $user['roles'] ? explode(',', $user['roles']) : [];
            
            return [
                'userId' => $user['id'],
                'email' => $user['email'],
                'roles' => $roles
            ];
        } catch (Exception $e) {
            throw new Exception('Invalid token');
        }
    }
    
    public function getUserById($userId) {
        $stmt = $this->db->prepare("
            SELECT u.*, 
                   GROUP_CONCAT(r.name) as roles,
                   dgp.status as deliveryStatus,
                   dgp.latitude,
                   dgp.longitude,
                   dgp.totalDeliveries,
                   dgp.successfulDeliveries,
                   dgp.averageRating,
                   dgp.totalEarnings,
                   dgp.isAvailable as deliveryIsAvailable
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.userId
            LEFT JOIN roles r ON ur.roleId = r.id
            LEFT JOIN delivery_guy_profiles dgp ON u.id = dgp.userId
            WHERE u.id = ?
            GROUP BY u.id
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            throw new Exception('User not found');
        }
        
        $roles = $user['roles'] ? explode(',', $user['roles']) : [];
        
        return [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'phone' => $user['phone'],
            'createdAt' => $user['createdAt'],
            'lastLogin' => $user['lastLogin'],
            'deliveryProfile' => $user['deliveryStatus'] ? [
                'status' => $user['deliveryStatus'],
                'latitude' => $user['latitude'],
                'longitude' => $user['longitude'],
                'totalDeliveries' => $user['totalDeliveries'],
                'successfulDeliveries' => $user['successfulDeliveries'],
                'averageRating' => $user['averageRating'],
                'totalEarnings' => $user['totalEarnings'],
                'isAvailable' => (bool)$user['deliveryIsAvailable']
            ] : null,
            'roles' => $roles,
            'mustChangePassword' => (bool)$user['mustChangePassword']
        ];
    }
    
    private function logActivity($userId, $action, $entity, $details) {
        $stmt = $this->db->prepare("
            INSERT INTO activity_logs (id, userId, action, entity, details, ipAddress, userAgent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $this->generateUUID(),
            $userId,
            $action,
            $entity,
            $details,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
    }
    
    public function generateUUID() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}

