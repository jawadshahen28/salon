import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, ShoppingBag, Wallet, Clock, CheckCircle,
  BarChart3, Activity, Lock, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import StatCard from '../components/ui/StatCard';
import { SkeletonCard, SkeletonChart } from '../components/ui/Skeleton';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card border border-gold-500/20 p-3 text-sm">
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="font-bold">
            {entry.name}: {entry.value} ₪
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [isDashboardUnlocked, setIsDashboardUnlocked] = useState(false);
  const [dashboardPassword, setDashboardPassword] = useState('');
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [stats, setStats] = useState(null);
  const [purchases, setPurchases] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const handleDashboardUnlock = async (e) => {
    e.preventDefault();
    setCheckingPassword(true);

    try {
      await api.post('/auth/verify-dashboard', { password: dashboardPassword });
      setIsDashboardUnlocked(true);
      setDashboardPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'كلمة السر غير صحيحة');
    } finally {
      setCheckingPassword(false);
    }
  };

  const fetchData = useCallback(async () => {
    if (!isDashboardUnlocked) return;

    try {
      const [statsRes, purchasesRes] = await Promise.all([
        api.get('/customers/dashboard'),
        api.get('/purchases')
      ]);
      setStats(statsRes.data.data);
      setPurchases(purchasesRes.data.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isDashboardUnlocked]);

  useEffect(() => {
    if (isDashboardUnlocked) {
      fetchData();
    }
  }, [isDashboardUnlocked, fetchData]);

  useEffect(() => {
    const lockDashboard = () => {
      setIsDashboardUnlocked(false);
      setDashboardPassword('');
      setLoading(true);
    };

    window.addEventListener('dashboard-lock', lockDashboard);
    return () => window.removeEventListener('dashboard-lock', lockDashboard);
  }, []);

  useEffect(() => {
    if (!socket || !isDashboardUnlocked) return;
    socket.on('customerAdded', fetchData);
    socket.on('customerStatusUpdated', fetchData);
    socket.on('purchaseAdded', fetchData);
    return () => {
      socket.off('customerAdded', fetchData);
      socket.off('customerStatusUpdated', fetchData);
      socket.off('purchaseAdded', fetchData);
    };
  }, [socket, fetchData, isDashboardUnlocked]);

  const netProfitToday = (stats?.todayRevenue || 0) - (purchases?.todayTotal || 0);
  const netProfitMonth = (stats?.monthRevenue || 0) - (purchases?.monthTotal || 0);

  if (!isDashboardUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleDashboardUnlock}
          className="glass-card p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-gold-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">لوحة التحكم محمية</h2>
          <p className="text-white/40 text-sm mb-6">أدخل كلمة السر لعرض إحصائيات صالون عبود</p>

          <input
            type="password"
            className="input-field text-center"
            placeholder="كلمة السر"
            value={dashboardPassword}
            onChange={(event) => setDashboardPassword(event.target.value)}
            autoFocus
            required
          />

          <button
            type="submit"
            disabled={checkingPassword}
            className="gold-btn w-full flex items-center justify-center gap-2 mt-5"
          >
            {checkingPassword ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري التحقق...
              </>
            ) : (
              'دخول لوحة التحكم'
            )}
          </button>
        </motion.form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonChart /><SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-black text-white mb-1">لوحة التحكم</h2>
        <p className="text-white/30 text-sm">مرحباً بك! هذا ملخص أعمالك اليوم</p>
      </motion.div>

      {/* Live stats row */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card border border-blue-500/20 p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-white/40 text-xs">في الانتظار</p>
            <p className="text-2xl font-black text-blue-400">{stats?.waitingCount || 0}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="glass-card border border-green-500/20 p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-white/40 text-xs">جاهز للخدمة</p>
            <p className="text-2xl font-black text-green-400">{stats?.readyCount || 0}</p>
          </div>
        </motion.div>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="زبائن اليوم" value={stats?.todayCustomersCount || 0} subtitle="إجمالي الزبائن" icon={Users} color="blue" delay={0.1} />
        <StatCard title="زبائن الشهر" value={stats?.monthCustomersCount || 0} subtitle="هذا الشهر" icon={Users} color="purple" delay={0.15} />
        <StatCard title="أرباح اليوم" value={`${stats?.todayRevenue || 0} ₪`} subtitle="من الخدمات" icon={TrendingUp} color="gold" delay={0.2} />
        <StatCard title="أرباح الشهر" value={`${stats?.monthRevenue || 0} ₪`} subtitle="هذا الشهر" icon={TrendingUp} color="gold" delay={0.25} />
        <StatCard title="مشتريات اليوم" value={`${purchases?.todayTotal || 0} ₪`} subtitle="المصاريف" icon={ShoppingBag} color="red" delay={0.3} />
        <StatCard title="مشتريات الشهر" value={`${purchases?.monthTotal || 0} ₪`} subtitle="هذا الشهر" icon={ShoppingBag} color="red" delay={0.35} />
        <StatCard title="صافي ربح اليوم" value={`${netProfitToday} ₪`} subtitle="الأرباح - المصاريف" icon={Wallet} color={netProfitToday >= 0 ? 'green' : 'red'} delay={0.4} />
        <StatCard title="صافي ربح الشهر" value={`${netProfitMonth} ₪`} subtitle="هذا الشهر" icon={Wallet} color={netProfitMonth >= 0 ? 'green' : 'red'} delay={0.45} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-gold-400" />
            </div>
            <div>
              <h3 className="font-black text-white">الأرباح اليومية</h3>
              <p className="text-white/30 text-xs">آخر 7 أيام</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats?.dailyChart || []}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="الأرباح" stroke="#f59e0b" fill="url(#goldGrad)" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-black text-white">الأرباح الشهرية</h3>
              <p className="text-white/30 text-xs">آخر 6 أشهر</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.monthlyChart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="الأرباح" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent customers */}
      {stats?.recentCustomers?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="font-black text-white mb-4">آخر الزبائن</h3>
          <div className="space-y-3">
            {stats.recentCustomers.map((c, i) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center font-black text-gold-400">
                  {c.queueNumber}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{c.name}</p>
                  <p className="text-white/30 text-xs">
                    {new Date(c.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
                <span className={`text-sm font-bold ${c.status === 'done' ? 'text-green-400' : c.status === 'ready' ? 'text-blue-400' : 'text-white/50'}`}>
                  {c.price} ₪
                </span>
                <span className={`text-xs px-2 py-1 rounded-lg ${c.status === 'done' ? 'badge-done' : c.status === 'ready' ? 'badge-ready' : 'badge-waiting'}`}>
                  {c.status === 'done' ? 'انتهى' : c.status === 'ready' ? 'جاهز' : 'انتظار'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
