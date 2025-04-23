import express from 'express';
import { handleStripeWebhook } from '../controllers/webhookController.js';

const router = express.Router();

router.post('/', handleStripeWebhook);

export default router;