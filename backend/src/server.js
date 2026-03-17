import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { branchesSeed, dispatchesSeed, usersSeed } from "./data/seedData.js";
import { Branch } from "./models/Branch.js";
import { Dispatch } from "./models/Dispatch.js";
import { User } from "./models/User.js";

dotenv.config();

const seedIfEmpty = async () => {
  const branchCount = await Branch.countDocuments();
  if (branchCount > 0 || process.env.AUTO_SEED !== "true") {
    return;
  }

  // 1. Create a placeholder admin for the company
  const adminData = usersSeed.find(u => u.role === "ADMIN");
  const hashedAdminPass = await bcrypt.hash(adminData.password || "123456", 10);
  const tempAdmin = await User.create({
    fullName: adminData.fullName,
    email: adminData.email,
    password: hashedAdminPass,
    role: "ADMIN"
  });

  // 2. Create the Company with the admin
  const { Company } = await import("./models/Company.js"); // Lazy import or make sure it's at top
  const company = await Company.create({
    name: "BranchFlow Pro Corp",
    email: "system@branchflow.pro",
    phone: "+1 (555) 012-3456",
    adminId: tempAdmin._id
  });

  // 3. Link Admin to Company
  tempAdmin.companyId = company._id;
  await tempAdmin.save();

  // 4. Seed Branches with Company ID
  const branches = await Branch.insertMany(
    branchesSeed.map(b => ({ ...b, companyId: company._id, registrationKey: `KEY-${b.code}` }))
  );
  const branchMap = Object.fromEntries(branches.map((b) => [b.code, b]));

  // 5. Update Admin's Branch
  tempAdmin.branchId = branchMap[adminData.branchCode]._id;
  await tempAdmin.save();

  // 6. Seed other Users
  const otherUsers = usersSeed.filter(u => u.role !== "ADMIN");
  const userDocs = [];
  for (const u of otherUsers) {
    const hashed = await bcrypt.hash(u.password || "123456", 10);
    userDocs.push({
      fullName: u.fullName,
      email: u.email,
      password: hashed,
      role: u.role,
      branchId: branchMap[u.branchCode]._id,
      companyId: company._id
    });
  }
  await User.insertMany(userDocs);

  // 7. Seed Dispatches
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

  console.log("Seeded initial data for BranchFlow Pro Corp");
};

const start = async () => {
  await connectDB();
  await seedIfEmpty();

  const app = createApp();
  const port = Number(process.env.PORT || 5000);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

start().catch((error) => {
  console.error("Startup error", error);
  process.exit(1);
});
