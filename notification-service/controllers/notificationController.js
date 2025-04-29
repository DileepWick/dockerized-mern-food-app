import client from '../config/twilio.js';
import transporter from '../config/nodemailer.js';

export const sendSMS = async (req, res) => {
  const { to, body } = req.body;

  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_FROM_NUMBER,
      to,
      body,
    });
    res.status(200).json({ success: true, sid: message.sid });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const sendEmail = async (req, res) => {
  const { to, subject, html } = req.body;

  try {
    await transporter.sendMail({
      from: `"SnapByte" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending Email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
