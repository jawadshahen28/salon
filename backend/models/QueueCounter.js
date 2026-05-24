import mongoose from 'mongoose';

const queueCounterSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true
  },
  seq: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('QueueCounter', queueCounterSchema);
