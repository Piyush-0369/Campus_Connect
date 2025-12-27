import { registerAlumni,
         updateAlumniProfile,
         getAlumniExperience,
         updateAlumniExperience,
         deleteAlumniExperience,
         addAlumniExperience,
         completeAlumniProfile,
        } from "../controllers/alumini.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router =Router();

router.route("/registerAlumni").post(upload.single("degree"),registerAlumni);
router.route("/completeAlumniProfile").post(verifyJWT,authorizeRoles("Alumni"),upload.single("avatar"),completeAlumniProfile);
router.route("/updateprofile").patch(verifyJWT,authorizeRoles("Alumni","Admin"),upload.single("avatar"),updateAlumniProfile);

router.route("/addExperience").post(verifyJWT,authorizeRoles("Alumni"),addAlumniExperience);
router.route("/getExperience").get(verifyJWT,authorizeRoles("Alumni"),getAlumniExperience);
router.route("/updateExperience/:expId").patch(verifyJWT,authorizeRoles("Alumni"),updateAlumniExperience);
router.route("/deleteExperience/:expId").delete(verifyJWT,authorizeRoles("Alumni"),deleteAlumniExperience);

export default router;