import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  LogOut,
  Package,
  PlusCircle,
  LayoutGrid,
  Store,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { getMyShop, updateMyShop } from '../services/shop.service';
import type { Shop } from '../services/shop.service';
import type { OrderStatus } from '../services/order.service';
import { useSellerProducts } from '../hooks/useSellerProducts';
import type { Product, CreateProductPayload, UpdateProductPayload } from '../services/product.service';
import { useShopOrders } from '../hooks/useOrders';
import { ImageUploader } from '../components/ImageUploader';
import { ProductTable } from '../components/ProductTable';
import { OrderTable } from '../components/OrderTable';
import { DashboardStats } from '../components/DashboardStats';
import { ProductForm } from '../components/ProductForm';

type Tab = 'overview' | 'products' | 'orders' | 'shop';

export function DashboardScreen() {
  const { user, accessToken, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');

  // Product & order hooks
  const {
    products,
    loading: productsLoading,
    error: productsError,
    refresh: loadProducts,
    addProduct,
    updateProductById,
    deleteProductById,
    deletingId,
  } = useSellerProducts(accessToken);

  const {
    orders: shopOrders,
    loading: shopOrdersLoading,
    error: shopOrdersError,
    refresh: loadShopOrders,
    updateStatus,
    updatingOrderId,
  } = useShopOrders(accessToken);

  // Shop profile
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopLoading, setShopLoading] = useState(false);
  const [shopForm, setShopForm] = useState({ name: '', description: '' });
  const [shopImage, setShopImage] = useState<File | null>(null);
  const [shopSaving, setShopSaving] = useState(false);

  // Load shop data
  const loadShop = useCallback(async () => {
    if (!accessToken) return;
    setShopLoading(true);
    try {
      const s = await getMyShop(accessToken);
      setShop(s);
      setShopForm({
        name: s.name,
        description: s.description ?? '',
      });
    } catch (e) {
      /* ignore */
    } finally {
      setShopLoading(false);
    }
  }, [accessToken]);

  // Load initial data
  useEffect(() => {
    if (accessToken) void loadShopOrders();
  }, [accessToken, loadShopOrders]);

  useEffect(() => {
    if (tab === 'shop') void loadShop();
  }, [tab, loadShop]);

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'seller')) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Analytics
  const analytics = useMemo(
    () => ({
      totalProducts: products.length,
      totalOrders: shopOrders.length,
      pendingOrders: shopOrders.filter((o) =>
        ['pending', 'paid', 'confirmed'].includes(o.status),
      ).length,
      revenue: shopOrders
        .filter((o) => o.status !== 'cancelled')
        .flatMap((o) => o.items)
        .reduce((s, i) => s + parseFloat(i.subtotal), 0),
      lowStockCount:
        products.filter((p) => parseFloat(p.stock) === 0).length +
        products.filter((p) => parseFloat(p.stock) > 0 && parseFloat(p.stock) <= 5).length,
    }),
    [products, shopOrders],
  );

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProductById(id);
      toast.success('ลบสินค้าสำเร็จ');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleUpdateProductStock = async (
    id: number,
    stock: number,
  ): Promise<void> => {
    try {
      await updateProductById(id, { stock });
    } catch (e) {
      toast.error((e as Error).message);
      throw e;
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: number,
    newStatus: OrderStatus,
  ) => {
    try {
      await updateStatus(orderId, newStatus);
      toast.success('อัพเดทสถานะสำเร็จ');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleSaveShop = async () => {
    if (!accessToken) return;
    setShopSaving(true);
    try {
      const updated = await updateMyShop(accessToken, {
        name: shopForm.name,
        description: shopForm.description,
        image: shopImage ?? undefined,
      });
      setShop(updated);
      setShopImage(null);
      toast.success('บันทึกข้อมูลร้านค้าสำเร็จ');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setShopSaving(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product.id);
  };

  const handleProductFormSubmit = async (payload: CreateProductPayload | UpdateProductPayload) => {
    if (editingProduct !== null) {
      await updateProductById(editingProduct, payload);
      toast.success('อัพเดทสินค้าสำเร็จ');
      setEditingProduct(null);
    } else {
      await addProduct(payload as CreateProductPayload);
    }
  };

  const lowStockProducts = products.filter(
    (p) => parseFloat(p.stock) > 0 && parseFloat(p.stock) <= 5,
  );
  const outOfStockProducts = products.filter((p) => parseFloat(p.stock) === 0);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-stone-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-stone-900"
                style={{ fontSize: 22, fontWeight: 800 }}
              >
                แดชบอร์ด
              </h1>
              <p
                className="text-stone-500 mt-0.5"
                style={{ fontSize: 12 }}
              >
                {user.username}
                {shop ? ` · ${shop.name}` : ''}
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-2 bg-stone-100 text-stone-700 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-stone-200 transition"
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Tab Navigation */}
        <div className="flex rounded-2xl overflow-hidden border-2 border-stone-200 mb-6 bg-white">
          {(
            [
              {
                key: 'overview' as Tab,
                label: 'ภาพรวม',
                icon: <LayoutGrid size={14} />,
              },
              { key: 'products' as Tab, label: 'สินค้า', icon: <Package size={14} /> },
              {
                key: 'orders' as Tab,
                label: 'ออเดอร์',
                icon: <ShoppingBag size={14} />,
              },
              { key: 'shop' as Tab, label: 'ร้านค้า', icon: <Store size={14} /> },
            ] as const
          ).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 sm:py-4 transition-colors font-bold"
              style={{
                fontSize: 13,
                background: tab === key ? '#F97316' : '#FAFAF9',
                color: tab === key ? '#fff' : '#78716C',
              }}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {tab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Stats */}
              <DashboardStats
                stats={{
                  totalProducts: analytics.totalProducts,
                  totalOrders: analytics.totalOrders,
                  pendingOrders: analytics.pendingOrders,
                  revenue: analytics.revenue,
                  lowStockCount: analytics.lowStockCount,
                }}
                loading={productsLoading || shopOrdersLoading}
              />

              {/* Low stock alerts */}
              {(lowStockProducts.length > 0 ||
                outOfStockProducts.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-orange-50 rounded-2xl p-4 border border-orange-200"
                >
                  <p
                    className="text-orange-700 mb-3 font-bold"
                    style={{ fontSize: 13 }}
                  >
                    ⚠️ สินค้าต้องการสนใจ
                  </p>
                  <div className="space-y-2">
                    {outOfStockProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between text-orange-800"
                        style={{ fontSize: 12 }}
                      >
                        <span className="font-bold">{p.name}</span>
                        <span className="bg-red-100 text-red-600 rounded-full px-3 py-1">
                          หมดสต็อก
                        </span>
                      </div>
                    ))}
                    {lowStockProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between text-orange-800"
                        style={{ fontSize: 12 }}
                      >
                        <span>{p.name}</span>
                        <span className="bg-orange-100 text-orange-600 rounded-full px-3 py-1 font-bold">
                          เหลือ {p.stock} กก.
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Recent orders */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-stone-800 font-bold"
                    style={{ fontSize: 15 }}
                  >
                    ออเดอร์ล่าสุด
                  </h2>
                  <button
                    onClick={() => setTab('orders')}
                    className="flex items-center gap-1 text-orange-500 font-bold hover:text-orange-600 transition"
                    style={{ fontSize: 12 }}
                  >
                    ดูทั้งหมด <ChevronRight size={14} />
                  </button>
                </div>
                {shopOrdersLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((k) => (
                      <div
                        key={k}
                        className="bg-white rounded-2xl p-4 h-16 animate-pulse"
                      />
                    ))}
                  </div>
                ) : shopOrders.length === 0 ? (
                  <div
                    className="bg-white rounded-2xl p-8 text-center"
                    style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
                  >
                    <ShoppingBag
                      size={40}
                      className="text-stone-300 mx-auto mb-3"
                    />
                    <p
                      className="text-stone-500 font-bold"
                      style={{ fontSize: 14 }}
                    >
                      ยังไม่มีออเดอร์
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {shopOrders.slice(0, 3).map((order) => (
                      <button
                        key={order.id}
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="w-full bg-white rounded-2xl p-4 text-left flex items-center justify-between hover:bg-stone-50 transition"
                        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
                      >
                        <div className="min-w-0">
                          <p
                            className="text-stone-800 font-bold"
                            style={{ fontSize: 13 }}
                          >
                            ออเดอร์ #{order.id} · {order.buyer_username}
                          </p>
                          <p
                            className="text-orange-600 font-bold mt-1"
                            style={{ fontSize: 13 }}
                          >
                            ฿{parseFloat(order.total_price).toLocaleString()}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-stone-300 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Products Tab */}
          {tab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-stone-800 font-bold"
                  style={{ fontSize: 15 }}
                >
                  สินค้า ({products.length})
                </h2>
                {editingProduct === null && (
                  <button
                    onClick={() => setEditingProduct(-1)}
                    className="flex items-center gap-1.5 bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-2xl hover:bg-orange-600 transition font-bold"
                    style={{ fontSize: 12 }}
                  >
                    <PlusCircle size={15} />
                    <span>เพิ่มสินค้า</span>
                  </button>
                )}
              </div>

              <AnimatePresence>
                {editingProduct !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductForm
                      product={
                        editingProduct === -1
                          ? null
                          : products.find((p) => p.id === editingProduct) || null
                      }
                      onSubmit={handleProductFormSubmit}
                      onCancel={() => setEditingProduct(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {productsError ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center py-12 text-center gap-3 bg-white rounded-2xl"
                >
                  <AlertCircle size={40} className="text-red-400" />
                  <p
                    className="text-stone-600 font-bold"
                    style={{ fontSize: 14 }}
                  >
                    {productsError}
                  </p>
                  <button
                    onClick={() => loadProducts()}
                    className="bg-orange-500 text-white px-5 py-2 rounded-xl font-bold"
                    style={{ fontSize: 12 }}
                  >
                    ลองใหม่
                  </button>
                </motion.div>
              ) : (
                <ProductTable
                  products={products}
                  loading={productsLoading}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onUpdateStock={handleUpdateProductStock}
                  deletingId={deletingId}
                />
              )}
            </motion.div>
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-stone-800 font-bold"
                  style={{ fontSize: 15 }}
                >
                  ออเดอร์ ({shopOrders.length})
                </h2>
                <button
                  onClick={() => loadShopOrders()}
                  className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition"
                >
                  <RefreshCw size={14} className="text-stone-500" />
                </button>
              </div>

              {shopOrdersError ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center py-12 text-center gap-3 bg-white rounded-2xl"
                >
                  <AlertCircle size={40} className="text-red-400" />
                  <p
                    className="text-stone-600 font-bold"
                    style={{ fontSize: 14 }}
                  >
                    {shopOrdersError}
                  </p>
                  <button
                    onClick={() => loadShopOrders()}
                    className="bg-orange-500 text-white px-5 py-2 rounded-xl font-bold"
                    style={{ fontSize: 12 }}
                  >
                    ลองใหม่
                  </button>
                </motion.div>
              ) : (
                <OrderTable
                  orders={shopOrders}
                  loading={shopOrdersLoading}
                  statusFilter={orderStatusFilter}
                  onStatusChange={setOrderStatusFilter}
                  onViewDetails={(id) => navigate(`/orders/${id}`)}
                  onUpdateStatus={handleUpdateOrderStatus}
                  updatingOrderId={updatingOrderId}
                />
              )}
            </motion.div>
          )}

          {/* Shop Tab */}
          {tab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {shopLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-5 sm:p-6"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                >
                  <h2
                    className="text-stone-900 mb-5 font-bold"
                    style={{ fontSize: 16 }}
                  >
                    โปรไฟล์ร้านค้า
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <ImageUploader
                        value={shopImage}
                        previewUrl={shop?.image_url}
                        onChange={setShopImage}
                        label="โลโก้/แบนเนอร์ร้านค้า"
                        placeholder="คลิกเพื่ออัพโหลดรูปร้านค้า"
                        className="mb-4"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-stone-700 mb-2 font-bold"
                        style={{ fontSize: 13 }}
                      >
                        ชื่อร้านค้า
                      </label>
                      <input
                        type="text"
                        value={shopForm.name}
                        onChange={(e) =>
                          setShopForm((f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder="ชื่อร้านค้าของคุณ"
                        className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 outline-none focus:border-orange-400 text-stone-800 transition"
                        style={{ fontSize: 14 }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-stone-700 mb-2 font-bold"
                        style={{ fontSize: 13 }}
                      >
                        คำอธิบายร้าน
                      </label>
                      <textarea
                        value={shopForm.description}
                        onChange={(e) =>
                          setShopForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        placeholder="อธิบายเกี่ยวกับร้านค้าของคุณ เช่น ลักษณะเฉพาะ การบริการ เป็นต้น"
                        rows={4}
                        className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 outline-none focus:border-orange-400 text-stone-800 resize-none transition"
                        style={{ fontSize: 14 }}
                      />
                    </div>

                    <button
                      onClick={handleSaveShop}
                      disabled={shopSaving}
                      className="w-full bg-orange-500 text-white rounded-2xl py-3 sm:py-4 font-bold hover:bg-orange-600 disabled:opacity-60 transition"
                      style={{ fontSize: 15 }}
                    >
                      {shopSaving ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          กำลังบันทึก...
                        </span>
                      ) : (
                        'บันทึกข้อมูลร้านค้า'
                      )}
                    </button>

                    {shop && (
                      <p
                        className="text-stone-400 text-center pt-4 border-t border-stone-100"
                        style={{ fontSize: 11 }}
                      >
                        สร้างเมื่อ{' '}
                        {new Date(shop.created_at).toLocaleDateString(
                          'th-TH',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          },
                        )}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
