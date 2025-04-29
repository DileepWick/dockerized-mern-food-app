import express from 'express';
import { sendSMS, sendEmail } from '../controllers/notificationController.js';

const router = express.Router();

router.post('/send-sms', sendSMS);
router.post('/send-email', sendEmail);

export default router;
