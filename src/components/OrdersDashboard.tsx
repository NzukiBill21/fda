import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  DollarSign,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  Calendar,
  TrendingUp,
  Users,
  X,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  paymentMethod: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  customerName: string;
  customerPhone: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  estimatedDeliveryTime?: number;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  deliveryGuy?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  trackingHistory: Array<{
    id: string;
    status: string;
    notes?: string;
    timestamp: string;
    latitude?: number;
    longitude?: number;
  }>;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayOrders: number;
  thisWeekOrders: number;
}

const OrdersDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deliveryGuys, setDeliveryGuys] = useState<any[]>([]);

  const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PREPARING', label: 'Preparing' },
    { value: 'READY', label: 'Ready for Pickup' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const fetchDeliveryGuys = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        const deliveryGuysList = result.users.filter((user: any) => 
          user.roles?.includes('DELIVERY_GUY') && user.isActive
        );
        setDeliveryGuys(deliveryGuysList);
      }
    } catch (error) {
      console.error('Fetch delivery guys error:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found, skipping orders fetch');
        return;
      }
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (filterStatus) {
        params.append('status', filterStatus);
      }

      const response = await fetch(`http://localhost:5000/api/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setOrders(result.orders);
        setTotalPages(result.pagination.pages);
      } else {
        console.log('Orders fetch failed:', result.error);
        // Don't show error toast for auth issues
        if (!result.error?.includes('token') && !result.error?.includes('auth')) {
          toast.error(result.error || 'Failed to fetch orders');
        }
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      // Don't show error toast for network issues
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found, skipping stats fetch');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/orders/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
      } else {
        console.log('Stats fetch failed:', result.error);
        // Don't show error toast for auth issues
        if (!result.error?.includes('token') && !result.error?.includes('auth')) {
          toast.error(result.error || 'Failed to fetch stats');
        }
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
      // Don't show error toast for network issues
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchOrders(), fetchStats(), fetchDeliveryGuys()]);
      setLoading(false);
    };
    
    loadData();

    // lightweight polling for live updates
    const poll = setInterval(() => {
      fetchOrders();
      fetchStats();
    }, 5000);

    return () => clearInterval(poll);
  }, [currentPage, filterStatus]);

  const assignToDeliveryGuy = async (orderId: string, deliveryGuyId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deliveryGuyId })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Order assigned to delivery guy successfully!');
        fetchOrders();
        fetchStats();
      } else {
        toast.error(result.error || 'Failed to assign order');
      }
    } catch (error) {
      console.error('Assign order error:', error);
      toast.error('Failed to assign order');
    }
  };

  const createDemoOrder = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/demo/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: 'Demo Customer',
          customerPhone: '+254700000000',
          deliveryAddress: 'Nairobi, Kenya',
          items: [
            { menuItemId: 'ribs-1', quantity: 1 },
            { menuItemId: 'soft-drinks-1', quantity: 2 }
          ]
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Demo order created successfully!');
        fetchOrders();
        fetchStats();
      } else {
        toast.error(result.error || 'Failed to create demo order');
      }
    } catch (error) {
      console.error('Create demo order error:', error);
      toast.error('Failed to create demo order');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Order status updated successfully');
        fetchOrders();
        fetchStats();
      } else {
        toast.error(result.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Update order status error:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'CONFIRMED': return 'text-blue-600 bg-blue-100';
      case 'PREPARING': return 'text-purple-600 bg-purple-100';
      case 'READY': return 'text-green-600 bg-green-100';
      case 'OUT_FOR_DELIVERY': return 'text-orange-600 bg-orange-100';
      case 'DELIVERED': return 'text-green-600 bg-green-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Export Functions
  const exportToCSV = () => {
    const headers = ['Order Number', 'Customer Name', 'Phone', 'Status', 'Total (KES)', 'Items', 'Date', 'Address'];
    const rows = filteredOrders.map(order => [
      order.orderNumber,
      order.customerName,
      order.customerPhone,
      order.status,
      order.total,
      order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join('; '),
      new Date(order.createdAt).toLocaleString(),
      order.deliveryAddress
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mondas_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully!');
  };

  const exportToExcel = () => {
    // For Excel, we'll create a CSV with Excel-compatible formatting
    const headers = ['Order Number', 'Customer Name', 'Phone', 'Status', 'Total (KES)', 'Items', 'Date', 'Address'];
    const rows = filteredOrders.map(order => [
      order.orderNumber,
      order.customerName,
      order.customerPhone,
      order.status,
      order.total,
      order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join('; '),
      new Date(order.createdAt).toLocaleString(),
      order.deliveryAddress
    ]);

    const csvContent = [
      headers.join('\t'),
      ...rows.map(row => row.map(cell => String(cell)).join('\t'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mondas_orders_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Excel file exported successfully!');
  };

  const exportToPDF = async () => {
    // Create a printable HTML report
    const reportHTML = `
      <html>
        <head>
          <title>Mondas Orders Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #dc2626; }
            h2 { color: #ea580c; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f97316; color: white; }
            .stats { display: flex; gap: 20px; margin: 20px 0; }
            .stat-box { border: 2px solid #dc2626; padding: 15px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>Mondas Snack Bar - Orders Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          
          ${stats ? `
          <h2>Summary Statistics</h2>
          <div class="stats">
            <div class="stat-box">
              <strong>Total Orders:</strong> ${stats.totalOrders}
            </div>
            <div class="stat-box">
              <strong>Pending:</strong> ${stats.pendingOrders}
            </div>
            <div class="stat-box">
              <strong>Delivered:</strong> ${stats.deliveredOrders}
            </div>
            <div class="stat-box">
              <strong>Total Revenue:</strong> KES ${stats.totalRevenue.toLocaleString('en-KE')}
            </div>
          </div>
          ` : ''}
          
          <h2>Orders List (${filteredOrders.length} orders)</h2>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Total (KES)</th>
                <th>Items</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(order => `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${order.customerName}</td>
                  <td>${order.customerPhone}</td>
                  <td>${order.status}</td>
                  <td>${order.total.toLocaleString('en-KE')}</td>
                  <td>${order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join(', ')}</td>
                  <td>${new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Open in new window for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        toast.success('PDF ready for download! Use Print > Save as PDF');
      }, 500);
    }
  };

  const exportToPNG = async () => {
    try {
      // Create a canvas with the stats visualization
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        toast.error('Failed to create image');
        return;
      }

      // Background
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 48px Arial';
      ctx.fillText('Mondas Snack Bar - Orders Dashboard', 50, 60);
      ctx.fillStyle = '#666';
      ctx.font = '24px Arial';
      ctx.fillText(new Date().toLocaleString(), 50, 100);

      // Stats
      if (stats) {
        let yPos = 180;
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText('Key Performance Indicators', 50, yPos);
        
        yPos += 60;
        const statsData = [
          ['Total Orders', stats.totalOrders],
          ['Pending Orders', stats.pendingOrders],
          ['Delivered Orders', stats.deliveredOrders],
          ['Total Revenue', `KES ${stats.totalRevenue.toLocaleString('en-KE')}`],
          ['Out for Delivery', stats.outForDeliveryOrders || 0]
        ];

        statsData.forEach(([label, value], index) => {
          const x = 50 + (index % 3) * 350;
          const y = yPos + Math.floor(index / 3) * 120;
          
          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 36px Arial';
          ctx.fillText(String(value), x, y);
          ctx.fillStyle = '#666';
          ctx.font = '18px Arial';
          ctx.fillText(label, x, y + 40);
        });
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `mondas_dashboard_${new Date().toISOString().split('T')[0]}.png`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success('PNG dashboard exported successfully!');
        }
      }, 'image/png');
    } catch (error) {
      console.error('PNG export error:', error);
      toast.error('Failed to export PNG');
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf' | 'png') => {
    if (filteredOrders.length === 0) {
      toast.error('No orders to export');
      return;
    }

    switch (format) {
      case 'csv':
        exportToCSV();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'png':
        exportToPNG();
        break;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesSearch = !searchTerm || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Dashboard</h1>
          <p className="text-gray-600">Manage and track all orders</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={createDemoOrder}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            Create Demo Order
          </button>
          <button
            onClick={() => {
              fetchOrders();
              fetchStats();
              toast.success('Orders refreshed!');
            }}
            className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl border-2 border-orange-600"
            title="Refresh Orders"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out for Delivery</p>
                <p className="text-2xl font-bold text-orange-600">{stats.outForDeliveryOrders}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">KES {stats.totalRevenue.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Export */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Export Buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-semibold text-gray-700">Export:</span>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={() => handleExport('png')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            PNG Dashboard
          </button>
          <span className="text-xs text-gray-500 ml-2">
            ({filteredOrders.length} orders)
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{order.items.length} items</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerPhone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    KES {order.total.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-orange-600 hover:text-orange-900 mr-3"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2 text-orange-500" />
                      Customer Information
                    </h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedOrder.customerName}</p>
                      <p><span className="font-medium">Phone:</span> {selectedOrder.customerPhone}</p>
                      <p><span className="font-medium">Email:</span> {selectedOrder.user.email}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                      Delivery Information
                    </h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Address:</span> {selectedOrder.deliveryAddress}</p>
                      {selectedOrder.deliveryNotes && (
                        <p><span className="font-medium">Notes:</span> {selectedOrder.deliveryNotes}</p>
                      )}
                      <p><span className="font-medium">Payment:</span> {selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-orange-500" />
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                          {item.menuItem.image ? (
                            <img
                              src={item.menuItem.image}
                              alt={item.menuItem.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-white font-bold">
                              {item.menuItem.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.menuItem.name}</h4>
                          <p className="text-sm text-gray-600">KES {item.menuItem.price.toLocaleString('en-KE')} × {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            KES {(item.menuItem.price * item.quantity).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Tracking */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-orange-500" />
                    Order Tracking
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.trackingHistory.map((tracking, index) => (
                      <div key={tracking.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tracking.status)}`}>
                              {tracking.status}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(tracking.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {tracking.notes && (
                            <p className="text-sm text-gray-600 mt-1">{tracking.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Update Order Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.slice(1).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateOrderStatus(selectedOrder.id, option.value)}
                        disabled={selectedOrder.status === option.value}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedOrder.status === option.value
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersDashboard;