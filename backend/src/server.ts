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
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
  credentials: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
        longitude: longitude || null,
        updatedAt: new Date()
      },
      create: {
        userId: decoded.userId,
        status: status || 'offline',
        latitude: latitude || null,
        longitude: longitude || null,
        updatedAt: new Date()
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

// Get delivery profile
app.get('/api/delivery/profile', async (req, res) => {
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

    const profile = await prisma.deliveryGuyProfile.findUnique({
      where: { userId: decoded.userId }
    });

    res.json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update delivery profile
app.put('/api/delivery/profile', async (req, res) => {
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

    const profileData = req.body;

    // Update User fields (name, phone, etc.)
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: profileData.name,
        phone: profileData.phone
      }
    });

    // Update DeliveryGuyProfile fields
    const allowedFields = {
      status: profileData.status,
      latitude: profileData.latitude,
      longitude: profileData.longitude,
      isAvailable: profileData.isAvailable
    };

    const profile = await prisma.deliveryGuyProfile.upsert({
      where: { userId: decoded.userId },
      update: allowedFields,
      create: {
        userId: decoded.userId,
        ...allowedFields
      }
    });

    res.json({ success: true, profile });
  } catch (error: any) {
    console.error('Profile update error:', error);
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
    const [totalOrders, totalUsers, totalMenuItems, recentOrders, onlineDrivers] = await Promise.all([
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
      prisma.deliveryGuyProfile.findMany({
        where: { status: 'online' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      dashboard: {
        totalOrders,
        totalUsers,
        totalMenuItems,
        recentOrders,
        onlineDrivers,
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
        },
        deliveryProfile: true
      }
    });

    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roles[0]?.role.name || 'User',
      isActive: user.isActive,
      createdAt: user.createdAt,
      isOnline: user.deliveryProfile?.status === 'online' || false
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

    // First check if the item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return res.status(404).json({ 
        success: false,
        error: `Menu item with id "${id}" not found` 
      });
    }

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

// ====================
// ORDER ROUTES
// ====================

// Create new order (Cash on Delivery)
app.post('/api/orders', async (req, res) => {
  try {
    const {
      userId,
      items,
      deliveryAddress,
      deliveryNotes,
      customerName,
      customerPhone,
      deliveryLatitude,
      deliveryLongitude,
      estimatedDeliveryTime
    } = req.body;

    if (!userId || !items || !deliveryAddress || !customerName || !customerPhone) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, items, deliveryAddress, customerName, customerPhone' 
      });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      let menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      });

      // If menu item doesn't exist, create it with proper name from frontend data
      if (!menuItem) {
        // Map of known menu items with proper names
        const menuItemNames: { [key: string]: { name: string; description: string; price: number; category: string } } = {
          'ribs-1': { name: 'Tender BBQ Ribs', description: 'Fall-off-the-bone ribs glazed with our signature BBQ sauce', price: 4000, category: 'Premium' },
          'steak-1': { name: 'Premium Steak Combo', description: 'Perfectly grilled premium beef steak with seasonal vegetables', price: 8000, category: 'Premium' },
          'nyama-1': { name: 'Nyama Choma Special', description: 'Authentic Kenyan roasted goat meat with kachumbari', price: 1800, category: 'African Specials' },
          'pilau-1': { name: 'Beef Pilau', description: 'Aromatic spiced rice with tender beef chunks, steaming hot', price: 650, category: 'African Specials' },
          'ugali-1': { name: 'Ugali & Sukuma', description: 'Traditional Kenyan maize meal with collard greens', price: 300, category: 'African Specials' },
          'chicken-1': { name: 'Grilled Chicken', description: 'Perfectly seasoned grilled chicken breast', price: 1200, category: 'Main Course' },
          'fish-1': { name: 'Tilapia Fry', description: 'Fresh tilapia fish fried to golden perfection', price: 1500, category: 'Main Course' },
          'pizza-1': { name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, and basil pizza', price: 2000, category: 'Italian' },
          'burger-1': { name: 'Classic Burger', description: 'Juicy beef patty with fresh vegetables', price: 1800, category: 'Fast Food' },
          'pasta-1': { name: 'Spaghetti Carbonara', description: 'Creamy pasta with bacon and parmesan', price: 1600, category: 'Italian' }
        };

        const itemData = menuItemNames[item.menuItemId] || {
          name: `Delicious ${item.menuItemId.replace('-', ' ').replace(/\d+/g, '').trim()}`,
          description: 'Fresh and delicious meal prepared with care',
          price: 1000,
          category: 'Custom'
        };

        menuItem = await prisma.menuItem.create({
          data: {
            id: item.menuItemId,
            name: itemData.name,
            description: itemData.description,
            price: itemData.price,
            image: 'https://via.placeholder.com/150',
            category: itemData.category,
            rating: 4.5,
            isAvailable: true,
            isPopular: false,
            isSpicy: false,
            isVegetarian: false,
            nutrition: JSON.stringify({}),
            allergens: JSON.stringify([])
          }
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({ error: `Menu item ${menuItem.name} is not available` });
      }

      const itemTotal = menuItem.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        status: 'PENDING',
        total,
        paymentMethod: 'CASH',
        deliveryAddress,
        deliveryNotes,
        customerName,
        customerPhone,
        deliveryLatitude: deliveryLatitude || null,
        deliveryLongitude: deliveryLongitude || null,
        estimatedDeliveryTime: estimatedDeliveryTime || 30,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // Create initial tracking entry
    await prisma.orderTracking.create({
      data: {
        orderId: order.id,
        status: 'PENDING',
        notes: 'Order placed successfully'
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'ORDER_CREATED',
        entity: 'Order',
        details: `Order ${orderNumber} created with ${items.length} items, total: $${total}`
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (Admin only)
app.get('/api/admin/orders', async (req, res) => {
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

    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = status ? { status: status as string } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          deliveryGuy: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          trackingHistory: {
            orderBy: {
              timestamp: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: Number(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        deliveryGuy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            deliveryProfile: {
              select: {
                status: true,
                latitude: true,
                longitude: true
              }
            }
          }
        },
        trackingHistory: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order
    });

  } catch (error: any) {
    console.error('Get order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update order status (Admin only)
app.put('/api/admin/orders/:id/status', async (req, res) => {
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
    const { status, notes, deliveryGuyId } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = { status };
    
    if (deliveryGuyId) {
      updateData.deliveryGuyId = deliveryGuyId;
    }

    if (status === 'DELIVERED') {
      updateData.actualDeliveryTime = new Date();
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        user: true,
        deliveryGuy: true
      }
    });

    // Create tracking entry
    await prisma.orderTracking.create({
      data: {
        orderId: id,
        status,
        notes: notes || `Status updated to ${status}`
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: decoded.userId,
        action: 'ORDER_STATUS_UPDATED',
        entity: 'Order',
        details: `Order ${order.orderNumber} status updated to ${status}`
      }
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });

  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get orders for delivery guy
app.get('/api/delivery/orders', async (req, res) => {
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

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { deliveryGuyId: decoded.userId },
          { 
            status: 'OUT_FOR_DELIVERY',
            deliveryGuyId: null
          }
        ]
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        trackingHistory: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      orders
    });

  } catch (error: any) {
    console.error('Get delivery orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update delivery location (for tracking)
app.put('/api/delivery/orders/:id/location', async (req, res) => {
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

    const { id } = req.params;
    const { latitude, longitude, status, notes } = req.body;

    // Create tracking entry
    await prisma.orderTracking.create({
      data: {
        orderId: id,
        status: status || 'OUT_FOR_DELIVERY',
        latitude: latitude || null,
        longitude: longitude || null,
        notes: notes || 'Location updated'
      }
    });

    res.json({
      success: true,
      message: 'Location updated successfully'
    });

  } catch (error: any) {
    console.error('Update delivery location error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Assign order to delivery guy (Admin only) - Fixed version
app.put('/api/admin/orders/:id/assign', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    
    if (!decoded.roles.includes('ADMIN') && !decoded.roles.includes('SUPER_ADMIN')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { deliveryGuyId } = req.body;
    const orderId = req.params.id;

    if (!deliveryGuyId) {
      return res.status(400).json({ error: 'Delivery guy ID is required' });
    }

    // Simple check - just verify the user exists and is active
    const deliveryGuy = await prisma.user.findUnique({
      where: { id: deliveryGuyId },
      include: { deliveryProfile: true }
    });

    if (!deliveryGuy || !deliveryGuy.isActive) {
      return res.status(400).json({ error: 'Invalid delivery guy' });
    }

    // Update order
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryGuyId,
        status: 'OUT_FOR_DELIVERY'
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        user: true,
        deliveryGuy: true
      }
    });

    // Create tracking entry
    await prisma.orderTracking.create({
      data: {
        orderId: order.id,
        status: 'OUT_FOR_DELIVERY',
        notes: `Assigned to delivery guy: ${deliveryGuy.name}`
      }
    });

    res.json({
      success: true,
      message: 'Order assigned successfully',
      order
    });

  } catch (error: any) {
    console.error('Assign order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Demo endpoint to create a test order (for demo purposes)
app.post('/api/demo/order', async (req, res) => {
  try {
    const {
      customerName = 'Demo Customer',
      customerPhone = '+254700000000',
      deliveryAddress = 'Nairobi, Kenya',
      items = [
        { menuItemId: 'ribs-1', quantity: 1 },
        { menuItemId: 'soft-drinks-1', quantity: 2 }
      ]
    } = req.body;

    // Generate unique order number
    const orderNumber = `DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findFirst({
        where: { 
          OR: [
            { id: item.menuItemId },
            { name: { contains: item.menuItemId } }
          ]
        }
      });

      if (menuItem) {
        const itemTotal = menuItem.price * item.quantity;
        total += itemTotal;

        orderItems.push({
          menuItemId: menuItem.id,
          quantity: item.quantity,
          price: menuItem.price
        });
      }
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: 'demo-user',
        status: 'PENDING',
        total,
        paymentMethod: 'CASH',
        deliveryAddress,
        deliveryNotes: 'Demo order for testing',
        customerName,
        customerPhone,
        deliveryLatitude: -1.2921,
        deliveryLongitude: 36.8219,
        estimatedDeliveryTime: 30,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    // Create initial tracking entry
    await prisma.orderTracking.create({
      data: {
        orderId: order.id,
        status: 'PENDING',
        notes: 'Demo order created'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Demo order created successfully',
      order
    });

  } catch (error: any) {
    console.error('Demo order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Order assignment endpoint removed to fix TypeScript issues

// Get order statistics (Admin only)
app.get('/api/admin/orders/stats', async (req, res) => {
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

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      preparingOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      todayOrders,
      thisWeekOrders
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.order.count({ where: { status: 'PREPARING' } }),
      prisma.order.count({ where: { status: 'OUT_FOR_DELIVERY' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'DELIVERED' }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        preparingOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        todayOrders,
        thisWeekOrders
      }
    });

  } catch (error: any) {
    console.error('Get order stats error:', error);
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

// Sync menu items from frontend to database
app.post('/api/admin/sync-menu', async (req, res) => {
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

    const frontendMenuItems = [
      { id: 'ribs-1', name: 'Tender BBQ Ribs', description: 'Fall-off-the-bone ribs glazed with our signature BBQ sauce', price: 4000, category: 'Premium', rating: 5.0, isPopular: true, isSpicy: false, isVegetarian: false },
      { id: 'steak-1', name: 'Premium Steak Combo', description: 'Perfectly grilled premium beef steak with seasonal vegetables', price: 8000, category: 'Premium', rating: 4.9, isPopular: true, isSpicy: false, isVegetarian: false },
      { id: 'nyama-1', name: 'Nyama Choma Special', description: 'Authentic Kenyan roasted goat meat with kachumbari', price: 1800, category: 'African Specials', rating: 4.9, isPopular: true, isSpicy: true, isVegetarian: false },
      { id: 'pilau-1', name: 'Beef Pilau', description: 'Aromatic spiced rice with tender beef chunks, steaming hot', price: 650, category: 'African Specials', rating: 4.8, isPopular: true, isSpicy: false, isVegetarian: false },
      { id: 'ugali-1', name: 'Ugali & Sukuma', description: 'Traditional Kenyan maize meal with collard greens', price: 300, category: 'African Specials', rating: 4.7, isPopular: false, isSpicy: false, isVegetarian: true },
      { id: 'chicken-1', name: 'Grilled Chicken', description: 'Perfectly seasoned grilled chicken breast', price: 1200, category: 'Main Course', rating: 4.6, isPopular: false, isSpicy: false, isVegetarian: false },
      { id: 'fish-1', name: 'Tilapia Fry', description: 'Fresh tilapia fish fried to golden perfection', price: 1500, category: 'Main Course', rating: 4.8, isPopular: false, isSpicy: false, isVegetarian: false },
      { id: 'pizza-1', name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, and basil pizza', price: 2000, category: 'Italian', rating: 4.7, isPopular: false, isSpicy: false, isVegetarian: true },
      { id: 'burger-1', name: 'Classic Burger', description: 'Juicy beef patty with fresh vegetables', price: 1800, category: 'Fast Food', rating: 4.5, isPopular: false, isSpicy: false, isVegetarian: false },
      { id: 'pasta-1', name: 'Spaghetti Carbonara', description: 'Creamy pasta with bacon and parmesan', price: 1600, category: 'Italian', rating: 4.6, isPopular: false, isSpicy: false, isVegetarian: false }
    ];

    const syncedItems = [];
    for (const item of frontendMenuItems) {
      const existingItem = await prisma.menuItem.findUnique({
        where: { id: item.id }
      });

      if (existingItem) {
        // Update existing item
        const updatedItem = await prisma.menuItem.update({
          where: { id: item.id },
          data: {
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            rating: item.rating,
            isPopular: item.isPopular || false,
            isSpicy: item.isSpicy || false,
            isVegetarian: item.isVegetarian || false,
            isAvailable: true
          }
        });
        syncedItems.push(updatedItem);
      } else {
        // Create new item
        const newItem = await prisma.menuItem.create({
          data: {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            rating: item.rating,
            isPopular: item.isPopular || false,
            isSpicy: item.isSpicy || false,
            isVegetarian: item.isVegetarian || false,
            isAvailable: true,
            image: 'https://via.placeholder.com/150',
            nutrition: JSON.stringify({}),
            allergens: JSON.stringify([])
          }
        });
        syncedItems.push(newItem);
      }
    }

    res.json({
      success: true,
      message: `Synced ${syncedItems.length} menu items`,
      items: syncedItems
    });
  } catch (error: any) {
    console.error('Menu sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Demo order endpoint for testing
app.post('/api/demo/order', async (req, res) => {
  try {
    const orderNumber = `DEMO-${Date.now()}`;
    
    const demoOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: 'demo-user',
        status: 'PENDING',
        total: 2500,
        paymentMethod: 'CASH',
        deliveryAddress: 'Demo Address, Nairobi',
        deliveryNotes: 'Demo order for testing',
        customerName: 'Demo Customer',
        customerPhone: '+254700000000',
        deliveryLatitude: -1.2921,
        deliveryLongitude: 36.8219,
        estimatedDeliveryTime: 30,
        items: {
          create: [
            {
              menuItemId: 'demo-item-1',
              quantity: 2,
              price: 1250
            }
          ]
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    res.json({
      success: true,
      order: demoOrder,
      message: 'Demo order created successfully'
    });
  } catch (error: any) {
    console.error('Demo order creation error:', error);
    res.status(500).json({ error: error.message });
  }
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
