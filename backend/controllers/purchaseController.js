import Purchase from '../models/Purchase.js';
import Customer from '../models/Customer.js';

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const getMonthDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// @desc    إضافة مشتريات
export const addPurchase = async (req, res) => {
  try {
    const { itemName, quantity, price, notes } = req.body;
    const today = getTodayDate();

    const purchase = await Purchase.create({
      itemName,
      quantity: quantity || 1,
      price,
      notes,
      date: today
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('purchaseAdded', purchase);
    }

    res.status(201).json({
      success: true,
      message: `تم إضافة ${itemName} بنجاح`,
      data: purchase
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    الحصول على المشتريات
export const getPurchases = async (req, res) => {
  try {
    const { date, month } = req.query;
    let filter = {};

    if (date) filter.date = date;
    else if (month) filter.date = { $regex: `^${month}` };

    const purchases = await Purchase.find(filter).sort({ createdAt: -1 });
    const today = getTodayDate();
    const monthPrefix = getMonthDate();

    const todayPurchases = await Purchase.find({ date: today });
    const monthPurchases = await Purchase.find({ date: { $regex: `^${monthPrefix}` } });

    const todayTotal = todayPurchases.reduce((sum, p) => sum + p.price, 0);
    const monthTotal = monthPurchases.reduce((sum, p) => sum + p.price, 0);

    // Calculate net profit
    const todayCustomers = await Customer.find({ date: today, status: 'done' });
    const monthCustomers = await Customer.find({ date: { $regex: `^${monthPrefix}` }, status: 'done' });

    const todayRevenue = todayCustomers.reduce((sum, c) => sum + c.price, 0);
    const monthRevenue = monthCustomers.reduce((sum, c) => sum + c.price, 0);

    res.status(200).json({
      success: true,
      data: {
        purchases,
        stats: {
          todayTotal,
          monthTotal,
          todayNetProfit: todayRevenue - todayTotal,
          monthNetProfit: monthRevenue - monthTotal
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    حذف مشتريات
export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const purchase = await Purchase.findByIdAndDelete(id);

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'المشتريات غير موجودة' });
    }

    res.status(200).json({ success: true, message: 'تم حذف المشتريات بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
