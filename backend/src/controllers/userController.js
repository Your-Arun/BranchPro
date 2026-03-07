import { User } from "../models/User.js";

export const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find({}).populate("branchId", "name code city").sort({ fullName: 1 }).lean();

    res.json(
      users.map((u) => ({
        _id: u._id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        avatarUrl: u.avatarUrl,
        branchName: u.branchId?.name ?? "",
        branchId: u.branchId?._id ?? null,
        branch: u.branchId || null
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role = "STAFF", branchId } = req.body;

    if (!fullName || !email || !password || !branchId) {
      return res.status(400).json({ message: "fullName, email, password and branchId are required" });
    }

    if (!["ADMIN", "STAFF"].includes(role)) {
      return res.status(400).json({ message: "Role must be ADMIN or STAFF" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const newUser = await User.create({
      fullName,
      email,
      password,
      role,
      branchId
    });

    const populatedUser = await User.findById(newUser._id).populate("branchId", "name code city").lean();

    res.status(201).json({
      _id: populatedUser._id,
      fullName: populatedUser.fullName,
      email: populatedUser.email,
      role: populatedUser.role,
      avatarUrl: populatedUser.avatarUrl,
      branchName: populatedUser.branchId?.name ?? "",
      branchId: populatedUser.branchId?._id ?? null,
      branch: populatedUser.branchId || null
    });
  } catch (error) {
    next(error);
  }
};
