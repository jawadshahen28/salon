import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, User, DollarSign, Loader2, Clock, Hash, ArrowLeft } from 'lucide-react';
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
      toast.success(`تم إضافة ${form.name} - رقم الدور: ${customer.queueNumber}`);
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
    <div className="relative flex min-h-[74vh] flex-col items-center justify-center gap-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl text-center"
      >
        <div className="mb-5 flex items-center justify-center gap-3">
          <BarberLogo size="sm" />
          <div className="text-right">
            <h2 className="page-title text-gradient-cyber">إضافة زبون جديد</h2>
          </div>
        </div>
        <p className="page-subtitle mx-auto">ابدأ بطاقة دور جديدة مع السعر والوقت المتوقع بشكل فوري.</p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 16 }}
        whileHover={{ scale: 1.04, y: -4 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleOpen}
        className="group relative flex h-52 w-52 flex-col items-center justify-center gap-4 overflow-hidden rounded-[2rem] border border-neon-cyan/25 bg-neon-cyan/10 shadow-2xl shadow-neon-cyan/10 transition-all duration-300 hover:border-neon-green/35 hover:bg-neon-green/10"
      >
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-white/60 to-transparent" />
        <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-neon-gold/30 bg-neon-gold/14 shadow-lg shadow-neon-gold/15 transition-all duration-300 group-hover:rotate-3">
          <Plus className="h-10 w-10 text-neon-gold stroke-[3]" />
        </div>
        <span className="text-xl font-black text-white">إضافة زبون</span>
        <span className="text-xs font-bold text-white/38">فتح نموذج الإدخال</span>
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-white/34"
      >
        أو اذهب إلى{' '}
        <button onClick={() => navigate('/queue')} className="inline-flex items-center gap-1 font-black text-neon-cyan transition-colors hover:text-white">
          صفحة الدور
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
      </motion.p>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="إضافة زبون جديد"
      >
        {queueInfo && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="metric-panel border-neon-cyan/20 bg-neon-cyan/10 p-3">
              <Hash className="mx-auto mb-1 h-4 w-4 text-neon-cyan" />
              <p className="text-xl font-black text-neon-cyan">{queueInfo.nextNumber}</p>
              <p className="text-xs text-white/32">رقم الدور</p>
            </div>
            <div className="metric-panel border-neon-gold/20 bg-neon-gold/10 p-3">
              <Clock className="mx-auto mb-1 h-4 w-4 text-neon-gold" />
              <p className="text-xl font-black text-neon-gold">{queueInfo.waitMinutes}</p>
              <p className="text-xs text-white/32">دقيقة انتظار</p>
            </div>
            <div className="metric-panel border-neon-green/20 bg-neon-green/10 p-3">
              <User className="mx-auto mb-1 h-4 w-4 text-neon-green" />
              <p className="text-xl font-black text-neon-green">{queueInfo.count}</p>
              <p className="text-xs text-white/32">قبله</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-white/68">اسم الزبون *</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                className="input-field pr-11"
                placeholder="أدخل اسم الزبون"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white/68">السعر *</label>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {PRICE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handlePriceSelect(value)}
                  className={`rounded-2xl border py-3 text-lg font-black transition-all duration-300 active:scale-95 ${
                    selectedPrice === value
                      ? 'border-neon-gold/50 bg-neon-gold/15 text-neon-gold shadow-lg shadow-neon-gold/10'
                      : 'border-white/10 bg-white/5 text-white/55 hover:border-neon-cyan/25 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative">
              <DollarSign className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="number"
                className="input-field pr-11"
                placeholder="مبلغ آخر (اختياري)"
                value={form.customPrice}
                onChange={(e) => handleCustomPrice(e.target.value)}
                min="0"
              />
            </div>
          </div>

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
              className="gold-btn flex flex-1 items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> جاري الإضافة...</>
              ) : (
                <><Plus className="h-4 w-4" /> إضافة للدور</>
              )}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
