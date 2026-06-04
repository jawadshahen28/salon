import Customer from '../models/Customer.js';
import QueueCounter from '../models/QueueCounter.js';

const CUSTOMER_SLOT_MINUTES = 20;

const formatLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayDate = () => formatLocalDate();

const getMonthDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getNextQueueNumber = async (date) => {
  const latestCustomer = await Customer.findOne({ date }).sort({ queueNumber: -1 });
  const latestQueueNumber = latestCustomer?.queueNumber || 0;

  await QueueCounter.updateOne(
    { date },
    { $setOnInsert: { date, seq: latestQueueNumber } },
    { upsert: true }
  );

  const counter = await QueueCounter.findOneAndUpdate(
    { date },
    { $inc: { seq: 1 } },
    { new: true }
  );

  if (counter.seq <= latestQueueNumber) {
    const syncedCounter = await QueueCounter.findOneAndUpdate(
      { date },
      { $set: { seq: latestQueueNumber + 1 } },
      { new: true }
    );

    return syncedCounter.seq;
  }

  return counter.seq;
};

const ensureUniqueQueueNumbersForDate = async (date) => {
  const customers = await Customer.find({ date }).sort({ queueNumber: 1, createdAt: 1 });
  const usedNumbers = new Set();
  let maxQueueNumber = customers.reduce((max, customer) => Math.max(max, customer.queueNumber || 0), 0);

  for (const customer of customers) {
    if (customer.queueNumber > 0 && !usedNumbers.has(customer.queueNumber)) {
      usedNumbers.add(customer.queueNumber);
      continue;
    }

    maxQueueNumber += 1;
    customer.queueNumber = maxQueueNumber;
    usedNumbers.add(maxQueueNumber);
    await customer.save();
  }

  await QueueCounter.findOneAndUpdate(
    { date },
    { $max: { seq: maxQueueNumber } },
    { upsert: true }
  );
};

// Calculate expected time for a customer based on queue position
const calculateExpectedTime = (queuePosition, baseTime = new Date()) => {
  const expectedTime = new Date(baseTime);
  expectedTime.setMinutes(expectedTime.getMinutes() + (queuePosition * CUSTOMER_SLOT_MINUTES));
  return expectedTime;
};

