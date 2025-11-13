<?php
/**
 * JWT Token Handler
 * Replicates Node.js JWT logic
 */

class JWT {
    private static $secret;
    
    public static function init() {
        self::$secret = $_ENV['JWT_SECRET'] ?? 'your_super_secret_jwt_key_change_in_production';
    }
    
    public static function generate($payload) {
        self::init();
        
        $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload = base64_encode(json_encode($payload));
        $signature = base64_encode(hash_hmac('sha256', "$header.$payload", self::$secret, true));
        
        return "$header.$payload.$signature";
    }
    
    public static function verify($token) {
        self::init();
        
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        
        [$header, $payload, $signature] = $parts;
        
        $expectedSignature = base64_encode(hash_hmac('sha256', "$header.$payload", self::$secret, true));
        
        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }
        
        $decoded = json_decode(base64_decode($payload), true);
        
        // Check expiration if present
        if (isset($decoded['exp']) && $decoded['exp'] < time()) {
            return null;
        }
        
        return $decoded;
    }
}




