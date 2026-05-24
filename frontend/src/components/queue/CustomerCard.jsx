import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Trash2, Zap } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  waiting: {
    label: 'قيد الانتظار',
    class: 'badge-waiting',
    next: 'ready',
    nextLabel: 'تأهيل',
    nextColor: 'border-neon-green/25 bg-neon-green/10 text-neon-green hover:bg-neon-green/16'
  },
  ready: {
    label: 'جاهز',
    class: 'badge-ready',
    next: 'done',
    nextLabel: 'إنهاء الخدمة',
    nextColor: 'border-neon-gold/25 bg-neon-gold/10 text-neon-gold hover:bg-neon-gold/16'
  },
  done: {
    label: 'انتهى',
    class: 'badge-done',
    next: null,
    nextLabel: null,
    nextColor: ''
  }
};

const formatDuration = (totalSeconds) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const pad = (value) => String(value).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
};

function QueueProgress({ customer, queueAhead = 0 }) {
  const getRemainingSeconds = () => {
    if (customer.expectedTime) {
      return Math.ceil((new Date(customer.expectedTime).getTime() - Date.now()) / 1000);
    }

    return (customer.remainingMinutes || 0) * 60;
  };

  const [remainingSeconds, setRemainingSeconds] = useState(getRemainingSeconds);

  useEffect(() => {
    setRemainingSeconds(getRemainingSeconds());
    const interval = setInterval(() => {
      setRemainingSeconds(getRemainingSeconds());
    }, 1000);

    return () => clearInterval(interval);
  }, [customer.expectedTime, customer.remainingMinutes]);

  return (
    <div className="queue-progress">
      <p className="text-[11px] font-black leading-tight text-neon-cyan">
        قبلك {queueAhead}
      </p>
      <p className="mt-0.5 text-[11px] font-bold leading-tight text-neon-green">
        المتوقع {formatDuration(remainingSeconds)}
      </p>
    </div>
  );
}

export default function CustomerCard({ customer, index, queueAhead = 0, onUpdate, onDelete }) {
  const [loading, setLoading] = useState(false);
  const config = STATUS_CONFIG[customer.status];

  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleStatusChange = async () => {
    if (!config.next) return;
    setLoading(true);

    try {
      await api.put(`/customers/${customer._id}/status`, { status: config.next });
      toast.success(`تم تغيير حالة ${customer.name} إلى ${STATUS_CONFIG[config.next].label}`);
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف ${customer.name}؟`)) return;

    try {
      await api.delete(`/customers/${customer._id}`);
      toast.success(`تم حذف ${customer.name} من الدور`);
      onDelete();
    } catch (err) {
      toast.error('حدث خطأ في الحذف');
    }
  };

  const statusStyle = {
    waiting: 'border-neon-cyan/22',
    ready: 'border-neon-green/28',
    done: 'border-white/8 opacity-70'
  };

  const numberStyle = {
    waiting: 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan',
    ready: 'border-neon-green/30 bg-neon-green/10 text-neon-green',
    done: 'border-white/10 bg-white/8 text-white/45'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      layout
      className={`glass-card group overflow-hidden border ${statusStyle[customer.status]} p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-neon-cyan/35 md:p-5`}
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-l from-transparent via-neon-cyan/45 to-transparent" />

      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border text-xl font-black shadow-lg shadow-black/20 ${numberStyle[customer.status]}`}>
          {customer.queueNumber}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="truncate text-xl font-black text-white">{customer.name}</h3>
            {customer.status === 'waiting' ? (
              <QueueProgress customer={customer} queueAhead={queueAhead} />
            ) : (
              <span className={config.class}>{config.label}</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-neon-gold/20 bg-neon-gold/10 px-3 py-1 text-sm font-black text-neon-gold">
              <DollarSign className="h-4 w-4" />
              <span>{customer.price} ₪</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-white/42">
              <Clock className="h-3.5 w-3.5" />
              <span>دخل: {formatTime(customer.entryTime)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 md:justify-end">
          {config.next && (
            <button
              onClick={handleStatusChange}
              disabled={loading}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-black transition-all duration-300 hover:scale-[1.01] active:scale-95 disabled:opacity-60 ${config.nextColor}`}
            >
              <Zap className="h-4 w-4" />
              {loading ? '...' : config.nextLabel}
            </button>
          )}
          {customer.status !== 'done' && (
            <button
              onClick={handleDelete}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-danger/20 bg-neon-danger/8 text-neon-danger/55 opacity-100 transition-all duration-300 hover:bg-neon-danger/15 hover:text-neon-danger md:opacity-0 md:group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
