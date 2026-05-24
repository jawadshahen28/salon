import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  waiting: {
    label: 'قيد الانتظار',
    next: 'ready',
    nextLabel: 'تأهيل',
    nextColor: 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
  },
  ready: {
    label: 'جاهز',
    class: 'badge-ready',
    next: 'done',
    nextLabel: 'إنهاء الخدمة',
    nextColor: 'bg-gold-500/10 border-gold-500/20 text-gold-400 hover:bg-gold-500/20'
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
      <p className="text-[11px] font-black text-cyan-200 leading-tight">
        ضايل قدامك {queueAhead}
      </p>
      <p className="text-[11px] font-bold text-emerald-300 leading-tight mt-0.5">
        الوقت المتوقع {formatDuration(remainingSeconds)}
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

  const borderColor = {
    waiting: 'border-blue-500/20',
    ready: 'border-green-500/30',
    done: 'border-gray-500/10 opacity-60'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      layout
      className={`glass-card border ${borderColor[customer.status]} p-5 group hover:scale-[1.01] transition-all duration-300`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg
          ${customer.status === 'waiting' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' :
            customer.status === 'ready' ? 'bg-green-500/10 border border-green-500/30 text-green-400' :
            'bg-gray-500/10 border border-gray-500/20 text-gray-500'}`}>
          {customer.queueNumber}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-black text-lg text-white truncate">{customer.name}</h3>
            {customer.status === 'waiting' ? (
              <QueueProgress customer={customer} queueAhead={queueAhead} />
            ) : (
              <span className={config.class}>{config.label}</span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-gold-400 font-bold">
              <DollarSign className="w-4 h-4" />
              <span>{customer.price} ₪</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/40 text-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>دخل: {formatTime(customer.entryTime)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {config.next && (
            <button
              onClick={handleStatusChange}
              disabled={loading}
              className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all duration-200 active:scale-95 ${config.nextColor}`}
            >
              {loading ? '...' : config.nextLabel}
            </button>
          )}
          {customer.status !== 'done' && (
            <button
              onClick={handleDelete}
              className="w-9 h-9 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400/50 hover:text-red-400 hover:bg-red-500/15 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
