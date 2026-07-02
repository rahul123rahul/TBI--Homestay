import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI environment variable is not defined in .env file.");
    }
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Mongoose] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Mongoose Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
