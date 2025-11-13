<?php
class Request {
    public static function getPath(): string {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($uri, PHP_URL_PATH);
        
        // Remove base path if in subdirectory
        if (strpos($path, '/Food-Delivery-App/backend-php') === 0) {
            $path = substr($path, strlen('/Food-Delivery-App/backend-php'));
        }
        
        return $path ?: '/';
    }
    
    public static function getMethod(): string {
        return $_SERVER['REQUEST_METHOD'] ?? 'GET';
    }
    
    public static function getBody(): array {
        $body = file_get_contents('php://input');
        return json_decode($body, true) ?? [];
    }
    
    public static function getHeaders(): array {
        return getallheaders() ?? [];
    }
}

