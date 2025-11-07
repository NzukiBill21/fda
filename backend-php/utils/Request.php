<?php
/**
 * Request Helper
 */

class Request {
    public static function getBody() {
        $body = file_get_contents('php://input');
        return json_decode($body, true) ?? [];
    }
    
    public static function getAuthToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (strpos($authHeader, 'Bearer ') === 0) {
            return substr($authHeader, 7);
        }
        
        return null;
    }
    
    public static function getMethod() {
        return $_SERVER['REQUEST_METHOD'];
    }
    
    public static function getPath() {
        $path = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($path, PHP_URL_PATH);
        return rtrim($path, '/');
    }
    
    public static function getParam($name) {
        return $_GET[$name] ?? null;
    }
    
    public static function getRouteParam($route, $path) {
        $routeParts = explode('/', trim($route, '/'));
        $pathParts = explode('/', trim($path, '/'));
        
        if (count($routeParts) !== count($pathParts)) {
            return null;
        }
        
        $params = [];
        foreach ($routeParts as $index => $routePart) {
            if (strpos($routePart, ':') === 0) {
                $paramName = substr($routePart, 1);
                $params[$paramName] = $pathParts[$index] ?? null;
            } elseif ($routePart !== $pathParts[$index]) {
                return null;
            }
        }
        
        return $params;
    }
}

