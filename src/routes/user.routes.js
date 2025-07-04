import { Router } from "express";
import { registerUser, loginUser, logoutUser, renewRefreshToken, changeCurrentPassword, updateAccountDetails, 
    updateAvatar, updateCoverImage, getCurrentUser, getUserProfileDetails, getUserWatchHistory } 
    from "../controllers/user.controller.js";
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
router.route("/change-password").post(jwtVerification, changeCurrentPassword)
router.route("/update-account-details").post(jwtVerification, updateAccountDetails)

router.route("/update-avatar").patch(jwtVerification, upload.single("avatar"), updateAvatar)
router.route("/update-cover-image").patch(jwtVerification, upload.single("coverImage"), updateCoverImage)

router.route("/get-user").get(jwtVerification, getCurrentUser)
router.route("/c/:username").get(jwtVerification, getUserProfileDetails)
router.route("/history").get(jwtVerification, getUserWatchHistory)

export default router