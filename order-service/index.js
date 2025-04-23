import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import orderRoutes from './routes/order_routes.js';

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware to parse cookies
app.use(cookieParser());

// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:4173","http://localhost:5173","http://localhost:30080"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

app.get('/', (req, res) => res.send('Hello from Order Service! ✅'));

// MongoDB connection
connectDB();

// Routes
app.use('/api/orders', orderRoutes);

// Start server
app.listen(process.env.PORT, () => {
  console.log(`order Service running on http://localhost:${process.env.PORT} ✅`);
});
