import mongoose from 'mongoose';
const { Schema } = mongoose;

const deliverySchema = new Schema({
  // Order reference
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },

  // Driver reference
  driver_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Buyer information
  buyer_address: {
    street: String,
    city: String,
    postal_code: String
  },

  // Restaurant information
  restaurant_address: {
    street: String,
    city: String,
    postal_code: String
  },

  // Order items
  items: [{
    name: String,
    quantity: Number,
    price: Number
  }],

  // Delivery assignment and status
  assigned_at: Date,
  status: {
    type: String,
    enum: ['PICKED_UP', 'DELIVERED', 'CANCELLED', 'ACCEPTED'],
    default: 'ACCEPTED',
  },
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

const Delivery = mongoose.model('Delivery', deliverySchema);
export default Delivery;