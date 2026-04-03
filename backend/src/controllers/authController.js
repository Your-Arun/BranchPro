import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { Branch } from "../models/Branch.js";
import { Company } from "../models/Company.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "branchflow_secret_key", {
    expiresIn: "30d"
  });

export const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, registrationKey, phone } = req.body;

    if (!fullName || !email || !password || !registrationKey) {
      return res.status(400).json({ message: "fullName, email, password and registrationKey are required" });
    }

    const branch = await Branch.findOne({ registrationKey });
    if (!branch) {
      return res.status(400).json({ message: "Invalid registration key" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role: "STAFF",
      branchId: branch._id,
      companyId: branch.companyId,
      phone: phone || ""
    });

    const populatedUser = await User.findById(user._id)
      .populate("branchId", "name code city")
      .populate("companyId", "name email phone");

    res.status(201).json({
      _id: populatedUser._id,
      fullName: populatedUser.fullName,
      email: populatedUser.email,
      role: populatedUser.role,
      phone: populatedUser.phone,
      company: populatedUser.companyId,
      branch: populatedUser.branchId,
      token: generateToken(populatedUser._id)
    });
  } catch (error) {
    next(error);
  }
};

export const adminRegister = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full Name, Email and Password are required" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone: phone || "",
      role: "ADMIN"
    });

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
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

    const user = await User.findOne({ email: email.toLowerCase() })
      .populate("branchId", "name code city")
      .populate("companyId", "name email phone");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      company: user.companyId,
      branch: user.branchId,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("branchId", "name code city")
      .populate("companyId", "name email phone");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      company: user.companyId,
      branch: user.branchId
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { fullName, email, phone, password } = req.body;

    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    
    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) return res.status(400).json({ message: "Email already in use" });
      user.email = email.toLowerCase();
    }

    if (password) user.password = password;

    await user.save();

    const populatedUser = await User.findById(user._id)
      .populate("branchId", "name code city")
      .populate("companyId", "name email phone");

    res.json({
      _id: populatedUser._id,
      fullName: populatedUser.fullName,
      email: populatedUser.email,
      role: populatedUser.role,
      phone: populatedUser.phone,
      company: populatedUser.companyId,
      branch: populatedUser.branchId,
      token: generateToken(populatedUser._id)
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Please provide an email" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "There is no user with that email address." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash("sha256").update(otp).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save();

    console.log("Your OTP is:", otp); // Log for easy local testing

    try {
      await sendPasswordResetEmail(user.email, otp);
      res.status(200).json({ message: "OTP sent to your email!" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Please provide email, OTP, and new password" });
    }

    // Get hashed token
    const resetPasswordToken = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

