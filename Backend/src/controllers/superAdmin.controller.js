import { Admin,SuperAdmin } from "../models/admin_SuperAdmin.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/baseUser.model.js";
import { default_avatar_url } from "../constants.js";

const registerAdmin = asyncHandler(async(req,res)=>{
    const {first_name,middle_name,last_name,email,password_hash} = req.body || {};
    
    const RegisteringPersonRole = req.user?.role;
    if(RegisteringPersonRole != "SuperAdmin"){
        throw new ApiError(404,"UnAuthorized Request for registering Admin");
    }
    const requiredFields = {first_name,last_name, email, password_hash };
    
    if (Object.values(requiredFields).some(value => !value)) {
        throw new ApiError(400, "kindly fill the mandatory field");
    }

    const checkUnique = await User.findOne({email});
    if(checkUnique){
        throw new ApiError(404,"User Already exist with this email");
    }
    
    const avatarLocalPath = req.file?.path;
    if(avatarLocalPath){
        const avatar =await uploadOnCloudinary(avatarLocalPath);
        if(!avatar.url){
            throw new ApiError(400,"Something went wrong while uploading avatar on cloudinary");
        }
    }



    const admin = await Admin.create(
        {
            first_name,
            middle_name,
            last_name,
            avatar:avatar?.url || default_avatar_url,
            email,
            password_hash,
            email_verified: true,
        }
    )

    const adminObj = admin.toObject();
    delete adminObj.password_hash;
    delete adminObj.refreshToken;

    return res
    .status(200)
    .json(
        new ApiResponse(200,adminObj,"Alumni Registered Successfully")
    )
})

export{
    registerAdmin,
}