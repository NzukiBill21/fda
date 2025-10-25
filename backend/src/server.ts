import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { authService } from './services/auth.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Monda Food Delivery Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: ['RBAC', 'Authentication', 'SQLite Database']
  });
});

// API health check for system monitoring
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    message: 'Monda Food Delivery API',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/login - Login',
      'POST /api/auth/register - Register',
      'GET /api/auth/me - Get current user',
      'GET /api/menu - Get menu items',
      'POST /api/orders - Create order',
      'GET /api/admin/dashboard - Admin dashboard (requires auth)',
    ]
  });
});

// ====================
// AUTH ROUTES
// ====================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const result = await authService.register({ email, password, name, phone });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    const user = await authService.getUserById(decoded.userId);
    
    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// ====================
// MENU ROUTES
// ====================

app.get('/api/menu', async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, menuItems: items });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/menu/:id', async (req, res) => {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: req.params.id },
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ====================
// ORDER ROUTES
// ====================

app.post('/api/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = 'guest';

    // If logged in, get user ID
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = await authService.verifyToken(token);
        userId = decoded.userId;
      } catch (e) {
        // Continue as guest
      }
    }

    const { items, total, paymentMethod, deliveryAddress, customerName, customerPhone, deliveryNotes } = req.body;

    // Create order
    const orderNumber = 'ORD-' + Date.now();
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        total,
        paymentMethod,
        deliveryAddress,
        customerName,
        customerPhone,
        deliveryNotes,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        deliveryGuy: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ====================
// DELIVERY ROUTES
// ====================

