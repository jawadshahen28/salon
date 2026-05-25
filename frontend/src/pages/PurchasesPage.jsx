import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, FileText, Hash, Loader2, Package, Plus, ShoppingBag, Trash2, DollarSign, Receipt, Wallet } from 'lucide-react';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard, SkeletonRow } from '../components/ui/Skeleton';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [form, setForm] = useState({ itemName: '', quantity: '', price: '', notes: '' });
  const { socket } = useSocket();

  const fetchPurchases = useCallback(async (date = selectedDate) => {
    try {
      setLoading(true);
      const res = await api.get('/purchases', { params: { date } });
      setPurchases(res.data.data.purchases);
      setStats(res.data.data.stats);
    } catch {
      toast.error('تعذر تحميل المشتريات');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  useEffect(() => {
    if (!socket) return;
    const handlePurchaseAdded = () => fetchPurchases();
    socket.on('purchaseAdded', handlePurchaseAdded);
    return () => socket.off('purchaseAdded', handlePurchaseAdded);
  }, [socket, fetchPurchases]);

  const selectedTotal = purchases.reduce((sum, purchase) => sum + purchase.price, 0);
  const today = getLocalDate();
  const isToday = selectedDate === today;
  const quantityValue = form.quantity ? parseFloat(form.quantity) : 1;
  const unitPriceValue = form.price ? parseFloat(form.price) : 0;
  const finalPrice = Number.isFinite(quantityValue) && Number.isFinite(unitPriceValue)
    ? quantityValue * unitPriceValue
    : 0;

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchPurchases(date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName.trim()) return toast.error('يرجى إدخال اسم الصنف');
    if (!form.price || parseFloat(form.price) <= 0) return toast.error('يرجى إدخال سعر صحيح');
    if (form.quantity && parseFloat(form.quantity) <= 0) return toast.error('يرجى إدخال كمية صحيحة');

    setSubmitting(true);
    try {
      await api.post('/purchases', {
        itemName: form.itemName,
        quantity: quantityValue,
        price: finalPrice,
        notes: form.notes
      });
      toast.success(`تم إضافة ${form.itemName} بنجاح`);
      setForm({ itemName: '', quantity: '', price: '', notes: '' });
      setIsOpen(false);
      setSelectedDate(today);
      fetchPurchases(today);
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    try {
      await api.delete(`/purchases/${id}`);
      toast.success('تم حذف المشتريات بنجاح');
      fetchPurchases();
    } catch {
      toast.error('حدث خطأ في الحذف');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="page-title">المشتريات</h2>
          <p className="page-subtitle">تتبع المصاريف اليومية وصافي الربح مع سجل عمليات واضح وسريع.</p>
        </div>
        <button onClick={() => setIsOpen(true)} className="gold-btn flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة شراء
        </button>
      </div>

      <div className="glass-card flex flex-wrap items-center gap-3 p-4">
        <div className="flex items-center gap-2 font-bold text-white/64">
          <CalendarDays className="h-4 w-4 text-neon-cyan" />
          عرض تاريخ
        </div>
        <input
          type="date"
          className="input-field max-w-56 py-2"
          value={selectedDate}
          onChange={(event) => handleDateChange(event.target.value)}
        />
        <button
          type="button"
          onClick={() => handleDateChange(today)}
          className="ghost-btn px-4 py-2"
        >
          اليوم
        </button>
        <span className="text-sm text-white/34">
          {isToday ? 'تعرض مشتريات اليوم' : `تعرض مشتريات ${selectedDate}`}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => <SkeletonCard key={index} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'مشتريات التاريخ المحدد', value: `${selectedTotal} ₪`, icon: Receipt, color: 'border-neon-danger/24 bg-neon-danger/10', text: 'text-neon-danger' },
            { label: 'عدد المشتريات', value: purchases.length, icon: ShoppingBag, color: 'border-neon-cyan/24 bg-neon-cyan/10', text: 'text-neon-cyan' },
            { label: 'مشتريات اليوم', value: `${stats?.todayTotal || 0} ₪`, icon: Package, color: 'border-neon-gold/24 bg-neon-gold/10', text: 'text-neon-gold' },
            { label: 'صافي ربح اليوم', value: `${stats?.todayNetProfit || 0} ₪`, icon: Wallet, color: (stats?.todayNetProfit || 0) >= 0 ? 'border-neon-green/24 bg-neon-green/10' : 'border-neon-danger/24 bg-neon-danger/10', text: (stats?.todayNetProfit || 0) >= 0 ? 'text-neon-green' : 'text-neon-danger' }
          ].map(({ label, value, icon: Icon, color, text }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`metric-panel border ${color} flex items-center gap-3 text-right`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-cyber-950/40">
                <Icon className={`h-5 w-5 ${text}`} />
              </div>
              <div>
                <p className="mb-1 text-xs font-black text-white/38">{label}</p>
                <p className={`text-2xl font-black ${text}`}>{value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="glass-card p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-white">سجل المشتريات</h3>
            <p className="text-xs text-white/30">قائمة العمليات حسب التاريخ المحدد</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-bold text-white/38">{selectedDate}</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => <SkeletonRow key={index} />)}
          </div>
        ) : purchases.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="لا توجد مشتريات"
            description="لا توجد مشتريات مسجلة في هذا التاريخ"
            action={{ label: '+ إضافة شراء', onClick: () => setIsOpen(true) }}
          />
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
              {purchases.map((purchase, index) => (
                <motion.div
                  key={purchase._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.03 }}
                  className="surface-row group flex flex-col gap-3 p-4 md:flex-row md:items-center"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-neon-danger/22 bg-neon-danger/10">
                    <Package className="h-5 w-5 text-neon-danger" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-white">{purchase.itemName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/30">
                      {purchase.quantity > 1 && <span>الكمية: {purchase.quantity}</span>}
                      {purchase.notes && <span className="truncate">{purchase.notes}</span>}
                      <span>{new Date(purchase.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>
                  </div>
                  <span className="text-lg font-black text-neon-danger">{purchase.price} ₪</span>
                  <button
                    onClick={() => handleDelete(purchase._id, purchase.itemName)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-neon-danger/15 bg-neon-danger/8 text-neon-danger/45 opacity-100 transition-all duration-300 hover:bg-neon-danger/15 hover:text-neon-danger md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="إضافة شراء جديد">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-white/68">اسم الصنف *</label>
            <div className="relative">
              <Package className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                className="input-field pr-11"
                placeholder="مثال: شامبو، مستلزمات..."
                value={form.itemName}
                onChange={(event) => setForm({ ...form, itemName: event.target.value })}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-bold text-white/68">الكمية</label>
              <div className="relative">
                <Hash className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  type="number"
                  className="input-field pr-11"
                  placeholder="1"
                  min="0"
                  step="0.5"
                  value={form.quantity}
                  onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-white/68">سعر القطعة *</label>
              <div className="relative">
                <DollarSign className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  type="number"
                  className="input-field pr-11"
                  placeholder="0 ₪"
                  min="0"
                  step="0.5"
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-neon-gold/22 bg-neon-gold/10 p-4">
            <span className="text-sm font-bold text-white/60">السعر النهائي</span>
            <span className="text-xl font-black text-neon-gold">{finalPrice || 0} ₪</span>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white/68">ملاحظات</label>
            <div className="relative">
              <FileText className="absolute right-4 top-3.5 h-4 w-4 text-white/30" />
              <textarea
                className="input-field resize-none pr-11"
                rows={2}
                placeholder="ملاحظات إضافية..."
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="ghost-btn flex-1">إلغاء</button>
            <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.98 }} className="gold-btn flex flex-1 items-center justify-center gap-2">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  حفظ
                </>
              )}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
