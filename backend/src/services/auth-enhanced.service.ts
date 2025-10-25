/**
 * Enhanced Authentication Service
 * Implements "Extreme Login" with 2FA and security features
 * Date: 23/10/2025
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { RBACService } from './rbac.service';
import { logger } from '../utils/logger';

export class EnhancedAuthService {
  /**
   * Register new user with role limit checking
   */
  static async register(data: {
    email: string;
    phone: string;
    password: string;
    name: string;
    role?: string;
  }) {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
      },
    });

    if (existingUser) {
      throw new AppError('User already exists with this email or phone', 400);
    }

    // Check role limits if role is specified
    if (data.role && data.role !== 'CUSTOMER') {
      const canAdd = await RBACService.checkRoleLimit(data.role);
      if (!canAdd) {
        throw new AppError(`Maximum number of ${data.role}s reached`, 400);
      }
    }

    // Hash password with high cost factor
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        name: data.name,
        role: (data.role as any) || 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
      },
    });

    // Generate token
    const token = this.generateToken(user);

    // Create session with security info
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, token };
  }

  /**
   * Enhanced login with security features
   */
  static async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new AppError(`Account locked. Try again in ${minutes} minutes`, 423);
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Account has been deactivated', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = user.loginAttempts + 1;
      const updates: any = { loginAttempts: newAttempts };

      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        logger.warn(`Account locked for user ${email} due to failed login attempts`);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });

      throw new AppError('Invalid credentials', 401);
    }

    // Reset login attempts and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Return temporary token requiring 2FA verification
      return {
        requiresTwoFactor: true,
        tempToken: this.generateTempToken(user.id),
      };
    }

    const token = this.generateToken(user);

    // Create session with security info
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        ipAddress,
        userAgent,
        fingerprint: this.generateFingerprint(ipAddress, userAgent),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Log activity for admin users
    if (user.role !== 'CUSTOMER') {
      await RBACService.logActivity(
        user.id,
        'LOGIN',
        'Session',
        undefined,
        undefined,
        ipAddress,
        userAgent
      );
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      permissions: await RBACService.getUserPermissions(user.id),
    };
  }

  /**
   * Verify 2FA code
   */
  static async verify2FA(tempToken: string, code: string) {
    // Implementation for 2FA verification
    // This would integrate with services like Google Authenticator
    throw new Error('2FA not yet implemented');
  }

  /**
   * Enable 2FA for user
   */
  static async enable2FA(userId: string) {
    const secret = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      },
    });

    return { secret };
  }

  /**
   * Logout
   */
  static async logout(token: string) {
    await prisma.session.delete({
      where: { token },
    });
  }

  /**
   * Logout all sessions for user
   */
  static async logoutAll(userId: string) {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  /**
   * Generate JWT token
   */
  private static generateToken(user: { id: string; email: string; role: string }) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Generate temporary token for 2FA
   */
  private static generateTempToken(userId: string) {
    return jwt.sign(
      { id: userId, temp: true },
      process.env.JWT_SECRET!,
      { expiresIn: '5m' }
    );
  }

  /**
   * Generate device fingerprint
   */
  private static generateFingerprint(ipAddress?: string, userAgent?: string): string {
    return crypto
      .createHash('sha256')
      .update(`${ipAddress}:${userAgent}`)
      .digest('hex');
  }

  /**
   * Verify session security
   */
  static async verifySession(token: string, ipAddress?: string, userAgent?: string): Promise<boolean> {
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session) return false;

    // Check expiration
    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      return false;
    }

    // Check fingerprint (optional, can be made strict)
    const currentFingerprint = this.generateFingerprint(ipAddress, userAgent);
    if (session.fingerprint && session.fingerprint !== currentFingerprint) {
      logger.warn(`Fingerprint mismatch for session ${session.id}`);
      // Could enforce this, but browsers/networks change
    }

    // Update last activity
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActivity: new Date() },
    });

    return true;
  }

  /**
   * Get active sessions for user
   */
  static async getActiveSessions(userId: string) {
    return prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gte: new Date() },
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        lastActivity: true,
      },
      orderBy: { lastActivity: 'desc' },
    });
  }

  /**
   * Revoke specific session
   */
  static async revokeSession(sessionId: string, userId: string) {
    await prisma.session.delete({
      where: { id: sessionId, userId },
    });
  }
}


