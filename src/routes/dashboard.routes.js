import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js"
import {jwtVerification} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(jwtVerification); // Apply verifyJWT middleware to all routes in this file

router.route("/:channelId/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router