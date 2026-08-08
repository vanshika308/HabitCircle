import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log the error but do NOT crash the process. 
    // This allows the Express server to stay online and return descriptive HTTP 503 errors.
    console.error(`Database Connection Warning: ${error.message}`);
  }
};

export default connectDB;
