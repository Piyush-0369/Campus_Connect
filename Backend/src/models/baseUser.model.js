import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const options = { discriminatorKey: "role", timestamps: true };

const BaseUserSchema = new mongoose.Schema(
    {
        first_name: { 
          type: String, 
          required: true 
        },
        middle_name: { 
          type: String
        },
        last_name: { 
          type: String, 
          required: true 
        },
        avatar: {
          type: String,
          required:false
        },
        email: { 
          type: String,
          required: true, 
          unique: true,
          index:true,
        },
        password_hash: { 
          type: String, 
          required: true 
        },
        email_verified: { 
          type: Boolean, 
          default: false 
        },
        refreshToken:{
            type:String,
        },
        faceEmbedding: {
          embedding: [{ type: Number }],  // 128-dimensional face embedding vector
          imageUrl: { type: String },      // Cloudinary URL of the image used for embedding
          createdAt: { type: Date }
        }
  },
  options
);


BaseUserSchema.pre("save", async function (next) {
  if(!this.isModified("password_hash")) return next();

  this.password_hash = await bcrypt.hash(this.password_hash, 10)
    next()
})

BaseUserSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(password,this.password_hash);
}

BaseUserSchema.methods.generateAccessToken = function(){
    return jwt.sign(
      {
            _id:this._id,
            email:this.email,
            role:this.role
        },

        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
          }
        )
}
      
      
BaseUserSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
      {
        _id:this._id,
        email:this.email,
        role:this.role
      },

      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
    }
  )
}
    
    
export const User = mongoose.model("User", BaseUserSchema);