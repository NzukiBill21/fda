/**
 * TypeScript interfaces matching the MySQL database schema exactly
 * All field names must match the database column names
 */

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'CANCELED';

export type PaymentMethod = 'CASH' | 'MPESA';

export type BackendRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'SUB_ADMIN' 
  | 'USER' 
  | 'DELIVERY_GUY' 
  | 'CATERER';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  loginAttempts?: number;
  lockedUntil?: string | null;
  lastLogin?: string | null;
  mustChangePassword?: boolean;
  roles?: Role[];
  role?: string; // Normalized single role for frontend
}

export interface Role {
  id: string;
  name: BackendRole;
  description?: string;
  createdAt?: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  createdAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null; // LONGTEXT - raw base64 or URL
  rating?: number;
  isPopular?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isAvailable: boolean;
  isFeatured?: boolean;
  stock?: number;
  prepTime?: number;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  allergens?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  deliveryGuyId?: string | null;
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  deliveryNotes?: string | null;
  customerName: string;
  customerPhone: string;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
  estimatedDeliveryTime?: number | null;
  actualDeliveryTime?: string | null;
  confirmedAt?: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  items?: OrderItem[];
  trackingHistory?: OrderTracking[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  createdAt?: string;
  menuItemName?: string;
  menuItemPrice?: number;
  menuItemImage?: string;
}

export interface OrderTracking {
  id: string;
  orderId: string;
  status: OrderStatus;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface DashboardResponse {
  success: boolean;
  dashboard?: {
    totalOrders: number;
    totalUsers: number;
    recentOrders: Order[];
    [key: string]: any;
  };
  error?: string;
}

export interface UsersResponse {
  success: boolean;
  users?: Array<{
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    role: BackendRole; // Single normalized role
  }>;
  error?: string;
}

export interface MenuResponse {
  success: boolean;
  menuItems?: MenuItem[];
  items?: MenuItem[];
  error?: string;
}

export interface OrderResponse {
  success: boolean;
  order?: Order;
  error?: string;
}
