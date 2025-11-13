<?php
$user = verifyToken();
$userId = $user['id'];

$sql = "SELECT u.*, GROUP_CONCAT(r.name) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.userId
        LEFT JOIN roles r ON ur.roleId = r.id
        WHERE u.id = ?
        GROUP BY u.id";
$userData = Database::queryOne($sql, [$userId]);

if ($userData && $userData['roles']) {
    $userData['roles'] = explode(',', $userData['roles']);
} else {
    $userData['roles'] = [];
}

echo json_encode(['user' => $userData]);


