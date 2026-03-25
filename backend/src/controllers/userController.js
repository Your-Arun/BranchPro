import { Branch } from "../models/Branch.js";
import { User } from "../models/User.js";

const formatUser = (u) => ({
  _id: u._id,
  fullName: u.fullName,
  email: u.email,
  role: u.role,
  phone: u.phone,
  avatarUrl: u.avatarUrl,
  branchId: u.branchId || null,       // Populated object: { _id, name, code, city }
  companyId: u.companyId || null,
});

export const getUsers = async (req, res, next) => {
  try {
    // Admins only see users in their own company
    const query = req.user.companyId
      ? { companyId: req.user.companyId }
      : { _id: req.user._id }; // Fallback: only self

    const users = await User.find(query)
      .populate("branchId", "name code city")
      .sort({ fullName: 1 })
      .lean();

    res.json(users.map(formatUser));
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

    // Ensure branch belongs to this admin's company
    const branch = await Branch.findOne({ _id: branchId, companyId: req.user.companyId });
    if (!branch) {
      return res.status(400).json({ message: "Branch not found or not in your company" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role,
      branchId,
      companyId: req.user.companyId,
    });

    const populatedUser = await User.findById(newUser._id)
      .populate("branchId", "name code city")
      .lean();

    res.status(201).json(formatUser(populatedUser));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role, branchId } = req.body;

    // Admin can only update users in their company
    const user = await User.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!user) {
      return res.status(404).json({ message: "User not found or unauthorized" });
    }

    if (fullName) user.fullName = fullName;
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (emailExists) return res.status(400).json({ message: "Email already taken" });
      user.email = email.toLowerCase();
    }
    if (password) user.password = password;
    if (role && ["ADMIN", "STAFF"].includes(role)) user.role = role;
    if (branchId) user.branchId = branchId;

    await user.save();

    const populatedUser = await User.findById(user._id)
      .populate("branchId", "name code city")
      .lean();

    res.json(formatUser(populatedUser));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    // Admin can only delete users in their company
    const user = await User.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!user) {
      return res.status(404).json({ message: "User not found or unauthorized" });
    }
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed" });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteUsers = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "ids array is required" });
    }

    // Admins can only delete users in their company and cannot delete themselves
    const usersToDelete = await User.find({
      _id: { $in: ids },
      companyId: req.user.companyId,
      _id: { $ne: req.user._id }
    });

    const foundIds = usersToDelete.map(u => String(u._id));

    if (foundIds.length === 0) {
      return res.status(404).json({ message: "No valid users found for deletion" });
    }

    await User.deleteMany({ _id: { $in: foundIds } });
    res.json({ message: `${foundIds.length} users removed` });
  } catch (error) {
    next(error);
  }
};
