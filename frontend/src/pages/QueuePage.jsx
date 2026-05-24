import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Users, RotateCcw, Search, Plus } from 'lucide-react';
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-white mb-1">إدارة الدور</h2>
          <p className="text-white/30 text-sm">{stats.total} زبون في الدور حالياً</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchQueue}
            className="w-10 h-10 glass-card border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            title="تحديث"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/add-customer')}
            className="gold-btn flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة زبون
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'في الدور', value: stats.total, color: 'text-white', bg: 'bg-white/5 border-white/10' },
          { label: 'انتظار', value: stats.waiting, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'جاهز', value: stats.ready, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' }
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`glass-card border ${bg} p-4 text-center`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-white/40 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            className="input-field pr-10 py-2.5 text-sm"
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
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                filter === value
                  ? 'bg-gold-500/20 border border-gold-500/40 text-gold-400'
                  : 'glass-card border border-white/10 text-white/50 hover:text-white'
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
