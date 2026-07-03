import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI environment variable is not defined in .env file.");
    }
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // Timeout connection attempts after 5 seconds instead of hanging
    });
    console.log(`[Mongoose] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n==================================================`);
    console.error(`[Mongoose Error] Connection failed: ${error.message}`);
    console.error(`IMPORTANT: If this is an IP whitelist issue, please whitelist your current IP in MongoDB Atlas.`);
    console.error(`The backend will run in offline/db-disconnected mode.`);
    console.error(`==================================================\n`);
  }
};

export default connectDB;
