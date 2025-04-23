import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with the secret key from env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;
