<?php
/**
 * Response Helper
 */

class Response {
    public static function json($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: ' . self::getOrigin());
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
        
        echo json_encode($data);
        exit;
    }
    
    public static function error($message, $statusCode = 400) {
        self::json(['error' => $message], $statusCode);
    }
    
    public static function success($data = [], $statusCode = 200) {
        self::json(['success' => true, ...$data], $statusCode);
    }
    
    private static function getOrigin() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedOrigins = CORS_ORIGINS;
        
        if (in_array($origin, $allowedOrigins)) {
            return $origin;
        }
        
        return $allowedOrigins[0] ?? '*';
    }
}

