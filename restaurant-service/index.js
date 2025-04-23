import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // Import your DB connection module
import cors from 'cors';
import cookieParser from 'cookie-parser';

import restaurantRoutes from './routes/restaurantRoutes.js'; // Import your product routes

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware to parse cookies
app.use(cookieParser());

// Enable CORS
app.use(
  cors({
    origin: 'http://localhost:4173', // Allows only frontend running on localhost:5173
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true, // Allow credentials (cookies) to be sent
  })
);

// Middleware
app.use(express.json());

app.get('/', (req, res) => res.send('Hello from Restaurant Service! ✅'));

// MongoDB connection
connectDB(); // Use the function from your db.js to connect to MongoDB

// Routes
app.use('/api/restaurant', restaurantRoutes); // Use product routes

// Start server
app.listen(process.env.PORT, () => {
  console.log(
    `Restaurant Service running on http://localhost:${process.env.PORT} ✅`
  );
});
