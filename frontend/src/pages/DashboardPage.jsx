import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, ShoppingBag, Wallet, Clock, CheckCircle,
  BarChart3, Activity, Lock, Loader2, ShieldCheck
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import StatCard from '../components/ui/StatCard';
import { SkeletonCard, SkeletonChart } from '../components/ui/Skeleton';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card border border-neon-cyan/20 p-3 text-sm">
        <p className="mb-1 text-white/60">{label}</p>
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
      <div className="flex min-h-[72vh] items-center justify-center">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleDashboardUnlock}
          className="glass-card w-full max-w-md overflow-hidden p-8 text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-neon-primary/25 bg-neon-primary/10 shadow-2xl shadow-neon-primary/15">
            <Lock className="h-8 w-8 text-neon-cyan" />
          </div>
          <p className="page-kicker mx-auto mb-4 w-fit">Protected Analytics</p>
          <h2 className="mb-2 text-2xl font-black text-white">لوحة التحكم محمية</h2>
          <p className="mb-6 text-sm leading-7 text-white/42">أدخل كلمة السر لعرض إحصائيات صالون عبود</p>

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
            className="gold-btn mt-5 flex w-full items-center justify-center gap-2"
          >
            {checkingPassword ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                جاري التحقق...
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                دخول لوحة التحكم
              </>
            )}
          </button>
        </motion.form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonChart /><SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="page-kicker mb-3">Executive Overview</p>
          <h2 className="page-title">لوحة التحكم</h2>
          <p className="page-subtitle">ملخص حي لأداء الصالون، الدور، الإيرادات، والمصاريف اليومية.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="metric-panel flex items-center gap-3 text-right"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neon-cyan/25 bg-neon-cyan/10">
            <Clock className="h-5 w-5 text-neon-cyan" />
          </div>
          <div>
            <p className="text-xs font-black text-white/38">في الانتظار</p>
            <p className="text-3xl font-black text-neon-cyan">{stats?.waitingCount || 0}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="metric-panel flex items-center gap-3 text-right"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neon-green/25 bg-neon-green/10">
            <CheckCircle className="h-5 w-5 text-neon-green" />
          </div>
          <div>
            <p className="text-xs font-black text-white/38">جاهز للخدمة</p>
            <p className="text-3xl font-black text-neon-green">{stats?.readyCount || 0}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="زبائن اليوم" value={stats?.todayCustomersCount || 0} subtitle="إجمالي الزبائن" icon={Users} color="blue" delay={0.1} />
        <StatCard title="زبائن الشهر" value={stats?.monthCustomersCount || 0} subtitle="هذا الشهر" icon={Users} color="purple" delay={0.15} />
        <StatCard title="أرباح اليوم" value={`${stats?.todayRevenue || 0} ₪`} subtitle="من الخدمات" icon={TrendingUp} color="gold" delay={0.2} />
        <StatCard title="أرباح الشهر" value={`${stats?.monthRevenue || 0} ₪`} subtitle="هذا الشهر" icon={TrendingUp} color="gold" delay={0.25} />
        <StatCard title="مشتريات اليوم" value={`${purchases?.todayTotal || 0} ₪`} subtitle="المصاريف" icon={ShoppingBag} color="red" delay={0.3} />
        <StatCard title="مشتريات الشهر" value={`${purchases?.monthTotal || 0} ₪`} subtitle="هذا الشهر" icon={ShoppingBag} color="red" delay={0.35} />
        <StatCard title="صافي ربح اليوم" value={`${netProfitToday} ₪`} subtitle="الأرباح - المصاريف" icon={Wallet} color={netProfitToday >= 0 ? 'green' : 'red'} delay={0.4} />
        <StatCard title="صافي ربح الشهر" value={`${netProfitMonth} ₪`} subtitle="هذا الشهر" icon={Wallet} color={netProfitMonth >= 0 ? 'green' : 'red'} delay={0.45} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-gold/25 bg-neon-gold/10">
              <Activity className="h-4 w-4 text-neon-gold" />
            </div>
            <div>
              <h3 className="font-black text-white">الأرباح اليومية</h3>
              <p className="text-xs text-white/30">آخر 7 أيام</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.dailyChart || []}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB800" stopOpacity={0.36}/>
                  <stop offset="95%" stopColor="#FFB800" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.22)" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.22)" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="الأرباح" stroke="#FFB800" fill="url(#goldGrad)" strokeWidth={3} dot={{ fill: '#FFB800', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-card p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-cyan/25 bg-neon-cyan/10">
              <BarChart3 className="h-4 w-4 text-neon-cyan" />
            </div>
            <div>
              <h3 className="font-black text-white">الأرباح الشهرية</h3>
              <p className="text-xs text-white/30">آخر 6 أشهر</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.monthlyChart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.22)" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.22)" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="الأرباح" fill="#00D1FF" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {stats?.recentCustomers?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="mb-4 font-black text-white">آخر الزبائن</h3>
          <div className="space-y-3">
            {stats.recentCustomers.map((c, i) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="surface-row flex items-center gap-4 p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-gold/25 bg-neon-gold/10 font-black text-neon-gold">
                  {c.queueNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{c.name}</p>
                  <p className="text-xs text-white/30">
                    {new Date(c.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
                <span className={`text-sm font-black ${c.status === 'done' ? 'text-neon-green' : c.status === 'ready' ? 'text-neon-cyan' : 'text-white/55'}`}>
                  {c.price} ₪
                </span>
                <span className={`text-xs ${c.status === 'done' ? 'badge-done' : c.status === 'ready' ? 'badge-ready' : 'badge-waiting'}`}>
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
