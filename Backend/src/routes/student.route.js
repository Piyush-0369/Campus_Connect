import { Router } from "express";
import { registerStudent,
         updateStudentProfile,
         getStudentExperience,
         updateStudentExperience,
         deleteStudentExperience,
         addStudentExperience,
         addStudentProject,
         getStudentProjects,
         updateStudentProject,
         deleteStudentProject,
         addStudentAchievement,
         getStudentAchievements,
         updateStudentAchievement,
         deleteStudentAchievement,
         getStudentAchievementsByCategory,
         completeStudentProfile,
        } from "../controllers/student.controller.js";
import {verifyJWT,authorizeRoles} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/registerStudent").post(upload.single("avatar"),registerStudent);
router.route("/completeStudentProfile").post(verifyJWT,authorizeRoles("Student"),upload.single("avatar"),completeStudentProfile);
router.route("/updateProfile").patch(verifyJWT,authorizeRoles("Student","Admin"),upload.single("avatar"),updateStudentProfile);

// Experience routes
router.route("/addExperience").post(verifyJWT,authorizeRoles("Student"),addStudentExperience);
router.route("/getExperience").get(verifyJWT,authorizeRoles("Student"),getStudentExperience);
router.route("/updateExperience/:expId").patch(verifyJWT,authorizeRoles("Student"),updateStudentExperience);
router.route("/deleteExperience/:expId").delete(verifyJWT,authorizeRoles("Student"),deleteStudentExperience);

// Project routes
router.route("/addProject").post(verifyJWT,authorizeRoles("Student"),addStudentProject);
router.route("/getProjects").get(verifyJWT,authorizeRoles("Student"),getStudentProjects);
router.route("/updateProject/:projectId").patch(verifyJWT,authorizeRoles("Student"),updateStudentProject);
router.route("/deleteProject/:projectId").delete(verifyJWT,authorizeRoles("Student"),deleteStudentProject);

// Achievement routes
router.route("/addAchievement").post(verifyJWT,authorizeRoles("Student"),addStudentAchievement);
router.route("/getAchievements").get(verifyJWT,authorizeRoles("Student"),getStudentAchievements);
router.route("/getAchievements/:category").get(verifyJWT,authorizeRoles("Student"),getStudentAchievementsByCategory);
router.route("/updateAchievement/:achievementId").patch(verifyJWT,authorizeRoles("Student"),updateStudentAchievement);
router.route("/deleteAchievement/:achievementId").delete(verifyJWT,authorizeRoles("Student"),deleteStudentAchievement);

export default router;
