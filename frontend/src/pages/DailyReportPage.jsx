import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Loader2,
  Lock,
  Printer,
  Receipt,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Users,
  Wallet
} from 'lucide-react';
import { SkeletonCard, SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
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

const formatMoney = (value = 0) => `${Number(value || 0).toLocaleString('ar-SA')} ₪`;

const formatDate = (date) => {
  return new Date(`${date}T12:00:00`).toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (date) => {
  if (!date) return '-';

  return new Date(date).toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const buildPrintDocument = ({ date, summary, customers, purchases }) => {
  const customerRows = customers.length === 0
    ? '<tr><td colspan="5">لا يوجد زبائن منتهين في هذا التاريخ</td></tr>'
    : customers.map((customer, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(customer.name)}</td>
        <td>${escapeHtml(customer.queueNumber)}</td>
        <td>${escapeHtml(formatTime(customer.endTime || customer.updatedAt))}</td>
        <td>${escapeHtml(formatMoney(customer.price))}</td>
      </tr>
    `).join('');

  const purchaseRows = purchases.length === 0
    ? '<tr><td colspan="5">لا توجد مشتريات في هذا التاريخ</td></tr>'
    : purchases.map((purchase, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(purchase.itemName)}</td>
        <td>${escapeHtml(purchase.quantity || 1)}</td>
        <td>${escapeHtml(purchase.notes || '-')}</td>
        <td>${escapeHtml(formatMoney(purchase.price))}</td>
      </tr>
    `).join('');

  return `<!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>التقرير اليومي - ${escapeHtml(date)}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            direction: rtl;
            color: #111827;
            background: #ffffff;
            font-family: Arial, "Tahoma", sans-serif;
            font-size: 12px;
            line-height: 1.6;
          }

          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            border-bottom: 2px solid #111827;
            padding-bottom: 14px;
            margin-bottom: 18px;
          }

          h1 {
            margin: 0 0 4px;
            font-size: 28px;
            font-weight: 900;
          }

          .date,
          .brand {
            color: #4b5563;
            font-size: 14px;
            font-weight: 800;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 22px;
          }

          .summary div {
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 10px;
          }

          .summary span {
            display: block;
            color: #6b7280;
            font-size: 11px;
            font-weight: 800;
            margin-bottom: 4px;
          }

          .summary strong {
            color: #111827;
            font-size: 18px;
            font-weight: 900;
          }

          section {
            margin-top: 18px;
            break-inside: auto;
            page-break-inside: auto;
          }

          h2 {
            margin: 0 0 8px;
            font-size: 17px;
            font-weight: 900;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            break-inside: auto;
            page-break-inside: auto;
          }

          thead {
            display: table-header-group;
          }

          tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          th,
          td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: right;
            vertical-align: top;
          }

          th {
            background: #f3f4f6;
            font-weight: 900;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>التقرير اليومي</h1>
            <div class="date">${escapeHtml(formatDate(date))}</div>
          </div>
          <div class="brand">صالون عبود</div>
        </div>

        <div class="summary">
          <div><span>عدد الزبائن</span><strong>${escapeHtml(summary.customersCount)}</strong></div>
          <div><span>إجمالي الربح</span><strong>${escapeHtml(formatMoney(summary.revenue))}</strong></div>
          <div><span>المشتريات</span><strong>${escapeHtml(formatMoney(summary.purchasesTotal))}</strong></div>
          <div><span>الصافي</span><strong>${escapeHtml(formatMoney(summary.netProfit))}</strong></div>
        </div>

        <section>
          <h2>أسماء الزبائن المنتهين</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم</th>
                <th>رقم الدور</th>
                <th>الوقت</th>
                <th>المبلغ</th>
              </tr>
            </thead>
            <tbody>${customerRows}</tbody>
          </table>
        </section>

        <section>
          <h2>مشتريات اليوم</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الصنف</th>
                <th>الكمية</th>
                <th>ملاحظات</th>
                <th>المبلغ</th>
              </tr>
            </thead>
            <tbody>${purchaseRows}</tbody>
          </table>
        </section>
      </body>
    </html>`;
};

export default function DailyReportPage() {
  const today = getLocalDate();
  const [isReportUnlocked, setIsReportUnlocked] = useState(false);
  const [reportPassword, setReportPassword] = useState('');
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const handleReportUnlock = async (e) => {
    e.preventDefault();
    setCheckingPassword(true);

    try {
      await api.post('/auth/verify-dashboard', { password: reportPassword });
      setIsReportUnlocked(true);
      setReportPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'كلمة السر غير صحيحة');
    } finally {
      setCheckingPassword(false);
    }
  };

  const fetchReport = useCallback(async (date = selectedDate) => {
    if (!isReportUnlocked) return;

    try {
      setLoading(true);
      const res = await api.get('/reports/daily', { params: { date } });
      setReport(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'تعذر تحميل التقرير اليومي');
    } finally {
      setLoading(false);
    }
  }, [isReportUnlocked, selectedDate]);

  useEffect(() => {
    if (isReportUnlocked) {
      fetchReport(selectedDate);
    }
  }, [fetchReport, isReportUnlocked, selectedDate]);

  useEffect(() => {
    if (!socket || !isReportUnlocked || selectedDate !== today) return;

    const refreshReport = () => fetchReport(selectedDate);

    socket.on('customerStatusUpdated', refreshReport);
    socket.on('purchaseAdded', refreshReport);

    return () => {
      socket.off('customerStatusUpdated', refreshReport);
      socket.off('purchaseAdded', refreshReport);
    };
  }, [socket, fetchReport, isReportUnlocked, selectedDate, today]);

  const handleDateChange = (date) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const handlePrint = () => {
    if (loading || !isReportUnlocked) return;

    const previousFrame = document.getElementById('daily-report-print-frame');
    previousFrame?.remove();

    const printFrame = document.createElement('iframe');
    printFrame.id = 'daily-report-print-frame';
    printFrame.title = 'daily-report-print';
    printFrame.style.position = 'fixed';
    printFrame.style.left = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.opacity = '0';

    document.body.appendChild(printFrame);

    const printWindow = printFrame.contentWindow;
    const printDocument = printWindow?.document;

    if (!printWindow || !printDocument) {
      window.print();
      return;
    }

    printDocument.open();
    printDocument.write(buildPrintDocument({
      date: selectedDate,
      summary,
      customers,
      purchases
    }));
    printDocument.close();

    printWindow.onafterprint = () => {
      printFrame.remove();
    };

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => printFrame.remove(), 60000);
    }, 250);
  };

  const customers = report?.customers || [];
  const purchases = report?.purchases || [];
  const summary = report?.summary || {
    customersCount: 0,
    revenue: 0,
    purchasesTotal: 0,
    netProfit: 0
  };

  const isToday = selectedDate === today;

  if (!isReportUnlocked) {
    return (
      <div className="flex min-h-[72vh] items-center justify-center">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleReportUnlock}
          className="glass-card w-full max-w-md overflow-hidden p-8 text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-neon-primary/25 bg-neon-primary/10 shadow-2xl shadow-neon-primary/15">
            <Lock className="h-8 w-8 text-neon-cyan" />
          </div>
          <h2 className="mb-2 text-2xl font-black text-white">صفحة التقرير اليومي محمية</h2>
          <p className="mb-6 text-sm leading-7 text-white/42">أدخل كلمة سر لوحة التحكم لعرض التقرير اليومي</p>

          <input
            type="password"
            className="input-field text-center"
            placeholder="كلمة السر"
            value={reportPassword}
            onChange={(event) => setReportPassword(event.target.value)}
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
                دخول صفحة التقرير
              </>
            )}
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="daily-report-page">
      <div className="screen-report space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="page-title">التقرير اليومي</h2>
          <p className="page-subtitle">
            تقرير مرتب لزبائن اليوم المنتهين، إجمالي الربح، والمشتريات حسب التاريخ المحدد.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          disabled={loading}
          className="gold-btn flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          طباعة التقرير
        </button>
      </div>

      <div className="glass-card flex flex-wrap items-center gap-3 p-4">
        <div className="flex items-center gap-2 font-bold text-white/64">
          <CalendarDays className="h-4 w-4 text-neon-cyan" />
          تاريخ التقرير
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
        <span className="text-sm text-white/34">
          {isToday ? 'يعرض تقرير اليوم' : `يعرض تقرير ${selectedDate}`}
        </span>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => <SkeletonCard key={index} />)}
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => <SkeletonRow key={index} />)}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'عدد زبائن اليوم', value: summary.customersCount, icon: Users, color: 'border-neon-cyan/24 bg-neon-cyan/10', text: 'text-neon-cyan' },
              { label: 'إجمالي الربح', value: formatMoney(summary.revenue), icon: Wallet, color: 'border-neon-green/24 bg-neon-green/10', text: 'text-neon-green' },
              { label: 'إجمالي المشتريات', value: formatMoney(summary.purchasesTotal), icon: ShoppingBag, color: 'border-neon-danger/24 bg-neon-danger/10', text: 'text-neon-danger' },
              { label: 'الصافي', value: formatMoney(summary.netProfit), icon: Receipt, color: summary.netProfit >= 0 ? 'border-neon-gold/24 bg-neon-gold/10' : 'border-neon-danger/24 bg-neon-danger/10', text: summary.netProfit >= 0 ? 'text-neon-gold' : 'text-neon-danger' }
            ].map(({ label, value, icon: Icon, color, text }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className={`metric-panel border ${color} flex items-center gap-3 text-right`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-cyber-950/40">
                  <Icon className={`h-5 w-5 ${text}`} />
                </div>
                <div>
                  <p className="mb-1 text-xs font-black text-white/38">{label}</p>
                  <p className={`text-2xl font-black ${text}`}>{value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="glass-card p-5 md:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-cyan/25 bg-neon-cyan/10">
                  <Scissors className="h-4 w-4 text-neon-cyan" />
                </div>
                <div>
                  <h3 className="font-black text-white">الزبائن المنتهين</h3>
                  <p className="text-xs text-white/30">{formatDate(selectedDate)}</p>
                </div>
              </div>

              {customers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="لا يوجد زبائن منتهين"
                  description="لا يوجد زبائن أنهوا الحلاقة في هذا التاريخ"
                />
              ) : (
                <div className="space-y-2">
                  {customers.map((customer, index) => (
                    <div key={customer._id} className="surface-row flex items-center gap-3 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-cyan/22 bg-neon-cyan/10 font-black text-neon-cyan">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-white">{customer.name}</p>
                        <p className="text-xs text-white/30">
                          رقم الدور {customer.queueNumber} · {formatTime(customer.endTime || customer.updatedAt)}
                        </p>
                      </div>
                      <span className="font-black text-neon-green">{formatMoney(customer.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-5 md:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-danger/25 bg-neon-danger/10">
                  <ShoppingBag className="h-4 w-4 text-neon-danger" />
                </div>
                <div>
                  <h3 className="font-black text-white">مشتريات اليوم</h3>
                  <p className="text-xs text-white/30">{formatDate(selectedDate)}</p>
                </div>
              </div>

              {purchases.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="لا توجد مشتريات"
                  description="لا توجد مشتريات مسجلة في هذا التاريخ"
                />
              ) : (
                <div className="space-y-2">
                  {purchases.map((purchase, index) => (
                    <div key={purchase._id} className="surface-row flex items-center gap-3 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-danger/22 bg-neon-danger/10 font-black text-neon-danger">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-white">{purchase.itemName}</p>
                        <p className="text-xs text-white/30">
                          الكمية: {purchase.quantity || 1}
                          {purchase.notes ? ` · ${purchase.notes}` : ''}
                        </p>
                      </div>
                      <span className="font-black text-neon-danger">{formatMoney(purchase.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      </div>

      <section className="print-report">
        <div className="print-report__header">
          <div>
            <h1>التقرير اليومي</h1>
            <p>{formatDate(selectedDate)}</p>
          </div>
          <div className="print-report__brand">صالون عبود</div>
        </div>

        <div className="print-report__summary">
          <div>
            <span>عدد الزبائن</span>
            <strong>{summary.customersCount}</strong>
          </div>
          <div>
            <span>إجمالي الربح</span>
            <strong>{formatMoney(summary.revenue)}</strong>
          </div>
          <div>
            <span>المشتريات</span>
            <strong>{formatMoney(summary.purchasesTotal)}</strong>
          </div>
          <div>
            <span>الصافي</span>
            <strong>{formatMoney(summary.netProfit)}</strong>
          </div>
        </div>

        <div className="print-report__section">
          <h2>أسماء الزبائن المنتهين</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم</th>
                <th>رقم الدور</th>
                <th>الوقت</th>
                <th>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5">لا يوجد زبائن منتهين في هذا التاريخ</td>
                </tr>
              ) : customers.map((customer, index) => (
                <tr key={customer._id}>
                  <td>{index + 1}</td>
                  <td>{customer.name}</td>
                  <td>{customer.queueNumber}</td>
                  <td>{formatTime(customer.endTime || customer.updatedAt)}</td>
                  <td>{formatMoney(customer.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="print-report__section">
          <h2>مشتريات اليوم</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الصنف</th>
                <th>الكمية</th>
                <th>ملاحظات</th>
                <th>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan="5">لا توجد مشتريات في هذا التاريخ</td>
                </tr>
              ) : purchases.map((purchase, index) => (
                <tr key={purchase._id}>
                  <td>{index + 1}</td>
                  <td>{purchase.itemName}</td>
                  <td>{purchase.quantity || 1}</td>
                  <td>{purchase.notes || '-'}</td>
                  <td>{formatMoney(purchase.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
