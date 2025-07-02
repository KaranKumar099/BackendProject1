import { Router } from "express";
import { registerUser, loginUser, logoutUser, renewRefreshToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { jwtVerification } from "../middlewares/auth.middleware.js";


const router=Router();
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// secured route
router.route("/logout").post(jwtVerification, logoutUser)
router.route("/refrsh-token").post(renewRefreshToken)

export default router