# Changelog & Milestone Execution History

All notable changes and milestones completed in this project are tracked here.

---

## [1.0.0] - 2026-08-01

### Added
- **Monorepo Directory Restructuring**: Restructured code base into `/client` (frontend) and `/server` (backend) directories to support full-stack deployment.
- **Express Backend Server (`server/`)**: Initialized Express server with dotenv configurations, CORS, Mongoose ODM, and passport.js.
- **Mongoose Database Schemas**:
  - `User.js` supporting rollNumber, facultyId, staffId, and designation details.
  - `Room.js` featuring specifications like blocks, capacity, and capabilities.
  - `BookingInitiative.js` utilizing continuous start/end ISO timestamps.
  - `AttendanceLog.js` employing standard states (`PRESENT`, `ABSENT`, `PENDING`).
  - `JoinRequest.js` and `CustomGroup.js` for faculty custom audience controls.
  - `Notification.js` for targeting broadcasts.
- **Domain-Locked Google OAuth & Dev Login**:
  - Wired Passport.js strategy to enforce `@bitsathy.ac.in` domain constraints.
  - Implemented `/api/auth/dev-login` endpoint for developer manual check-in testing.
- **Dynamic 24-Hour Timeline Queries**:
  - Added continuous start/end timestamp validations and overlap conflict detection.
- **Nested User Accordion Search API**:
  - Built department-grouped response structures mapping users to nested lists by roles.
- **Direct Staff Allocation & OTP Generation API**:
  - Added staff direct allocation bypass logic (instantly setting booking to `APPROVED`).
  - Added time-bound OTP generator code broadcasters for staff-initiated sessions.
- **Join Queue approvals**:
  - Created Join Requests API and mapped automatic student roster inserts upon approvals.