// @desc    إضافة زبون جديد للدور
export const addCustomer = async (req, res) => {
  try {
    const { name, price } = req.body;
    const today = getTodayDate();

    await ensureUniqueQueueNumbersForDate(today);
    const queueNumber = await getNextQueueNumber(today);

    const activeCustomers = await Customer.find({
      date: today,
      status: { $ne: 'done' }
    }).sort({ queueNumber: 1 });

    const now = new Date();

    // Calculate expected time based on queue position
    const waitingMinutes = activeCustomers.length * CUSTOMER_SLOT_MINUTES;
    const expectedTime = new Date(now);
    expectedTime.setMinutes(expectedTime.getMinutes() + waitingMinutes);

    const customer = await Customer.create({
      name,
      price,
      queueNumber,
      status: 'waiting',
      entryTime: now,
      expectedTime,
      remainingMinutes: waitingMinutes,
      date: today
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('customerAdded', customer);
      io.emit('queueUpdated', { type: 'add', customer });
    }

    res.status(201).json({
      success: true,
      message: `تم إضافة ${name} للدور بنجاح. رقم الدور: ${queueNumber}`,
      data: customer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    تغيير حالة الزبون
export const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'الزبون غير موجود' });
    }

    const oldStatus = customer.status;
    const now = new Date();

    if (status === 'ready' && oldStatus === 'waiting') {
      customer.startTime = now;
    }

    if (status === 'done' && oldStatus !== 'done') {
      customer.endTime = now;

      // Smart time logic: calculate actual duration
      if (customer.startTime) {
        const actualDuration = Math.round((now - customer.startTime) / 60000);
        const savedMinutes = Math.max(0, CUSTOMER_SLOT_MINUTES - actualDuration);

        // Update remaining customers' expected times
        if (savedMinutes > 0) {
          const laterCustomers = await Customer.find({
            date: customer.date,
            queueNumber: { $gt: customer.queueNumber },
            status: { $ne: 'done' }
          });

          for (const laterCustomer of laterCustomers) {
            const newExpected = new Date(laterCustomer.expectedTime);
            newExpected.setMinutes(newExpected.getMinutes() - savedMinutes);
            laterCustomer.expectedTime = newExpected;

            const remainingMs = newExpected - now;
            laterCustomer.remainingMinutes = Math.max(0, Math.round(remainingMs / 60000));
            await laterCustomer.save();
          }

          // Emit smart time update
          const io = req.app.get('io');
          if (io) {
            io.emit('timeUpdated', { savedMinutes, customerId: id });
          }
        }
      }
    }

    customer.status = status;
    await customer.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('customerStatusUpdated', customer);
      io.emit('queueUpdated', { type: 'statusChange', customer });
    }

    const statusText = { waiting: 'قيد الانتظار', ready: 'جاهز', done: 'انتهى' };

    res.status(200).json({
      success: true,
      message: `تم تغيير حالة ${customer.name} إلى ${statusText[status]}`,
      data: customer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    الحصول على دور اليوم
export const getTodayQueue = async (req, res) => {
  try {
    const today = getTodayDate();
    const now = new Date();

    await ensureUniqueQueueNumbersForDate(today);
    const customers = await Customer.find({
      date: today,
      status: { $ne: 'done' }
    }).sort({ queueNumber: 1 });

    // Update remaining minutes dynamically
    const updatedCustomers = customers.map(c => {
      if (c.status === 'waiting' && c.expectedTime) {
        const remainingMs = c.expectedTime - now;
        c.remainingMinutes = Math.max(0, Math.round(remainingMs / 60000));
      }
      return c;
    });

    res.status(200).json({
      success: true,
      data: updatedCustomers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    حذف زبون
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'الزبون غير موجود' });
    }

    await Customer.findByIdAndDelete(id);

    const io = req.app.get('io');
    if (io) {
      io.emit('customerDeleted', { id });
      io.emit('queueUpdated', { type: 'delete', customerId: id });
    }

    res.status(200).json({ success: true, message: 'تم حذف الزبون بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    إحصائيات الداشبورد
export const getDashboardStats = async (req, res) => {
  try {
    const today = getTodayDate();
    const monthPrefix = getMonthDate();

    const [
      todayCustomers,
      monthCustomers,
      todayQueue
    ] = await Promise.all([
      Customer.find({ date: today }),
      Customer.find({ date: { $regex: `^${monthPrefix}` } }),
      Customer.find({ date: today, status: { $ne: 'done' } })
    ]);

    const todayRevenue = todayCustomers.filter(c => c.status === 'done').reduce((sum, c) => sum + c.price, 0);
    const monthRevenue = monthCustomers.filter(c => c.status === 'done').reduce((sum, c) => sum + c.price, 0);

    const waitingCount = todayQueue.filter(c => c.status === 'waiting').length;
    const readyCount = todayQueue.filter(c => c.status === 'ready').length;

    // Daily chart data (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayCustomers = await Customer.find({ date: dateStr, status: 'done' });
      const dayRevenue = dayCustomers.reduce((sum, c) => sum + c.price, 0);
      last7Days.push({
        date: dateStr,
        day: date.toLocaleDateString('ar-SA', { weekday: 'short' }),
        revenue: dayRevenue,
        count: dayCustomers.length
      });
    }

    // Monthly chart data (last 6 months)
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthCust = await Customer.find({ date: { $regex: `^${monthStr}` }, status: 'done' });
      const mRevenue = monthCust.reduce((sum, c) => sum + c.price, 0);
      last6Months.push({
        month: monthStr,
        label: date.toLocaleDateString('ar-SA', { month: 'short' }),
        revenue: mRevenue,
        count: monthCust.length
      });
    }

    res.status(200).json({
      success: true,
      data: {
        todayCustomersCount: todayCustomers.length,
        monthCustomersCount: monthCustomers.length,
        todayRevenue,
        monthRevenue,
        waitingCount,
        readyCount,
        dailyChart: last7Days,
        monthlyChart: last6Months,
        recentCustomers: todayCustomers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
