import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    banner:{
        type: String,
        required: true,
    },
    title: { 
        type: String, 
        required: true, 
        trim: true,
        unique:true,
        index:true,
    },
    description: { 
        type: String, 
        required: true, 
        trim: true 
    },
    date: { 
        type: Date, 
        required: true 
    },
    time: { 
        type: String, 
        required: true, 
        trim: true 
    },
    location: { 
        type: String, 
        required: true, 
        trim: true 
    },
    mode: { 
        type: String, 
        enum: ["Offline", "Online", "Hybrid"], 
        required: true 
    },
    organizer: { 
        type: String, 
        trim: true 
    },
    speaker: { 
        type: String, 
        trim: true 
    },
    tags: [{ 
        type: String, 
        trim: true 
    }],
    status: { 
        type: String, 
        enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"], 
        default: "Upcoming" 
    }
}, { timestamps: true });

export const Event = mongoose.model("Event", eventSchema);