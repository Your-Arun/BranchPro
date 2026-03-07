export const branchesSeed = [
  { name: "Main Headquarters", city: "Seattle", address: "Main Headquarters (Seattle, WA)", code: "HQ", status: "ACTIVE" },
  { name: "Jodhpur Branch", city: "Jodhpur", address: "Ratanada Industrial Area", code: "JDH", status: "ACTIVE" },
  { name: "Mumbai North", city: "Mumbai", address: "Andheri East Logistics Hub", code: "MUM", status: "ACTIVE" },
  { name: "Delhi Central", city: "Delhi", address: "Okhla Phase III, South Delhi", code: "DEL", status: "ACTIVE" },
  { name: "Bangalore SEZ", city: "Bangalore", address: "Electronic City Phase II", code: "BLR", status: "ACTIVE" }
];

export const usersSeed = [
  {
    fullName: "Alex Rivera",
    email: "alex.rivera@branchflow.pro",
    password: "Admin@123",
    role: "ADMIN",
    branchCode: "HQ"
  },
  {
    fullName: "Rahul Sharma",
    email: "rahul.sharma@branchflow.pro",
    password: "Staff@123",
    role: "STAFF",
    branchCode: "JDH"
  },
  {
    fullName: "Marcus Thorne",
    email: "marcus.thorne@branchflow.pro",
    password: "Staff@123",
    role: "STAFF",
    branchCode: "MUM"
  },
  {
    fullName: "Sarah Jenkins",
    email: "sarah.jenkins@branchflow.pro",
    password: "Staff@123",
    role: "STAFF",
    branchCode: "DEL"
  }
];

export const dispatchesSeed = [
  {
    trackingId: "BF-99210",
    fromBranchCode: "HQ",
    toBranchCode: "DEL",
    category: "Logistics",
    courierName: "Rohit Sharma",
    description: "High-priority shipment.",
    dispatchDate: "2026-03-04T08:30:00.000Z",
    status: "IN_TRANSIT",
    priority: "HIGH",
    geoTrackingEnabled: true,
    attachments: [
      { fileName: "Manifest.pdf", type: "PDF", sizeMb: 1.2 },
      { fileName: "Load_Photo.jpg", type: "IMAGE", sizeMb: 2.4 }
    ],
    timeline: [
      { step: "Dispatched", note: "Completed", status: "COMPLETED", date: "2026-03-04T08:30:00.000Z" },
      { step: "In Transit", note: "En route to Delhi Central", status: "IN_PROGRESS", date: "2026-03-05T05:30:00.000Z" },
      { step: "Waiting for Receipt", note: "Awaiting digital signature", status: "PENDING" }
    ]
  },
  {
    trackingId: "BF-88124",
    fromBranchCode: "MUM",
    toBranchCode: "BLR",
    category: "Documents",
    courierName: "Meera Joshi",
    description: "Contract documents.",
    dispatchDate: "2026-03-05T01:00:00.000Z",
    status: "RECEIVED",
    priority: "MEDIUM",
    geoTrackingEnabled: false
  },
  {
    trackingId: "BF-99301",
    fromBranchCode: "DEL",
    toBranchCode: "MUM",
    category: "Spare Parts",
    courierName: "Rakesh Jain",
    description: "Spare module package.",
    dispatchDate: "2026-03-03T04:30:00.000Z",
    status: "WAITING_RECEIPT",
    priority: "MEDIUM",
    geoTrackingEnabled: true
  },
  {
    trackingId: "BF-77192",
    fromBranchCode: "BLR",
    toBranchCode: "HQ",
    category: "High Priority",
    courierName: "Akash Menon",
    description: "Urgent parcel.",
    dispatchDate: "2026-03-01T10:00:00.000Z",
    status: "OVERDUE",
    priority: "HIGH",
    geoTrackingEnabled: true
  }
];
