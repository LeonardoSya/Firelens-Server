import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// const mongoURI = process.env.MONGODB_URI;
const mongoURI = "mongodb://localhost:27017/firelens";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB连接错误:", error);
    process.exit(1);
  }
};

export default connectDB;
