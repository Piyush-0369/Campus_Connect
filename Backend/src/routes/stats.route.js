import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { evaluateProfileController } from "../controllers/stats.controller.js";

const router = Router();

router.route("/evaluateProfile").post(verifyJWT,evaluateProfileController);

export default router;
