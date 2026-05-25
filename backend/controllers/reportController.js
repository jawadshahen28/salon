import Customer from '../models/Customer.js';
import Purchase from '../models/Purchase.js';

const getLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

// @desc    التقرير اليومي للزبائن المنتهين والمشتريات
export const getDailyReport = async (req, res) => {
  try {
    const date = req.query.date || getLocalDate();

    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'صيغة التاريخ غير صحيحة'
      });
    }

    const [customers, purchases] = await Promise.all([
      Customer.find({ date, status: 'done' }).sort({ endTime: 1, createdAt: 1 }),
      Purchase.find({ date }).sort({ createdAt: 1 })
    ]);

    const revenue = customers.reduce((sum, customer) => sum + (customer.price || 0), 0);
    const purchasesTotal = purchases.reduce((sum, purchase) => sum + (purchase.price || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        date,
        customers,
        purchases,
        summary: {
          customersCount: customers.length,
          revenue,
          purchasesTotal,
          netProfit: revenue - purchasesTotal
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
