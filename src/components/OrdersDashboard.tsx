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

interface OrdersDashboardProps { token?: string; variant?: 'default' | 'modal' }

const OrdersDashboard: React.FC<OrdersDashboardProps> = ({ token, variant = 'default' }) => {
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

  const resolveToken = () => token || localStorage.getItem('authToken');

  const fetchDeliveryGuys = async () => {
    try {
      const tk = resolveToken();
      if (!tk) return;
      
      const { createApiUrl } = await import('../config/api');
      const response = await fetch(createApiUrl('api/admin/users'), {
        headers: {
          'Authorization': `Bearer ${tk}`
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
      const tk = resolveToken();
      if (!tk) {
        // Silently skip if no token (user not logged in)
        return;
      }
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (filterStatus) {
        params.append('status', filterStatus);
      }

      const response = await fetch(`${createApiUrl('api/admin/orders')}?${params}`, {
        headers: {
          'Authorization': `Bearer ${tk}`
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
      const tk = resolveToken();
      if (!tk) {
        // Silently skip if no token (user not logged in)
        return;
      }
      
      const response = await fetch(createApiUrl('api/admin/orders/stats'), {
        headers: {
          'Authorization': `Bearer ${tk}`
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

    // lightweight polling for live updates (only if token exists)
    const poll = setInterval(() => {
      const tk = resolveToken();
      if (tk) {
        fetchOrders();
        fetchStats();
      }
    }, 5000);

    return () => clearInterval(poll);
  }, [currentPage, filterStatus]);

  const assignToDeliveryGuy = async (orderId: string, deliveryGuyId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(createApiUrl(`api/admin/orders/${orderId}/assign`), {
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
      // Randomize demo order items to create variety in pricing
      const menuItems = ['ribs-1', 'soft-drinks-1', 'burger-1', 'pizza-1', 'chicken-1'];
      const randomItems: Array<{ menuItemId: string; quantity: number }> = [];
      const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items
      
      for (let i = 0; i < itemCount; i++) {
        const randomItemId = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
        // Avoid duplicates
        if (!randomItems.find((item: any) => item.menuItemId === randomItemId)) {
          randomItems.push({ menuItemId: randomItemId, quantity });
        }
      }
      
      // Fallback if no items selected
      if (randomItems.length === 0) {
        randomItems.push({ menuItemId: 'ribs-1', quantity: 1 });
      }

      const response = await fetch(createApiUrl('api/demo/order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: `Demo Customer ${Math.floor(Math.random() * 1000)}`,
          customerPhone: `+2547${Math.floor(Math.random() * 100000000)}`,
          deliveryAddress: 'Nairobi, Kenya',
          items: randomItems
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
      const response = await fetch(createApiUrl(`api/admin/orders/${orderId}/status`), {
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
            body { font-family: Arial, sans-serif; padding: 0; margin: 0; }
            .header { height: 90px; background: linear-gradient(90deg, #7f1d1d, #991b1b, #ea580c); color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; }
            .header .title { font-weight: 800; font-size: 26px; }
            .container { padding: 24px; }
            h2 { color: #111827; margin-top: 24px; font-size: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #fef3c7; color: #111827; }
            .stats { display: flex; gap: 12px; margin: 16px 0; flex-wrap: wrap; }
            .stat-box { border: 1px solid #f59e0b; background: #fff7ed; padding: 12px 14px; border-radius: 8px; font-size: 12px; }
            .kpi-label { color: #6b7280; font-weight: 600; }
            .kpi-value { color: #111827; font-weight: 800; font-size: 16px; }
            .brand { opacity: .25; position: absolute; right: 16px; top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">MONDAS Orders Report</div>
            <div>${new Date().toLocaleString()}</div>
          </div>
          <div class="container">
          
          ${stats ? `
          <h2>Summary Statistics</h2>
          <div class="stats">
            <div class="stat-box">
              <span class="kpi-label">Total Orders:</span> <span class="kpi-value">${stats.totalOrders}</span>
            </div>
            <div class="stat-box">
              <span class="kpi-label">Pending:</span> <span class="kpi-value">${stats.pendingOrders}</span>
            </div>
            <div class="stat-box">
              <span class="kpi-label">Delivered:</span> <span class="kpi-value">${stats.deliveredOrders}</span>
            </div>
            <div class="stat-box">
              <span class="kpi-label">Total Revenue:</span> <span class="kpi-value">KES ${stats.totalRevenue.toLocaleString('en-KE')}</span>
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
          </div>
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
      // Ensure Plotly is available
      const ensurePlotly = async (): Promise<any> => {
        const w = window as any;
        if (w.Plotly) return w.Plotly;
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.plot.ly/plotly-2.26.0.min.js';
          s.onload = () => resolve();
          s.onerror = () => resolve();
          document.head.appendChild(s);
        });
        return (window as any).Plotly;
      };

      const Plotly = await ensurePlotly();

      // Create a canvas with branded report and charts
      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 900;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        toast.error('Failed to create image');
        return;
      }

      // Background gradient header
      const headerHeight = 120;
      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, '#7f1d1d');
      grad.addColorStop(0.5, '#991b1b');
      grad.addColorStop(1, '#ea580c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, headerHeight);
      // Body background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, headerHeight, canvas.width, canvas.height - headerHeight);

      // Title + branding
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 44px Arial';
      ctx.fillText('MONDAS Orders Report', 40, 75);
      ctx.font = '600 18px Arial';
      ctx.fillText(new Date().toLocaleString(), 1050, 85);

      // Logo (best-effort)
      try {
        const logo = new Image();
        logo.src = '/src/assets/b75535c69f22b26f18a7d3210cd25415150770f2.png';
        await new Promise((res) => { logo.onload = () => res(null); logo.onerror = () => res(null); });
        ctx.globalAlpha = 0.25;
        ctx.drawImage(logo, canvas.width - 220, 10, 180, 100);
        ctx.globalAlpha = 1;
      } catch {}

      // KPI boxes
      let chartsTop = headerHeight + 200;
      if (stats) {
        const aov = orders.length ? Math.round((stats.totalRevenue || 0) / Math.max(1, orders.length)) : 0;
        const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
        const kpis = [
          { label: 'Total Orders', value: String(stats.totalOrders) },
          { label: 'Pending', value: String(stats.pendingOrders) },
          { label: 'Out for Delivery', value: String(stats.outForDeliveryOrders || 0) },
          { label: 'Delivered', value: String(stats.deliveredOrders) },
          { label: 'Total Revenue', value: `KES ${stats.totalRevenue.toLocaleString('en-KE')}` },
          { label: 'Avg Order Value', value: `KES ${aov.toLocaleString('en-KE')}` },
          { label: 'Cancelled', value: String(cancelled) },
        ];
        const startY = headerHeight + 20;
        const startX = 40;
        const boxW = 260;
        const boxH = 90;
        kpis.forEach((kpi, i) => {
          const x = startX + (i % 3) * (boxW + 20);
          const y = startY + Math.floor(i / 3) * (boxH + 20);
          ctx.fillStyle = '#fef3c7';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.fillRect(x, y, boxW, boxH);
          ctx.strokeRect(x, y, boxW, boxH);
          ctx.fillStyle = '#6b7280';
          ctx.font = '600 16px Arial';
          ctx.fillText(kpi.label, x + 14, y + 28);
          ctx.fillStyle = '#111827';
          ctx.font = '800 28px Arial';
          ctx.fillText(kpi.value, x + 14, y + 64);
        });
        const rows = Math.ceil(kpis.length / 3);
        chartsTop = startY + rows * (boxH + 20) + 30;
      }

      // Prepare data for charts
      const statusCounts = ['PENDING','CONFIRMED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED']
        .map(s => ({ s, c: orders.filter(o => o.status === s).length }));
      const byDayMap = new Map<string, number>();
      orders.forEach(o => {
        const d = new Date(o.createdAt);
        const key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
        byDayMap.set(key, (byDayMap.get(key) || 0) + 1);
      });
      const byDay = Array.from(byDayMap.entries()).sort((a,b) => a[0] < b[0] ? -1 : 1);

      // Bar chart: status distribution
      const chart1X = 40, chart1Y = chartsTop, chart1W = 640, chart1H = 300;
      const chart2X = 740, chart2Y = chartsTop, chart2W = 620, chart2H = 300;

      // Prefer Apache ECharts if available for crisp export; fallback to Plotly
      const ensureECharts = async (): Promise<any> => {
        const w = window as any;
        if (w.echarts) return w.echarts;
        await new Promise<void>((resolve) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js';
          s.onload = () => resolve();
          s.onerror = () => resolve();
          document.head.appendChild(s);
        });
        return (window as any).echarts;
      };

      const echartsLib = await ensureECharts();

      if (echartsLib) {
        const d1 = document.createElement('div');
        const d2 = document.createElement('div');
        d1.style.cssText = `position:fixed;left:-9999px;top:-9999px;width:${chart1W}px;height:${chart1H}px;background:#fff;`;
        d2.style.cssText = `position:fixed;left:-9999px;top:-9999px;width:${chart2W}px;height:${chart2H}px;background:#fff;`;
        document.body.appendChild(d1); document.body.appendChild(d2);
        const c1 = echartsLib.init(d1, undefined, { renderer: 'canvas' });
        c1.setOption({ animation: false, grid:{left:40,right:10,top:30,bottom:60}, xAxis:{type:'category',data:statusCounts.map(s=>s.s.replace(/_/g,' ')),axisLabel:{rotate:25}}, yAxis:{type:'value'}, series:[{type:'bar', data:statusCounts.map(s=>s.c), itemStyle:{color:'#10b981'}}] });
        const c2 = echartsLib.init(d2, undefined, { renderer: 'canvas' });
        c2.setOption({ animation: false, grid:{left:50,right:10,top:30,bottom:60}, xAxis:{type:'category',data:byDay.map(d=>d[0])}, yAxis:{type:'value'}, series:[{type:'line', data:byDay.map(d=>d[1]), lineStyle:{color:'#ef4444',width:3}, itemStyle:{color:'#f59e0b'}}] });
        await new Promise(res => setTimeout(res, 120));
        const url1 = c1.getDataURL({ pixelRatio: 3, backgroundColor: '#ffffff' });
        const url2 = c2.getDataURL({ pixelRatio: 3, backgroundColor: '#ffffff' });
        const i1 = new Image(); const i2 = new Image();
        await new Promise<void>(res=>{let c=0;i1.onload=()=>{if(++c===2)res();};i2.onload=()=>{if(++c===2)res();}; i1.src=url1; i2.src=url2;});
        ctx.fillStyle = '#111827'; ctx.font = '700 20px Arial'; ctx.fillText('Orders by Status', chart1X, chart1Y - 12);
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 2; ctx.fillRect(chart1X-10, chart1Y-10, chart1W+20, chart1H+20); ctx.strokeRect(chart1X-10, chart1Y-10, chart1W+20, chart1H+20);
        ctx.drawImage(i1, chart1X, chart1Y);
        ctx.fillStyle = '#111827'; ctx.font = '700 20px Arial'; ctx.fillText('Orders Over Time', chart2X, chart2Y - 12);
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 2; ctx.fillRect(chart2X-10, chart2Y-10, chart2W+20, chart2H+20); ctx.strokeRect(chart2X-10, chart2Y-10, chart2W+20, chart2H+20);
        ctx.drawImage(i2, chart2X, chart2Y);
        c1.dispose(); c2.dispose(); document.body.removeChild(d1); document.body.removeChild(d2);
      } else if (Plotly) {
        const temp1 = document.createElement('div');
        const temp2 = document.createElement('div');
        temp1.style.position = 'fixed'; temp1.style.left = '-9999px';
        temp2.style.position = 'fixed'; temp2.style.left = '-9999px';
        document.body.appendChild(temp1); document.body.appendChild(temp2);

        const barData = [{
          x: statusCounts.map(s => s.s.replace(/_/g,' ')),
          y: statusCounts.map(s => s.c),
          type: 'bar', marker: { color: ['#ef4444','#f59e0b','#f59e0b','#ef4444','#f59e0b','#10b981','#ef4444'] }
        }];
        const lineData = [{
          x: byDay.map(d => d[0]), y: byDay.map(d => d[1]), type: 'scatter', mode: 'lines+markers',
          line: { color: '#ef4444', width: 3 }, marker: { color: '#f59e0b' }
        }];
        await Plotly.newPlot(temp1, barData, { width: chart1W, height: chart1H, margin: { l: 40, r: 10, t: 20, b: 60 }, paper_bgcolor: '#ffffff', plot_bgcolor: '#ffffff' }, { displayModeBar: false });
        await Plotly.newPlot(temp2, lineData, { width: chart2W, height: chart2H, margin: { l: 50, r: 10, t: 20, b: 60 }, paper_bgcolor: '#ffffff', plot_bgcolor: '#ffffff' }, { displayModeBar: false });
        const img1 = await Plotly.toImage(temp1, { format: 'png', width: chart1W, height: chart1H });
        const img2 = await Plotly.toImage(temp2, { format: 'png', width: chart2W, height: chart2H });
        const imgEl1 = new Image(); const imgEl2 = new Image();
        await new Promise<void>(res => { let c=0; imgEl1.onload=() => { if(++c===2) res(); }; imgEl2.onload=() => { if(++c===2) res(); }; imgEl1.src = img1; imgEl2.src = img2; });
        ctx.fillStyle = '#111827'; ctx.font = '700 20px Arial'; ctx.fillText('Orders by Status', chart1X, chart1Y - 12);
        // Chart frames
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.fillRect(chart1X-10, chart1Y-10, chart1W+20, chart1H+20);
        ctx.strokeRect(chart1X-10, chart1Y-10, chart1W+20, chart1H+20);
        ctx.drawImage(imgEl1, chart1X, chart1Y);
        ctx.fillText('Orders Over Time', chart2X, chart2Y - 12);
        ctx.fillRect(chart2X-10, chart2Y-10, chart2W+20, chart2H+20);
        ctx.strokeRect(chart2X-10, chart2Y-10, chart2W+20, chart2H+20);
        ctx.drawImage(imgEl2, chart2X, chart2Y);
        document.body.removeChild(temp1); document.body.removeChild(temp2);
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `mondas_orders_report_${new Date().toISOString().split('T')[0]}.png`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success('PNG report exported successfully!');
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

  // Filter orders on the client side as well (in case backend doesn't filter properly)
  // But prioritize using filtered orders from backend
  const filteredOrders = orders.filter(order => {
    // If filterStatus is set, only show orders matching that status
    const matchesStatus = !filterStatus || order.status.toUpperCase() === filterStatus.toUpperCase();
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
    <div className="space-y-6" style={{ minHeight: 'auto' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders Dashboard</h1>
          <p className="text-white">Manage and track all orders</p>
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
      <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-lg p-6 border-2 border-white/50">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 border-2 border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none font-medium shadow-sm transition-all"
                style={{ paddingLeft: '4rem' }}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none font-medium shadow-sm"
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
            className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm shadow border"
            style={{ backgroundColor: '#6d28d9', color: '#ffffff', borderColor: '#4c1d95' }}
          >
            <Download className="w-4 h-4" />
            PNG
          </button>
          <span className="text-xs text-gray-500 ml-2">
            ({filteredOrders.length} orders)
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: 'none' }}>
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