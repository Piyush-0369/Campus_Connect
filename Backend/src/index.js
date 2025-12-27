// index.js
import dotenv from 'dotenv';
import connectDB from "./db/DB.js";
import { app } from "./app.js";
import http from "http";
import { setupSocket } from "./socket.js";   
dotenv.config({ path: './.env' });

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO with our server
setupSocket(server);

// Connect DB and start server
connectDB()
    .then(() => {
        server.listen(process.env.PORT, () => {
            console.log(`Server is running on Port : ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB connection failed ", error);
    });
