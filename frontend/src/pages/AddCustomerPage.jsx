import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User, DollarSign, Loader2, Clock, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import api from '../utils/api';
import toast from 'react-hot-toast';
import BarberLogo from '../components/ui/BarberLogo';

const PRICE_OPTIONS = [
  { value: 10, label: '10 ₪' },
  { value: 15, label: '15 ₪' },
  { value: 20, label: '20 ₪' },
];

export default function AddCustomerPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', customPrice: '' });
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);
  const navigate = useNavigate();

  // Fetch current queue info
  const fetchQueueInfo = async () => {
    try {
      const res = await api.get('/customers/queue');
      const active = res.data.data.filter(c => c.status !== 'done');
      setQueueInfo({
        count: active.length,
        nextNumber: active.length + 1,
        waitMinutes: active.length * 30
      });
    } catch {}
  };

  const handleOpen = () => {
    fetchQueueInfo();
    setIsOpen(true);
  };

  const handlePriceSelect = (price) => {
    setSelectedPrice(price);
    setForm({ ...form, price: price, customPrice: '' });
  };

  const handleCustomPrice = (val) => {
    setSelectedPrice('custom');
    setForm({ ...form, price: val, customPrice: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('يرجى إدخال اسم الزبون');
    const price = parseFloat(form.price);
    if (!price || price <= 0) return toast.error('يرجى إدخال سعر صحيح');

    setLoading(true);
    try {
      const res = await api.post('/customers', { name: form.name, price });
      const customer = res.data.data;
      toast.success(`✅ تم إضافة ${form.name} - رقم الدور: ${customer.queueNumber}`);
      setForm({ name: '', price: '', customPrice: '' });
      setSelectedPrice(null);
      setIsOpen(false);
      fetchQueueInfo();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ في الإضافة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-gold-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-gold-600/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <BarberLogo size="sm" />
          <h2 className="text-3xl font-black text-gradient-gold">إضافة زبون جديد</h2>
        </div>
        <p className="text-white/30">اضغط على الزر لإضافة زبون للدور</p>
      </motion.div>

      {/* Big add button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className="relative w-48 h-48 rounded-full bg-gradient-to-br from-gold-600/20 to-gold-500/10
          border-2 border-gold-500/40 flex flex-col items-center justify-center gap-3
          hover:border-gold-400/70 hover:from-gold-600/30 hover:to-gold-500/20
          transition-all duration-300 cursor-pointer group glow-gold hover:glow-gold"
      >
        {/* Animated ring */}
        <div className="absolute inset-0 rounded-full border-2 border-gold-500/20 animate-ping opacity-30" />
        <div className="absolute inset-3 rounded-full border border-gold-500/10 animate-pulse" />

        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-600 to-gold-500 flex items-center justify-center shadow-lg shadow-gold-500/30 group-hover:shadow-gold-500/50 transition-shadow">
          <Plus className="w-8 h-8 text-dark-950 stroke-[3]" />
        </div>
        <span className="text-gold-400 font-black text-lg">إضافة زبون</span>
      </motion.button>

      {/* Queue hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-white/20 text-sm"
      >
        أو اذهب إلى <button onClick={() => navigate('/queue')} className="text-gold-400/60 hover:text-gold-400 underline">صفحة الدور</button> لإدارة الزبائن
      </motion.p>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="إضافة زبون جديد"
      >
        {/* Queue info */}
        {queueInfo && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
              <Hash className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-blue-400 font-black text-xl">{queueInfo.nextNumber}</p>
              <p className="text-white/30 text-xs">رقم الدور</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 text-orange-400 mx-auto mb-1" />
              <p className="text-orange-400 font-black text-xl">{queueInfo.waitMinutes}</p>
              <p className="text-white/30 text-xs">دقيقة انتظار</p>
            </div>
            <div className="bg-gold-500/10 border border-gold-500/20 rounded-xl p-3 text-center">
              <User className="w-4 h-4 text-gold-400 mx-auto mb-1" />
              <p className="text-gold-400 font-black text-xl">{queueInfo.count}</p>
              <p className="text-white/30 text-xs">قبله</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-white/70 text-sm mb-2 font-semibold">اسم الزبون *</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                className="input-field pr-10"
                placeholder="أدخل اسم الزبون"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-white/70 text-sm mb-2 font-semibold">السعر *</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {PRICE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handlePriceSelect(value)}
                  className={`py-3 rounded-xl border font-black text-lg transition-all duration-200 active:scale-95
                    ${selectedPrice === value
                      ? 'bg-gold-500/20 border-gold-500/60 text-gold-400'
                      : 'bg-white/3 border-white/10 text-white/50 hover:bg-white/8 hover:text-white'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="number"
                className="input-field pr-10"
                placeholder="مبلغ آخر (اختياري)"
                value={form.customPrice}
                onChange={(e) => handleCustomPrice(e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="ghost-btn flex-1"
            >
              إلغاء
            </button>
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="gold-btn flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> جاري الإضافة...</>
              ) : (
                <><Plus className="w-4 h-4" /> إضافة للدور</>
              )}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
