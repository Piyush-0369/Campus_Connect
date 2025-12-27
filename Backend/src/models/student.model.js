import {User} from "./baseUser.model.js"
import mongoose from "mongoose";
import ExperienceSchema from "./experience.model.js";

const StudentSchema = new mongoose.Schema({
    college_roll: { 
        type: String, 
        required: true 
    },
    batch_year: { 
        type: Number, 
        required: false 
    },
  course: { 
        type: String, 
        required: false 
    },
    course_duration: { 
    type: Number, 
    default: false 
  },
    isProfileComplete: { 
    type: Boolean, 
    default: false 
  },
    about_me:{
    type : String,
  },
    skills: [{
    name: { type: String },
    llmTags: { type: Object, default: {} }
    }],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String },
        technologies: [{ type: String }],
        link: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        llmTags: { type: Object, default: {} },
      },
    ],
    experience: [ExperienceSchema],
    // Gamification fields
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    // Stats fields (0-100 scale)
    stats: {
      technicalMastery: { type: Number, default: 0, min: 0, max: 100 },
      projectPower: { type: Number, default: 0, min: 0, max: 100 },
      collaboration: { type: Number, default: 0, min: 0, max: 100 },
      innovationCreativity: { type: Number, default: 0, min: 0, max: 100 },
      problemSolving: { type: Number, default: 0, min: 0, max: 100 },
      academicEndurance: { type: Number, default: 0, min: 0, max: 100 },
      leadership: { type: Number, default: 0, min: 0, max: 100 },
      extracurricular: { type: Number, default: 0, min: 0, max: 100 },
    },
    // Timeline/Achievements
    achievements: [
      {
        title: { type: String },
        description: { type: String },
        date: { type: Date },
        category: { type: String },
        llmTags: { type: Object, default: {} },
      },
    ],
});

export const Student = User.discriminator("Student", StudentSchema);