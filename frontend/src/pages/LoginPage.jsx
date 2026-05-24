import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import BarberLogo from '../components/ui/BarberLogo';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(form.email, form.password);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/');
    } catch (err) {
      const message = err.response
        ? err.response.data?.message || 'بيانات الدخول غير صحيحة'
        : err.message || 'تعذر الاتصال بالسيرفر. تأكد أن الباكند يعمل على المنفذ 5003';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(108,92,255,0.24),transparent_34rem),radial-gradient(circle_at_12%_22%,rgba(0,209,255,0.18),transparent_30rem),linear-gradient(140deg,#020611,#06101d_48%,#03040c)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-neon-cyan/50 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px] opacity-45" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_28rem]"
      >
        <section className="hidden lg:block">
          <div className="page-kicker mb-4">Luxury Operations</div>
          <h1 className="max-w-xl text-5xl font-black leading-tight text-white">
            صالون عبود
            <span className="mt-2 block text-gradient-cyber">لوحة إدارة مستقبلية</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-8 text-white/45">
            متابعة الدور، العملاء، المشتريات، والمؤشرات اليومية من واجهة واحدة مصممة للعمل السريع.
          </p>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {['دور مباشر', 'مزامنة فورية', 'تحكم آمن'].map((item) => (
              <div key={item} className="glass-card px-4 py-3 text-center text-xs font-black text-white/70">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <BarberLogo size="lg" className="mb-4" />
            <h1 className="text-3xl font-black text-gradient-cyber">صالون عبود</h1>
            <p className="mt-1 text-sm text-white/40">تسجيل دخول الإدارة</p>
          </div>

          <div className="glass-card overflow-hidden border-neon-cyan/20 p-7 shadow-2xl shadow-neon-primary/10 md:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="page-kicker mb-3">Secure Access</p>
                <h2 className="text-2xl font-black text-white">تسجيل الدخول</h2>
              </div>
              <BarberLogo size="sm" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-white/68">البريد الإلكتروني</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white/68">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pl-12"
                    placeholder="********"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="gold-btn mt-6 flex w-full items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    دخول
                    <LogIn className="h-5 w-5" />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
