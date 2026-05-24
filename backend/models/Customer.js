import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الزبون مطلوب'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'السعر مطلوب'],
    min: [0, 'السعر لا يمكن أن يكون سالباً']
  },
  queueNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'ready', 'done'],
    default: 'waiting'
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  expectedTime: {
    type: Date
  },
  remainingMinutes: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  date: {
    type: String, // YYYY-MM-DD format for daily grouping
    required: true
  }
}, { timestamps: true });

customerSchema.index({ date: 1, queueNumber: 1 }, { unique: true });

export default mongoose.model('Customer', customerSchema);
