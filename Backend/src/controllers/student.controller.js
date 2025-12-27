import { Student } from "../models/student.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { college_Domain } from "../constants.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/baseUser.model.js";
import { default_avatar_url } from "../constants.js";
import { Otp } from "../models/otp.model.js";
import { addExperience,
    getExperiences,
    updateExperience,
    deleteExperience} from "../utils/experience.js"
import { extractAndSaveFaceEmbedding } from "../utils/faceRecognition.js";

const registerStudent = asyncHandler(async(req,res)=>{                                             // at login frontend should check isProfileComplete for student/alumni and give a pop up.
    const {first_name,middle_name,last_name,email,password_hash,college_roll} = req.body || {};                     
                                                                                                
    const requiredFields = {first_name,last_name,email,password_hash,college_roll};
    
    if (Object.values(requiredFields).some(value => !value)) {
        throw new ApiError(400, "kindly fill the mandatory field");
    }       
  const emailDomain = email.includes("@") ? email.split("@")[1] : null;

    if(emailDomain==null || emailDomain!=college_Domain){
        throw new ApiError(404,"invalid Email, kindly Enter your college mail");
    }

    const checkUnique = await User.findOne({email});
    if(checkUnique){
        throw new ApiError(404,"User Already exist with this email");
    }
    const otp = await Otp.findOne({email:email});
    if(!otp){
      throw new ApiError(400,"email verification expired ,kindly verify it again");
    }
    let isEmailVerified=false;
    if(otp.isVerified ===true){
        isEmailVerified=true;
    }else{
      throw new ApiError(400,"Email not verified");
    }

    const student = await Student.create(
        {
            first_name,
            middle_name,
            last_name,
            college_roll,                   
            email,
            password_hash,
            email_verified: isEmailVerified,
          }
        )

    const studentObj = student.toObject();
    delete studentObj.password_hash;
    delete studentObj.refreshToken;
    delete studentObj.faceEmbedding;
    return res
    .status(200)
    .json(
        new ApiResponse(200,studentObj,"Student Registered Successfully")
    )
})

const completeStudentProfile = asyncHandler(async(req,res)=>{
const oldStudent = req.user;

if(oldStudent.isProfileComplete){
  throw new ApiError (400, "Profile already complete");
}

  const {department, batch_year, about_me, course, course_duration} = {...req.body};
  const avatarLocalPath=req.file?.path;

  const required_fields ={department, batch_year, about_me, course, course_duration};
  if(Object.values(required_fields).some(value => !value)){
    throw new ApiError(400,"Kindly fill the mandatory fields to complete profile");
  }

  let avatar;
  if(avatarLocalPath){
    avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar?.url){
      throw new ApiError(400, "Something went wrong and could not upload image on cloudinary");
    }
    }
  else{
    throw new ApiError(400, "Please upload the avatar to complete profile");
  }
    const updatedStudent = await Student.findByIdAndUpdate(
    oldStudent._id,
    { $set: {...req.body, isProfileComplete: true, avatar: avatar?.url} },
    { new: true , select : "-password_hash -refreshToken -faceEmbedding" }
  );

  if (avatar?.url) {
        extractAndSaveFaceEmbedding(updatedStudent, avatar.url).catch(err => {
            console.error('Face embedding extraction failed:', err.message);
        });
    }



  return res.status(200).json(new ApiResponse(200, updatedStudent, "Student profile completed"));

})
const updateStudentProfile = asyncHandler(async (req, res) => {
  const student = req.user;
  if (!student) {
    throw new ApiError(404, "Student not found");
  }
  //
  const update={...req.body};
  const avatarLocalPath=req.file?.path;
  if(avatarLocalPath){
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar?.url){
      throw new ApiError(400, "Something went wrong and could not upload image on cloudinary");
    }
    else{
      update.avatar = avatar?.url;
    }
    }
  //  


  const updatedStudent = await Student.findByIdAndUpdate(
    student._id,
    { $set:  update},
    { new: true , select : "-password_hash -refreshToken -faceEmbedding"}
  );


  // If avatar was updated, regenerate face embedding (non-blocking)
  if (update.avatar) {
    extractAndSaveFaceEmbedding(updatedStudent, update.avatar).catch(err => {
      console.error('Face embedding regeneration failed:', err.message);
    });
  }

  return res.status(200).json(
    new ApiResponse(200, updatedStudent, "Student profile updated")
  );
});

const addStudentExperience = async (req, res) => {
  const student = req.user;

  const expData = { ...req.body };
  if(expData.isCurrent === true){
    expData.end_date =null;
  }

  const updated = await addExperience(Student, student._id, expData);
  if (!updated) return res.status(404).json({ message: "student not found" });
  res
  .status(200)
  .json(
    new ApiResponse(200,updated,"student experience added successfully")
  );
};

const getStudentExperience = async (req, res) => {
  const student = req.user;
  const updated = await getExperiences(Student, student._id);
  if (!updated) return res.status(404).json({ message: "Student not found" });
  res
  .status(200)
  .json(
    new ApiResponse(200,updated,"Student experience fetched successfully")
  );
};
const updateStudentExperience = async (req, res) => {
  const student = req.user;
  const {expId} = req.params;
  const updated = await updateExperience(Student, student._id,expId,req.body);
  if (!updated) return res.status(404).json({ message: "Student not found" });
  res
  .status(200)
  .json(
    new ApiResponse(200,updated,"Student experience updated successfully")
  );
};
const deleteStudentExperience = async (req, res) => {
  const student = req.user;
  const {expId} = req.params;
  const updated = await deleteExperience(Student, student._id,expId);
  if (!updated) return res.status(404).json({ message: "Student not found" });
  res
  .status(200)
  .json(
    new ApiResponse(200,updated,"Student experience delete successfully")
  );
};

