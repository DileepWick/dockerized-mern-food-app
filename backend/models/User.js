import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User schema definition
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
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
    enum: ['admin', 'user'],
    default: 'user',
  },
}, { timestamps: true });



// Hash password before saving user
userSchema.pre('save', async function (next) {
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
