import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import { CryptoService } from './services/cryptoService.js';
import { MentionsService } from './services/mentionsService.js';
import { AuthService } from './services/authService.js';
import { errorHandler } from './middleware/errorHandler.js';
import { SocialMediaService } from './services/socialMediaService.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Initialize services
const cache = new NodeCache({
  stdTTL: 120,
  checkperiod: 60,
  useClones: false,
  deleteOnExpire: false
});

const cryptoService = new CryptoService(cache);
const mentionsService = new MentionsService(cache);
const authService = new AuthService();
const socialMediaService = new SocialMediaService();

app.use(cors());
app.use(express.json());

// Auth routes
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await authService.login(username, password);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    const user = await authService.signup(username, password, email);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Likes route
app.post('/api/auth/likes/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { likes } = req.body;
    const updatedLikes = await authService.updateLikes(userId, likes);
    res.json(updatedLikes);
  } catch (error) {
    next(error);
  }
});

// Existing routes...
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

app.get('/api/crypto/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await cryptoService.getCryptoDetails(id);
    if (!data) {
      throw new Error('No cryptocurrency details available');
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

app.get('/api/news', async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1; 
  const source = req.query.source || 'latimes';
  const type = req.query.type || null;
  try {
    const data = await socialMediaService.getNewsFeed(page, 9, source, type);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

export default app;