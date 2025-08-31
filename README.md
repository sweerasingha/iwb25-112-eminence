# CivilQuest

A community engagement platform enabling citizens to organize and join events, sponsor events, and earn points for contributions. This contains:

- civilquest_backend – Ballerina HTTP API service (MongoDB, JWT, SMTP, Cloudinary)
- civilquest_dashboard – Next.js dashboard (admin/operator UI)
- civilquest_mobileapp – Expo React Native app (user app)

## At a glance

- Language/runtime: Ballerina 2201.9.2
- Data store: MongoDB (Atlas or self-hosted)
- Mail: SMTP
- Media: Cloudinary (image uploads)
- API base path: /api


## Backend Repository structure

- civilquest_backend/
  - main.bal – boots the server via bootstrap + server modules
  - modules/
    - server – HTTP listener and route wiring
    - auth – login, registration, password reset via OTP
    - user – user/admin/admin-operator profile and role management
    - events – CRUD, approval, completion, province/city rules, image upload
    - participants – apply, participate (geofenced/time-gated), status
    - sponsors – sponsorships (amount or donation), approvals
    - points – points config, transactions, leaderboard, admin adjustments
    - analytics – counts, summaries, top events, health metrics
    - notifications – in-app + email notifications
    - audit – admin actions
    - middleware – JWT validation + RBAC checks
    - token – JWT issue/validate/extract
    - otp – one-time passwords (email delivery)
    - email – SMTP wrapper
    - cloudinary – Cloudinary wrapper
    - database – Mongo client and DB
    - bcrypt – secure salted SHA-256 hashing
    - utils – common helpers (responses, geo, validation)


## Prerequisites

- Ballerina 2201.9.2
- MongoDB connection string (Atlas or local)
- SMTP credentials (e.g., Mailtrap)
- Cloudinary account
- RSA keypair for JWT if using asymmetric validation (keys/private.key, keys/cert.pem)


## Configuration

Backend uses Ballerina configuration via Config.toml (a sample is provided in civilquest_backend/sample.config.toml). Keys and defaults used by modules:

- eminence.civilquest_api.server
  - server_port: number (e.g., 4444)
- eminence.civilquest_api.database
  - mongodb_con_string: string
  - mongodb_database: string
- eminence.civilquest_api.token
  - secret_key: string
  - private_key_path: string (PEM, for RSA)
  - public_key_path: string (PEM, for RSA)
  - issuer: string
  - audience: string
- eminence.civilquest_api.email
  - SMTP_HOST: string
  - SMTP_PORT: number
  - SMTP_USER: string
  - SMTP_PASS: string
  - SMTP_SECURITY: START_TLS_AUTO | START_TLS_NEVER | SSL | START_TLS_ALWAYS
  - FROM_EMAIL: string
- sachisw.cloudinary
  - cloud_name: string
  - api_key: string
  - api_secret: string
  - upload_preset: string (optional)
- ballerina.log
  - level: INFO | DEBUG | ERROR


## Setup and Run (Quick Start)

Follow these steps.

### 1) Backend API (Ballerina)
- Requirements: Ballerina 2201.9.2, MongoDB connection string, SMTP creds, Cloudinary.
- Configure the backend and start the server:

```powershell
# From the repo root
cd civilquest_backend
# Create local config from sample (edit values afterward)
Copy-Item -Path sample.config.toml -Destination Config.toml -Force
# Start the API (listens on http://localhost:4444/api by default)
bal run
```

Notes:
- Config file: `civilquest_backend/Config.toml` (MongoDB, JWT, SMTP, Cloudinary).
- Dev keys exist in `civilquest_backend/keys/`; replace for production.
- On first run, a SUPER_ADMIN is ensured by bootstrap (see logs for details).

## Initial Setup

The application automatically creates a SUPER_ADMIN account on first startup:

- **Email**: `superadmin@civilquest.com`
- **Password**: `SuperAdmin123!`

### 2) Admin Dashboard (Next.js)
- Requirements: Node.js LTS.
- Configure API URL and run dev server:

```powershell
# New terminal, from repo root
cd civilquest_dashboard
# Create .env with the backend URL
Set-Content -Path .env -Value "NEXT_PUBLIC_API_URL=http://localhost:4444/api"
# Install and run
npm install
npm run dev
```

