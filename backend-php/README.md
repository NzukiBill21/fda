# Monda Food Delivery - PHP Backend

This is the PHP/MySQL backend for the Monda Food Delivery application, converted from the Node.js/Express/Prisma backend.

## Features

- **Authentication & Authorization**: JWT-based authentication with RBAC (Role-Based Access Control)
- **Menu Management**: CRUD operations for menu items
- **Order Management**: Complete order lifecycle management
- **Delivery Management**: Delivery guy assignments and tracking
- **Admin Dashboard**: Comprehensive admin features
- **Security**: Account locking, login attempt limiting, forced password changes

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx with mod_rewrite enabled
- PDO MySQL extension

## Installation

1. **Clone the repository** (if not already done)

2. **Create MySQL database**:
   ```sql
   CREATE DATABASE monda_food_delivery;
   ```

3. **Import database schema**:
   ```bash
   mysql -u root -p monda_food_delivery < database/schema.sql
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and JWT secret.

5. **Set up web server**:
   - Point your web server document root to the `backend-php` directory
   - Ensure `.htaccess` is enabled (for Apache)
   - For Nginx, configure URL rewriting to route all requests to `index.php`

6. **Set permissions**:
   ```bash
   chmod 755 logs/
   chmod 644 .htaccess
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get menu item by ID

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/:userId/promote` - Promote user
- `POST /api/admin/users/:userId/demote` - Demote user
- `POST /api/admin/users/:userId/activate` - Activate user
- `POST /api/admin/users/:userId/deactivate` - Deactivate user
- `DELETE /api/admin/users/:userId` - Delete user
- `POST /api/admin/menu` - Create menu item
- `PUT /api/admin/menu/:id` - Update menu item
- `DELETE /api/admin/menu/:id` - Delete menu item
- `GET /api/admin/categories` - Get categories
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `PUT /api/admin/orders/:id/assign` - Assign order to delivery guy
- `GET /api/admin/orders/stats` - Get order statistics

### Delivery
- `GET /api/delivery/assignments` - Get delivery assignments
- `GET /api/delivery/earnings` - Get delivery earnings
- `GET /api/delivery/performance` - Get delivery performance
- `POST /api/delivery/status` - Update delivery status
- `POST /api/delivery/accept/:orderId` - Accept order
- `POST /api/delivery/complete/:orderId` - Complete delivery
- `GET /api/delivery/profile` - Get delivery profile
- `PUT /api/delivery/profile` - Update delivery profile
- `GET /api/delivery/orders` - Get delivery orders
- `PUT /api/delivery/orders/:id/location` - Update delivery location

### Caterer
- `GET /api/caterer/orders` - Get caterer orders
- `PUT /api/caterer/orders/:id/status` - Update order status

## Database Schema

The database schema includes:
- `users` - User accounts
- `roles` - User roles (SUPER_ADMIN, ADMIN, USER, DELIVERY_GUY, CATERER)
- `user_roles` - User-role relationships
- `menu_items` - Menu items
- `orders` - Orders
- `order_items` - Order line items
- `order_tracking` - Order tracking history
- `delivery_guy_profiles` - Delivery guy profiles
- `activity_logs` - Activity logs

## Security

- JWT tokens expire after 7 days
- Account locking after 5 failed login attempts (15 minutes)
- Forced password change for new admins
- CORS protection
- SQL injection protection via prepared statements
- XSS protection headers

## Deployment

1. Upload all files to your web server
2. Configure database connection in `.env`
3. Import database schema
4. Set proper file permissions
5. Configure web server (Apache/Nginx)
6. Update frontend API URL to point to PHP backend

## Notes

- All endpoints return JSON responses
- Authentication is required for most endpoints (except `/api/menu`, `/api/orders`)
- Admin endpoints require SUPER_ADMIN or ADMIN role
- Delivery endpoints require DELIVERY_GUY role
- Caterer endpoints require CATERER, ADMIN, or SUPER_ADMIN role

## Troubleshooting

- **500 Internal Server Error**: Check PHP error logs, database connection, and file permissions
- **404 Not Found**: Ensure `.htaccess` is enabled and URL rewriting is configured
- **Database Connection Error**: Verify database credentials in `.env`
- **JWT Token Error**: Ensure JWT_SECRET is set in `.env`

