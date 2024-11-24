import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import { CryptoService } from './services/cryptoService.js';
import { MentionsService } from './services/mentionsService.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize services
const cache = new NodeCache({
  stdTTL: 120,
  checkperiod: 60,
  useClones: false,
  deleteOnExpire: false
});

const cryptoService = new CryptoService(cache);
const mentionsService = new MentionsService(cache);

// Configure CORS to allow Netlify domains and local development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://gentle-moonbeam-caa906.netlify.app',
        /\.netlify\.app$/,
        'https://ass2-test-2024.wl.r.appspot.com'
      ]
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 3600
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes with better error handling
app.get('/api/crypto', async (req, res, next) => {
  try {
    const data = await cryptoService.getCryptoData();
    if (!data || data.length === 0) {
      throw new Error('No cryptocurrency data available');
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get('/api/global', async (req, res, next) => {
  try {
    const data = await cryptoService.getGlobalData();
    if (!data) {
      throw new Error('No global market data available');
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get('/api/crypto/:id/history', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await cryptoService.getCryptoHistory(id);
    if (!data || data.length === 0) {
      throw new Error('No historical data available');
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get('/api/crypto/:id/mentions', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await mentionsService.getMentionsData(id);
    if (!data) {
      throw new Error('No mentions data available');
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware should be last
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

export default app;