Open the printed URL (usually http://localhost:3000). Ensure the backend is running.

### 3) Mobile App (Expo / React Native)
- Requirements: Node.js LTS, Android Studio emulator or Expo Go on a phone on the same Wi‑Fi.
- Point the app to your machine’s LAN IP and start Expo:

```powershell
# New terminal, from repo root
cd civilquest_mobileapp
# Use your LAN IP so the phone/emulator can reach the backend
# Example: http://192.168.1.100:4444/api (replace with your IP)
$env:EXPO_PUBLIC_API_URL = "http://<YOUR_LAN_IP>:4444/api"
# Install and run
npm install
npm run android   # or: npm run web
```

If using a physical device, install Expo Go and scan the QR from the terminal/web UI. Backend must be reachable from the device (firewall may need to allow port 4444).

---


### server

- Provides the HTTP listener and all /api routes with CORS.
- Wires requests to business modules and guards with middleware.
- Grouped routes (see Endpoints section for the full list):
  - Auth: login, register/init, register/complete, password reset
  - Users/admins: premium request/approval, CRUD for admins and admin_operators, profile
  - Events: create/update/delete, approve/reject, end, list, get
  - Participants: apply, participate, list, per-event lists, user views
  - Sponsors: create, approve/reject, list, user sponsors
  - Points: leaderboard, history, config (get/update), adjustments
  - Analytics: events/users/sponsorships/participation/top-events, system health
  - Notifications: list/mark-read/count
  - Audit: list/count

### auth

- login(caller, req): email + password; returns JWT token.
- initRegisteration(caller, req): checks uniqueness, hashes password, creates USER (verified=false), issues OTP via email.
- completeRegistration(caller, req): verifies OTP, sets verified=true.
- requestPasswordResetOtp(caller, req): issues OTP to existing email.
- resetPassword(caller, req): verifies OTP, hashes and sets new password.
- DTOs are validated with ballerina/constraint (auth_dto.bal).

Notes
- Password hashing uses modules/bcrypt which implements salted multi-iteration SHA-256 (API-compatible naming).
- Tokens issued via token module with role and email embedded.

### middleware

- tokenValidation(caller, req): requires Authorization: Bearer ...; validates JWT.
- assertAnyRole(caller, req, allowedRoles): RBAC gate checking token claims.

### token

- Config: secret_key, private/public key paths, issuer, audience.
- generateToken(username, role) -> string|error
- validateToken(token) -> jwt:Payload|error
- extractRole(token) -> string|error
- extractUserId(token) -> string|error

### database

- Connects to MongoDB using mongodb_con_string and mongodb_database.
- Exposes database:db used throughout other modules to open collections.

### user

- Data types: User (public API shape), internal UserDoc mapping to Mongo.
- Lookup helpers: findUserByEmail, findAnyUserByEmail, findUserByPhoneNumber.
- Mutations: insertUser, updateUserByEmail, deleteUser(+by phone), anyUserWithRole.
- Premium flow: requestPremium (USER -> PREMIUM_PENDING), approvePremium (-> PREMIUM_USER or revert to USER). Emits notifications + audit log.
- Admins (SUPER_ADMIN only): createAdmin, updateAdmin, deleteAdmin, getAllAdmins. Admins must have a province set.
- Admin Operators (ADMIN only): createAdminOperator, updateAdminOperator, deleteAdminOperator, getAllAdminOperators. Admin operator bound to admin’s province and a city.
- Profile: getUserProfile, updateUserProfile.
- Search: searchUsers (filters + pagination), getUsersByRole, getPendingPremiumRequests.

### events

- Event type with geo, schedule, and metadata. Province-city consistency enforced.
- createEvent: multipart/form-data; fields include:
  - image (binary part; optional)
  - eventTitle, eventDescription, eventType, location, city, province, date (YYYY-MM-DD), startTime (HH:MM), endTime? (HH:MM), latitude, longitude, reward (string numeric), etc.
  - Image is uploaded to Cloudinary; secure_url is stored.
  - Creates event with status=PENDING; awards creation points using points config.
- approveEvent/reject: role- and location-aware permissions: SUPER_ADMIN any; ADMIN within province; ADMIN_OPERATOR within city.
- endEvent: closes event; awards completion bonuses to creator and participants.
- getEvents/getEvent: query/pagination/sorting; enriches participantCount, userApplicationStatus, sponsors list.
- updateEvent: creator or privileged roles; disallows edits to APPROVED events; validates time/order and geo values.
- deleteEvent: cascade deletes participants/sponsors; updates relations.
- getProvinceCityMapping(): shared province→cities list used for validation and public endpoint.

### participants

- Records applications and real participation per event/user.
- applyToEvent: method=INTERESTED|WILL_JOIN; only for APPROVED events and before start time; stores an application record and updates relations.
- participateInEvent: requires geofence <= 500m from event coords, only on event day and after start; marks isParticipated=true and awards reward points once.
- updateParticipationStatus: admin operator can toggle isParticipated and award/deduct points accordingly.
- removeParticipation: user can remove own; admin operator can remove any; keeps relations consistent.
- Reporting: getParticipants (filters), getEventParticipants (grouped), getUserParticipations, getUserAppliedEvents, getUserEventParticipation..

### sponsors

- Sponsor type: AMOUNT or DONATION (donationAmount/donation text).
- createSponsor: create sponsorship for event (APPROVED events only).
- approveSponsor/reject: updates sponsor record, adds/removes user from event.sponsor; awards sponsorship bonus on approval; emits audit + notifications.
- createOfficialSponsor: admin operator creates an approved sponsorship directly.
- getSponsors, getSponsor, getUserSponsors: list and detail views.

### points

- PointsConfig single-record store:
  - eventCreationPoints, eventParticipationPoints, eventCompletionBonusPoints, eventApprovalBonusPoints, sponsorshipBonusPoints, allowNegativeBalance, maxDailyPointsPerUser, lastUpdatedBy/timestamps
- awardPoints/deductPoints: writes point_transactions and updates user.points; enforces daily cap.
- Endpoints: get leaderboard (global/city with ranks), get points history for a user, get/update points config (admin), adminAdjustPoints.

### analytics

- EventAnalytics: totals by status, total participants, sponsors, sum of sponsorship amounts.
- UserAnalytics: counts by roles, verified, total points.
- SponsorshipAnalytics: totals by status, total/avg amount.
- ParticipationAnalytics: total, actual, interested, will_join.
- Top events by participation; user activity summary; system health (active events, pending approvals, uptime).

### notifications

- In-app notifications stored in notifications collection; optionally emails via email module.
- Convenience helpers: notifyEventApproval, notifyPremiumApproval, notifySponsorshipApproval, notifyEventReminder, notifyPointsAwarded, notifyEventCompleted.
- Endpoints: list by user, mark single/all read, unread count, cleanup old notifications.

### audit

- AuditLog model and helpers: logAdminAction, logRoleChange, logEventApproval, logSponsorshipApproval, logPremiumApproval, logPointsAdjustment, logUserCreation/Deletion.
- Endpoints for listing and counting with filters.

### otp

- issueOtp(email): 6-digit code valid for 10 minutes; stores in otp collection; emails the code.
- verifyOtp(email, otp): validates presence and expiry.

### email

- SMTP client (configurable security mode); sendEmail(to, subject, body).

### cloudinary

- Thin wrapper around sachisw/cloudinary: uploadImage/deleteImage; credentials via config section.

### bcrypt

- Provides hashPassword(password, cost) and verifyPassword(password, stored).
- Implementation uses salted SHA-256 with many iterations (labelled ssha256) for portability.

### bootstrap

- checkSystemIntegrity(): ensures SUPER_ADMIN exists (default superadmin@civilquest.com / SuperAdmin123!), fixes admin metadata, cleans invalid roles.
- ensureSuperAdminExists(): one-time seed and log warning to change password.

### utils

- JSON response helpers (jsonResponse, sendError, badRequest/unauthorized/forbidden/notFound/serverError).
- Geo helpers: calculateHaversineDistanceMeters (approximation), validation helpers used across modules.
- File helpers for serving uploaded images (if used locally).


## Authentication and roles

- Authorization header with Bearer <JWT> required for most routes.
- Roles: USER, PREMIUM_PENDING, PREMIUM_USER, ADMIN_OPERATOR (city-scoped), ADMIN (province-scoped), SUPER_ADMIN (global).
- Middleware validates token and role membership per endpoint.


## API endpoints (summary)

Base URL: /api

Auth
- POST auth/login
- POST auth/register/init
- POST auth/register/complete
- POST auth/password/reset/request
- POST auth/password/reset/verify

Users and roles
- POST users/premium/apply (USER)
- PUT users/{userId}/premium/approve (ADMIN_OPERATOR|ADMIN)
- PUT users/{userId}/premium/reject (ADMIN_OPERATOR)
- GET users/profile (auth)
- PUT users/profile (auth)
- GET users/role/{role} (SUPER_ADMIN|ADMIN|ADMIN_OPERATOR)
- GET users/search (SUPER_ADMIN|ADMIN|ADMIN_OPERATOR)
- GET users/premium/pending (ADMIN_OPERATOR|ADMIN)

Admins (SUPER_ADMIN)
- POST accounts/admins
- PUT accounts/admins/{adminId}
- DELETE accounts/admins/{adminId}
- GET accounts/admins

Admin operators (ADMIN)
- POST accounts/admin_operators
- PUT accounts/admin_operators/{operatorId}
- DELETE accounts/admin_operators/{operatorId}
- GET accounts/admin_operators

Events
- GET events (public; filters: status, city, eventType, createdBy, pagination/sort)
- GET events/{eventId}
- POST events (ADMIN|ADMIN_OPERATOR|PREMIUM_USER; multipart/form-data)
- PUT events/{eventId}
- PUT events/{eventId}/approve (ADMIN|ADMIN_OPERATOR|SUPER_ADMIN)
- PUT events/{eventId}/reject (ADMIN|ADMIN_OPERATOR|SUPER_ADMIN)
- POST events/{eventId}/end (ADMIN|ADMIN_OPERATOR|PREMIUM_USER)
- DELETE events/{eventId} (ADMIN|ADMIN_OPERATOR|SUPER_ADMIN)
- GET provinces (public) – province→cities mapping

Participants
- POST events/{eventId}/apply (USER|PREMIUM_PENDING|PREMIUM_USER)
- POST events/{eventId}/participate (USER|PREMIUM_USER) – geofenced/time-gated
- GET events/{eventId}/participants (public)
- PUT events/{eventId}/participants/{participantId}/status (ADMIN_OPERATOR)
- DELETE events/{eventId}/participants/{participantId} (ADMIN_OPERATOR|user self)
- GET users/me/participations (auth)
- GET users/me/events/applied (auth)
- GET events/{eventId}/participation/me (auth)

Sponsors
- POST sponsors (USER|PREMIUM_PENDING|PREMIUM_USER|ADMIN_OPERATOR)
- PUT sponsors/{sponsorId}/approve (ADMIN_OPERATOR|PREMIUM_USER)
- PUT sponsors/{sponsorId}/reject (ADMIN_OPERATOR|PREMIUM_USER)
- POST sponsors/official (ADMIN_OPERATOR)
- GET sponsors (auth)
- GET sponsors/{sponsorId} (auth)
- GET users/me/sponsors (auth)

Points
- GET points/leaderboard (public; optional city/limit/skip)
- GET users/{userEmail}/points/history (auth; admins can view any, users only own)
- GET admin/points/config (ADMIN|ADMIN_OPERATOR)
- PUT admin/points/config (ADMIN)
- POST admin/points/adjust (ADMIN|ADMIN_OPERATOR)

Notifications (auth)
- GET users/{userId}/notifications
- PUT notifications/{notificationId}/read
- PUT users/{userId}/notifications/read (mark all)
- GET users/{userId}/notifications/count/unread

Audit (ADMIN|SUPER_ADMIN)
- GET admin/audit/logs
- GET admin/audit/logs/count


## Data model (collections overview)

- users – accounts, roles, points, relations (eventId, organizeEventId), province/city
- events – event metadata, geo, times, status, relations (participant[], sponsor[]), applications[]
- participants – normalized applications/participations with flags
- sponsors – sponsorships per event
- points_config – singleton config values
- point_transactions – per-user transactions (award/deduct)
- notifications – per-user in-app notifications
- otp – email/otp/expiresAt
- audit_logs – admin actions


## Development and testing

- Unit tests live under modules/**/tests
- Run tests from civilquest_backend:

```powershell
cd civilquest_backend
bal test
```


## Troubleshooting

- Mongo connection: ensure IP allowlist and correct mongodb_con_string.
- JWT keys: path in Config.toml must point to readable PEM files; restart after changes.
- Timezones: participation uses day-of-event logic; inputs are treated as UTC strings (YYYY-MM-DD, HH:MM).


## Dashboard and mobile apps

- civilquest_dashboard: Next.js 14+; UI for admins/operators. Configure API base URL in its config.
- civilquest_mobileapp: Expo app for users; configure API base URL and tokens in services.
