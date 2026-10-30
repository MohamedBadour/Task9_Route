import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI || "mongodb://127.0.0.1:27017/sticky-notes");
    console.log("MongoDB connected");
  } catch (err) {
    console.log("DB error", err.message);
  }
};
