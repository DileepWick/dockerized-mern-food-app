import express from 'express';
import dotenv from 'dotenv';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();
const app = express();

app.use(express.json());

app.use('/api/notify', notificationRoutes);

app.get('/', (req, res) => {
  res.send('Notification Service is running!');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));
