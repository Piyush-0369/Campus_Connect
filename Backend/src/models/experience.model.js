import mongoose from "mongoose";

const ExperienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },       
    company: { type: String, required: true },     
    location: { type: String },
    start_date: { type: Date, required: true },
    end_date: { type: Date },                      
    description: { type: String },
    technologies: [{ type: String }],
    isCurrent: { type: Boolean, default: false },
    llmTags: { type: Object, default: {} },              
  }
);

export default ExperienceSchema;