import { notificationService } from '../util/service-gateways.js';

const sendEmail = async (to, subject, html) => {
  try {
    const response = await notificationService.post('/send-email', {
      to,
      subject,
      html,
    });
   

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    return response.data;

  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};


const sendSMS = async (to, body) => {
  try {
    const response = await notificationService.post('/send-sms', {
      to,
      body,
    });

    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }
    return response.data;

  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

export { sendEmail, sendSMS };