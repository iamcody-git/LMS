import express from "express";
import {
  authenticateUser,
  createUserAccount,
  getCurrentUserProfile,
  signOutUser,
  updateUserProfile,
} from "../Controllers/userController.js";
import { isAuthenticated } from "../Middleware/authMiddleware.js";
import { validateSignUp } from "../Middleware/validationMiddleware.js";
import upload from '../Utils/Multer.js';

const router = express.Router();

// Auth routes
router.post("/signup", validateSignUp, createUserAccount);
router.post("/signin", authenticateUser);
router.post("/signout", isAuthenticated, signOutUser);

// Profile routes
router.get("/profile", isAuthenticated, getCurrentUserProfile);

// If you are using Multer for file uploads, it should be used like this:
router.patch("/profile", isAuthenticated, upload.single('profileImage'), updateUserProfile);

export default router;
