// models/order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  order_item_id: {
    type: String,
    required: true,
  },
  menu_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'MenuItem',
  },
  quantity: {
    type: Number,
    required: true,
  },
  price_per_item: {
    type: Number,
    required: true,
  },
  total_price: {
    type: Number,
    required: true,
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
    unique: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Restaurant',
  },
  postal_code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'APPROVED', 'PREPARED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
  },
  total_amount: {
    type: Number,
    required: true,
  },
  payment_status: {
    type: String,
    enum: ['UNPAID', 'PAID', 'REFUNDED'],
    default: 'UNPAID',
  },
  placed_at: {
    type: Date,
    default: Date.now,
  },
  estimated_delivery_time: Date,
  items: [orderItemSchema],
  modification_deadline: {
    type: Date,
    default: function() {
      // Allow modifications for 15 minutes after order creation
      return new Date(this.placed_at.getTime() + 15 * 60000);
    }
  },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;