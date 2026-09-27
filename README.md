# GDC Ganderbal CampusFix

A simple campus issue-reporting app built with React, React Router, and an Express/MongoDB backend.

## Setup

```bash
npm install
npm run dev
```

Then open the local URL that Vite prints (usually http://localhost:5173).

## Backend setup

The API lives in `backend/` and uses the native MongoDB Node.js driver.

1. Start MongoDB locally, or create a MongoDB Atlas database.
2. Set `DATABASE_URL` and a long `JWT_SECRET` in `backend/.env`.
3. Install dependencies and start the API:

```bash
cd backend
npm install
npm run dev
```

The API runs at `http://localhost:4000`. It accepts a bearer token from `POST /api/auth/login` and enables the frontend origin at `http://localhost:5173` by default.

## Test on another phone

For testing with another device on the same Wi-Fi network, start both servers on the host computer:

```powershell
npm run dev
cd backend
node src/server.js
```

Find the host computer's Wi-Fi IPv4 address with `ipconfig`, then share this URL with the other device:

```text
http://YOUR-COMPUTER-IP:5173
```

Both devices must be on the same Wi-Fi network. Allow Node.js through Windows Firewall if the phone cannot connect. The frontend automatically uses the same computer IP for the API on port `4000`, so no phone-side configuration is needed.

Background administrator notifications use Web Push. They require HTTPS in production (localhost is the only browser exception), administrator notification permission, and the VAPID keys in `backend/.env`. A background push can show a system notification and vibration, but browsers do not allow a custom 10-second audio siren after a page is closed.

## API endpoints

- `POST /api/auth/signup` and `POST /api/auth/login`
- `GET /api/issues?filter=All|Open|High|Reported|Assigned|Resolved`
- `POST /api/issues` (authenticated)
- `PATCH /api/issues/:id/status` (admin only)
- `POST /api/issues/:id/photo` (authenticated, optional, image up to 5 MB)
- `GET /api/settings/helpline` and `PUT /api/settings/helpline` (admin for PUT)
- `GET /api/donations/total` and `POST /api/donations`

Resolved issues older than seven days are excluded from issue queries and removed by an hourly cleanup job. All request bodies are validated with Zod.

## Frontend data storage

The frontend uses the API for all application data. Users, issues, helpline settings, donations, and uploaded photos are stored by the MongoDB backend. The browser stores only the current login response so it can send the JWT with authenticated requests.

The response issue shape keeps the existing fields (`title`, `category`, `location`, `priority`, `description`, `status`, `createdAt`, `resolvedAt`) and adds `id`, `reportedById`, and optional `photoUrl`.

## Project structure

```
src/
  components/   Header, EmergencyBar, IssueCard, StatCard, AdminIssueRow, Modal, Toast
  pages/        Welcome, Login, Home, Report, Donate, AdminDashboard
  data/         seedIssues.js (default example reports)
  App.jsx       Routes and shared state (current user, toast)
  index.css     All app styling
```

## How the frontend currently works

- Reports, users, settings, and donations are loaded and saved through the API.
- Resolved reports older than seven days are removed by the backend cleanup job.
- Each student and faculty member can create an individual Student or Administrator account with a unique email address. Administrator accounts require the shared `ADMIN_ACCESS_CODE` from `backend/.env`. Only Administrators can open the Admin Dashboard or change the emergency helpline number.
- The "View report" button in the Admin Dashboard opens a modal to view full details and update a report's status.

## Notes

- Photos are uploaded to the backend `uploads/` directory and their URLs are stored in MongoDB.
