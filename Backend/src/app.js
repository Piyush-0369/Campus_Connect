import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
  origin: "http://localhost:3000",  // frontend URL
  credentials: true,                // allow cookies (important!)
}));

app.use(express.json({limit:"16kb",}));
app.use(express.urlencoded({limit:"16kb"}));
app.use(express.static("public")); // whichh could be acess by anyone
app.use(cookieParser()); // use to store read cookie on user browser

//routes import
import adminRouter from "./routes/admin.route.js"
import superAdminRouter from "./routes/superAdmin.route.js"
import studentRouter from "./routes/student.route.js"
import baseUserRouter from "./routes/baseUser.route.js"
import alumniRouter from "./routes/alumni.route.js"
import otpRouter from "./routes/otp.route.js";
import chatRouter from "./routes/chat.route.js";
import statsRouter from "./routes/stats.route.js"

//routes decleration


app.use("/api/v1/otp", otpRouter);
app.use("/api/v1/baseUsers",baseUserRouter);
app.use("/api/v1/students",studentRouter);
app.use("/api/v1/admins",adminRouter);
app.use("/api/v1/superAdmin",superAdminRouter);
app.use("/api/v1/alumni",alumniRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/stats",statsRouter);

export {app};