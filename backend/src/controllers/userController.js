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

export const updateUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role, branchId } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (fullName) user.fullName = fullName;
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (emailExists) return res.status(400).json({ message: "Email already taken" });
      user.email = email;
    }
    if (password) user.password = password;
    if (role && ["ADMIN", "STAFF"].includes(role)) user.role = role;
    if (branchId) user.branchId = branchId;

    await user.save();

    const populatedUser = await User.findById(user._id).populate("branchId", "name code city").lean();

    res.json({
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

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "ADMIN") {
      const adminCount = await User.countDocuments({ role: "ADMIN" });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot delete the only admin" });
      }
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed" });
  } catch (error) {
    next(error);
  }
};
