import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  changeCurrentPassword,
  getUser,
  updateAccountDetails,
  avatarUpdate,
  coverImageUpdate,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { uploadAVideo } from "../controllers/video.controller.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(upload.none(), loginUser);

router.route("/logout").post(verifyJwt, logoutUser);

router.route("/refresh-token").post(verifyJwt, refreshAccessToken);

router.route("/get-user").get(verifyJwt, getUser);
router.route("/update-user").put(verifyJwt, updateAccountDetails);
router.route("/password").put(verifyJwt, changeCurrentPassword);

router
  .route("/change-avatar")
  .put(verifyJwt, upload.single("avatar"), avatarUpdate);

router
  .route("/change-cover")
  .put(verifyJwt, upload.single("coverImage"), coverImageUpdate);

router.route("/c/:username").get(verifyJwt, getUserChannelProfile);
router.route("/history").get(verifyJwt, getWatchHistory);

router.route('/video').post(verifyJwt,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1
    },
    {
      name: "thumbnail",
      maxCount: 1
    }
  ]), uploadAVideo)

export default router;
