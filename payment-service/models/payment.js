import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // MongoDB automatically creates _id field
  payment_id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString() // Generate a unique ID if not provided
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Order' // Reference to Order model if you need to populate order details
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Reference to User model if you need to populate customer details
  },
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['PAYHERE', 'STRIPE', 'DIALOG_GENIE', 'FRIMI', 'PAYPAL'],
    default: 'STRIPE'
  },
  transaction_id: {
    type: String
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  payment_time: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object
  }
}, {
  timestamps: true
});


const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;