// gateway/server.js
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

// Enable CORS if needed
app.use(
  cors({
    origin: [
      'http://localhost:4173',
      'http://localhost:3001',
      'http://localhost:30001',
      'http://localhost:30080',
      'http://localhost:5173',
      'http://localhost:3007',
    ], // Allows only frontend running on localhost:5173 and localhost:4173

    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'], // Specify allowed methods

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Specify allowed methods

    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true, // Allow credentials (cookies) to be sent
  })
);

// Proxy rules for each service
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: 'http://auth-service:3000/api/auth',
    changeOrigin: true,
  })
);

app.use(
  '/api/delivery',
  createProxyMiddleware({
    target: 'http://delivery-service:3001/api/delivery',
    changeOrigin: true,
  })
);

app.use(
  '/api/notify',
  createProxyMiddleware({
    target: 'http://notification-service:3002/api/notify',
    changeOrigin: true,
  })
);

app.use(
  '/api/order',
  createProxyMiddleware({
    target: 'http://order-service:3003/api/orders',
    changeOrigin: true,
  })
);

app.use(
  '/api/payment',
  createProxyMiddleware({
    target: 'http://payment-service:3004/api/payments',
    changeOrigin: true,
  })
);

app.use(
  '/api/restaurant',
  createProxyMiddleware({
    target: 'http://restaurant-service:3005/api',
    changeOrigin: true,
  })
);

app.use(
  '/api/menu',
  createProxyMiddleware({
    target: 'http://restaurant-service:3005/api/menu',
    changeOrigin: true,
  })
);


app.use(
  '/api/cloudinary',
  createProxyMiddleware({
    target: 'http://restaurant-service/api/cloudinary',
    pathRewrite: { '^/api/cloudinary': '' },
    changeOrigin: true,
  })
);

// Root health check route
app.get('/', (req, res) => {
  res.send('API Gateway is running ✅');
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway is running on http://localhost:${PORT}`);
});
