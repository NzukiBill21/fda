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
      where: { isAvailable: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, items });
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
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
