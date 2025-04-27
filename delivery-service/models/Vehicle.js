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

// Index for efficient queries
vehicleSchema.index({ driver: 1 });
vehicleSchema.index({ licensePlate: 1 }, { unique: true });

// Validation to ensure driver has role 'driver'
vehicleSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('driver')) {
    try {
      const User = mongoose.model('User');
      const driver = await User.findById(this.driver);
      
      if (!driver) {
        return next(new Error('Driver not found'));
      }
      
      if (driver.role !== 'driver') {
        return next(new Error('Vehicle can only be assigned to users with driver role'));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;