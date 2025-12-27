import { Router } from "express";
import { VerifyAlumni,
        getPendingApprovalAlumni,
        denyAlumni,
        regenerateEmbeddings } from "../controllers/admin.controller.js";
import { createEvent } from "../controllers/event.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT,authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/verify-Alumni").post(verifyJWT,authorizeRoles("Admin"),VerifyAlumni);
router.route("/deny-Alumni").delete(verifyJWT,authorizeRoles("Admin"),denyAlumni);
router.route("/pending-approvalAlumni").get(verifyJWT,authorizeRoles("Admin"),getPendingApprovalAlumni);
router.route("/createEvent").post(verifyJWT,authorizeRoles("Admin"),upload.single("banner"),createEvent);
router.route("/regenerate-embeddings").post(verifyJWT,authorizeRoles("Admin"),regenerateEmbeddings);

export default router;