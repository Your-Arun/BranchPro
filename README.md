# BranchFlow Pro (React Native + MERN)

This project is split into:
- `frontend`: React Native (Expo) mobile app
- `backend`: Node.js + Express + MongoDB API
- `adminpanel`: Separate React (Vite) web app for ADMIN operations

## 1) Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend default:
- URL: `http://localhost:5000`
- Health: `GET /api/health`

MongoDB is required at `MONGO_URI`.
Default value in `.env.example` is:
`mongodb://127.0.0.1:27017/branchflow`

If `AUTO_SEED=true`, starter data is inserted automatically when DB is empty.

## 2) Frontend Setup (Mobile App)

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

Set API URL in `frontend/.env`:
`EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:5000/api`

Notes:
- On Android emulator you can also use `http://10.0.2.2:5000/api`.
- On real device, use your machine LAN IP.

## 3) Admin Panel Setup (Web)

```bash
cd adminpanel
cp .env.example .env
npm install
npm run dev
```

Open admin panel URL shown by Vite (usually `http://localhost:5173`).

Default seeded ADMIN login:
- Email: `alex.rivera@branchflow.pro`
- Password: `Admin@123`

## 4) Roles

Only 2 roles are used now:
- `ADMIN`
- `STAFF`

Signup (`/api/auth/signup` or `/api/auth/register`) always creates `STAFF` user.
Only ADMIN can create `ADMIN`/`STAFF` users from admin panel.

## 5) Implemented Screens (Mobile)

- Dashboard
- Incoming Dispatches (search + status filters)
- Create Dispatch
- Dispatch Details (timeline + confirm receive)
- Reports / Analytics
- Users & Settings
- Branches

## 6) API Summary

Public/basic routes:
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/register`
- `GET /api/dashboard`
- `GET /api/dispatches`
- `GET /api/dispatches/:id`
- `POST /api/dispatches`
- `PATCH /api/dispatches/:id/status`
- `GET /api/branches`
- `GET /api/users`
- `GET /api/reports`

Admin-only routes (Bearer token required, ADMIN role):
- `GET /api/admin/branches`
- `POST /api/admin/branches`
- `PUT /api/admin/branches/:id`
- `DELETE /api/admin/branches/:id`
- `GET /api/admin/users`
- `POST /api/admin/users`
