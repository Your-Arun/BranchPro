import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Branch } from "../models/Branch.js";
import { Company } from "../models/Company.js";

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
