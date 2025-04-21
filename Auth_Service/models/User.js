import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema(
  {
    street: { type: String },
    city: { type: String },
    postal_code: { type: String },
  },
  { _id: false }
);

// User schema definition
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone_number: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'seller', 'driver'],
      default: 'user',
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    address: addressSchema,
  },
  { timestamps: true }
);

// Hash password before saving user
userSchema.pre('save', async function (next) {
  if (this.role === 'user') {
    this.is_verified = true;
  }

  if (!this.isModified('password')) return next();

  // Hash password
  const salt = await bcrypt.genSalt(10); // Generate salt
  this.password = await bcrypt.hash(this.password, salt); // Hash password

  next();
});

// Method to compare the entered password with the hashed password in the DB
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export User model
const User = mongoose.model('User', userSchema);
export default User;
