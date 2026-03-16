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
