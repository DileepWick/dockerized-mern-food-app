import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI;
    if (!dbURI) {
      console.error("MongoDB URI not defined!");
      return;
    }

    await mongoose.connect(dbURI); // No need for useNewUrlParser and useUnifiedTopology anymore

    console.log("Products Service MongoDB Connected Successfully! ✅");
  } catch (err) {
    console.error(`❌ MongoDB Connection Failed: ${err.message}`);
  }
};

export default connectDB;
