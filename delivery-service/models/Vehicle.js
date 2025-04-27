import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ['car', 'motorcycle', 'bicycle', 'scooter', 'van', 'truck'],
      default: 'car'
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    }
  },
  { timestamps: true }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;