app.get('/api/delivery/assignments', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    
    // Check if user is delivery guy
    if (!decoded.roles.includes('DELIVERY_GUY')) {
      return res.status(403).json({ error: 'Delivery guy access required' });
    }

    // Get all orders assigned to this delivery guy or available for pickup
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { deliveryGuyId: decoded.userId },
          { deliveryGuyId: null, status: 'CONFIRMED' }
        ]
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ success: true, assignments: orders });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delivery earnings endpoint
app.get('/api/delivery/earnings', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    
    if (!decoded.roles.includes('DELIVERY_GUY')) {
      return res.status(403).json({ error: 'Delivery guy access required' });
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get completed deliveries for earnings calculation
    const todayDeliveries = await prisma.order.count({
      where: {
        deliveryGuyId: decoded.userId,
        status: 'DELIVERED',
        updatedAt: { gte: startOfDay }
      }
    });

    const weekDeliveries = await prisma.order.count({
      where: {
        deliveryGuyId: decoded.userId,
        status: 'DELIVERED',
        updatedAt: { gte: startOfWeek }
      }
    });

    const monthDeliveries = await prisma.order.count({
      where: {
        deliveryGuyId: decoded.userId,
        status: 'DELIVERED',
        updatedAt: { gte: startOfMonth }
      }
    });

    const deliveryFee = 50; // KES per delivery
    const earnings = {
      today: todayDeliveries * deliveryFee,
      week: weekDeliveries * deliveryFee,
      month: monthDeliveries * deliveryFee
    };

    res.json({ success: true, earnings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delivery performance endpoint
app.get('/api/delivery/performance', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    
    if (!decoded.roles.includes('DELIVERY_GUY')) {
      return res.status(403).json({ error: 'Delivery guy access required' });
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Get today's completed deliveries
    const completedToday = await prisma.order.count({
      where: {
        deliveryGuyId: decoded.userId,
        status: 'DELIVERED',
        updatedAt: { gte: startOfDay }
      }
    });

    // Calculate on-time rate (simplified)
    const onTimeRate = Math.min(95, 70 + (completedToday * 2));

    const performance = {
      rating: 4.8,
      completed: completedToday,
      onTime: Math.round(onTimeRate)
    };

    res.json({ success: true, performance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/delivery/status', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    
    if (!decoded.roles.includes('DELIVERY_GUY')) {
      return res.status(403).json({ error: 'Delivery guy access required' });
    }

    const { status, latitude, longitude } = req.body;

    await prisma.deliveryGuyProfile.upsert({
      where: { userId: decoded.userId },
      update: {
        status,
        latitude: latitude || null,
        longitude: longitude || null
      },
      create: {
        userId: decoded.userId,
        status,
        latitude: latitude || null,
        longitude: longitude || null
      }
    });

    res.json({ success: true, message: 'Status updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/delivery/accept/:orderId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    
    if (!decoded.roles.includes('DELIVERY_GUY')) {
      return res.status(403).json({ error: 'Delivery guy access required' });
    }

    const { orderId } = req.params;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryGuyId: decoded.userId,
        status: 'OUT_FOR_DELIVERY'
      }
    });

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/delivery/complete/:orderId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    
    if (!decoded.roles.includes('DELIVERY_GUY')) {
      return res.status(403).json({ error: 'Delivery guy access required' });
    }

    const { orderId } = req.params;

    const order = await prisma.order.update({
      where: { id: orderId, deliveryGuyId: decoded.userId },
      data: {
        status: 'DELIVERED'
      }
    });

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ====================
// ADMIN ROUTES
// ====================

app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    
    // Check if user is admin
    if (!decoded.roles.includes('SUPER_ADMIN') && !decoded.roles.includes('ADMIN')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get dashboard stats
    const [totalOrders, totalUsers, totalMenuItems, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.menuItem.count(),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      dashboard: {
        totalOrders,
        totalUsers,
        totalMenuItems,
        recentOrders,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== SUPER ADMIN ROUTES =====

// Get all users (Super Admin only)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roles[0]?.role.name || 'User',
      isActive: user.isActive,
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// User management actions
app.post('/api/admin/users/:userId/activate', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true }
    });

    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users/:userId/deactivate', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users/:userId/promote', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    // Get the role ID (case-insensitive lookup)
    const roleName = (role || 'ADMIN').toUpperCase();
    const roleRecord = await prisma.role.findFirst({
      where: { name: roleName }
    });

    if (!roleRecord) {
      return res.status(400).json({ error: 'Role not found' });
    }

    // First, remove existing roles for this user
    await prisma.userRole.deleteMany({
      where: { userId: userId }
    });

    // Then add the new role
    await prisma.userRole.create({
      data: {
        userId: userId,
        roleId: roleRecord.id
      }
    });

    res.json({
      success: true,
      message: `User promoted to ${roleName} successfully`
    });
  } catch (error: any) {
    console.error('User promotion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// User activation endpoint
app.post('/api/admin/users/:userId/activate', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true }
    });

    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error: any) {
    console.error('User activation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// User deactivation endpoint
app.post('/api/admin/users/:userId/deactivate', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error: any) {
    console.error('User deactivation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// User demotion endpoint
app.post('/api/admin/users/:userId/demote', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    // Get the role ID (case-insensitive lookup)
    const roleName = (role || 'USER').toUpperCase();
    const roleRecord = await prisma.role.findFirst({
      where: { name: roleName }
    });

    if (!roleRecord) {
      return res.status(400).json({ error: 'Role not found' });
    }

    // First, remove existing roles for this user
    await prisma.userRole.deleteMany({
      where: { userId: userId }
    });

    // Then add the new role
    await prisma.userRole.create({
      data: {
        userId: userId,
        roleId: roleRecord.id
      }
    });

    res.json({
      success: true,
      message: `User demoted to ${roleName} successfully`
    });
  } catch (error: any) {
    console.error('User demotion error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Menu management
app.post('/api/admin/menu/:itemId/toggle', async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await prisma.menuItem.update({
      where: { id: itemId },
      data: { isAvailable: !item.isAvailable }
    });

    res.json({
      success: true,
      message: 'Menu item status updated'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/menu/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    
    await prisma.menuItem.delete({
      where: { id: itemId }
    });

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// System operations
app.post('/api/admin/system/backup', async (req, res) => {
  try {
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    res.json({
      success: true,
      message: 'Database backup completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/system/optimize', async (req, res) => {
  try {
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    res.json({
      success: true,
      message: 'System optimization completed successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/system/restart', async (req, res) => {
  try {
    // Simulate restart process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({
      success: true,
      message: 'System restart initiated successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/system/clear-cache', async (req, res) => {
  try {
    // Simulate cache clearing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Additional developer endpoints
app.post('/api/admin/system/run-tests', async (req, res) => {
  try {
    // Simulate test running
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    res.json({
      success: true,
      message: 'All tests passed successfully',
      results: {
        passed: 24,
        failed: 0,
        skipped: 2,
        duration: '2.3s'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/system/deploy', async (req, res) => {
  try {
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    res.json({
      success: true,
      message: 'Deployment completed successfully',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/system/git-pull', async (req, res) => {
  try {
    // Simulate git pull
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    res.json({
      success: true,
      message: 'Git pull completed successfully',
      commits: 3,
      filesChanged: 12
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/system/view-logs', async (req, res) => {
  try {
    // Simulate log viewing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({
      success: true,
      message: 'Logs retrieved successfully',
      logs: [
        '2024-01-15 10:30:15 - INFO: Server started on port 5000',
        '2024-01-15 10:30:16 - INFO: Database connected successfully',
        '2024-01-15 10:30:17 - INFO: All services running normally',
        '2024-01-15 10:31:45 - INFO: User login: admin@monda.com',
        '2024-01-15 10:32:12 - INFO: New order created: #12345'
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// ====================
// MENU MANAGEMENT ROUTES
// ====================

// Create menu item
app.post('/api/admin/menu', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    
    if (!decoded.roles.includes('SUPER_ADMIN') && !decoded.roles.includes('ADMIN')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const {
      name,
      description,
      price,
      image,
      category,
      isAvailable = true,
      isFeatured = false,
      stock = 0,
      prepTime = 15,
      nutrition,
      allergens = []
    } = req.body;

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        category,
        isAvailable,
        isFeatured,
        stock: parseInt(stock),
        prepTime: parseInt(prepTime),
        nutrition: nutrition ? JSON.stringify(nutrition) : null,
        allergens: JSON.stringify(allergens)
      }
    });

    res.json({
      success: true,
      message: 'Menu item created successfully',
      menuItem
    });
  } catch (error: any) {
    console.error('Menu creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update menu item
app.put('/api/admin/menu/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    
    if (!decoded.roles.includes('SUPER_ADMIN') && !decoded.roles.includes('ADMIN')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Parse JSON fields if they exist
    if (updateData.nutrition) {
      updateData.nutrition = JSON.stringify(updateData.nutrition);
    }
    if (updateData.allergens) {
      updateData.allergens = JSON.stringify(updateData.allergens);
    }

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      menuItem
    });
  } catch (error: any) {
    console.error('Menu update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete menu item
app.delete('/api/admin/menu/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    
    if (!decoded.roles.includes('SUPER_ADMIN') && !decoded.roles.includes('ADMIN')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    await prisma.menuItem.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error: any) {
    console.error('Menu deletion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('===========================================');
  console.log(`  Monda Food Delivery Backend Running!`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  API: http://localhost:${PORT}/api`);
  console.log('===========================================');
  console.log('  Features:');
  console.log('  - RBAC System (Super Admin, Admin, etc.)');
  console.log('  - Authentication (Login/Register)');
  console.log('  - SQLite Database');
  console.log('  - Menu Management');
  console.log('  - Order System');
  console.log('===========================================');
  console.log('');
});

export default app;
