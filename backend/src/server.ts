import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectToDatabase } from './infrastructure/db/connection';
import authRoutes from './presentation/routes/authRoutes';
import adminRoutes from './presentation/routes/adminRoutes';
import paymentRoutes from './presentation/routes/paymentRoutes';
import reunionRoutes from './presentation/routes/reunionRoutes';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is missing!');
  process.exit(1);
}

// Global Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reunion', reunionRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('🔥 Server Error Exception:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected internal server error occurred.'
  });
});

// Boot Server after connecting to Database
async function startServer() {
  try {
    await connectToDatabase(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`🚀 EX-POLS API Server is running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to boot application:', error);
    process.exit(1);
  }
}

startServer();
