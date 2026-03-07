import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "branchflow_secret_key", {
    expiresIn: "30d"
  });

export const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, branchId } = req.body;

    if (!fullName || !email || !password || !branchId) {
      return res.status(400).json({ message: "fullName, email, password and branchId are required" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      branchId,
      role: "STAFF"
    });

    const populatedUser = await User.findById(user._id).populate("branchId", "name code city");

    res.status(201).json({
      _id: populatedUser._id,
      fullName: populatedUser.fullName,
      email: populatedUser.email,
      role: populatedUser.role,
      branch: populatedUser.branchId,
      token: generateToken(populatedUser._id)
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate("branchId", "name code city");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      branch: user.branchId,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};
