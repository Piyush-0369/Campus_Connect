import { Router } from "express";
import { Login,
        logout,
        refreshAccessToken,
        changeCurrentPassword,
        deleteAccount,
        getProfile,
        searchUsers,
        getUserById
        } from "../controllers/baseUser.controller.js";
import {
        getAllEvents,
        updateEventDetails,
        deleteEvent
} from "../controllers/event.controller.js"
import { verifyJWT,authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router =Router();

router.route("/login").post(Login);

router.route("/logout").post(verifyJWT,logout);
router.route("/refreshAccessToken").get(refreshAccessToken);
router.route("/ChangeCurrentPassword").patch(verifyJWT,changeCurrentPassword);
router.route("/deleteAccount").delete(verifyJWT,deleteAccount);
router.route("/getProfile").get(verifyJWT,getProfile);
router.route("/searchUser").post(verifyJWT, upload.single("photo"), searchUsers);
router.route("/getAllEvents").get(getAllEvents);
router.route("/updateEvent/:eventId").patch(verifyJWT,authorizeRoles("Admin"),updateEventDetails);
router.route("/deleteEvent/:eventId").delete(verifyJWT,authorizeRoles("Admin"),deleteEvent);

router.get("/profile/:id", verifyJWT, getUserById);
export default router;

