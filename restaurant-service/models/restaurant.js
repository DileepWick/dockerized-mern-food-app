import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    postal_code: {
      type: String,
      required: true,
    },
    cover_image: {
      type: String,
      default: '',
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;
