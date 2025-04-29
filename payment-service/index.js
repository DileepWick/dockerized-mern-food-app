// File: index.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import paymentRoutes from './routes/paymentRoutes.js';


// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware to parse cookies
app.use(cookieParser());

// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173" , "http://localhost:30080" , "http://localhost:3007"], // Allows only frontend running on localhost:5173
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
    credentials: true, // Allow credentials (cookies) to be sent
  })
);


// Middleware for JSON parsing
app.use(express.json());

// Home route
app.get('/', (req, res) => res.send('Hello from Payment Service! ✅'));

// Payment routes
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Payment service is running' });
});

// MongoDB connection
connectDB();

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Payment Service running on http://localhost:${process.env.PORT} ✅`);
});