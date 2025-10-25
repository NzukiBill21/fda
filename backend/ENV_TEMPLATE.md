# Environment Variables Template

Create a `.env` file in the backend directory with these variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/food_delivery_db"
REDIS_URL="redis://localhost:6379"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# M-Pesa (Daraja API - Kenya)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_SHORTCODE=your_business_shortcode
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback

# Africa's Talking (SMS)
AFRICASTALKING_API_KEY=your_africastalking_api_key
AFRICASTALKING_USERNAME=your_username

# Unsplash API
UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# Google Maps (Optional - for advanced geolocation)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Admin
ADMIN_EMAIL=admin@fooddelivery.com
ADMIN_PASSWORD=secure_admin_password
```

