# BIT Sathy Smart Classroom Booking and Utilization Management System

This repository hosts the **Smart Classroom Booking and Utilization Management System** built specifically for the **Bannari Amman Institute of Technology (BIT Sathy)**.

## Project Structure
```plaintext
bitsathy-smart-classroom/
├── client/                   # FRONTEND (React + Vite + Tailwind CSS)
└── server/                   # BACKEND (Node.js + Express.js + Mongoose)
```

---

## Getting Started

### 1. Backend Setup (`server/`)
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Create your `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup (`client/`)
1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend client:
   ```bash
   npm run dev
   ```

---

## API Reference (Server)

### 1. Authentication
* `POST /api/auth/dev-login` - Developer/local testing login. Requires `{ email: "user@bitsathy.ac.in" }`.
* `GET /api/auth/google` - Trigger Google OAuth 2.0.
* `GET /api/auth/google/callback` - OAuth success callback (redirects to client with JWT).

### 2. Users & Governance
* `GET /api/users` - Fetch user tree nested by department (Admin/Staff only, supports regex `search` query).
* `POST /api/users` - Create user metadata (Admin only).

### 3. Rooms Inventory & Schedules
* `GET /api/rooms` - Query physical classroom/lab specs.
* `POST /api/rooms` - Register new physical rooms (Admin only).
* `GET /api/rooms/timeline` - Retrieve continuous Gantt timeline bookings of rooms for a specific date.

### 4. Booking Initiatives & Approvals
* `POST /api/bookings` - Request booking slot (Faculty/Staff/Admin). Direct approved allocation for Staff/Admin.
* `GET /api/bookings` - Retrieve system bookings.
* `PATCH /api/bookings/:id/status` - Approve or reject booking initiative requests (Staff/Admin).

### 5. Attendance & Join Queues
* `POST /api/attendance/otp/generate` - Generate active 6-digit OTP Broadcaster code (Faculty/Staff).
* `POST /api/attendance/otp/verify` - Check-in student attendance using OTP code + Survey answers (Student).
* `POST /api/attendance/override` - Manual override student attendance status (Staff/Admin).
* `GET /api/attendance/session/:bookingId` - Fetch real-time check-in counts and roster logs.
* `POST /api/bookings/:bookingId/requests` - Join requests submission (Student).
* `GET /api/bookings/:bookingId/requests` - Pending Join requests roster (Faculty/Staff).
* `PATCH /api/bookings/requests/:id` - Approve or reject Join requests (Faculty/Staff).

### 6. Notifications & Broadcasts
* `GET /api/notifications` - Retrieve alerts/announcements.
* `POST /api/notifications` - Broadcast announcements to targets (Faculty/Staff/Admin).
