import mongoose from 'mongoose';

const DeliverySchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assigned_at: {
    type: Date,
    default: Date.now
  },
  picked_up_at: {
    type: Date
  },
  delivered_at: {
    type: Date
  }
}, { timestamps: true });

const Delivery = mongoose.model('Delivery', DeliverySchema);
export default Delivery;