import User from "../model/userModel.js";
import Chat from "../model/chatModel.js";
import bcrypt from "bcrypt";

export const loadRegisterPage = async (req, res) => {
  res.render("register");
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
      image: "images/" + req.file.filename,
    });

    res.redirect("/home");
  } catch (error) {
    console.log(error.message);
  }
};

export const loadLoginPage = (req, res) => {
  res.render("login");
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.render("login", { message: "Invalid Email!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.render("login", { message: "Invalid Password!" });
    }

    req.session.user = user;
    res.redirect("/home");
  } catch (error) {
    console.log(error.message);
  }
};

export const logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

export const loadProfilePage = (req, res) => {
  res.render("dashboard", { user: req.session.user });
};

export const loadHomePage = async (req, res) => {
  try {
    const users = await User.find({ _id: { $nin: req.session.user._id } });

    res.render("home", { user: req.session.user, users: users });
  } catch (error) {
    console.log(error.message);
  }
};

export const saveChat = async (req, res) => {
  try {
    const { sender_id, reciever_id, message } = req.body;

    const chat = await Chat.create({
      sender_id,
      reciever_id,
      message,
    });

    return res.status(200).json({ success: true, data: chat });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
