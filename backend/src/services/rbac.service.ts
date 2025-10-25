/**
 * Advanced RBAC Service - Role-Based Access Control
 * Implements the 3-tier admin system from requirements
 * Date: 23/10/2025
 */

import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Permission definitions matching requirements
export const PERMISSIONS = {
  // Super Admin (3 users) - God mode
  SUPER_ADMIN: [
    'MANAGE_SUPER_ADMINS',
    'MANAGE_ADMINS',
    'MANAGE_SUB_ADMINS',
    'SYSTEM_CONFIGURATION',
    'VIEW_ALL_ANALYTICS',
    'MANAGE_PAYMENTS',
    'MANAGE_DATABASE',
    'MANAGE_ORDERS',
    'MANAGE_USERS',
    'MANAGE_MENU',
    'VIEW_ANALYTICS',
    'ADD_PEOPLE',
    'MANAGE_DELIVERY',
  ],
  
  // Admin (2 users) - Bossy, Analytics, Orders, Can add people
  ADMIN: [
    'MANAGE_ORDERS',
    'MANAGE_USERS',
    'MANAGE_MENU',
    'VIEW_ANALYTICS',
    'ADD_PEOPLE',
    'MANAGE_DELIVERY',
    'VIEW_ORDERS',
    'UPDATE_ORDER_STATUS',
  ],
  
  // Sub-Admin (3 users) - Limited rights
  SUB_ADMIN: [
    'VIEW_ORDERS',
    'UPDATE_ORDER_STATUS',
    'VIEW_USERS',
    'VIEW_MENU',
  ],
  
  // Delivery Guy - Delivery specific
  DELIVERY_GUY: [
    'VIEW_ASSIGNED_ORDERS',
    'UPDATE_DELIVERY_STATUS',
    'VIEW_DELIVERY_LOCATION',
  ],
  
  // Customer - Basic permissions
  CUSTOMER: [],
};

// Maximum users per role (as per requirements)
export const ROLE_LIMITS = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  SUB_ADMIN: 3,
  DELIVERY_GUY: Infinity,
  CUSTOMER: Infinity,
};

