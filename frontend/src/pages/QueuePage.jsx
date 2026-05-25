import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Users, RotateCcw, Search, Plus, Timer, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomerCard from '../components/queue/CustomerCard';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/Skeleton';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';

const FILTERS = [
  { value: 'all', label: 'الكل' },
  { value: 'waiting', label: 'انتظار' },
  { value: 'ready', label: 'جاهز' }
];

export default function QueuePage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { socket } = useSocket();
  const navigate = useNavigate();

  const fetchQueue = useCallback(async () => {
    try {
      const res = await api.get('/customers/queue');
      setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  useEffect(() => {
    if (!socket) return;

    socket.on('queueUpdated', fetchQueue);
    socket.on('customerStatusUpdated', fetchQueue);
    socket.on('timeUpdated', fetchQueue);

    return () => {
      socket.off('queueUpdated', fetchQueue);
      socket.off('customerStatusUpdated', fetchQueue);
      socket.off('timeUpdated', fetchQueue);
    };
  }, [socket, fetchQueue]);

  const filtered = customers.filter((customer) => {
    const matchFilter = filter === 'all' || customer.status === filter;
    const matchSearch = !search || customer.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    waiting: customers.filter((customer) => customer.status === 'waiting').length,
    ready: customers.filter((customer) => customer.status === 'ready').length,
    total: customers.length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="page-title">إدارة الدور</h2>
          <p className="page-subtitle">{stats.total} زبون في الدور حالياً مع تحديثات مباشرة للحالة والوقت.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchQueue}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/55 transition-all duration-300 hover:border-neon-cyan/35 hover:text-white"
            title="تحديث"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate('/add-customer')}
            className="gold-btn flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            إضافة زبون
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          { label: 'في الدور', value: stats.total, icon: Users, color: 'text-white', bg: 'border-white/10 bg-white/5' },
          { label: 'انتظار', value: stats.waiting, icon: Timer, color: 'text-neon-cyan', bg: 'border-neon-cyan/22 bg-neon-cyan/10' },
          { label: 'جاهز', value: stats.ready, icon: CheckCircle2, color: 'text-neon-green', bg: 'border-neon-green/22 bg-neon-green/10' }
        ].map(({ label, value, icon: Icon, color, bg }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className={`metric-panel border ${bg} flex items-center gap-3 text-right`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-cyber-950/40">
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className={`text-3xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-white/40">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card flex flex-wrap gap-3 p-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            className="input-field py-2.5 pr-11 text-sm"
            placeholder="بحث عن زبون..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-black transition-all duration-300 ${
                filter === value
                  ? 'border border-neon-cyan/35 bg-neon-cyan/12 text-neon-cyan shadow-lg shadow-neon-cyan/10'
                  : 'border border-white/10 bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => <SkeletonRow key={index} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'لم يتم العثور على نتائج' : 'لا يوجد زبائن في الدور'}
          description={search ? 'جرب البحث بكلمة مختلفة' : 'لا يوجد زبائن ينتظرون حالياً. أضف زبوناً جديداً للبدء'}
          action={!search ? { label: '+ إضافة زبون', onClick: () => navigate('/add-customer') } : undefined}
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((customer, index) => (
              <CustomerCard
                key={customer._id}
                customer={customer}
                index={index}
                queueAhead={customers.filter((item) => item.queueNumber < customer.queueNumber).length}
                onUpdate={fetchQueue}
                onDelete={fetchQueue}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
