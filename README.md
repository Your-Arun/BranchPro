<div align="center">

# 🚀 BranchFlow Pro
### **एक Complete Logistics & Branch Management System**
*Courier / Logistics Companies के लिए बना एक All-in-One Software Solution*

---

[![Admin Live](https://img.shields.io/badge/Admin%20Panel-Live%20Website-purple?style=for-the-badge&logo=react)](https://adminpanel-branch.onrender.com/)
[![Staff Live](https://img.shields.io/badge/Staff%20Portal-Live%20Website-blue?style=for-the-badge&logo=react)](https://branchpro-1.onrender.com/#/login)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?style=for-the-badge&logo=node.js)](/)
[![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen?style=for-the-badge&logo=mongodb)](/)
[![Mobile Apps](https://img.shields.io/badge/Mobile-React%20Native%20%2B%20Expo-orange?style=for-the-badge&logo=expo)](/)

</div>

---

## 📌 Links & Credentials (At a Glance)

### 🌐 Live Web Apps
* **👑 Admin Web Panel:** [https://adminpanel-branch.onrender.com/](https://adminpanel-branch.onrender.com/)
* **👷 Staff Web Portal:** [https://branchpro-1.onrender.com/#/login](https://branchpro-1.onrender.com/#/login)

### 📱 Android APKs (In-Repo Downloads)
You can find the pre-built android applications inside the project repository:
* **👑 Admin Mobile App:** [BranchPro_Admin.apk (Locally under /apk/)](./apk/BranchPro_Admin.apk)
* **👷 Staff Mobile App:** [BranchPro_Staff.apk (Locally under /apk/)](./apk/BranchPro_Staff.apk)

### 🔐 Demo Credentials
Use these pre-configured user credentials to log in and test the system:

| Role | Username / Email | Password | Scope / Permissions |
| :--- | :--- | :--- | :--- |
| **👑 Company Admin** | `alex.rivera@branchflow.pro` | `Admin@123` | Control all branches, staff, view all dispatches & generate reports. |
| **👷 Branch Staff** | `rahul.sharma@branchflow.pro` | `Staff@123` | Create dispatches from Jodhpur Branch, view incoming packets, add general entries. |
| **👷 Branch Staff (MUM)** | `marcus.thorne@branchflow.pro` | `Staff@123` | Manage Mumbai North Branch activities. |
| **👷 Branch Staff (DEL)**| `sarah.jenkins@branchflow.pro` | `Staff@123` | Manage Delhi Central Branch activities. |

---

## 🔄 System Flow (How it Works)

```
                       ┌───────────────────────────────────────────────────┐
                       │             BRANCHFLOW PRO ECOSYSTEM              │
                       └───────────────────────────────────────────────────┘

        👑 ADMIN (Company Owner/Manager)                  👷 STAFF (Branch Workers)
        ┌───────────────────────────────┐                 ┌───────────────────────────────┐
        │ • Web Admin Panel             │                 │ • Staff Web Portal            │
        │ • Admin Mobile App            │                 │ • Staff Mobile App            │
        └──────────────┬────────────────┘                 └──────────────┬────────────────┘
                       │                                                 │
                       │ (API Requests / Auth)                           │ (Dispatch & Stock Entries)
                       └──────────────────────┬──────────────────────────┘
                                              ▼
                                   ⚙️ BACKEND API SERVER
                                   (Node.js + Express.js)
                                              │
                                              ▼
                                    💾 DATABASE LAYER
                                    (MongoDB Atlas)
```

1. **Staff** log in using their credentials mapped to a specific Branch (e.g., Jodhpur Branch).
2. **Dispatch Creation:** When Staff A sends a package to Branch B, they create a Dispatch entry specifying Category, Courier Name, Docket Number, and Priority. A unique Tracking ID is generated.
3. **Real-time Updates:** The package enters the `SENT` -> `IN_TRANSIT` -> `WAITING_RECEIPT` pipeline.
4. **Receipt Confirmation:** Staff at Branch B see this incoming dispatch on their dashboard and mark it as `RECEIVED` with one click.
5. **Admin Monitoring:** The Company Admin monitors all movements, analytics, staff additions, and branch creation in real-time.

---

## 📦 Project Directory Breakdown (5 Sub-Systems)

This project is organized into modular workspaces:

1. **`adminpanel/` (Admin Web Portal):** Built with React 18 & Vite. Standard dashboard layout with glassmorphic styling to view all operations, manage branches, and create staff.
2. **`staff_website/` (Staff Web Portal):** Built with React 19 & Vite. Core portal for branch employees to run dispatch routines, view pending arrivals, and maintain general registers. Uses HashRouter for robust reload performance.
3. **`backend/` (Server API):** Express-based REST API server connecting to MongoDB using Mongoose schemas. Manages JWT auth, schema validation, email alerts, and dashboards.
4. **`frontend/` (Staff Mobile App):** React Native + Expo app that replicates the Staff Portal features with offline caching, camera integration, and mobile layouts.
5. **`admin-app/` (Admin Mobile App):** React Native + Expo app allowing owners to monitor statistics, check live charts, and track branches on-the-go.
6. **`apk/` (Android APK Releases):** Built APK binaries for quick testing without needing emulator setup.

---

## ✨ Features Checklist

* **🔐 Authentication & Security:**
  - JWT state-free token login.
  - Hashing of passwords using `bcryptjs`.
  - Role-based route guards (`ADMIN` / `STAFF`).
  - Secure signup requiring a unique **Branch Join Registration Key** created by the Admin.
* **📦 Dispatch Tracking Pipeline:**
  - Standard status transitions: `SENT` ➔ `IN_TRANSIT` ➔ `WAITING_RECEIPT` ➔ `RECEIVED`.
  - Edge states support: `PENDING`, `FAILED`, and `OVERDUE` triggers.
  - Priority classes: `LOW`, `MEDIUM`, and `HIGH`.
  - Attachments (PDFs, Images, Manifest documents).
* **📋 General Inventory Entries:**
  - Log standard daily stock/activity changes (IN / OUT).
  - Categories: `GENERAL`, `OFFICE_SUPPLIES`, `EQUIPMENT`, `DOCUMENTS`, `POSTAL`, `OTHER`.
* **📊 Dashboards & Analytics:**
  - Real-time counters showing Sent vs Received dispatches.
  - Dynamic lists of "Incoming Deliveries" ready to be received in one click.
* **📬 Alerts & Notifications:**
  - Automatic email dispatches sent on critical status changes.
  - Toast and custom dialog widgets instead of boring browser alerts.
  - Native Push Notifications via Expo server for mobile clients.

---

## 🗄️ Database Schemas (Data Models)

### 🏢 Company
```json
{
  "name": "Company name (e.g. BranchFlow Logistics)",
  "email": "Contact corporate email",
  "phone": "Telephone line",
  "adminId": "ObjectId ref -> User (Admin creator)"
}
```

### 🏪 Branch
```json
{
  "name": "Branch display name (e.g. Jodhpur Branch)",
  "city": "City where branch resides",
  "address": "Detailed physical street address",
  "code": "Unique short identifier (e.g. JDH)",
  "registrationKey": "Secret onboarding string used by Staff to register",
  "companyId": "ObjectId ref -> Company",
  "status": "ACTIVE / INACTIVE"
}
```

### 👤 User
```json
{
  "fullName": "User full name",
  "email": "User login email address",
  "password": "Bcrypt hashed password",
  "phone": "Mobile number",
  "role": "ADMIN / STAFF",
  "companyId": "ObjectId ref -> Company",
  "branchId": "ObjectId ref -> Branch (only for STAFF role)",
  "avatarUrl": "Optional profile photo link"
}
```

### 📦 Dispatch (Shipment)
```json
{
  "trackingId": "Auto-generated sequence code (e.g. BF-99210)",
  "fromBranchId": "ObjectId ref -> Branch (Origin)",
  "toBranchId": "ObjectId ref -> Branch (Destination)",
  "category": "e.g. Spare Parts, Documents",
  "courierName": "Name of carrier person/agency",
  "docketNumber": "AWB/Tracking Number of courier partner",
  "description": "Text details of the package",
  "dispatchDate": "ISO Timestamp",
  "status": "SENT / IN_TRANSIT / WAITING_RECEIPT / RECEIVED / PENDING / OVERDUE / FAILED",
  "priority": "LOW / MEDIUM / HIGH",
  "timeline": [
    {
      "step": "Status text",
      "note": "Comment",
      "status": "COMPLETED / IN_PROGRESS / PENDING",
      "date": "Timestamp"
    }
  ],
  "attachments": [
    {
      "fileName": "document.pdf",
      "type": "PDF / IMAGE",
      "sizeMb": 2.4
    }
  ]
}
```

### 📋 General Entry
```json
{
  "itemName": "Item label description",
  "quantity": "Numeric volume count",
  "description": "Additional context",
  "entryType": "IN / OUT",
  "category": "GENERAL / OFFICE_SUPPLIES / EQUIPMENT / DOCUMENTS / POSTAL / OTHER",
  "branchId": "ObjectId ref -> Branch",
  "companyId": "ObjectId ref -> Company",
  "createdBy": "ObjectId ref -> User"
}
```

---

## 🛠️ Tech Stack Matrix

| Stack Layer | Technology | Key Library / Version |
| :--- | :--- | :--- |
| **Backend API** | Node.js + Express.js | `express ^4.19`, `dotenv`, `cors` |
| **Database** | MongoDB | Mongoose ORM `mongoose ^8.5` |
| **Web Apps UI** | React | Vite, React Router DOM (v6 & v7) |
| **Mobile Apps** | React Native | Expo SDK 52 |
| **Styling** | Vanilla CSS | Custom Glassmorphic & Modern Theme layouts |
| **Security** | JSON Web Tokens | `jsonwebtoken`, `bcryptjs` hashing |
| **Mailers** | SMTP | `nodemailer` |

---

## 🔑 Environment Setup Templates

### ⚙️ Backend Environment Config (`/backend/.env`)
Create a file named `.env` in the `/backend` folder:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/branchflow
JWT_SECRET=your_super_secret_unique_jwt_token_key
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_smtp_sender_email@gmail.com
EMAIL_PASS=your_gmail_app_password
AUTO_SEED=false
```

### 🖥️ Staff Web App Environment Config (`/staff_website/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

### 👑 Admin Panel Environment Config (`/adminpanel/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 How to Run Locally

### 1️⃣ Run Backend Server (First)
```bash
cd backend
npm install
# Ensure .env is configured correctly
npm start
```
*Port: `http://localhost:5000`*

### 2️⃣ Run Staff Web Portal
```bash
# In a new terminal tab
cd staff_website
npm install
npm run dev
```
*Port: `http://localhost:5173`*

### 3️⃣ Run Admin Web Panel
```bash
# In a new terminal tab
cd adminpanel
npm install
npm run dev
```
*Port: `http://localhost:5174` (or `http://localhost:3001` depending on assignment)*

### 4️⃣ Launch Mobile Apps (Optional)
```bash
# Staff Mobile
cd frontend
npm install
npx expo start

# Admin Mobile
cd admin-app
npm install
npx expo start
```
*Use the **Expo Go** application on your Android/iOS physical device to scan the console's QR code.*

---

## 🔒 Security Summary
* **Bcrypt Password Storage:** Passwords are never stored raw; they are securely salted and hashed.
* **Route Guards:** API endpoints check the authorization header for bearer JWT tokens. If validation fails, or if a `STAFF` member calls an `ADMIN` dashboard endpoint, access is immediately blocked.
* **Sanitized inputs:** Mongoose schemas validate fields to block SQL/NoSQL injections.

---

### Developed for courier & logistics enterprises desiring smart operations.
*BranchFlow Pro — Real-time. Reliable. Ready.*