export class RBACService {
  /**
   * Check if user has specific permission
   */
  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { permissions: true },
      });

      if (!user) return false;

      // Super admins have all permissions
      if (user.role === 'SUPER_ADMIN') return true;

      // Check role-based permissions
      const rolePermissions = PERMISSIONS[user.role] || [];
      if (rolePermissions.includes(permission)) return true;

      // Check custom permissions
      const hasCustomPermission = user.permissions.some(
        (p) => p.permission === permission && (!p.expiresAt || p.expiresAt > new Date())
      );

      return hasCustomPermission;
    } catch (error) {
      logger.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Grant permission to user
   */
  static async grantPermission(
    userId: string,
    permission: string,
    grantedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    // Check if granter has permission to grant
    const canGrant = await this.hasPermission(grantedBy, 'ADD_PEOPLE');
    if (!canGrant) {
      throw new AppError('You do not have permission to grant permissions', 403);
    }

    await prisma.userPermission.create({
      data: {
        userId,
        permission: permission as any,
        grantedBy,
        expiresAt,
      },
    });

    logger.info(`Permission ${permission} granted to user ${userId} by ${grantedBy}`);
  }

  /**
   * Revoke permission from user
   */
  static async revokePermission(userId: string, permission: string): Promise<void> {
    await prisma.userPermission.deleteMany({
      where: {
        userId,
        permission: permission as any,
      },
    });

    logger.info(`Permission ${permission} revoked from user ${userId}`);
  }

  /**
   * Check if role limit has been reached
   */
  static async checkRoleLimit(role: string): Promise<boolean> {
    const limit = ROLE_LIMITS[role as keyof typeof ROLE_LIMITS];
    if (limit === Infinity) return true;

    const count = await prisma.user.count({
      where: { role: role as any, isActive: true },
    });

    return count < limit;
  }

  /**
   * Get all permissions for a user
   */
  static async getUserPermissions(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { permissions: true },
    });

    if (!user) return [];

    const rolePermissions = PERMISSIONS[user.role] || [];
    const customPermissions = user.permissions
      .filter((p) => !p.expiresAt || p.expiresAt > new Date())
      .map((p) => p.permission);

    return [...new Set([...rolePermissions, ...customPermissions])];
  }

  /**
   * Log admin activity
   */
  static async logActivity(
    userId: string,
    action: string,
    entity: string,
    entityId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * Get admin analytics
   */
  static async getAdminAnalytics(userId: string): Promise<any> {
    const hasPermission = await this.hasPermission(userId, 'VIEW_ANALYTICS');
    if (!hasPermission) {
      throw new AppError('You do not have permission to view analytics', 403);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      totalDeliveryGuys,
      recentActivity,
      topItems,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),
      
      // Total revenue
      prisma.order.aggregate({
        where: { paymentStatus: 'COMPLETED' },
        _sum: { total: true },
      }),
      
      // Total users
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      
      // Total delivery guys
      prisma.user.count({ where: { role: 'DELIVERY_GUY', isActive: true } }),
      
      // Recent activity
      prisma.activityLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      
      // Top menu items
      prisma.menuItem.findMany({
        take: 10,
        orderBy: { orderCount: 'desc' },
        select: { name: true, orderCount: true, price: true },
      }),
    ]);

    return {
      overview: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalUsers,
        totalDeliveryGuys,
      },
      recentActivity,
      topItems,
    };
  }

  /**
   * Promote user to a higher role
   */
  static async promoteUser(
    userId: string,
    newRole: string,
    promotedBy: string
  ): Promise<void> {
    // Check if promoter has permission
    const canPromote = await this.hasPermission(promotedBy, 'MANAGE_ADMINS');
    if (!canPromote) {
      throw new AppError('You do not have permission to promote users', 403);
    }

    // Check role limits
    const canAddRole = await this.checkRoleLimit(newRole);
    if (!canAddRole) {
      throw new AppError(`Maximum number of ${newRole}s reached`, 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any },
    });

    // Log activity
    await this.logActivity(
      promotedBy,
      'PROMOTED_USER',
      'User',
      userId,
      { newRole }
    );

    logger.info(`User ${userId} promoted to ${newRole} by ${promotedBy}`);
  }

  /**
   * Deactivate user
   */
  static async deactivateUser(userId: string, deactivatedBy: string): Promise<void> {
    const canDeactivate = await this.hasPermission(deactivatedBy, 'MANAGE_USERS');
    if (!canDeactivate) {
      throw new AppError('You do not have permission to deactivate users', 403);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // Log activity
    await this.logActivity(
      deactivatedBy,
      'DEACTIVATED_USER',
      'User',
      userId
    );

    logger.info(`User ${userId} deactivated by ${deactivatedBy}`);
  }

  /**
   * Get system statistics (Super Admin only)
   */
  static async getSystemStats(userId: string): Promise<any> {
    const canView = await this.hasPermission(userId, 'VIEW_ALL_ANALYTICS');
    if (!canView) {
      throw new AppError('Insufficient permissions', 403);
    }

    const [
      usersByRole,
      ordersByStatus,
      revenueByDay,
      activeDeliveryGuys,
    ] = await Promise.all([
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
        where: { isActive: true },
      }),
      
      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
      
      // Revenue by day (last 30 days)
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          paymentStatus: 'COMPLETED',
        },
        select: {
          createdAt: true,
          total: true,
        },
      }),
      
      // Active delivery guys
      prisma.deliveryStats.findMany({
        where: { isAvailable: true },
        include: {
          user: {
            select: { name: true, phone: true },
          },
        },
      }),
    ]);

    return {
      usersByRole,
      ordersByStatus,
      revenueByDay,
      activeDeliveryGuys,
    };
  }
}


