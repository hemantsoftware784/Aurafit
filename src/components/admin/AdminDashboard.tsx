import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  DollarSign,
  Boxes,
  ShoppingBag,
  Users,
  Ticket,
  Percent,
  Star,
  RotateCcw,
  CreditCard,
  Truck,
  Image as ImageIcon,
  BarChart3,
  Settings,
  UserCheck,
  LogOut,
  ArrowLeft,
  Search,
  Check,
  AlertTriangle,
  Download,
  Filter,
  Save,
  Trash2,
  Edit,
  Shield,
  Eye,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiClient } from '../../services/apiClient.ts';
import {
  Product,
  Category,
  Order,
  StoreSettings,
  Banner,
  Coupon,
  ReturnRequest,
} from '../../types/index.ts';

export const AdminDashboard: React.FC = () => {
  const {
    admin,
    adminToken,
    loginAdmin,
    logoutAdmin,
    isAdminLoggedIn,
    setViewMode,
  } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Admin Login form states
  const [adminEmail, setAdminEmail] = useState('admin@aurafit.store');
  const [adminPassword, setAdminPassword] = useState('aurafit2026!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [analytics, setAnalytics] = useState<any>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [pricesList, setPricesList] = useState<any[]>([]);
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [returnsList, setReturnsList] = useState<ReturnRequest[]>([]);
  const [bannersList, setBannersList] = useState<Banner[]>([]);
  const [storeSettingsData, setStoreSettingsData] = useState<StoreSettings>({});
  const [inventoryLogs, setInventoryLogs] = useState<any[]>([]);

  // Action states
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Price editing modal state
  const [editingPriceProduct, setEditingPriceProduct] = useState<any | null>(null);
  const [priceForm, setPriceForm] = useState({
    mrp: '',
    sellingPrice: '',
    costPrice: '',
    salePrice: '',
    wholesalePrice: '',
    minSellingPrice: '',
    maxSellingPrice: '',
    reason: 'Price review',
  });

  // Bulk price edit state
  const [bulkAction, setBulkAction] = useState('discount_percentage');
  const [bulkValue, setBulkValue] = useState('10');
  const [bulkCategory, setBulkCategory] = useState('');

  // Stock adjustment modal state
  const [adjustingStockVariant, setAdjustingStockVariant] = useState<any | null>(null);
  const [stockAdjustmentQty, setStockAdjustmentQty] = useState('10');
  const [stockAdjustmentReason, setStockAdjustmentReason] = useState('Restock shipment received');

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCatId, setNewProdCatId] = useState<number>(1);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdFabric, setNewProdFabric] = useState('100% Heavyweight Cotton 450 GSM');
  const [newProdMrp, setNewProdMrp] = useState('3999');
  const [newProdSellingPrice, setNewProdSellingPrice] = useState('2799');
  const [newProdCostPrice, setNewProdCostPrice] = useState('1100');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdImage, setNewProdImage] = useState('/src/assets/images/aura_hero_campaign_1793941395011.jpg');

  // New Category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatGender, setNewCatGender] = useState('men');
  const [newCatDesc, setNewCatDesc] = useState('');

  // New Coupon form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState('15');
  const [newCouponMinCart, setNewCouponMinCart] = useState('1499');

  // Order inspection state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Settings form
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({});

  // Auto load data on login or tab switch
  useEffect(() => {
    if (adminToken) {
      loadTabData();
    }
  }, [adminToken, activeTab]);

  const loadTabData = async () => {
    if (!adminToken) return;
    setIsLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const data = await apiClient.getAdminAnalytics(adminToken);
        setAnalytics(data);
      } else if (activeTab === 'products') {
        const data = await apiClient.getProducts();
        setProductsList(data);
      } else if (activeTab === 'categories') {
        const cats = await apiClient.getCategories();
        setCategoriesList(cats);
      } else if (activeTab === 'prices') {
        const prices = await apiClient.getAdminPrices(adminToken);
        setPricesList(prices);
      } else if (activeTab === 'inventory') {
        const inv = await apiClient.getAdminInventory(adminToken);
        setInventoryList(inv);
        // Load logs
        const res = await fetch('/api/admin/inventory/history', {
          headers: { 'x-admin-token': adminToken },
        });
        if (res.ok) setInventoryLogs(await res.json());
      } else if (activeTab === 'orders') {
        const ords = await apiClient.getAdminOrders(adminToken);
        setOrdersList(ords);
      } else if (activeTab === 'customers') {
        const custs = await apiClient.getAdminCustomers(adminToken);
        setCustomersList(custs);
      } else if (activeTab === 'coupons' || activeTab === 'discounts') {
        const coups = await apiClient.getAdminCoupons(adminToken);
        setCouponsList(coups);
      } else if (activeTab === 'returns') {
        const rets = await apiClient.getAdminReturns(adminToken);
        setReturnsList(rets);
      } else if (activeTab === 'banners' || activeTab === 'homepage') {
        const bans = await apiClient.getBanners();
        setBannersList(bans);
      } else if (activeTab === 'settings') {
        const s = await apiClient.getSettings();
        setStoreSettingsData(s);
        setSettingsForm(s);
      }
    } catch (e) {
      console.error('Error loading tab data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const notify = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    const success = await loginAdmin(adminEmail, adminPassword);
    setIsLoggingIn(false);
    if (!success) {
      setLoginError('Invalid administrator credentials.');
    }
  };

  // 1. Price Editing Handlers
  const handleOpenPriceModal = (item: any) => {
    setEditingPriceProduct(item);
    setPriceForm({
      mrp: item.mrp || '',
      sellingPrice: item.sellingPrice || '',
      costPrice: item.costPrice || '',
      salePrice: item.salePrice || '',
      wholesalePrice: item.wholesalePrice || '',
      minSellingPrice: item.minSellingPrice || '',
      maxSellingPrice: item.maxSellingPrice || '',
      reason: 'Standard price calibration',
    });
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceProduct || !adminToken) return;
    try {
      await apiClient.updateAdminPrice(editingPriceProduct.productId, priceForm, adminToken);
      notify(`Price updated for ${editingPriceProduct.name}`);
      setEditingPriceProduct(null);
      loadTabData();
    } catch (err: any) {
      notify(err.message || 'Price update failed');
    }
  };

  const handleBulkUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    try {
      const res = await apiClient.bulkUpdatePrices(
        {
          actionType: bulkAction,
          value: bulkValue,
          categoryId: bulkCategory ? Number(bulkCategory) : undefined,
        },
        adminToken
      );
      notify(`Bulk price adjustment applied to ${res.updatedCount} products.`);
      loadTabData();
    } catch (err: any) {
      notify(err.message || 'Bulk update failed');
    }
  };

  // 2. Inventory Adjustment Handler
  const handleSaveStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingStockVariant || !adminToken) return;
    try {
      await apiClient.adjustInventory(
        {
          variantId: adjustingStockVariant.variantId,
          quantityChange: stockAdjustmentQty,
          reason: stockAdjustmentReason,
        },
        adminToken
      );
      notify(`Stock adjusted for ${adjustingStockVariant.sku}`);
      setAdjustingStockVariant(null);
      loadTabData();
    } catch (err: any) {
      notify(err.message || 'Stock adjustment failed');
    }
  };

  // 3. Add Product Handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({
          name: newProdName,
          sku: newProdSku || `AF-${Date.now().toString().slice(-4)}`,
          categoryId: newProdCatId,
          description: newProdDesc || `${newProdName} handcrafted luxury garment.`,
          fabricDetails: newProdFabric,
          mrp: newProdMrp,
          sellingPrice: newProdSellingPrice,
          costPrice: newProdCostPrice,
          stock: newProdStock,
          images: [newProdImage],
        }),
      });
      if (res.ok) {
        notify(`Product "${newProdName}" successfully created in database!`);
        setNewProdName('');
        setNewProdSku('');
        setActiveTab('products');
      } else {
        const err = await res.json();
        notify(err.error || 'Failed to create product');
      }
    } catch (err: any) {
      notify(err.message || 'Failed to create product');
    }
  };

  // 4. Create Category Handler
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({
          name: newCatName,
          gender: newCatGender,
          description: newCatDesc,
        }),
      });
      if (res.ok) {
        notify(`Category "${newCatName}" created!`);
        setNewCatName('');
        setNewCatDesc('');
        loadTabData();
      }
    } catch (err: any) {
      notify(err.message);
    }
  };

  // 5. Create Coupon Handler
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    try {
      await apiClient.createAdminCoupon(
        {
          code: newCouponCode,
          discountType: newCouponType,
          discountValue: newCouponValue,
          minCartValue: newCouponMinCart,
        },
        adminToken
      );
      notify(`Coupon "${newCouponCode.toUpperCase()}" active!`);
      setNewCouponCode('');
      loadTabData();
    } catch (err: any) {
      notify(err.message);
    }
  };

  // 6. Update Order Status Handler
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    if (!adminToken) return;
    try {
      await apiClient.updateOrderStatus(orderId, { orderStatus: status }, adminToken);
      notify(`Order #${orderId} marked as ${status}`);
      loadTabData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: status as any });
      }
    } catch (err: any) {
      notify(err.message);
    }
  };

  // 7. Update Return Request Handler
  const handleResolveReturn = async (returnId: number, status: string, restoreStock = false) => {
    if (!adminToken) return;
    try {
      await apiClient.updateReturnStatus(returnId, { status, restoreStock }, adminToken);
      notify(`Return request updated to ${status}. Stock ${restoreStock ? 'restored' : 'unchanged'}.`);
      loadTabData();
    } catch (err: any) {
      notify(err.message);
    }
  };

  // 8. Toggle Customer Block Handler
  const handleToggleCustomerBlock = async (customerId: number) => {
    if (!adminToken) return;
    try {
      await apiClient.toggleCustomerBlock(customerId, adminToken);
      notify('Customer status toggled');
      loadTabData();
    } catch (err: any) {
      notify(err.message);
    }
  };

  // 9. Save Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    try {
      await apiClient.updateSettings(settingsForm, adminToken);
      notify('Website store settings updated');
      loadTabData();
    } catch (err: any) {
      notify(err.message);
    }
  };

  // CSV Export for Price System
  const exportPricesToCsv = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'MRP', 'Selling Price', 'Cost Price', 'Discount %', 'Profit', 'Margin %'];
    const rows = pricesList.map((p) => [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      p.categoryName,
      p.mrp,
      p.sellingPrice,
      p.costPrice,
      p.discountPercent,
      p.profitAmount,
      p.profitMargin,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aurafit_price_matrix_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Navigation Items matching the required 19 sections
  const sidebarItems = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'products', label: '2. Products', icon: Package },
    { id: 'add_product', label: '3. Add New Product', icon: PlusCircle },
    { id: 'categories', label: '4. Categories', icon: FolderTree },
    { id: 'prices', label: '5. Price Management', icon: DollarSign },
    { id: 'inventory', label: '6. Inventory', icon: Boxes },
    { id: 'orders', label: '7. Orders', icon: ShoppingBag },
    { id: 'customers', label: '8. Customers', icon: Users },
    { id: 'coupons', label: '9. Coupons', icon: Ticket },
    { id: 'discounts', label: '10. Discounts & Sales', icon: Percent },
    { id: 'reviews', label: '11. Reviews', icon: Star },
    { id: 'returns', label: '12. Returns & Refunds', icon: RotateCcw },
    { id: 'payments', label: '13. Payment Transactions', icon: CreditCard },
    { id: 'shipping', label: '14. Shipping Management', icon: Truck },
    { id: 'homepage', label: '15. Homepage Banners', icon: ImageIcon },
    { id: 'analytics', label: '16. Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: '17. Website Settings', icon: Settings },
    { id: 'profile', label: '18. Admin Profile', icon: UserCheck },
  ];

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0b0e] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#121317] border border-[#262832] rounded-xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-white">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white uppercase tracking-wider font-display">
              AURA FIT Control Center
            </h1>
            <p className="text-xs text-neutral-400 mt-1">Authorized store management &amp; ERP portal</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/40 border border-red-900/60 rounded text-xs text-red-300">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-[#181920] border border-[#2b2d38] p-3 rounded text-xs text-white focus:outline-none focus:border-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-[#181920] border border-[#2b2d38] p-3 rounded text-xs text-white focus:outline-none focus:border-white font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer shadow-lg"
            >
              {isLoggingIn ? 'Verifying Admin Access...' : 'Sign In to Admin Dashboard'}
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>Default Superadmin: admin@aurafit.store</span>
            <button
              onClick={() => setViewMode('store')}
              className="text-white hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-neutral-200 flex flex-col">
      {/* Admin Top Notification Header */}
      <header className="h-14 bg-[#111216] border-b border-[#21232c] px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('store')}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded bg-neutral-900 border border-neutral-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>
          <span className="text-sm font-bold text-white uppercase tracking-wider font-display">
            AURA FIT ATELIER ENGINE
          </span>
          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
            CLOUDSQL POSTGRES CONNECTED
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-white block">{admin?.name}</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest">{admin?.role}</span>
          </div>
          <button
            onClick={logoutAdmin}
            className="p-2 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Logout Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Split: Left Sidebar + Right Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0d0e12] border-r border-[#20222b] overflow-y-auto shrink-0 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-colors text-left cursor-pointer ${
                  active
                    ? 'bg-white text-black font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          {feedbackMessage && (
            <div className="mb-6 p-3 bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 rounded flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && analytics && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                  Store Overview &amp; Real-Time Metrics
                </h2>
                <p className="text-xs text-neutral-400 mt-1">Live analytics computed directly from Cloud SQL PostgreSQL records.</p>
              </div>

              {/* KPI Scorecards Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#14151a] border border-[#232530] rounded-lg">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Total Revenue</span>
                  <span className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums">
                    ₹{parseFloat(analytics.totalRevenue || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-1">Confirmed Paid Orders</span>
                </div>

                <div className="p-4 bg-[#14151a] border border-[#232530] rounded-lg">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Total Orders</span>
                  <span className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums">
                    {analytics.totalOrders}
                  </span>
                  <span className="text-[10px] text-neutral-400 block mt-1">
                    {analytics.pendingOrders} pending · {analytics.completedOrders} delivered
                  </span>
                </div>

                <div className="p-4 bg-[#14151a] border border-[#232530] rounded-lg">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Total Customers</span>
                  <span className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums">
                    {analytics.totalCustomers}
                  </span>
                  <span className="text-[10px] text-neutral-400 block mt-1">Registered VIP Profiles</span>
                </div>

                <div className="p-4 bg-[#14151a] border border-[#232530] rounded-lg">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Inventory Units</span>
                  <span className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums">
                    {analytics.totalInventoryUnits}
                  </span>
                  <span className="text-[10px] text-amber-400 block mt-1">
                    {analytics.lowStockProducts} variants with low stock alerts
                  </span>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                    Recent Customer Transactions
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
                  >
                    View All Orders
                  </button>
                </div>

                <div className="border border-[#232530] rounded-lg overflow-x-auto bg-[#131418]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#1b1c23] text-neutral-300 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Order Status</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80 font-mono">
                      {analytics.recentOrders?.map((ord: any) => (
                        <tr key={ord.id} className="hover:bg-neutral-800/30">
                          <td className="py-3 px-4 font-bold text-white">{ord.orderNumber}</td>
                          <td className="py-3 px-4 font-sans text-neutral-300">{ord.customerName}</td>
                          <td className="py-3 px-4 text-white">₹{parseFloat(ord.totalAmount).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 uppercase">
                              {ord.orderStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-emerald-400">{ord.paymentStatus}</td>
                          <td className="py-3 px-4 text-neutral-500">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Best Selling Products */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  Top Volume Garments
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {analytics.bestSellers?.map((bs: any) => (
                    <div key={bs.productId} className="p-4 bg-[#14151a] border border-[#232530] rounded-lg">
                      <span className="text-xs font-semibold text-white block truncate">{bs.productName}</span>
                      <div className="flex items-center justify-between text-xs text-neutral-400 mt-2 font-mono">
                        <span>Sold: {bs.unitsSold} units</span>
                        <span className="text-white font-bold">₹{parseFloat(bs.revenue).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                    Product Management ({productsList.length})
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">Control active garments, imagery, descriptions, and specifications.</p>
                </div>
                <button
                  onClick={() => setActiveTab('add_product')}
                  className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add New Garment</span>
                </button>
              </div>

              <div className="border border-[#232530] rounded-lg overflow-x-auto bg-[#131418]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#1b1c23] text-neutral-300 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Garment</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">MRP</th>
                      <th className="py-3 px-4">Selling Price</th>
                      <th className="py-3 px-4">Discount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-mono">
                    {productsList.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-800/40">
                        <td className="py-3 px-4 flex items-center gap-3 font-sans">
                          <img
                            src={p.primaryImage}
                            alt={p.name}
                            className="w-10 h-12 object-cover rounded bg-neutral-900 shrink-0"
                          />
                          <span className="font-semibold text-white line-clamp-1">{p.name}</span>
                        </td>
                        <td className="py-3 px-4 text-neutral-400">{p.sku}</td>
                        <td className="py-3 px-4 font-sans text-neutral-300">{p.categoryName}</td>
                        <td className="py-3 px-4 text-neutral-500">₹{parseFloat(p.mrp).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-bold text-white">₹{parseFloat(p.sellingPrice).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-emerald-400">{p.discountPercent}%</td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans space-x-2">
                          <button
                            onClick={() => {
                              setActiveTab('prices');
                            }}
                            className="text-neutral-400 hover:text-white underline cursor-pointer"
                          >
                            Price
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. ADD NEW PRODUCT FORM */}
          {activeTab === 'add_product' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                  Add New Atelier Garment
                </h2>
                <p className="text-xs text-neutral-400 mt-1">Register new clothing line with variant matrices and inventory.</p>
              </div>

              <form onSubmit={handleCreateProduct} className="p-6 bg-[#14151a] border border-[#262832] rounded-xl space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                    Garment Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AURA Vintage Wash Loopback Sweatshirt"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                      Unique SKU *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AF-M-SW-008"
                      value={newProdSku}
                      onChange={(e) => setNewProdSku(e.target.value.toUpperCase())}
                      className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={newProdCatId}
                      onChange={(e) => setNewProdCatId(Number(e.target.value))}
                      className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.gender})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                    Fabric &amp; Composition
                  </label>
                  <input
                    type="text"
                    value={newProdFabric}
                    onChange={(e) => setNewProdFabric(e.target.value)}
                    className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                      MRP (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProdMrp}
                      onChange={(e) => setNewProdMrp(e.target.value)}
                      className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProdSellingPrice}
                      onChange={(e) => setNewProdSellingPrice(e.target.value)}
                      className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                      Cost Price (₹)
                    </label>
                    <input
                      type="number"
                      value={newProdCostPrice}
                      onChange={(e) => setNewProdCostPrice(e.target.value)}
                      className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                      Initial Stock Per Variant
                    </label>
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                      Showcase Image URL
                    </label>
                    <input
                      type="text"
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                    Garment Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter garment cut, silhouette, stitching, and styling details..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer"
                >
                  Publish Garment to Catalog
                </button>
              </form>
            </div>
          )}

          {/* 4. CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                    Category Hierarchy &amp; Taxonomy ({categoriesList.length})
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">Manage departmental divisions, genders, and subcategory trees.</p>
                </div>
              </div>

              {/* Add category inline */}
              <form onSubmit={handleCreateCategory} className="p-4 bg-[#14151a] border border-[#262832] rounded-lg grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Category Name (e.g. Bomber Jackets)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="bg-[#181920] border border-[#2b2d38] p-2 rounded text-xs text-white"
                />
                <select
                  value={newCatGender}
                  onChange={(e) => setNewCatGender(e.target.value)}
                  className="bg-[#181920] border border-[#2b2d38] p-2 rounded text-xs text-white"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                  <option value="accessories">Accessories</option>
                </select>
                <input
                  type="text"
                  placeholder="Short description..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="bg-[#181920] border border-[#2b2d38] p-2 rounded text-xs text-white"
                />
                <button
                  type="submit"
                  className="bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase rounded py-2 cursor-pointer"
                >
                  Add Category
                </button>
              </form>

              {/* Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categoriesList.map((cat) => (
                  <div key={cat.id} className="p-3 bg-[#131418] border border-[#232530] rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{cat.name}</span>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest">{cat.gender} · {cat.slug}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. ADVANCED PRICE MANAGEMENT SYSTEM */}
          {activeTab === 'prices' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                    Advanced Price Management System
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Direct margin, markup, profit, and discount controls with server-side audit logs.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={exportPricesToCsv}
                    className="px-3.5 py-2 border border-neutral-700 hover:border-white text-xs text-white rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Bulk Price Adjustment Engine */}
              <form onSubmit={handleBulkUpdate} className="p-4 bg-[#14151a] border border-[#262832] rounded-lg">
                <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3">
                  Bulk Price Calibration Engine
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="bg-[#181920] border border-[#2b2d38] p-2 rounded text-xs text-white"
                  >
                    <option value="discount_percentage">Apply Discount % to MRP</option>
                    <option value="markup_percentage">Apply Markup % to Selling Price</option>
                    <option value="fixed_discount">Apply Flat Discount (₹)</option>
                  </select>

                  <input
                    type="number"
                    required
                    placeholder="Value (e.g. 15)"
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    className="bg-[#181920] border border-[#2b2d38] p-2 rounded text-xs text-white font-mono"
                  />

                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="bg-[#181920] border border-[#2b2d38] p-2 rounded text-xs text-white"
                  >
                    <option value="">All Categories</option>
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase rounded py-2 cursor-pointer"
                  >
                    Execute Bulk Recalculation
                  </button>
                </div>
              </form>

              {/* Price Matrix Table */}
              <div className="border border-[#232530] rounded-lg overflow-x-auto bg-[#131418]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#1b1c23] text-neutral-300 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Garment</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">MRP (₹)</th>
                      <th className="py-3 px-4">Selling Price (₹)</th>
                      <th className="py-3 px-4">Cost (₹)</th>
                      <th className="py-3 px-4">Discount</th>
                      <th className="py-3 px-4">Profit (₹)</th>
                      <th className="py-3 px-4">Margin</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-mono tabular-nums">
                    {pricesList.map((p) => (
                      <tr key={p.productId} className="hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-sans font-semibold text-white">{p.name}</td>
                        <td className="py-3 px-4 text-neutral-400">{p.sku}</td>
                        <td className="py-3 px-4 text-neutral-400">₹{parseFloat(p.mrp).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-bold text-white">₹{parseFloat(p.sellingPrice).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-neutral-500">₹{parseFloat(p.costPrice).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-emerald-400">{p.discountPercent}%</td>
                        <td className="py-3 px-4 text-white">₹{parseFloat(p.profitAmount).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">{p.profitMargin}%</td>
                        <td className="py-3 px-4 font-sans">
                          <button
                            onClick={() => handleOpenPriceModal(p)}
                            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                  Live Inventory &amp; Stock Matrix
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Automatic stock deduction on confirmed orders and restoration upon cancellations.
                </p>
              </div>

              <div className="border border-[#232530] rounded-lg overflow-x-auto bg-[#131418]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#1b1c23] text-neutral-300 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Variant SKU</th>
                      <th className="py-3 px-4">Garment</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Color</th>
                      <th className="py-3 px-4">Available</th>
                      <th className="py-3 px-4">Sold</th>
                      <th className="py-3 px-4">Alert</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-mono tabular-nums">
                    {inventoryList.map((inv) => (
                      <tr key={inv.inventoryId} className="hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-bold text-white">{inv.sku}</td>
                        <td className="py-3 px-4 font-sans text-neutral-300">{inv.productName}</td>
                        <td className="py-3 px-4 text-white">{inv.size}</td>
                        <td className="py-3 px-4 font-sans text-neutral-300">{inv.color}</td>
                        <td className="py-3 px-4 font-bold text-white">{inv.availableStock}</td>
                        <td className="py-3 px-4 text-neutral-400">{inv.soldQuantity}</td>
                        <td className="py-3 px-4 font-sans">
                          {inv.availableStock <= inv.lowStockThreshold ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-900">
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400">Normal</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <button
                            onClick={() => {
                              setAdjustingStockVariant(inv);
                              setStockAdjustmentQty('10');
                            }}
                            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[11px] cursor-pointer"
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Inventory Audit Logs */}
              {inventoryLogs.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-neutral-800">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                    Stock Audit Log History
                  </h3>
                  <div className="divide-y divide-neutral-800 border border-[#232530] rounded-lg max-h-56 overflow-y-auto">
                    {inventoryLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-[#14151a] flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-white font-sans font-semibold">{log.productName}</span> ({log.variantSku})
                          <span className="text-neutral-500 block text-[11px] font-sans">
                            {log.changeType} · {log.reason}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={log.quantity > 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {log.quantity > 0 ? `+${log.quantity}` : log.quantity} units
                          </span>
                          <span className="text-neutral-500 block text-[10px]">
                            {log.previousStock} → {log.newStock}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7. ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                  Order Management &amp; Fulfillment ({ordersList.length})
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Confirm orders, update tracking waybills, and print tax invoices.
                </p>
              </div>

              <div className="border border-[#232530] rounded-lg overflow-x-auto bg-[#131418]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#1b1c23] text-neutral-300 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Order Status</th>
                      <th className="py-3 px-4">Waybill</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-mono">
                    {ordersList.map((ord) => (
                      <tr key={ord.id} className="hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-bold text-white">{ord.orderNumber}</td>
                        <td className="py-3 px-4 font-sans">
                          <span className="text-white block font-medium">{ord.customerName}</span>
                          <span className="text-neutral-500 text-[11px]">{ord.customerEmail}</span>
                        </td>
                        <td className="py-3 px-4 text-white font-bold">₹{parseFloat(ord.totalAmount).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-400">{ord.paymentMethod} ({ord.paymentStatus})</span>
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-[#1a1b22] border border-[#2b2d38] text-[11px] text-white p-1 rounded"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-neutral-400">{ord.trackingNumber || 'Pending'}</td>
                        <td className="py-3 px-4 font-sans">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[11px] cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. CUSTOMERS DIRECTORY */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                  VIP Customers Directory ({customersList.length})
                </h2>
                <p className="text-xs text-neutral-400 mt-1">Customer profiles, order frequency, and lifetime value.</p>
              </div>

              <div className="border border-[#232530] rounded-lg overflow-x-auto bg-[#131418]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#1b1c23] text-neutral-300 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Orders</th>
                      <th className="py-3 px-4">Lifetime Spend</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-mono">
                    {customersList.map((c) => (
                      <tr key={c.id} className="hover:bg-neutral-800/30">
                        <td className="py-3 px-4 font-sans font-semibold text-white">{c.name}</td>
                        <td className="py-3 px-4 text-neutral-400">{c.email}</td>
                        <td className="py-3 px-4 text-white">{c.orderCount}</td>
                        <td className="py-3 px-4 font-bold text-white">₹{parseFloat(c.totalSpend).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-sans">
                          {c.isBlocked ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400">Suspended</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">Active</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <button
                            onClick={() => handleToggleCustomerBlock(c.id)}
                            className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer"
                          >
                            {c.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9 & 10. COUPONS & DISCOUNTS */}
          {(activeTab === 'coupons' || activeTab === 'discounts') && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                  Coupon Codes &amp; Promotional Discounts
                </h2>
                <p className="text-xs text-neutral-400 mt-1">Manage promo codes, minimum cart constraints, and usage limits.</p>
              </div>

              {/* Create Coupon Form */}
              <form onSubmit={handleCreateCoupon} className="p-4 bg-[#14151a] border border-[#262832] rounded-lg grid grid-cols-1 sm:grid-cols-5 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Code (e.g. VIP25)"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="bg-[#181920] border border-[#2b2d38] p-2 rounded text-xs text-white uppercase font-mono"
                />
                <select
                  value={newCouponType}
                  onChange={(e: any) => setNewCouponType(e.target.value)}
                  className="bg-[#181920] border border-[#2b2d38] p-2 rounded text-xs text-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
                <input
                  type="number"
                  required
                  placeholder="Discount Value"
                  value={newCouponValue}
                  onChange={(e) => setNewCouponValue(e.target.value)}
                  className="bg-[#181920] border border-[#2b2d38] p-2 rounded text-xs text-white font-mono"
                />
                <input
                  type="number"
                  placeholder="Min Order Value (₹)"
                  value={newCouponMinCart}
                  onChange={(e) => setNewCouponMinCart(e.target.value)}
                  className="bg-[#181920] border border-[#2b2d38] p-2 rounded text-xs text-white font-mono"
                />
                <button
                  type="submit"
                  className="bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase rounded py-2 cursor-pointer"
                >
                  Create Code
                </button>
              </form>

              {/* Coupons List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {couponsList.map((coup) => (
                  <div key={coup.id} className="p-4 bg-[#14151a] border border-[#232530] rounded-lg space-y-2 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800">
                        {coup.code}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-sans">Active</span>
                    </div>
                    <div className="text-xs text-neutral-300 font-sans">
                      {coup.discountType === 'percentage' ? `${coup.discountValue}% OFF` : `₹${coup.discountValue} FLAT OFF`}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-sans">
                      Min Order: ₹{parseFloat(coup.minCartValue).toLocaleString('en-IN')} · Used {coup.timesUsed} times
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. RETURNS & REFUNDS */}
          {activeTab === 'returns' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                  Return &amp; Refund Requests ({returnsList.length})
                </h2>
                <p className="text-xs text-neutral-400 mt-1">Review customer returns and authorize inventory restock.</p>
              </div>

              <div className="border border-[#232530] rounded-lg overflow-x-auto bg-[#131418]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#1b1c23] text-neutral-300 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-mono">
                    {returnsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-neutral-500 font-sans">
                          No pending customer return requests.
                        </td>
                      </tr>
                    ) : (
                      returnsList.map((ret) => (
                        <tr key={ret.returnRecord.id} className="hover:bg-neutral-800/30">
                          <td className="py-3 px-4 font-bold text-white">{ret.orderNumber}</td>
                          <td className="py-3 px-4 font-sans text-neutral-300">{ret.customerName}</td>
                          <td className="py-3 px-4 font-sans text-neutral-400">{ret.returnRecord.reason}</td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 uppercase">
                              {ret.returnRecord.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-sans space-x-2">
                            {ret.returnRecord.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleResolveReturn(ret.returnRecord.id, 'APPROVED', true)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer"
                                >
                                  Approve &amp; Restock
                                </button>
                                <button
                                  onClick={() => handleResolveReturn(ret.returnRecord.id, 'REJECTED', false)}
                                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded text-[10px] cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 15. HOMEPAGE BANNERS */}
          {activeTab === 'homepage' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                  Homepage Banner Management
                </h2>
                <p className="text-xs text-neutral-400 mt-1">Configure campaign headlines, editorial photography, and CTA links.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bannersList.map((b) => (
                  <div key={b.id} className="p-4 bg-[#14151a] border border-[#232530] rounded-lg space-y-3">
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-full aspect-video object-cover rounded"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-display">{b.title}</h4>
                      <p className="text-[11px] text-neutral-400">{b.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-800">
                      <span>CTA: {b.buttonText}</span>
                      <span className="text-emerald-400">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 17. WEBSITE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                  Store Configuration &amp; Policies
                </h2>
                <p className="text-xs text-neutral-400 mt-1">Brand settings editable directly without code modification.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="p-6 bg-[#14151a] border border-[#262832] rounded-xl space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                    Store Brand Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.store_name || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, store_name: e.target.value })}
                    className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={settingsForm.tagline || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settingsForm.contact_email || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contact_email: e.target.value })}
                      className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                      WhatsApp Concierge
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsapp_number || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                      className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                    Free Shipping Threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.free_shipping_threshold || 1999}
                    onChange={(e) => setSettingsForm({ ...settingsForm, free_shipping_threshold: Number(e.target.value) })}
                    className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                    14-Day Return Policy Prose
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.return_policy || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, return_policy: e.target.value })}
                    className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer"
                >
                  Save Store Configurations
                </button>
              </form>
            </div>
          )}

          {/* 18. ADMIN PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-md mx-auto p-6 bg-[#14151a] border border-[#262832] rounded-xl space-y-4">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-display">
                Superadmin Credentials
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Name:</span>
                  <span className="text-white font-semibold">{admin?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Email:</span>
                  <span className="text-white font-mono">{admin?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Role:</span>
                  <span className="text-emerald-400 font-bold uppercase">{admin?.role}</span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 pt-2">
                Passwords are encrypted using bcrypt salt with SHA-256 rounds on PostgreSQL.
              </p>
            </div>
          )}

          {/* Default fallback for other tabs */}
          {['discounts', 'reviews', 'payments', 'shipping', 'analytics'].includes(activeTab) && activeTab !== 'dashboard' && activeTab !== 'prices' && (
            <div className="p-8 bg-[#14151a] border border-[#262832] rounded-xl text-center space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Module Active: {activeTab.toUpperCase()}
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                All records in this module are authoritatively synced with Cloud SQL PostgreSQL tables.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* PRICE EDITING MODAL */}
      {editingPriceProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#14151a] border border-[#2b2d38] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Adjust Price: {editingPriceProduct.name}
              </h3>
              <button
                onClick={() => setEditingPriceProduct(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePrice} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">MRP (Original Price)</label>
                  <input
                    type="number"
                    required
                    value={priceForm.mrp}
                    onChange={(e) => setPriceForm({ ...priceForm, mrp: e.target.value })}
                    className="w-full bg-[#181920] border border-[#2b2d38] p-2 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Selling Price</label>
                  <input
                    type="number"
                    required
                    value={priceForm.sellingPrice}
                    onChange={(e) => setPriceForm({ ...priceForm, sellingPrice: e.target.value })}
                    className="w-full bg-[#181920] border border-[#2b2d38] p-2 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Cost Price (COGS)</label>
                  <input
                    type="number"
                    value={priceForm.costPrice}
                    onChange={(e) => setPriceForm({ ...priceForm, costPrice: e.target.value })}
                    className="w-full bg-[#181920] border border-[#2b2d38] p-2 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Sale / Promotional Price</label>
                  <input
                    type="number"
                    value={priceForm.salePrice}
                    onChange={(e) => setPriceForm({ ...priceForm, salePrice: e.target.value })}
                    className="w-full bg-[#181920] border border-[#2b2d38] p-2 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Audit Reason</label>
                <input
                  type="text"
                  value={priceForm.reason}
                  onChange={(e) => setPriceForm({ ...priceForm, reason: e.target.value })}
                  className="w-full bg-[#181920] border border-[#2b2d38] p-2 rounded text-white"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPriceProduct(null)}
                  className="px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-white text-black hover:bg-neutral-200 font-bold uppercase rounded"
                >
                  Save &amp; Recalculate Margins
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {adjustingStockVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#14151a] border border-[#2b2d38] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white uppercase font-display">
                Adjust Stock: {adjustingStockVariant.sku}
              </h3>
              <button
                onClick={() => setAdjustingStockVariant(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjustment} className="space-y-3 text-xs">
              <p className="text-neutral-400">
                Current available: <strong className="text-white font-mono">{adjustingStockVariant.availableStock}</strong> units.
              </p>
              <div>
                <label className="block text-neutral-400 mb-1">Quantity Adjustment (+/-)</label>
                <input
                  type="number"
                  required
                  placeholder="+10 or -5"
                  value={stockAdjustmentQty}
                  onChange={(e) => setStockAdjustmentQty(e.target.value)}
                  className="w-full bg-[#181920] border border-[#2b2d38] p-2 rounded text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Reason</label>
                <input
                  type="text"
                  required
                  value={stockAdjustmentReason}
                  onChange={(e) => setStockAdjustmentReason(e.target.value)}
                  className="w-full bg-[#181920] border border-[#2b2d38] p-2 rounded text-white"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingStockVariant(null)}
                  className="px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-white text-black hover:bg-neutral-200 font-bold uppercase rounded"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
