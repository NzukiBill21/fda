<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Request.php';
require_once __DIR__ . '/../../services/AuthService.php';

try {
    $token = Request::getAuthToken();
    if (!$token) {
        Response::error('Authentication required', 401);
    }
    
    $authService = new AuthService();
    $decoded = $authService->verifyToken($token);
    
    if (!in_array('DELIVERY_GUY', $decoded['roles'])) {
        Response::error('Delivery guy access required', 403);
    }
    
    $body = Request::getBody();
    $db = Database::getInstance()->getConnection();
    
    // Update User fields (name, phone, etc.)
    if (isset($body['name']) || isset($body['phone'])) {
        $userUpdateFields = [];
        $userUpdateParams = [];
        
        if (isset($body['name'])) {
            $userUpdateFields[] = 'name = ?';
            $userUpdateParams[] = $body['name'];
        }
        if (isset($body['phone'])) {
            $userUpdateFields[] = 'phone = ?';
            $userUpdateParams[] = $body['phone'];
        }
        
        $userUpdateParams[] = $decoded['userId'];
        $userUpdateStmt = $db->prepare("UPDATE users SET " . implode(', ', $userUpdateFields) . " WHERE id = ?");
        $userUpdateStmt->execute($userUpdateParams);
    }
    
    // Update DeliveryGuyProfile fields
    $allowedFields = ['status', 'latitude', 'longitude', 'isAvailable'];
    $profileUpdateFields = [];
    $profileUpdateParams = [];
    
    foreach ($allowedFields as $field) {
        if (isset($body[$field])) {
            $profileUpdateFields[] = "{$field} = ?";
            $profileUpdateParams[] = $body[$field];
        }
    }
    
    if (!empty($profileUpdateFields)) {
        // Check if profile exists
        $checkStmt = $db->prepare("SELECT id FROM delivery_guy_profiles WHERE userId = ?");
        $checkStmt->execute([$decoded['userId']]);
        $existing = $checkStmt->fetch();
        
        if ($existing) {
            $profileUpdateParams[] = $decoded['userId'];
            $profileUpdateStmt = $db->prepare("UPDATE delivery_guy_profiles SET " . implode(', ', $profileUpdateFields) . ", updatedAt = NOW() WHERE userId = ?");
            $profileUpdateStmt->execute($profileUpdateParams);
        } else {
            $profileId = $authService->generateUUID();
            $profileUpdateParams[] = $profileId;
            $profileUpdateParams[] = $decoded['userId'];
            $profileInsertStmt = $db->prepare("INSERT INTO delivery_guy_profiles (id, userId, " . implode(', ', array_map(function($f) { return str_replace(' = ?', '', $f); }, $profileUpdateFields)) . ") VALUES (?, ?, " . str_repeat('?, ', count($profileUpdateFields) - 1) . "?)");
            $profileInsertStmt->execute($profileUpdateParams);
        }
    }
    
    // Fetch updated profile
    $profileStmt = $db->prepare("SELECT * FROM delivery_guy_profiles WHERE userId = ?");
    $profileStmt->execute([$decoded['userId']]);
    $profile = $profileStmt->fetch();
    
    Response::json(['success' => true, 'profile' => $profile]);
} catch (Exception $e) {
    error_log('Profile update error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

