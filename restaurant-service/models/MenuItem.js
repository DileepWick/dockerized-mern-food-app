import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId, // You can use UUID if you store UUIDs, but usually ObjectId is preferred in Mongo
      ref: 'Restaurant',
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    image_url: {
      type: String,
    },
    is_available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;
