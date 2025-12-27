import { Admin } from "../models/admin_SuperAdmin.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {Alumni} from "../models/alumni.model.js"
import {Student} from "../models/student.model.js"
import { regenerateBulkEmbeddings } from "../utils/faceRecognition.js";

const VerifyAlumni = asyncHandler(async(req,res)=>{
    const {alumni_id} = req.body || {};
    if(!alumni_id){
        throw new ApiError(500,"alumni_id not recieved");
    }
    const alumni = await Alumni.findByIdAndUpdate(
        alumni_id,
        {
            $set:{approved:true},
        },
        {new:true}
    ).select("-password_hash -refreshToken");
    
    if(!alumni){
        throw new ApiError(500,"alumni not found with the server ggiven id");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,alumni,"Alumni Approved Successfully")
    )

})

const denyAlumni = asyncHandler(async(req,res)=>{
    const {alumni_id} = req.body || {};
     if(!alumni_id){
        throw new ApiError(500,"alumni_id not recieved");
    }
    await Alumni.deleteOne({_id:alumni_id});

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Alumni Disproved successfully")
    )
})

const getPendingApprovalAlumni = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;   
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;
    
    const PendingApproval = await Alumni.aggregate([
        {
            $match:{
                approved:false,
            }
        },
        {
            $facet: {
                data: [
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                    { $project: { password_hash: 0, refreshToken: 0 } }
                ],
                metadata: [
                    { $count: 'totalPending' }
                ]
            }
        },
        {
            $project:{
                data:'$data',
                totalPending: { $arrayElemAt: ['$metadata.totalPending', 0] }
            }
        }
    ]);
    return res
    .status(200)
    .json(
        new ApiResponse(200,PendingApproval,"list of all pending alumni fetched successfully")
    )
})

const regenerateEmbeddings = asyncHandler(async(req,res)=>{
    const { role, forceRegenerate = false, userIds } = req.body || {};
    
    // Validate role
    if (!role || !['Alumni', 'Student', 'all'].includes(role)) {
        throw new ApiError(400, "Invalid role. Must be 'Alumni', 'Student', or 'all'");
    }
    
    let users = [];
    
    try {
        // If specific user IDs provided
        if (userIds && Array.isArray(userIds) && userIds.length > 0) {
            if (role === 'Alumni' || role === 'all') {
                const alumni = await Alumni.find({ _id: { $in: userIds } });
                users.push(...alumni);
            }
            if (role === 'Student' || role === 'all') {
                const students = await Student.find({ _id: { $in: userIds } });
                users.push(...students);
            }
        } else {
            // Get all users based on role
            if (role === 'Alumni') {
                users = await Alumni.find({});
            } else if (role === 'Student') {
                users = await Student.find({});
            } else if (role === 'all') {
                const [alumni, students] = await Promise.all([
                    Alumni.find({}),
                    Student.find({})
                ]);
                users = [...alumni, ...students];
            }
        }
        
        if (users.length === 0) {
            throw new ApiError(404, "No users found for regeneration");
        }
        
        // Regenerate embeddings (sequential processing to avoid overwhelming Flask)
        const results = await regenerateBulkEmbeddings(users, { 
            forceRegenerate
        });
        
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                results,
                `Embedding regeneration completed: ${results.successful} successful, ${results.failed} failed, ${results.skipped} skipped`
            )
        );
    } catch (error) {
        // If it's already an ApiError, re-throw it
        if (error instanceof ApiError) {
            throw error;
        }
        // Otherwise, wrap it
        throw new ApiError(500, `Embedding regeneration failed: ${error.message}`);
    }
})

export{
    VerifyAlumni,
    getPendingApprovalAlumni,
    denyAlumni,
    regenerateEmbeddings,
}
