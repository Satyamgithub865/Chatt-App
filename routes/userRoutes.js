import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  loadHomePage,
  loadLoginPage,
  loadProfilePage,
  loadRegisterPage,
  loginUser,
  logoutUser,
  registerUser,
  saveChat,
} from "../controller/user-controller.js";
import { isLogin, isLogout } from "../middleware/auth.js";

const router = express.Router();

// Define __dirname in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: (req, file, cb) => {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

router.get("/register", isLogout, loadRegisterPage);
router.post("/register", upload.single("image"), registerUser);

router.get("/", isLogout, loadLoginPage);
router.post("/", loginUser);

router.get("/logout", isLogin, logoutUser);

router.get("/dashboard", isLogin, loadProfilePage);
router.get("/home", isLogin, loadHomePage);

router.post("/save-chat", isLogin, saveChat);

router.get("*", function (req, res) {
  res.redirect("/");
});

export default router;
