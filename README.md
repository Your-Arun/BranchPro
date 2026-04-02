<div align="center">

# 🚀 BranchFlow Pro

**एक Complete Logistics & Branch Management System**

*Courier / Logistics Companies के लिए बना एक All-in-One Software Solution*

---

[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?style=for-the-badge&logo=node.js)](/)
[![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen?style=for-the-badge&logo=mongodb)](/)
[![Staff Web](https://img.shields.io/badge/Staff%20Web-React%20%2B%20Vite-blue?style=for-the-badge&logo=react)](/)
[![Admin Panel](https://img.shields.io/badge/Admin%20Panel-React%20%2B%20Vite-purple?style=for-the-badge&logo=react)](/)
[![Mobile App](https://img.shields.io/badge/Mobile%20App-React%20Native%20%2B%20Expo-orange?style=for-the-badge&logo=expo)](/)

</div>

---

## 📌 Table of Contents

1. [Project क्या है?](#-project-kya-hai)
2. [System कैसे काम करता है? (Simple Flow)](#-system-kaise-kaam-karta-hai)
3. [Project के 5 Parts](#-project-ke-5-parts)
4. [Complete Features List](#-complete-features-list)
5. [Database Models (Data Structure)](#-database-models)
6. [API Routes (Backend Endpoints)](#-api-routes)
7. [Staff Web App — Pages & Features](#-staff-web-app)
8. [Admin Panel — Pages & Features](#-admin-panel)
9. [Mobile Apps](#-mobile-apps)
10. [Tech Stack (Technologies Used)](#-tech-stack)
11. [Environment Variables Setup](#-environment-variables-setup)
12. [How to Run (Step-by-Step)](#-how-to-run-locally)
13. [Folder Structure](#-folder-structure)
14. [User Roles & Permissions](#-user-roles--permissions)
15. [Dispatch Status Flow](#-dispatch-status-flow)

---

## 🤔 Project Kya Hai?

**BranchFlow Pro** एक ऐसा software system है जो किसी भी **Courier या Logistics Company** को उनके सभी branches के बीच shipments/dispatches को track करने में help करता है।

### Problem जो यह Solve करता है:
- किसी company के पास 5, 10, या 50 branches होती हैं
- एक branch से दूसरी branch में packages/documents/parcels भेजे जाते हैं
- **पहले:** कोई proper system नहीं था — manual register, calls, confusion
- **अब:** BranchFlow Pro से सब कुछ digital, real-time, और error-free है

### एक Line में:
> *"जैसे BlueDart, DTDC के लिए internal tracking + management system होता है — वैसे ही यह system किसी भी courier company के लिए बना है।"*

---

## 🔄 System Kaise Kaam Karta Hai?

```
┌─────────────────────────────────────────────────────────────────┐
│                     BRANCHFLOW PRO ECOSYSTEM                     │
└─────────────────────────────────────────────────────────────────┘

  👨‍💼 ADMIN (Company Owner)
  ├── Admin Panel (Website)  ──→  Sab kuch manage karo (Branches, Staff, Reports)
  └── Admin Mobile App       ──→  On-the-go live data dekho

  👷 STAFF (Branch Employee)
  └── Staff Web App          ──→  Dispatch banao, receive karo, entries karo

  ☁️  BACKEND (The Brain)
  └── Node.js + MongoDB      ──→  Sab ka data store & sync karta hai

  📊 DATA FLOW:
  Branch A ka Staff → Dispatch Create karta hai → Backend save karta hai
  → Branch B ka Staff ko notification → Confirm Receipt karta hai → Admin dekh sakta hai
```

---

## 📦 Project Ke 5 Parts

### 1. 🖥️ Staff Web App (`/staff_website`)
**Kaun use karta hai:** Branch ke employees (daily workers)

**Kya karte hain isme:**
- Login karke apni branch ka dashboard dekho
- Doosri branch ko dispatch/shipment bhejo
- Incoming deliveries receive karo
- General entries (items, documents) record karo
- Apna profile manage karo

**Technology:** React 19 + Vite + React Router

---

### 2. 👑 Admin Panel (`/adminpanel`)
**Kaun use karta hai:** Company ka Owner / Top Manager

**Kya karte hain isme:**
- Nayi branches create karo
- Staff accounts manage karo
- Saari dispatches ek jagah dekho
- Reports aur analytics dekho
- Bulk operations (delete, update)
- Push notifications bhejo

**Technology:** React 18 + Vite

---

### 3. 📱 Staff Mobile App (`/frontend`)
**Kaun use karta hai:** Branch staff (phone par)

**Kya karte hain isme:**
- Mobile se dispatches create & track karo
- Real-time push notifications paao
- Offline caching (internet na ho tab bhi data dikhe)

**Technology:** React Native + Expo

---

### 4. 📱 Admin Mobile App (`/admin-app`)
**Kaun use karta hai:** Company owner/manager (phone par)

**Kya karte hain isme:**
- Move karte hue bhi sab kuch monitor karo
- Live branch statistics dekho

**Technology:** React Native + Expo

---

### 5. ⚙️ Backend API (`/backend`)
**Yeh koi UI nahi hai** — yeh ek server hai jo sab kuch connect karta hai.

**Kya karta hai:**
- Saari apps ke liye data provide karta hai
- Login/Logout handle karta hai (JWT Authentication)
- Database (MongoDB) se baat karta hai
- Emails bhejta hai (dispatch notifications)
- Security — sirf authorized users access kar saken

**Technology:** Node.js + Express.js + MongoDB

---

## ✨ Complete Features List

### 🔐 Authentication & Security
- [x] JWT Token-based login (secure & stateless)
- [x] Password hashing with bcryptjs
- [x] Role-based access control (ADMIN / STAFF)
- [x] Protected routes — bina login ke kuch bhi access nahi
- [x] Branch Join Code se staff onboarding (unique registration key per branch)

### 📦 Dispatch Management
- [x] Nayi dispatch create karo (from → to branch)
- [x] Tracking ID automatic generate hota hai
- [x] Priority set karo: LOW / MEDIUM / HIGH
- [x] Category aur Courier Name dalo
- [x] Docket Number track karo
- [x] Timeline tracking (har step record hota hai)
- [x] Status update karo (SENT → IN_TRANSIT → RECEIVED etc.)
- [x] Attachments support (PDF, Image, DOC)
- [x] Dispatch edit karo
- [x] Dispatch detail page with full timeline

### 📋 General Entry System
- [x] Branch ke andar aane/jaane wale items record karo
- [x] Entry type: IN (aaya) / OUT (gaya)
- [x] Categories: GENERAL, OFFICE_SUPPLIES, EQUIPMENT, DOCUMENTS, POSTAL, OTHER
- [x] Item name, quantity, description
- [x] Date-wise filtering
- [x] Entries delete karo

### 📊 Dashboard & Analytics
- [x] Branch overview — Sent, Received, In Transit, Overdue ka count
- [x] "Pending Deliveries" — jo confirm karni hain wo alag dikhti hain
- [x] Recent activity feed
- [x] One-click receipt confirmation dashboard se hi

### 📬 Incoming Tracking
- [x] Apni branch par aane wale dispatches ki list
- [x] Status filter karo
- [x] Sidha receive karo list se

### 👤 Profile Management
- [x] Apna naam, phone number update karo
- [x] Password change karo
- [x] Avatar upload karo
- [x] Apni branch details dekho

### 🔔 Notifications & Alerts
- [x] Email notifications (dispatch create/update par)
- [x] Toast notifications — success, error, warning ke liye
- [x] Custom confirm modals (native browser popup nahi)
- [x] Mobile push notifications (Expo Notifications)

### 📱 Mobile-Specific Features
- [x] Offline data caching
- [x] Automatic navigation bar fit (koi UI hide nahi hoti)
- [x] APK build support (EAS Build se)

---

## 🗄️ Database Models

### 🏢 Company
```
Company
├── name          (Company ka naam)
├── email         (Contact email)
├── phone         (Phone number)
└── adminId       (Company ka main Admin ka reference)
```

### 🏪 Branch
```
Branch
├── name            (Branch ka naam, e.g. "Delhi HQ")
├── city            (Shehar)
├── address         (Pura address)
├── code            (Unique short code, e.g. "DEL-01")
├── registrationKey (Branch Join Code — staff login ke liye)
├── companyId       (Kis company ka hai)
└── status          (ACTIVE / INACTIVE)
```

### 👤 User (Staff / Admin)
```
User
├── fullName    (Poora naam)
├── email       (Login email)
├── password    (Hashed — bcrypt se secure)
├── phone       (Phone number)
├── role        (ADMIN ya STAFF)
├── companyId   (Kis company mein hai)
├── branchId    (Kis branch par hai)
└── avatarUrl   (Photo URL)
```

### 📦 Dispatch (Shipment)
```
Dispatch
├── trackingId        (Unique tracking number)
├── fromBranchId      (Bhejne wali branch)
├── toBranchId        (Prapt karne wali branch)
├── category          (Document, Parcel, etc.)
├── courierName       (Courier company ka naam)
├── docketNumber      (Courier docket/AWB number)
├── description       (Kya bheja)
├── dispatchDate      (Bhejne ki date)
├── status            (SENT / IN_TRANSIT / WAITING_RECEIPT / RECEIVED / PENDING / OVERDUE / FAILED)
├── priority          (LOW / MEDIUM / HIGH)
├── timeline          ([ {step, note, status, date} ] — har update record hoti hai)
└── attachments       ([ {fileName, type, sizeMb} ] — files attach kar sako)
```

### 📋 General Entry
```
GeneralEntry
├── itemName     (Item ka naam, max 200 chars)
├── quantity     (Kitna — whole number)
├── description  (Detail, max 500 chars)
├── entryType    (IN ya OUT)
├── category     (GENERAL / OFFICE_SUPPLIES / EQUIPMENT / DOCUMENTS / POSTAL / OTHER)
├── branchId     (Kis branch ki entry hai)
├── companyId    (Kis company ka)
└── createdBy    (Kis user ne banaya — User reference)
```

---

## 🔌 API Routes

> **Base URL:** `http://localhost:5000/api`

| Route Group        | Endpoint Prefix           | Purpose                          |
|--------------------|---------------------------|----------------------------------|
| Health Check       | `GET /api/health`         | Server chal raha hai ya nahi     |
| Authentication     | `/api/auth`               | Login, Signup, Profile           |
| Dashboard          | `/api/dashboard`          | Branch stats & recent activity   |
| Dispatches         | `/api/dispatches`         | CRUD for all shipments           |
| Branches           | `/api/branches`           | Branch management                |
| Users              | `/api/users`              | User/Staff management            |
| General Entries    | `/api/general-entries`    | Branch inventory entries         |
| Reports            | `/api/reports`            | Analytics & reports data         |
| Admin              | `/api/admin`              | Admin-only operations            |

### Authentication Endpoints
```
POST   /api/auth/login       → Email + Password se login karo
POST   /api/auth/signup      → Nayi account banao (Branch Join Code chahiye)
GET    /api/auth/me          → Apni profile dekho
PUT    /api/auth/profile     → Profile update karo
```

### Dispatch Endpoints
```
GET    /api/dispatches          → Apni branch ke saare dispatches
POST   /api/dispatches          → Nayi dispatch banao
GET    /api/dispatches/:id      → Ek dispatch ki detail
PUT    /api/dispatches/:id      → Dispatch update/edit karo
DELETE /api/dispatches/:id      → Dispatch delete karo
PATCH  /api/dispatches/:id/status → Sirf status update karo
```

### General Entry Endpoints
```
GET    /api/general-entries          → Saari entries
POST   /api/general-entries          → Nayi entry banao
PUT    /api/general-entries/:id      → Entry edit karo
DELETE /api/general-entries/:id      → Entry delete karo
```

---

## 🖥️ Staff Web App

**Location:** `/staff_website`  
**Run Command:** `npm run dev` (port: 5173)

### Pages & Unka Kaam

| Page | Route | Kya karta hai |
|------|-------|---------------|
| **Login** | `/login` | Staff login page |
| **Signup** | `/signup` | Nayi account — Branch Join Code dalo |
| **Dashboard** | `/` | Branch overview, pending deliveries, metrics |
| **Dispatch** | `/dispatch` | Nayi dispatch create karo |
| **Dispatch Edit** | `/dispatch/edit/:id` | Existing dispatch edit karo |
| **Dispatch Details** | `/details/:id` | Full dispatch info + timeline |
| **Incoming** | `/incoming` | Apni branch par aane wale packets |
| **General Entry** | `/general-entry` | Items/documents ki entries |
| **Profile** | `/profile` | Account settings |

### Routing Behavior
- **HashRouter** use hota hai — isliye refresh par "Page Not Found" nahi aata
- **Protected Routes** — login nahi hai to `/login` par redirect
- **Auto Redirect** — login ho gaye to `/` par aao automatically

---

## 👑 Admin Panel

**Location:** `/adminpanel`  
**Run Command:** `npm run dev` (port: 5174 ya 3001)

### Features
- **Company Dashboard** — Sab branches ka overview
- **Branch Management** — Branches create/edit/delete karo
- **Staff Management** — New staff accounts, existing manage karo
- **All Dispatches View** — Company ki saari dispatches ek jagah
- **Bulk Delete** — Multiple records ek sath delete
- **Reports** — Date-range se analytics nikalo
- **Glassmorphic UI** — Premium dark-mode design with toast notifications & custom confirm modals

---

## 📱 Mobile Apps

### Staff Mobile App (`/frontend`)
- **Framework:** React Native + Expo SDK 52
- **Push Notifications:** Expo Notifications
- **APK Build:** `eas build --platform android`
- **Run:** `npx expo start` → Expo Go app se scan karo

### Admin Mobile App (`/admin-app`)
- **Framework:** React Native + Expo
- **Purpose:** Manager monitoring on mobile
- **Run:** `npx expo start`

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend Runtime** | Node.js | LTS |
| **Backend Framework** | Express.js | ^4.19 |
| **Database** | MongoDB (via Mongoose) | ^8.5 |
| **Authentication** | JWT + bcryptjs | — |
| **Email Service** | Nodemailer + Resend | — |
| **Staff Web** | React + Vite | React 19 |
| **Admin Panel** | React + Vite | React 18 |
| **Mobile Apps** | React Native + Expo | SDK 52 |
| **Routing (Web)** | React Router DOM | v7 |
| **Icons (Web)** | Lucide React | — |
| **HTTP Client** | Axios | — |
| **Dev Tool** | Nodemon | — |

---

## 🔑 Environment Variables Setup

### Backend (`.env` file — `/backend/.env`)
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/branchflow

# JWT Secret (koi bhi random string rakh do, strong rakho)
JWT_SECRET=your_super_secret_key_here

# Server Port
PORT=5000

# Frontend ka URL (CORS ke liye)
CLIENT_ORIGIN=http://localhost:5173

# Email Service (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Auto seed karna hai pehli baar? (true/false)
AUTO_SEED=false
```

### Admin Panel (`.env` file — `/adminpanel/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

### Staff Web App
```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ **Important:** `.env` file kabhi Git par push mat karo! `.gitignore` mein already add hai.

---

## 🚀 How To Run Locally

> **Prerequisites:** Node.js (v18+) aur MongoDB Atlas account (ya local MongoDB) chahiye.

### Step 1: Repository Clone Karo
```bash
git clone https://github.com/urarun0211/BranchPro.git
cd BranchPro
```

### Step 2: Backend Start Karo (Sabse Pehle)
```bash
cd backend
npm install
# .env file banao (upar wala template dekho)
npm start
```
✅ Console mein dikhega: `Server running on port 5000`

*(Yeh terminal band mat karo! Background mein chalne do.)*

---

### Step 3: Staff Web App Start Karo
```bash
# Naya terminal kholo
cd staff_website
npm install
npm run dev
```
✅ Browser mein kholo: `http://localhost:5173`

---

### Step 4: Admin Panel Start Karo
```bash
# Ek aur naya terminal
cd adminpanel
npm install
npm run dev
```
✅ Browser mein kholo: `http://localhost:5174`

---

### Step 5: Mobile App Chalao (Optional)
```bash
# Staff Mobile App
cd frontend
npm install
npx expo start
# ─ QR code scan karo Expo Go app se

# Admin Mobile App
cd admin-app
npm install
npx expo start
```

> 📱 Expo Go app Google Play/App Store se download karo, phir QR code scan karo.

---

## 📁 Folder Structure

```
BranchPro/
│
├── 📁 backend/                 ← Node.js API Server
│   └── src/
│       ├── app.js              ← Express app setup
│       ├── server.js           ← Server start + DB connect
│       ├── config/             ← Database config
│       ├── controllers/        ← Business logic (auth, dispatch, etc.)
│       ├── middleware/         ← Auth guard, error handler
│       ├── models/             ← MongoDB schemas (User, Branch, Dispatch...)
│       ├── routes/             ← API endpoint definitions
│       └── utils/              ← Email sender, helpers
│
├── 📁 staff_website/           ← Staff React Web App (Vite)
│   └── src/
│       ├── pages/              ← Dashboard, Dispatch, Incoming, etc.
│       ├── components/         ← Layout, Navbar, shared UI
│       ├── context/            ← AuthContext (global state)
│       └── App.jsx             ← Routing
│
├── 📁 adminpanel/              ← Admin React Web App (Vite)
│   └── src/
│       └── App.jsx             ← Sab kuch ek file mein (monolithic)
│
├── 📁 frontend/                ← Staff Mobile App (React Native + Expo)
│   └── src/
│       ├── screens/            ← Mobile screens
│       ├── components/         ← Reusable mobile components
│       ├── navigation/         ← App navigation
│       ├── api/                ← API calls
│       └── utils/              ← Helpers
│
└── 📁 admin-app/               ← Admin Mobile App (React Native + Expo)
    └── src/                    ← Screens aur components
```

---

## 👥 User Roles & Permissions

| Feature | STAFF | ADMIN |
|---------|-------|-------|
| Dashboard dekho | ✅ (apni branch) | ✅ (sab branches) |
| Dispatch create karo | ✅ | ✅ |
| Dispatch delete karo | ✅ (sirf apni branch ke) | ✅ (sab) |
| General Entries | ✅ | ✅ |
| General Entry delete | ✅ (apni branch) | ✅ (sab) |
| Branch create/delete | ❌ | ✅ |
| Staff manage karo | ❌ | ✅ |
| Reports dekho | ❌ | ✅ |
| Bulk delete operations | ❌ | ✅ |

---

## 🔄 Dispatch Status Flow

```
[Dispatch Created]
       │
       ▼
    📤 SENT
       │
       ▼
  🚚 IN_TRANSIT
       │
       ├─────────────→  ⏰ OVERDUE  (agar time pe nahi pahucha)
       │
       ▼
 📬 WAITING_RECEIPT  (pahucha, confirm karna baaki)
       │
       ▼
   ✅ RECEIVED  ← Final success state
       
  Kabhi bhi → ❌ FAILED  (agar koi problem aayi)
  Kabhi bhi → ⏳ PENDING  (hold kar diya)
```

**Status Badge Colors (Web App):**
- 🔵 SENT — Blue
- 🟡 IN_TRANSIT / PENDING — Yellow/Orange  
- 🟠 WAITING_RECEIPT — Orange
- 🟢 RECEIVED — Green
- 🔴 OVERDUE / FAILED — Red

---

## 📧 Email Notifications

Yeh system automatically emails bhejta hai jab:
- ✉️ Nayi dispatch create hoti hai (sender + receiver branch ko)
- 📬 Dispatch status update hoti hai

**Email Service:** Nodemailer (SMTP) ya Resend API — configure karo `.env` mein

---

## 🔒 Security Features

- All passwords **bcrypt hashed** hain (plaintext kabhi store nahi hota)
- All API routes **JWT protected** hain (header mein Bearer token chahiye)
- Role-based middleware — STAFF ADMIN ke APIs access nahi kar sakta
- CORS configured — sirf allowed origins se requests aayengi
- Branch Join Code — random unique key, staff onboarding ke liye secure

---

## 🐛 Known Setup Tips

1. **MongoDB connection fail ho raha hai?**  
   → `MONGODB_URI` check karo, Atlas mein IP whitelist karo (`0.0.0.0/0`)

2. **Staff Web App "Page Not Found" on refresh?**  
   → Yeh HashRouter se fix hai, fresh install mein yeh nahi aata

3. **Emails nahi aa rahe?**  
   → Gmail use kar rahe ho? Gmail App Password chahiye (normal password kaam nahi karega)  
   → Google Account → Security → App Passwords → Generate

4. **Mobile App notification nahi aata?**  
   → Physical device chahiye (emulator par Expo notifications kaam nahi karte)

---

<div align="center">

---

### Built with ❤️ for logistics companies that deserve better software.

**BranchFlow Pro** — *Real-time. Reliable. Ready.*

</div>
