// controllers/otp.controller.js
import { Otp } from "../models/otp.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { sendMail } from "../utils/mailer.js";
import { User } from "../models/baseUser.model.js"; 

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const otp = generateOtp();

  // Save or update OTP
  await Otp.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true, new: true }
  );

  await sendMail(
    email,
    "Your OTP Code",
    `Your OTP is ${otp}. It will expire in 5 minutes.`,
    `<h2>Your OTP is <b>${otp}</b></h2><p>Expires in 5 minutes.</p>`
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP sent successfully"));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, "Email and OTP required");

  const record = await Otp.findOne({ email });
  if (!record) throw new ApiError(400, "OTP expired or not found");

  if (record.otp !== otp) throw new ApiError(400, "Invalid OTP");
  await Otp.findByIdAndUpdate(
  record._id,
  { $set: { isVerified: true } },  
  { new: true }                   
  );
  // OTP verified → delete it
  // await Otp.deleteOne({ email });
  return res
    .status(200)
    .json(new ApiResponse(200, { verified: true }, "OTP verified successfully.  Email marked as verified."));
});

export { sendOtp, verifyOtp };

