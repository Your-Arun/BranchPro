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

  const branches = await Branch.insertMany(branchesSeed);
  const branchMap = Object.fromEntries(branches.map((b) => [b.code, b]));

  const userDocs = [];
  for (const u of usersSeed) {
    const hashed = await bcrypt.hash(u.password || "123456", 10);
    userDocs.push({
      fullName: u.fullName,
      email: u.email,
      password: hashed,
      role: u.role,
      branchId: branchMap[u.branchCode]._id
    });
  }

  await User.insertMany(userDocs);

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

  console.log("Seeded initial data");
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
