<div align="center">
  <img src="./frontend/assets/icon.png" width="128" height="128" alt="BranchFlow Pro Logo" />
  <h1>🚀 BranchFlow Pro</h1>
  <p><strong>A Complete Logistics & Shipment Tracking System</strong></p>
</div>

---

## 🤔 What is BranchFlow Pro?

BranchFlow Pro is a complete software system for a courier or logistics company. It helps the company track incoming and outgoing shipments between different branches easily. 

Everything happens in real-time, so if a shipment is marked "Received" at one branch, the Admin instantly sees it on their screen!

<br>

<div align="center">
  <h3>📊 Quick Presentation Slide (Elevator Pitch)</h3>
  <table>
    <tr>
      <td width="33%"><strong>🛑 The Problem</strong><br>Logistics companies struggle to sync branch deliveries and dispatch data in real-time. Staff make errors when receiving packets.</td>
      <td width="33%"><strong>💡 Our Solution</strong><br>A unified system (Admin Web + Admin App + Staff App) handling full branch ops. Simple login with "Branch Codes".</td>
      <td width="33%"><strong>🎯 Key Benefits</strong><br>✔️ Real-time dashboards<br>✔️ Offline-caching capability<br>✔️ Error-free branch joining<br>✔️ Secure "One-Tap" logic</td>
    </tr>
  </table>
  <p><em>(Perfect for a quick 30-second summary or meeting presentation!)</em></p>
</div>

---

## 🏗️ The 4 Main Parts of the Project

This project is divided into four easy-to-understand parts:

### 1. 📦 Staff App (For Branch Workers)
- **Who uses it:** The staff working at a specific branch.
- **What it does:** They use this mobile app to create new shipments (dispatches), track where shipments are, and scan/receive them when they arrive.

### 2. 👑 Admin App (For the Boss/Manager)
- **Who uses it:** The company owners or top-level managers.
- **What it does:** A mobile app to oversee all branches, view live data, check total deliveries, and manage the whole network on the go.

### 3. 💻 Web Admin Panel (For Office Management)
- **Who uses it:** Office managers working on a computer.
- **What it does:** A website used to add new branches, create new staff accounts, manage settings, and see detailed reports.

### 4. ⚙️ The Backend (The Brain)
- **What it does:** It connects the Staff app, Admin app, and the Website together so they all share the same live data using a database (MongoDB).

---

## ✨ Cool Things It Can Do

- **Easy Login:** Staff only need a "Branch Join Code" to log in. No complicated setups!
- **Works Without Internet (Briefly):** If the internet drops, the app still shows your cached data instantly.
- **Live Notifications:** You get clean, pop-up notifications (toasts) when things happen, without annoying system alerts.
- **No Network Bugs:** If the database disconnects, the app handles it smoothly without crashing.
- **Perfect Fit for Any Phone:** The design automatically adjusts so it never hides behind your phone's navigation bar.

---

## 🖥️ How To Run It (Step-by-Step)

Want to run this on your own computer? Follow these easy steps:

### Step 1: Start the Backend (The Brain)
Open your terminal and type:
```bash
cd backend
npm install
npm start
```
*(Leave this terminal running!)*

### Step 2: Start the Web Dashboard
Open a **new** terminal window and type:
```bash
cd adminpanel
npm install
npm run dev
```
*(This will give you a link to open the website in your browser!)*

### Step 3: Start the Mobile Apps
Open another **new** terminal window. 

**To run the Staff App:**
```bash
cd frontend
npm install
npx expo start
```

**To run the Admin Mobile App:**
```bash
cd admin-app
npm install
npx expo start
```
*(Scan the QR code with the Expo Go app on your phone to see the magic!)*

---

<div align="center">
  <p>Built with ❤️ by the BranchFlow team.</p>
</div>
