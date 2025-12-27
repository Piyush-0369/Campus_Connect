import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { evaluateProfile, transformStudentToProfile } from "../utils/stats.js";
import { Student } from "../models/student.model.js";

const evaluateProfileController = asyncHandler(async (req, res) => {
  const student = req.user;
  
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const evaluatorInput = transformStudentToProfile(student);
  const result = await evaluateProfile(evaluatorInput);

  // Update student with computed stats, XP, and level
  const updatedStudent = await Student.findByIdAndUpdate(
    student._id,
    {
      $set: {
        xp: result.xp,
        level: result.level,
        stats: {
          technicalMastery: Math.round(result.stats.technicalMastery),
          projectPower: Math.round(result.stats.projectPower),
          collaboration: Math.round(result.stats.collaboration),
          innovationCreativity: Math.round(result.stats.innovationCreativity),
          problemSolving: Math.round(result.stats.problemSolving),
          academicEndurance: Math.round(result.stats.academicEndurance),
          leadership: Math.round(result.stats.leadership),
          extracurricular: Math.round(result.stats.extracurricular),
        },
      },
    },
    { new: true }
  );

  // Format response compatible with frontend profile
  const response = {
    xp: result.xp,
    level: result.level,
    nextLevelXP: result.nextLevelXP,
    stats: result.stats,
    statsBreakdown: [
      { name: "Technical Mastery", value: Math.round(result.stats.technicalMastery) },
      { name: "Project Power", value: Math.round(result.stats.projectPower) },
      { name: "Collaboration & Teamwork", value: Math.round(result.stats.collaboration) },
      { name: "Innovation & Creativity", value: Math.round(result.stats.innovationCreativity) },
      { name: "Problem-Solving", value: Math.round(result.stats.problemSolving) },
      { name: "Academic Endurance", value: Math.round(result.stats.academicEndurance) },
      { name: "Leadership & Initiative", value: Math.round(result.stats.leadership) },
      { name: "Extracurricular Excellence", value: Math.round(result.stats.extracurricular) },
    ],
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Student profile evaluated successfully"));
});

export { evaluateProfileController };
