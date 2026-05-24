import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import purchaseRoutes from './routes/purchases.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
console.log(process.env.MONGODB_URI);

await connectDB();

const app = express();
const server = createServer(app);

const allowedOrigins = ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000'];

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : allowedOrigins,
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/purchases', purchaseRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running normally' });
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
