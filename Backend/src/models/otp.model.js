// models/otp.model.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index:true},
  otp: { type: String, required: true },
  isVerified:{
    type:Boolean,
    default:false
  },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // auto delete after 5 minutes
});

export const Otp = mongoose.model("Otp", otpSchema);
