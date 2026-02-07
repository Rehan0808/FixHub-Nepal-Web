import mongoose from "mongoose";

const CONNECTION_STRING: string = process.env.MONGODB_URI || "";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(CONNECTION_STRING);
    console.log("Mongodb connected");
  } catch (err) {
    console.log("DB error", err);
  }
};

export default connectDB;
