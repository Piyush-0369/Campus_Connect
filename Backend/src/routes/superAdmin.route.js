import { Router } from "express";
import { registerAdmin } from "../controllers/superAdmin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT,authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register-Admin").post(verifyJWT,authorizeRoles("SuperAdmin"),upload.single("avatar"),registerAdmin);

export default router;
