// /server/server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';                    // Load environment variables
import connectDB from './config/mongodb.js';

import imageRouter from './routes/imageRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

/* ── Middleware ───────────────────────────────────────────────────────── */
app.use(express.json()); // Parse JSON request bodies

// CORS: Allow frontend on Vite (localhost:5173)
app.use(cors());

/* ── Routes ───────────────────────────────────────────────────────────── */
app.use('/api/user', userRouter);     // User-related routes
app.use('/api/image', imageRouter);   // Image upload/generation routes

// Test root route
app.get('/', (_req, res) => res.send('API Working 🚀'));

/* ── Start Server ─────────────────────────────────────────────────────── */
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB
    app.listen(port, () => {
      console.log(`🚀 Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
