import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'اسم الصنف مطلوب'],
    trim: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: [0, 'الكمية لا يمكن أن تكون سالبة']
  },
  price: {
    type: Number,
    required: [true, 'السعر مطلوب'],
    min: [0, 'السعر لا يمكن أن يكون سالباً']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'الملاحظات لا يمكن أن تتجاوز 200 حرف']
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Purchase', purchaseSchema);
