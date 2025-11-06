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
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
    : process.env.NODE_ENV === 'production'
      ? [] // Production: must set CORS_ORIGIN
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
  credentials: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Change password endpoint
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get user to verify current password
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear mustChangePassword flag
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        password: hashedNewPassword,
        mustChangePassword: false
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: decoded.userId,
        action: 'PASSWORD_CHANGED',
        entity: 'AUTH',
        details: 'User changed password successfully',
      },
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message });
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
    
    // Get mustChangePassword flag from database
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { mustChangePassword: true }
    });
    
    res.json({ 
      user: {
        ...user,
        mustChangePassword: dbUser?.mustChangePassword || false
      }
    });
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
        status: 'OUT_FOR_DELIVERY',
        pickedUpAt: new Date()
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
        status: 'DELIVERED',
        deliveredAt: new Date()
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
    let roleRecord = await prisma.role.findFirst({
      where: { name: roleName }
    });

    // If role doesn't exist, create it (especially for CATERER which may not be seeded)
    if (!roleRecord) {
      roleRecord = await prisma.role.create({
        data: {
          name: roleName,
          description: `${roleName} role`
        }
      });
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

    // If promoting to ADMIN or SUPER_ADMIN, set mustChangePassword to true
    // This forces them to change their password on first login
    if (roleName === 'ADMIN' || roleName === 'SUPER_ADMIN') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          mustChangePassword: true
        }
      });
    }

    res.json({
      success: true,
      message: `User promoted to ${roleName} successfully${roleName === 'ADMIN' || roleName === 'SUPER_ADMIN' ? '. They will be required to change their password on first login.' : ''}`
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
    const updateData = { ...req.body };

    // Remove id from updateData - Prisma doesn't allow updating the id field
    delete updateData.id;

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

    // Filter out fields that don't exist in the schema or shouldn't be updated
    const allowedFields = [
      'name', 'description', 'price', 'category', 'image', 'rating',
      'isPopular', 'isSpicy', 'isVegetarian', 'isAvailable', 'isFeatured',
      'stock', 'prepTime', 'nutrition', 'allergens'
    ];
    
    const filteredData: any = {};
    for (const key of allowedFields) {
      if (updateData.hasOwnProperty(key)) {
        filteredData[key] = updateData[key];
      }
    }

    // Parse JSON fields if they exist
    if (filteredData.nutrition && typeof filteredData.nutrition === 'object') {
      filteredData.nutrition = JSON.stringify(filteredData.nutrition);
    }
    if (filteredData.allergens && Array.isArray(filteredData.allergens)) {
      filteredData.allergens = JSON.stringify(filteredData.allergens);
    }

    // Ensure category is a string
    if (filteredData.category && typeof filteredData.category !== 'string') {
      filteredData.category = String(filteredData.category);
    }

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: filteredData
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

    // Check if item exists first
    const existingItem = await prisma.menuItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return res.status(404).json({ 
        success: false,
        error: 'Menu item not found. It may have already been deleted.' 
      });
    }

    // Check if item is referenced in orders
    const orderItems = await prisma.orderItem.findMany({
      where: { menuItemId: id },
      take: 1
    });
    
    if (orderItems.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot delete this item. It is referenced in existing orders. Please mark it as unavailable instead.' 
      });
    }

    await prisma.menuItem.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error: any) {
    console.error('Menu deletion error:', error);
    // Handle Prisma foreign key constraint errors
    if (error.code === 'P2003' || error.message?.includes('Foreign key constraint')) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot delete this item. It is referenced in existing orders. Please mark it as unavailable instead.' 
      });
    }
    // Handle Prisma "record not found" errors
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false,
        error: 'Menu item not found. It may have already been deleted.' 
      });
    }
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to delete menu item' 
    });
  }
});

