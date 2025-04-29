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
  try {
    const { to, subject, html } = req.body;
    
    // Input validation
    if (!to) {
      return res.status(400).json({ success: false, error: 'Recipient email is required' });
    }
    
    if (!subject) {
      return res.status(400).json({ success: false, error: 'Email subject is required' });
    }
    
    if (!html) {
      return res.status(400).json({ success: false, error: 'Email content is required' });
    }
    
    // Email format validation using regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }
    
    // Subject length validation
    if (subject.length > 100) {
      return res.status(400).json({ success: false, error: 'Subject too long (max 100 characters)' });
    }
    
    // HTML content validation - basic check for non-empty content
    if (html.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Email content cannot be empty' });
    }
    
    // If all validations pass, send the email
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
