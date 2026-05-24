import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, FileText, Hash, Loader2, Package, Plus, ShoppingBag, Trash2, DollarSign } from 'lucide-react';
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
    socket.on('purchaseAdded', () => fetchPurchases());
    return () => socket.off('purchaseAdded');
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-white mb-1">المشتريات</h2>
          <p className="text-white/30 text-sm">تتبع مصاريف صالون عبود حسب اليوم</p>
        </div>
        <button onClick={() => setIsOpen(true)} className="gold-btn flex items-center gap-2">
          <Plus className="w-4 h-4" />
          إضافة شراء
        </button>
      </div>

      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-white/60 font-semibold">
          <CalendarDays className="w-4 h-4 text-gold-400" />
          عرض مشتريات تاريخ
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
        <span className="text-white/30 text-sm">
          {isToday ? 'تعرض مشتريات اليوم' : `تعرض مشتريات ${selectedDate}`}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => <SkeletonCard key={index} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'مشتريات التاريخ المحدد', value: `${selectedTotal} ₪`, color: 'border-red-500/20 bg-red-500/5', text: 'text-red-400' },
            { label: 'عدد المشتريات', value: purchases.length, color: 'border-blue-500/20 bg-blue-500/5', text: 'text-blue-400' },
            { label: 'مشتريات اليوم', value: `${stats?.todayTotal || 0} ₪`, color: 'border-orange-500/20 bg-orange-500/5', text: 'text-orange-400' },
            { label: 'صافي ربح اليوم', value: `${stats?.todayNetProfit || 0} ₪`, color: (stats?.todayNetProfit || 0) >= 0 ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5', text: (stats?.todayNetProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400' }
          ].map(({ label, value, color, text }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`glass-card border ${color} p-5 transition-all duration-300`}
            >
              <p className="text-white/40 text-sm mb-2">{label}</p>
              <p className={`text-2xl font-black ${text}`}>{value}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="glass-card p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h3 className="font-black text-white">سجل المشتريات</h3>
          <span className="text-white/30 text-sm">{selectedDate}</span>
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
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 group transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{purchase.itemName}</p>
                    <div className="flex items-center gap-3 text-xs text-white/30 mt-0.5">
                      {purchase.quantity > 1 && <span>الكمية: {purchase.quantity}</span>}
                      {purchase.notes && <span className="truncate">{purchase.notes}</span>}
                      <span>{new Date(purchase.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>
                  </div>
                  <span className="text-red-400 font-black text-lg">{purchase.price} ₪</span>
                  <button
                    onClick={() => handleDelete(purchase._id, purchase.itemName)}
                    className="w-8 h-8 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400/40 hover:text-red-400 hover:bg-red-500/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
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
            <label className="block text-white/70 text-sm mb-2 font-semibold">اسم الصنف *</label>
            <div className="relative">
              <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                className="input-field pr-10"
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
              <label className="block text-white/70 text-sm mb-2 font-semibold">الكمية</label>
              <div className="relative">
                <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="number"
                  className="input-field pr-10"
                  placeholder="1"
                  min="0"
                  step="0.5"
                  value={form.quantity}
                  onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2 font-semibold">سعر القطعة *</label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="number"
                  className="input-field pr-10"
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

          <div className="rounded-xl border border-gold-500/20 bg-gold-500/10 p-4 flex items-center justify-between gap-3">
            <span className="text-white/60 text-sm font-semibold">السعر النهائي</span>
            <span className="text-gold-400 text-xl font-black">{finalPrice || 0} ₪</span>
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2 font-semibold">ملاحظات</label>
            <div className="relative">
              <FileText className="absolute right-3 top-3 w-4 h-4 text-white/30" />
              <textarea
                className="input-field pr-10 resize-none"
                rows={2}
                placeholder="ملاحظات إضافية..."
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="ghost-btn flex-1">إلغاء</button>
            <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.98 }} className="gold-btn flex-1 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
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
