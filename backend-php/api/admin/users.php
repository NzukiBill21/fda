<?php
requireRole(['ADMIN', 'SUPER_ADMIN']);

$sql = "SELECT u.id, u.email, u.name, u.isActive, GROUP_CONCAT(r.name) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.userId
        LEFT JOIN roles r ON ur.roleId = r.id
        GROUP BY u.id
        ORDER BY u.createdAt DESC";

$users = Database::queryAll($sql);

// Normalize roles - same as Node.js
foreach ($users as &$user) {
    if ($user['roles']) {
        $roles = explode(',', $user['roles']);
        // Get highest priority role
        $priority = ['SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN', 'DELIVERY_GUY', 'USER'];
        $user['role'] = 'USER';
        foreach ($priority as $role) {
            if (in_array($role, $roles)) {
                $user['role'] = $role;
                break;
            }
        }
    } else {
        $user['role'] = 'USER';
    }
    $user['isActive'] = (bool)$user['isActive'];
}

echo json_encode(['success' => true, 'users' => $users]);