// ==================== PROJECT CRUD OPERATIONS ====================

const addStudentProject = asyncHandler(async (req, res) => {
  const student = req.user;
  const { title, description, technologies, link, startDate, endDate } = req.body;

  if (!title) {
    throw new ApiError(400, "Project title is required");
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    student._id,
    {
      $push: {
        projects: {
          title,
          description,
          technologies: technologies || [],
          link,
          startDate,
          endDate,
        },
      },
    },
    { new: true }
  );

  if (!updatedStudent) {
    throw new ApiError(404, "Student not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedStudent.projects, "Project added successfully")
    );
});

const getStudentProjects = asyncHandler(async (req, res) => {
  const student = req.user;

  const studentData = await Student.findById(student._id).select("projects");

  if (!studentData) {
    throw new ApiError(404, "Student not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, studentData.projects, "Projects fetched successfully")
    );
});

const updateStudentProject = asyncHandler(async (req, res) => {
  const student = req.user;
  const { projectId } = req.params;
  const { title, description, technologies, link, startDate, endDate } = req.body;

  const updatedStudent = await Student.findOneAndUpdate(
    { _id: student._id, "projects._id": projectId },
    {
      $set: {
        "projects.$.title": title,
        "projects.$.description": description,
        "projects.$.technologies": technologies,
        "projects.$.link": link,
        "projects.$.startDate": startDate,
        "projects.$.endDate": endDate,
      },
    },
    { new: true }
  );

  if (!updatedStudent) {
    throw new ApiError(404, "Student or project not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedStudent.projects, "Project updated successfully")
    );
});

const deleteStudentProject = asyncHandler(async (req, res) => {
  const student = req.user;
  const { projectId } = req.params;

  const updatedStudent = await Student.findByIdAndUpdate(
    student._id,
    {
      $pull: { projects: { _id: projectId } },
    },
    { new: true }
  );

  if (!updatedStudent) {
    throw new ApiError(404, "Student not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedStudent.projects, "Project deleted successfully")
    );
});

// ==================== ACHIEVEMENT CRUD OPERATIONS ====================

const addStudentAchievement = asyncHandler(async (req, res) => {
  const student = req.user;
  const { title, description, date, category } = req.body;

  if (!title) {
    throw new ApiError(400, "Achievement title is required");
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    student._id,
    {
      $push: {
        achievements: {
          title,
          description,
          date: date || new Date(),
          category,
        },
      },
    },
    { new: true }
  );

  if (!updatedStudent) {
    throw new ApiError(404, "Student not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedStudent.achievements,
        "Achievement added successfully"
      )
    );
});

const getStudentAchievements = asyncHandler(async (req, res) => {
  const student = req.user;

  const studentData = await Student.findById(student._id).select("achievements");

  if (!studentData) {
    throw new ApiError(404, "Student not found");
  }

  // Sort achievements by date (most recent first)
  const sortedAchievements = studentData.achievements.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sortedAchievements,
        "Achievements fetched successfully"
      )
    );
});

const updateStudentAchievement = asyncHandler(async (req, res) => {
  const student = req.user;
  const { achievementId } = req.params;
  const { title, description, date, category } = req.body;

  const updatedStudent = await Student.findOneAndUpdate(
    { _id: student._id, "achievements._id": achievementId },
    {
      $set: {
        "achievements.$.title": title,
        "achievements.$.description": description,
        "achievements.$.date": date,
        "achievements.$.category": category,
      },
    },
    { new: true }
  );

  if (!updatedStudent) {
    throw new ApiError(404, "Student or achievement not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedStudent.achievements,
        "Achievement updated successfully"
      )
    );
});

const deleteStudentAchievement = asyncHandler(async (req, res) => {
  const student = req.user;
  const { achievementId } = req.params;

  const updatedStudent = await Student.findByIdAndUpdate(
    student._id,
    {
      $pull: { achievements: { _id: achievementId } },
    },
    { new: true }
  );

  if (!updatedStudent) {
    throw new ApiError(404, "Student not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedStudent.achievements,
        "Achievement deleted successfully"
      )
    );
});

// Get achievements by category (optional filter)
const getStudentAchievementsByCategory = asyncHandler(async (req, res) => {
  const student = req.user;
  const { category } = req.params;

  const studentData = await Student.findById(student._id).select("achievements");

  if (!studentData) {
    throw new ApiError(404, "Student not found");
  }

  // Filter by category if provided
  const filteredAchievements = category
    ? studentData.achievements.filter(
        (achievement) => achievement.category === category
      )
    : studentData.achievements;

  // Sort by date (most recent first)
  const sortedAchievements = filteredAchievements.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sortedAchievements,
        `Achievements fetched successfully${
          category ? ` for category: ${category}` : ""
        }`
      )
    );
});

export{
    registerStudent,
    completeStudentProfile,
    updateStudentProfile,
    updateStudentExperience,
    deleteStudentExperience,
    getStudentExperience,
    addStudentExperience,
    addStudentProject,
    getStudentProjects,
    updateStudentProject,
    deleteStudentProject,
    addStudentAchievement,
    getStudentAchievements,
    updateStudentAchievement,
    deleteStudentAchievement,
    getStudentAchievementsByCategory
}
