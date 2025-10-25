import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_monda_app_change_in_production_min_32_chars';

export class AuthService {
  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new Error(`Account locked. Try again in ${minutesLeft} minutes`);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Increment login attempts
      const loginAttempts = user.loginAttempts + 1;
      const updates: any = { loginAttempts };

      // Lock account after 5 failed attempts
      if (loginAttempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });

      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // Get user roles
    const roles = user.roles.map(ur => ur.role.name);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roles,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'AUTH',
        details: `User logged in successfully`,
      },
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        roles,
      },
    };
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
      },
    });

    // Assign USER role by default
    const userRole = await prisma.role.findUnique({
      where: { name: 'USER' },
    });

    if (userRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: userRole.id,
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entity: 'AUTH',
        details: `New user registered`,
      },
    });

    // Auto-login
    return this.login(data.email, data.password);
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid token');
      }

      return {
        userId: user.id,
        email: user.email,
        roles: user.roles.map(ur => ur.role.name),
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        deliveryProfile: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      deliveryProfile: user.deliveryProfile,
      roles: user.roles.map(ur => ur.role.name),
    };
  }
}

export const authService = new AuthService();
