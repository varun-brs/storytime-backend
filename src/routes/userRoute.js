import express from "express";
import {
  createUser,
  verifyEmail,
  loginUser,
  generateSpotifyRefreshToken,
  getUserProfile,
  updateUserProfile,
  updatePreferredLanguage,
  updatePassword,
  forgotPassword,
  resetPassword,
  saveSpotifyStory,
  removeSpotifyStory,
  getSpotifyStories,
} from "../controllers/userController.js";
import { checkToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", createUser);
router.get("/verifyEmail/:verifyToken", verifyEmail);
router.post("/login", loginUser);
router.get("/refreshtoken", checkToken, generateSpotifyRefreshToken);
router.get("/profile", checkToken, getUserProfile);
router.put("/profile", checkToken, updateUserProfile);
router.put("/preferredlanguage", checkToken, updatePreferredLanguage);
router.put("/updatepassword", checkToken, updatePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword", resetPassword);
router.post("/savestory", checkToken, saveSpotifyStory);
router.delete("/removestory", checkToken, removeSpotifyStory);
router.get("/library", checkToken, getSpotifyStories);

export default router;
