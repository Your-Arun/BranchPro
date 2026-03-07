import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Branch } from "../models/Branch.js";
import { Dispatch } from "../models/Dispatch.js";
import { User } from "../models/User.js";
import { branchesSeed, dispatchesSeed, usersSeed } from "./seedData.js";

dotenv.config();

const mapUsers = async (branchMap) => {
  const mapped = [];
  for (const u of usersSeed) {
    const hashed = await bcrypt.hash(u.password || "123456", 10);
    mapped.push({
      fullName: u.fullName,
      email: u.email,
      password: hashed,
      role: u.role,
      branchId: branchMap[u.branchCode]._id
    });
  }
  return mapped;
};

const run = async () => {
  await connectDB();

  await Branch.deleteMany({});
  await User.deleteMany({});
  await Dispatch.deleteMany({});

  const branches = await Branch.insertMany(branchesSeed);
  const branchMap = Object.fromEntries(branches.map((b) => [b.code, b]));

  await User.insertMany(await mapUsers(branchMap));

  await Dispatch.insertMany(
    dispatchesSeed.map((d) => ({
      trackingId: d.trackingId,
      fromBranchId: branchMap[d.fromBranchCode]._id,
      toBranchId: branchMap[d.toBranchCode]._id,
      category: d.category,
      courierName: d.courierName,
      description: d.description,
      dispatchDate: d.dispatchDate,
      status: d.status,
      priority: d.priority,
      geoTrackingEnabled: d.geoTrackingEnabled,
      attachments: d.attachments ?? [],
      timeline: d.timeline ?? []
    }))
  );

  console.log("Database seeded successfully");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed", err);
  process.exit(1);
});
