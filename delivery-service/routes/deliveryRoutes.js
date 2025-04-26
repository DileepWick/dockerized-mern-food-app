import express from 'express';
import {
  createDelivery
} from '../controllers/deliveryController.js';

const router = express.Router();

router.post('/create', createDelivery);

export default router;
