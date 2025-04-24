import mongoose from 'mongoose';

const DeliveryDriverStatusSchema = new mongoose.Schema({
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  is_available: {
    type: Boolean,
    default: true
  },
  current_location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  last_updated_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create a geospatial index on the location field
DeliveryDriverStatusSchema.index({ current_location: '2dsphere' });

const DeliveryDriverStatus = mongoose.model('DeliveryDriverStatus', DeliveryDriverStatusSchema);
export default DeliveryDriverStatus;