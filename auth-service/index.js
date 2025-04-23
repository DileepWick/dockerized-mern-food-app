import express from 'express';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import crypto from 'crypto'; // For generating random JWT secret if not set
import connectDB  from './config/db.js'; // Import your DB connection module
import cors from 'cors';

//Routes
import authRoutes from './routes/authRoutes.js';


// Load environment variables
dotenv.config();

// Dynamically generate JWT secret if not already set
if (!process.env.JWT_SECRET) {
  const randomSecret = crypto.randomBytes(64).toString('hex'); // Generates a secure random secret key
  process.env.JWT_SECRET = randomSecret;
}



// Initialize app
const app = express();

// Middleware
app.use(cookieParser());


// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:4173","http://localhost:3001","http://localhost:30001","http://localhost:30080","http://localhost:5173"], // Allows only frontend running on localhost:5173 and localhost:4173
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
    credentials: true, // Allow credentials (cookies) to be sent
  })
)

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('Hello from the backend!'));

// MongoDB connection
connectDB(); // Use the function from your db.js to connect to MongoDB

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Auth Service running on http://localhost:${process.env.PORT} ✅`);
});
