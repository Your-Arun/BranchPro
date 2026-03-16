import { Branch } from "../models/Branch.js";
import { Company } from "../models/Company.js";
import { User } from "../models/User.js";

export const createCompany = async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;
    if (!name || !phone || !email) {
      return res.status(400).json({ message: "Name, phone and email are required" });
    }

    const companyExists = await Company.findOne({ adminId: req.user._id });
    if (companyExists) {
      return res.status(400).json({ message: "You have already created a company" });
    }

    const company = await Company.create({ name, phone, email, adminId: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { companyId: company._id });

    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
};

export const getMyCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ adminId: req.user._id });
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;

    const company = await Company.findOne({ adminId: req.user._id });
    if (!company) return res.status(404).json({ message: "Company not found" });

    if (name) company.name = name;
    if (phone) company.phone = phone;
    if (email) company.email = email;

    await company.save();
    res.json(company);
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ adminId: req.user._id });
    if (!company) return res.status(404).json({ message: "Company not found" });

    // Delete all branches under this company
    await Branch.deleteMany({ companyId: company._id });

    // Unlink all users from this company
    await User.updateMany({ companyId: company._id }, { $unset: { companyId: "", branchId: "" } });

    await Company.findByIdAndDelete(company._id);
    res.json({ message: "Company and all its branches deleted" });
  } catch (error) {
    next(error);
  }
};
