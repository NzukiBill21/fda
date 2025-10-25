# 🚀 Food Delivery Backend - Advanced ML-Powered System

A comprehensive, production-ready backend system for the Food Delivery App with advanced Machine Learning capabilities, real-time tracking, and seamless payment integration.

## 🎯 Features

### Core Features
- ✅ **RESTful API** with Express.js & TypeScript
- ✅ **PostgreSQL Database** with Prisma ORM
- ✅ **JWT Authentication** & Role-Based Authorization
- ✅ **Redis Caching** for optimal performance
- ✅ **Real-time Order Tracking** with Socket.IO
- ✅ **M-Pesa Payment Integration** (Daraja API)
- ✅ **SMS Notifications** (Africa's Talking)

### Advanced ML & AI Features
- 🤖 **Collaborative Filtering** - User-based recommendations
- 🔍 **NLP Search** - Natural Language Processing for intelligent search
- 📊 **Demand Forecasting** - Predict future demand using time series
- 📈 **Inventory Optimization** - AI-powered stock management
- 🎯 **Customer Segmentation** - Behavioral analysis
- 🔥 **Peak Hours Analysis** - Optimize operations

### Security & Performance
- 🔒 Rate limiting
- 🛡️ Helmet.js security headers
- 📝 Comprehensive logging with Winston
- ⚡ Redis caching layer
- 🗜️ Response compression

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Redis configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication, validation, error handling
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   │   ├── ml/         # Machine Learning services
│   │   ├── payment/    # Payment integration
│   │   └── notification/ # SMS services
│   ├── utils/          # Utilities (logger, helpers)
│   └── server.ts       # Application entry point
├── prisma/
│   └── schema.prisma   # Database schema
├── logs/               # Application logs
└── package.json
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Setup Steps

1. **Clone and navigate to backend**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file based on `ENV_TEMPLATE.md`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/food_delivery_db"
REDIS_URL="redis://localhost:6379"
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
AFRICASTALKING_API_KEY=your_key
UNSPLASH_ACCESS_KEY=your_key
```

4. **Set up database**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run seed
```

5. **Start Redis**
```bash
redis-server
```

6. **Run the server**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
```
POST   /api/v1/auth/register    - Register new user
POST   /api/v1/auth/login       - Login user
POST   /api/v1/auth/logout      - Logout user
```

### Menu
```
GET    /api/v1/menu             - Get all menu items (with filters)
GET    /api/v1/menu/:id         - Get item by ID
GET    /api/v1/menu/categories  - Get all categories
GET    /api/v1/menu/popular     - Get popular items
GET    /api/v1/menu/search      - Intelligent NLP search
GET    /api/v1/menu/autocomplete - Autocomplete suggestions
POST   /api/v1/menu/:id/favorite - Toggle favorite (protected)
GET    /api/v1/menu/recommendations/personalized - ML recommendations (protected)
```

### Cart
```
GET    /api/v1/cart             - Get user's cart
POST   /api/v1/cart/items       - Add item to cart
PATCH  /api/v1/cart/items/:id   - Update item quantity
DELETE /api/v1/cart/items/:id   - Remove item
DELETE /api/v1/cart             - Clear cart
GET    /api/v1/cart/recommendations - Get cart-based recommendations
```

### Orders
```
POST   /api/v1/orders           - Create new order
GET    /api/v1/orders           - Get user's orders
GET    /api/v1/orders/:id       - Get order by ID
PATCH  /api/v1/orders/:id/cancel - Cancel order
PATCH  /api/v1/orders/:id/status - Update order status (admin/driver)
```

### Payments
```
POST   /api/v1/payments/mpesa/initiate  - Initiate M-Pesa payment
POST   /api/v1/payments/mpesa/callback  - M-Pesa callback (public)
GET    /api/v1/payments/mpesa/status/:id - Query payment status
```

### Users
```
GET    /api/v1/users/profile     - Get user profile
PATCH  /api/v1/users/profile     - Update profile
GET    /api/v1/users/addresses   - Get addresses
POST   /api/v1/users/addresses   - Add address
PATCH  /api/v1/users/addresses/:id - Update address
DELETE /api/v1/users/addresses/:id - Delete address
GET    /api/v1/users/favorites   - Get favorites
GET    /api/v1/users/reviews     - Get reviews
POST   /api/v1/users/reviews     - Add review
```

### Analytics (Admin only)
```
GET    /api/v1/analytics/dashboard  - Get dashboard analytics
GET    /api/v1/analytics/forecast/:itemId - Get demand forecast
GET    /api/v1/analytics/inventory/optimize - Inventory optimization
GET    /api/v1/analytics/peak-hours - Peak hours analysis
GET    /api/v1/analytics/customers/segments - Customer segmentation
GET    /api/v1/analytics/sales/trends - Sales trends
```

## 🧠 Machine Learning Features

### 1. Recommendation System
Uses collaborative filtering and content-based filtering:
- Analyzes user order history
- Finds similar users
- Recommends items based on preferences
- Real-time cart-based suggestions

### 2. NLP Search
Natural Language Processing for intelligent search:
- Tokenization and stemming
- TF-IDF scoring
- Intent extraction
- Autocomplete suggestions

### 3. Demand Forecasting
Predicts future demand using:
- Time series analysis
- Moving averages
- Historical order patterns

### 4. Customer Segmentation
Segments customers into:
- VIP (20+ orders)
- Regular (10+ orders)
- Occasional (3+ orders)
- New (< 3 orders)

## 🔌 Real-time Features

### Socket.IO Events
```javascript
// Client connects
socket.emit('join_order', orderId);

// Receive updates
socket.on('order_update', (data) => {
  // { orderId, status, location, estimatedTime }
});

// Disconnect
socket.emit('leave_order', orderId);
```

## 💳 Payment Integration

### M-Pesa (Safaricom Daraja API)
1. **Initiate Payment**: Send STK push to customer's phone
2. **Customer Pays**: Customer enters M-Pesa PIN
3. **Callback**: Safaricom sends callback to your server
4. **Confirmation**: Order status updated, SMS sent

### Flow
```
Client → POST /api/v1/payments/mpesa/initiate
       → STK Push sent to phone
       → Customer pays
       → Callback received
       → Order confirmed
       → SMS notification sent
```

## 📱 SMS Notifications

Automated SMS using Africa's Talking:
- Order confirmation
- Payment confirmation
- Order status updates
- Delivery ETA updates
- Promotional messages

## 🗄️ Database Schema

Key models:
- **User** - Customer accounts
- **MenuItem** - Food items with ML features
- **Order** - Order tracking
- **OrderItem** - Order details
- **CartItem** - Shopping cart
- **Address** - Delivery addresses
- **Review** - Customer reviews
- **Favorite** - User favorites
- **UserInteraction** - ML training data
- **Analytics** - Daily snapshots

## 🔐 Security

- JWT authentication
- Bcrypt password hashing
- Rate limiting (auth, orders, general)
- Helmet.js security headers
- Input validation
- CORS protection
- SQL injection prevention (Prisma)

## 📊 Performance

- Redis caching (5-30 min TTL)
- Database query optimization
- Response compression
- Connection pooling
- Efficient indexing

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Logging

Winston logger with:
- Console output (development)
- File logging (combined.log, error.log)
- Log rotation (5MB max, 5 files)
- Structured JSON logs

## 🚀 Deployment

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure production DATABASE_URL
- [ ] Set up Redis (Redis Cloud, AWS ElastiCache)
- [ ] Configure M-Pesa production credentials
- [ ] Set up SSL/TLS
- [ ] Configure environment variables
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

### Deployment Platforms
- **AWS**: EC2, RDS (PostgreSQL), ElastiCache (Redis)
- **Heroku**: Easy deployment with add-ons
- **DigitalOcean**: App Platform, Managed Databases
- **Railway**: Simple deployment

## 🤝 API Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

## 🛣️ Roadmap

- [ ] Unit & Integration tests
- [ ] API documentation (Swagger/OpenAPI)
- [ ] WebSocket authentication
- [ ] Email notifications
- [ ] Advanced ML models (Deep Learning)
- [ ] A/B testing framework
- [ ] Multi-language support
- [ ] GraphQL API option

## 📄 License

MIT License

## 👨‍💻 Support

For issues or questions:
- Create an issue in the repository
- Email: support@fooddelivery.com

---

**Built with ❤️ using Node.js, TypeScript, PostgreSQL, and AI**