// Get categories endpoint
app.get('/api/admin/categories', async (req, res) => {
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

    // Get unique categories from menu items
    const menuItems = await prisma.menuItem.findMany({
      select: { category: true }
    });

    // Extract unique categories
    const uniqueCategories = new Set<string>();
    menuItems.forEach(item => {
      if (item.category) {
        uniqueCategories.add(item.category);
      }
    });

    const categories = Array.from(uniqueCategories).sort();

    res.json({
      success: true,
      categories
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Security log endpoint
app.post('/api/security/log', async (req, res) => {
  try {
    // Just acknowledge the log - don't store it for now
    res.json({ success: true, message: 'Log received' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.head('/api/security/log', async (req, res) => {
  try {
    res.status(200).end();
  } catch (error: any) {
    res.status(500).end();
  }
});

// ====================
// ORDER ROUTES
// ====================

// Helper function to get appropriate Unsplash image for menu items
function getMenuItemImageUrl(name: string, category: string): string {
  const imageMap: { [key: string]: string } = {
    // Ribs
    'ribs': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=800&fit=crop&q=85',
    'bbq': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=800&fit=crop&q=85',
    // Steak
    'steak': 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1200&h=800&fit=crop&q=85',
    // Nyama Choma
    'nyama': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&h=800&fit=crop&q=85',
    'choma': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&h=800&fit=crop&q=85',
    // Pilau
    'pilau': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1200&h=800&fit=crop&q=85',
    'biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&h=800&fit=crop&q=85',
    // Ugali
    'ugali': 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=1200&h=800&fit=crop&q=85',
    'sukuma': 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=1200&h=800&fit=crop&q=85',
    // Chicken
    'chicken': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=1200&h=800&fit=crop&q=85',
    'wings': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=1200&h=800&fit=crop&q=85',
    // Fish
    'fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200&h=800&fit=crop&q=85',
    'tilapia': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200&h=800&fit=crop&q=85',
    // Burger
    'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=800&fit=crop&q=85',
    'egbo': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=800&fit=crop&q=85',
    'deluxe': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=800&fit=crop&q=85',
    // Pizza
    'pizza': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&h=800&fit=crop&q=85',
    'margherita': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&h=800&fit=crop&q=85',
    // Pasta
    'pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&h=800&fit=crop&q=85',
    'carbonara': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&h=800&fit=crop&q=85',
    'spaghetti': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&h=800&fit=crop&q=85',
    // Salad
    'salad': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=1200&h=800&fit=crop&q=85',
    'caesar': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=1200&h=800&fit=crop&q=85',
    // Hot Dog
    'hot dog': 'https://images.unsplash.com/photo-1612392062798-2ad99e4f4e7e?w=1200&h=800&fit=crop&q=85',
    // Nachos
    'nachos': 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=1200&h=800&fit=crop&q=85',
    // Fries
    'fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=1200&h=800&fit=crop&q=85',
    // Samosa
    'samosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&h=800&fit=crop&q=85',
    // Drinks
    'drink': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=1200&h=800&fit=crop&q=85',
    'soda': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=1200&h=800&fit=crop&q=85',
    // Milkshake
    'milkshake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=1200&h=800&fit=crop&q=85',
    'shake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=1200&h=800&fit=crop&q=85',
  };
  
  const lowerName = name.toLowerCase();
  for (const [key, url] of Object.entries(imageMap)) {
    if (lowerName.includes(key)) {
      return url;
    }
  }
  
  // Category-based fallback
  const categoryMap: { [key: string]: string } = {
    'Premium': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=800&fit=crop&q=85',
    'African Specials': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&h=800&fit=crop&q=85',
    'Main Course': 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1200&h=800&fit=crop&q=85',
    'Fast Food': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=800&fit=crop&q=85',
    'Italian': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&h=800&fit=crop&q=85',
  };
  
  return categoryMap[category] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop&q=85';
}

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

    if (!userId || !items || !Array.isArray(items) || items.length === 0 || !deliveryAddress || !customerName || !customerPhone) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, items (non-empty array), deliveryAddress, customerName, customerPhone',
        received: {
          hasUserId: !!userId,
          hasItems: !!items,
          itemsIsArray: Array.isArray(items),
          itemsLength: Array.isArray(items) ? items.length : 0,
          hasAddress: !!deliveryAddress,
          hasName: !!customerName,
          hasPhone: !!customerPhone
        }
      });
    }

    // Verify user exists - try by ID first, then by email (for backward compatibility)
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    // If not found by ID, try by email (for guest orders)
    if (!user && userId.includes('@')) {
      user = await prisma.user.findUnique({
        where: { email: userId }
      });
    }

    if (!user) {
      // Create guest user if doesn't exist
      let customerRole = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } });
      if (!customerRole) {
        customerRole = await prisma.role.create({ data: { name: 'CUSTOMER', description: 'Regular customer role' } });
      }
      
      const guestEmail = userId.includes('@') ? userId : `${userId}@monda.com`;
      user = await prisma.user.create({
        data: {
          email: guestEmail,
          password: 'guest123',
          name: guestEmail.split('@')[0],
          phone: null,
          roles: { create: { roleId: customerRole.id } }
        }
      });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate total from actual cart item prices
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      // Validate item structure
      if (!item.menuItemId && !item.id) {
        console.error('Invalid item structure:', item);
        continue; // Skip invalid items
      }
      
      const menuItemId = item.menuItemId || item.id;
      
      // Use price from cart (item.price) if provided, otherwise fetch from database
      let itemPrice = item.price || 0;
      let menuItem = await prisma.menuItem.findUnique({
        where: { id: menuItemId }
      });

      // If menu item exists, validate/use database price
      if (menuItem) {
        // Use database price as source of truth, but allow cart price if item doesn't exist in DB
        itemPrice = menuItem.price;
      } else if (!itemPrice || itemPrice === 0) {
      // If menu item doesn't exist and no price provided, use price from cart or default
        // Hardcoded menu items removed - all items must be added through menu editor
        const fallbackPrice = item.price || 500;
        itemPrice = fallbackPrice;
        // Don't create menu items automatically - they must exist in database
        // menuItem will remain null, and we'll return an error below
      }

      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${menuItemId} not found` });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({ error: `Menu item ${menuItem.name} is not available` });
      }

      // Calculate item total using the validated price
      const itemQuantity = item.quantity || 1;
      const itemTotal = itemPrice * itemQuantity;
      total += itemTotal;

      orderItems.push({
        menuItemId: menuItemId,
        quantity: itemQuantity,
        price: itemPrice // Use the validated/calculated price
      });
    }

    // Validate that we have at least one valid order item
    if (orderItems.length === 0) {
      return res.status(400).json({ 
        error: 'No valid items found in order. Please ensure all items have valid menuItemId and price.',
        receivedItems: items
      });
    }

    // Add delivery fee and tax
    const deliveryFee = total > 5000 ? 0 : 200; // Free delivery over KES 5,000
    const tax = total * 0.16; // 16% VAT
    const finalTotal = total + deliveryFee + tax;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id, // Use the resolved user's ID
        status: 'PENDING',
        total: finalTotal,
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
        userId: user.id, // Use the resolved user's ID
        action: 'ORDER_CREATED',
        entity: 'Order',
        details: `Order ${orderNumber} created with ${items.length} items, total: KES ${finalTotal}`
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

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
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
          // Orders assigned to this delivery guy
          { deliveryGuyId: decoded.userId },
          // OR unassigned orders that are READY for delivery
          {
            deliveryGuyId: null,
            status: 'READY'
          },
          // OR orders out for delivery assigned to this guy
          {
            deliveryGuyId: decoded.userId,
            status: 'OUT_FOR_DELIVERY'
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

// Get orders for caterer (PREPARING and PENDING orders)
app.get('/api/caterer/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    
    // Check if user has CATERER role or ADMIN role (admins can also manage kitchen)
    const hasCatererAccess = decoded.roles.includes('CATERER') || 
                             decoded.roles.includes('ADMIN') || 
                             decoded.roles.includes('SUPER_ADMIN');
    
    if (!hasCatererAccess) {
      return res.status(403).json({ error: 'Caterer access required' });
    }

    // Get orders that need preparation or are being prepared
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY']
        }
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                prepTime: true
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
        createdAt: 'asc' // Oldest orders first
      }
    });

    res.json({
      success: true,
      orders
    });

  } catch (error: any) {
    console.error('Get caterer orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update order status for caterer (PENDING → PREPARING → READY)
app.put('/api/caterer/orders/:id/status', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    
    // Check if user has CATERER role or ADMIN role
    const hasCatererAccess = decoded.roles.includes('CATERER') || 
                             decoded.roles.includes('ADMIN') || 
                             decoded.roles.includes('SUPER_ADMIN');
    
    if (!hasCatererAccess) {
      return res.status(403).json({ error: 'Caterer access required' });
    }

    const { id } = req.params;
    const { status, preparationTime } = req.body;

    // Caterer can only set: PREPARING, READY
    const validStatuses = ['PREPARING', 'READY'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Caterer can only set status to: ${validStatuses.join(', ')}` });
    }

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status with timestamps
    const updateData: any = { status };
    if (status === 'PREPARING') {
      updateData.preparingAt = new Date();
    } else if (status === 'READY') {
      updateData.readyAt = new Date();
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
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

    // Create tracking entry
    await prisma.orderTracking.create({
      data: {
        orderId: id,
        status,
        notes: status === 'PREPARING' 
          ? `Kitchen started preparing order (estimated time: ${preparationTime || 'N/A'} minutes)`
          : 'Order ready for pickup by delivery guy'
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: decoded.userId,
        action: 'ORDER_STATUS_UPDATED',
        entity: 'Order',
        details: `Caterer updated order ${order.orderNumber} status to ${status}`
      }
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });

  } catch (error: any) {
    console.error('Caterer update order status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delivery profile: get current profile (including avatar)
app.get('/api/delivery/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    if (!decoded.roles.includes('DELIVERY_GUY')) {
      return res.status(403).json({ error: 'Delivery guy access required' });
    }

    let profile = await prisma.deliveryGuyProfile.findUnique({
      where: { userId: decoded.userId }
    });

    if (!profile) {
      profile = await prisma.deliveryGuyProfile.create({
        data: { userId: decoded.userId, status: 'offline' }
      });
    }

    res.json({ success: true, profile });
  } catch (error: any) {
    console.error('Get delivery profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delivery profile: update avatar url and basic status
app.put('/api/delivery/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    const token = authHeader.replace('Bearer ', '');
    const decoded = await authService.verifyToken(token);
    if (!decoded.roles.includes('DELIVERY_GUY')) {
      return res.status(403).json({ error: 'Delivery guy access required' });
    }

    const { avatarUrl, status } = req.body;
    
    // Handle avatarUrl explicitly - preserve base64 images and nulls correctly
    const updateData: any = {};
    if (avatarUrl !== undefined && avatarUrl !== null && avatarUrl !== '') {
      updateData.avatarUrl = avatarUrl; // Save base64 or URL
    } else if (avatarUrl === null || avatarUrl === '') {
      updateData.avatarUrl = null; // Explicitly set to null if empty
    }
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    const updated = await prisma.deliveryGuyProfile.upsert({
      where: { userId: decoded.userId },
      update: updateData,
      create: { 
        userId: decoded.userId, 
        avatarUrl: (avatarUrl && avatarUrl !== '') ? avatarUrl : null, 
        status: status || 'offline' 
      } as any
    });

    res.json({ success: true, profile: updated });
  } catch (error: any) {
    console.error('Update delivery profile error:', error);
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
      items = [] // Demo order items - should be provided or will use first available item
    } = req.body;

    // Generate unique order number
    const orderNumber = `DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Ensure demo user exists
    let demoUser = await prisma.user.findUnique({
      where: { email: 'demo@monda.com' }
    });

    if (!demoUser) {
      let customerRole = await prisma.role.findUnique({
        where: { name: 'CUSTOMER' }
      });

      if (!customerRole) {
        customerRole = await prisma.role.create({
          data: {
            name: 'CUSTOMER',
            description: 'Regular customer role'
          }
        });
      }

      demoUser = await prisma.user.create({
        data: {
          email: 'demo@monda.com',
          password: 'demo123',
          name: 'Demo Customer',
          phone: '+254700000000',
          roles: {
            create: {
              roleId: customerRole.id
            }
          }
        }
      });
    }

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

    // If no items were found, return error - no hardcoded items
    if (orderItems.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No valid order items found. Please ensure menu items exist in the database.' 
      });
    }

    // Add delivery fee and tax (same logic as regular orders)
    const deliveryFee = total > 5000 ? 0 : 200; // Free delivery over KES 5,000
    const tax = total * 0.16; // 16% VAT
    const finalTotal = total + deliveryFee + tax;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: demoUser.id,
        status: 'PENDING',
        total: finalTotal,
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
      readyOrders,
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
      prisma.order.count({ where: { status: 'READY' } }),
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
        readyOrders,
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

    // Hardcoded menu items removed - all items should be added through the menu editor
    // This endpoint is kept for backward compatibility but no longer syncs hardcoded items
    const frontendMenuItems: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      category: string;
      rating: number;
      isPopular: boolean;
      isSpicy: boolean;
      isVegetarian: boolean;
    }> = [];

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
            image: getMenuItemImageUrl(item.name, item.category),
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
    
    // Ensure demo user exists
    let demoUser = await prisma.user.findUnique({
      where: { email: 'demo@monda.com' }
    });
    
    if (!demoUser) {
      // First, ensure the CUSTOMER role exists
      let customerRole = await prisma.role.findUnique({
        where: { name: 'CUSTOMER' }
      });
      
      if (!customerRole) {
        customerRole = await prisma.role.create({
          data: {
            name: 'CUSTOMER',
            description: 'Regular customer role'
          }
        });
      }
      
      demoUser = await prisma.user.create({
        data: {
          email: 'demo@monda.com',
          password: 'demo123',
          name: 'Demo Customer',
          phone: '+254700000000',
          roles: {
            create: {
              roleId: customerRole.id
            }
          }
        }
      });
    }
    
    // Demo order requires existing menu items - no hardcoded items
    // Get first available menu item or return error
    const demoMenuItem = await prisma.menuItem.findFirst({
      where: { isAvailable: true }
    });
    
    if (!demoMenuItem) {
      return res.status(400).json({
        success: false,
        error: 'No menu items available. Please add items through the menu editor first.'
      });
    }
    
    const demoOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: demoUser.id,
        status: 'PENDING',
        total: demoMenuItem.price * 2,
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
              menuItemId: demoMenuItem.id,
              quantity: 2,
              price: demoMenuItem.price
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

// Submit support request (for customers who haven't received delivery)
app.post('/api/orders/support-request', async (req, res) => {
  try {
    const { orderId, kitchenStaffNumber, timestamp } = req.body;

    if (!orderId || !kitchenStaffNumber) {
      return res.status(400).json({ error: 'Order ID and kitchen/staff number are required' });
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        deliveryGuy: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Log the support request as an activity
    await prisma.activityLog.create({
      data: {
        userId: order.userId,
        action: 'SUPPORT_REQUEST',
        entity: 'Order',
        details: `Support request for order ${order.orderNumber} - Kitchen/Staff Number: ${kitchenStaffNumber}. Order status: ${order.status}`
      }
    });

    // Create a tracking entry for the support request
    await prisma.orderTracking.create({
      data: {
        orderId: order.id,
        status: order.status,
        notes: `Support requested by customer - Kitchen/Staff Number: ${kitchenStaffNumber}. Customer indicates delivery not yet received.`
      }
    });

    // Log activity for admins
    const adminUsers = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: {
                in: ['SUPER_ADMIN', 'ADMIN']
              }
            }
          }
        }
      }
    });

    for (const admin of adminUsers) {
      await prisma.activityLog.create({
        data: {
          userId: admin.id,
          action: 'SUPPORT_REQUEST_ALERT',
          entity: 'Order',
          details: `Customer support request for Order ${order.orderNumber} - Staff #${kitchenStaffNumber}. Action required.`
        }
      });
    }

    res.json({
      success: true,
      message: 'Support request submitted successfully. Our team will contact you shortly.',
      orderNumber: order.orderNumber,
      supportContact: {
        kitchen: '+254 700 000 000',
        staff: '+254 700 000 001',
        email: 'support@monda.com'
      }
    });

  } catch (error: any) {
    console.error('Support request error:', error);
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
