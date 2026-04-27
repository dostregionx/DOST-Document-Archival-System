# DOST Document Archival System — Technical Documentation

**Organization:** Department of Science and Technology  
**Office:** Provincial Science and Technology Office in Misamis Oriental  
**Version:** 0.1.0  
**Framework:** Next.js 16.1.6 (App Router, Turbopack)  
**Last Updated:** April 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Installation & Setup](#3-installation--setup)
4. [Project Structure](#4-project-structure)
5. [Features](#5-features)
6. [Page Routes](#6-page-routes)
7. [API Reference](#7-api-reference)
8. [Database Schema](#8-database-schema)
9. [Components Reference](#9-components-reference)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Notification System](#11-notification-system)
12. [Database Configuration](#12-database-configuration)
13. [File & Document Management](#13-file--document-management)
14. [Maps & Geolocation](#14-maps--geolocation)
15. [Messaging System](#15-messaging-system)
16. [Configuration Files](#16-configuration-files)
17. [Environment Variables](#17-environment-variables)
18. [Development Guide](#18-development-guide)
19. [Deployment](#19-deployment)
20. [Troubleshooting](#20-troubleshooting)

---

## 1. Project Overview

The **DOST Document Archival System** is a full-stack web application built for the Department of Science and Technology – Misamis Oriental Provincial Office. It centralizes project management, document archiving, user administration, and geographic visualization for two primary DOST programs:

- **SETUP** (Small Enterprise Technology Upgrading Program) — Tracks firm-level technology assistance projects from proposal through graduation.
- **CEST** (Community Empowerment through Science and Technology) — Manages community-level projects with multi-phase document workflows.

### Core Capabilities

| Capability | Description |
|---|---|
| Project Management | Full lifecycle tracking for SETUP and CEST projects |
| Document Archival | Phase-based document upload, download, and QR tracking |
| User Administration | Role-based access, approval workflows, permission control |
| Calendar & Events | Event scheduling with personnel assignment |
| Geographic Mapping | Leaflet-based interactive map of all project locations |
| Messaging | Internal real-time chat between staff |
| Notifications | Deadline alerts, approval alerts, birthday reminders |
| Audit Logging | Complete activity trail for all user actions |
| Multi-Database | Seamless switching between cloud (CockroachDB) and local (PostgreSQL) |

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
│   React 19 + Next.js App Router + Tailwind CSS v4               │
│   Leaflet Maps │ Iconify Icons │ lucide-react                    │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP / fetch
┌────────────────────────────▼─────────────────────────────────────┐
│                    Next.js Server (Node.js)                       │
│   App Router API Routes  │  proxy.ts (auth middleware)           │
│   lib/prisma.ts (dynamic DB proxy)                               │
└──────────────┬───────────────────────────┬───────────────────────┘
               │                           │
┌──────────────▼───────┐     ┌─────────────▼────────────────┐
│  CockroachDB (Cloud) │     │  PostgreSQL (Local)           │
│  agile-vulture-24840 │     │  localhost:5432 / dost_db     │
│  aws-us-east-1       │     │  Development / Offline use    │
└──────────────────────┘     └──────────────────────────────┘
```

### Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 16.1.6 (App Router) |
| UI Library | React 19.2.4 |
| Styling | Tailwind CSS 4.1.18 + LightningCSS |
| Database ORM | Prisma 7.4.0 |
| Cloud Database | CockroachDB (PostgreSQL-compatible) |
| Local Database | PostgreSQL 14+ |
| Authentication | JWT cookies (bcryptjs) |
| File Handling | jspdf, xlsx, docx, html2canvas |
| Maps | Leaflet 1.9.4 + react-leaflet 5.0.0 |
| Icons | @iconify/react + lucide-react |
| Email | Nodemailer (Gmail SMTP) |
| QR Codes | qrcode.react |
| Language | TypeScript 5 |

---

## 3. Installation & Setup

### Prerequisites

- Node.js 20+ (Windows native, NOT WSL Node for dev server)
- PostgreSQL 14+ (for local database)
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DOST-Document-Archival-System
```

### 2. Install Dependencies

```bash
npm install
```

> **WSL2 Note:** The post-install script (`scripts/fix-wsl-binaries.cjs`) automatically downloads the Windows-native LightningCSS binary. This is required because WSL2 npm installs Linux binaries, but the dev server runs under Windows Node.js.

### 3. Configure Environment Variables

Create a `.env` file at the project root:

```env
# Cloud database (CockroachDB)
DATABASE_URL="postgresql://user:password@host:26257/defaultdb?sslmode=verify-full"

# Local database (PostgreSQL)
LOCAL_DATABASE_URL="postgresql://postgres:password@localhost:5432/dost_db"

# JWT secret
JWT_SECRET="your-secret-key"

# Email (Gmail SMTP for OTP)
EMAIL_USER="dostxmisamisoriental@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

### 4. Initialize the Database

**Cloud (CockroachDB):**
```bash
npx prisma migrate deploy
```

**Local (PostgreSQL) — first-time setup:**
```bash
npx prisma db push --config prisma.local.config.ts
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000` and on the local network at `http://<LAN-IP>:3000`.

### 7. Seed Initial Data (Optional)

```bash
npx tsx prisma/seed.ts
```

---

## 4. Project Structure

```
DOST-Document-Archival-System/
├── app/
│   ├── api/                    # API route handlers
│   │   ├── address/            # Philippine geographic hierarchy
│   │   ├── archival/           # Archival records CRUD
│   │   ├── auth/               # Authentication endpoints
│   │   ├── calendar-events/    # Calendar CRUD
│   │   ├── cest-dropdown-options/  # CEST dropdown data
│   │   ├── cest-projects/      # CEST project CRUD + documents
│   │   ├── conversations/      # Messaging system
│   │   ├── db-config/          # Database switching
│   │   ├── db-sync/            # Cloud ↔ Local sync
│   │   ├── local-ip/           # LAN IP for QR codes
│   │   ├── map-pins/           # Map pin CRUD
│   │   ├── notifications/      # Notification system
│   │   ├── setup-projects/     # SETUP project CRUD + documents
│   │   ├── time-records/       # Attendance records
│   │   ├── user-logs/          # Activity logs
│   │   ├── user-permissions/   # Permission management
│   │   ├── users/              # User CRUD
│   │   └── view-doc/           # Public document viewer
│   ├── components/             # Shared React components
│   ├── cest/                   # CEST pages
│   ├── dashboard/              # Dashboard page
│   ├── forgot-password/        # Password reset page
│   ├── maps/                   # Map page
│   ├── profile/                # Profile & admin page
│   ├── recent-activity/        # Activity log page
│   ├── settings/               # Settings page
│   ├── setup/                  # SETUP pages
│   ├── signup/                 # Registration page
│   ├── view-doc/               # Public viewer page
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Login page (/)
├── lib/
│   ├── prisma.ts               # Dual-DB Prisma client
│   ├── activity-log.ts         # Activity logging utilities
│   ├── api-client.ts           # Frontend API wrapper
│   └── email.ts                # Email service
├── prisma/
│   ├── schema.prisma           # Cloud DB schema
│   ├── schema.local.prisma     # Local DB schema
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Seed script
├── public/                     # Static assets
├── scripts/                    # Build & utility scripts
│   ├── fix-wsl-binaries.cjs    # WSL binary fix
│   ├── push-to-cockroach.cjs   # DB migration script
│   ├── seed-users-cockroach.cjs # User seeding
│   └── export-local-db.cjs     # DB export to JSON
├── db-config.json              # Runtime DB selection
├── proxy.ts                    # Auth middleware
├── next.config.mjs             # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
└── package.json
```

---

## 5. Features

### 5.1 SETUP Project Management

SETUP (Small Enterprise Technology Upgrading Program) projects follow a defined lifecycle:

```
PROPOSAL → APPROVED → ONGOING → EVALUATED → GRADUATED
                              ↘ WITHDRAWN / TERMINATED
```

**Features:**
- Create and manage SETUP project records with full firm details
- Track status transitions with timestamped history
- Upload and organize documents by phase (Initiation, Implementation, Monitoring)
- Assign projects to staff members
- QR code generation per document for mobile access
- Bulk import via Excel/CSV
- Geocoding of project locations (batch and individual)

### 5.2 CEST Project Management

CEST (Community Empowerment through Science and Technology) tracks community-level interventions.

**Features:**
- Multi-stakeholder project records (partner LGUs, beneficiaries, categories)
- Fund tracking (approved amount, released amount, counterpart amount)
- Phase-based document management
- Program funding classification
- Beneficiary type categorization
- Dynamic dropdown options management

### 5.3 Document Archival

Each project (SETUP and CEST) has associated documents organized into phases:

| Phase | Description |
|---|---|
| INITIATION | Project startup documents |
| IMPLEMENTATION | Ongoing project documents |
| MONITORING | Evaluation and monitoring reports |

Documents are stored as binary data (Base64) in the database and can be:
- Downloaded by authorized users
- Assigned a QR pin for physical-to-digital linking
- Viewed publicly via shareable `/view-doc/[docId]` URL

### 5.4 User Management

Admins can manage all system users from the Profile page:

- **Approve** new user registrations
- **Block/Unblock** user accounts
- **Set permissions** per module (Setup, CEST, Maps, Calendar, Archival, User Management)
- **View user logs** (login/logout history)
- **Transfer ownership** of projects when removing a user

### 5.5 Calendar & Events

- Create, edit, and delete calendar events
- Assign booked personnel and staff involved
- Priority levels (Normal, High, etc.)
- Event visualization

### 5.6 Geographic Maps

- Interactive Leaflet map
- Project pins color-coded by program (SETUP, CEST, SSCP, LGIA)
- District-based filtering
- Coordinate management for each project

### 5.7 Messaging

- Internal user-to-user conversations
- Group conversations
- Read receipts
- User mention input with `@` syntax

### 5.8 Notifications

- **Deadline Alerts:** Auto-generated when project deadlines are within 365 days
- **Pending Approvals:** Admin-only alert for users awaiting account approval
- **Birthday Reminders:** Popup notification for users with birthdays today
- **Login Toast Burst:** Staggered deadline/approval toasts shown once per session on login

### 5.9 Audit Logging

All user actions are recorded with:
- User ID and name
- Action type (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, DOWNLOAD, etc.)
- Resource type and ID
- Timestamp

Admins can view logs for all users; staff can view their own logs.

---

## 6. Page Routes

| Route | Page | Access | Description |
|---|---|---|---|
| `/` | Login | Public | Email/password login |
| `/signup` | Register | Public | New user registration |
| `/forgot-password` | Forgot Password | Public | OTP-based password reset |
| `/dashboard` | Dashboard | Auth | Project overview and stats |
| `/setup` | SETUP Projects | Auth + Permission | List and manage SETUP projects |
| `/setup/[id]` | SETUP Detail | Auth + Permission | Full project detail, documents |
| `/cest` | CEST Projects | Auth + Permission | List and manage CEST projects |
| `/cest/[id]` | CEST Detail | Auth + Permission | Full project detail, documents |
| `/maps` | Maps | Auth + Permission | Interactive project map |
| `/recent-activity` | Activity Log | Auth | User login/logout history |
| `/profile` | Profile | Auth | Account settings, admin tools |
| `/settings` | Settings | Admin only | Database configuration |
| `/view-doc/[docId]` | Document Viewer | Public | Publicly shareable document view |

---

## 7. API Reference

All authenticated endpoints require the `x-user-id` header (auto-injected by `lib/api-client.ts`).

---

### 7.1 Authentication

#### `POST /api/auth/login`
Authenticate a user and set the `auth-token` cookie.

**Request body:**
```json
{ "email": "string", "password": "string" }
```
**Response:** `{ id, email, fullName, role, profileImageUrl, isApproved, isBlocked }`

---

#### `POST /api/auth/signup`
Register a new user account (requires admin approval).

**Request body:**
```json
{ "email": "string", "password": "string", "fullName": "string", "contactNo": "string", "birthday": "string" }
```

---

#### `POST /api/auth/logout`
Clear the `auth-token` cookie.

---

#### `GET /api/auth/check-email?email=<email>`
Returns `{ exists: boolean }`.

---

#### `POST /api/auth/forgot-password`
Send OTP to the provided email address.

**Request body:** `{ "email": "string" }`

---

#### `POST /api/auth/verify-otp`
Verify the OTP code.

**Request body:** `{ "email": "string", "otp": "string" }`

---

#### `POST /api/auth/reset-password`
Reset password after OTP verification.

**Request body:** `{ "email": "string", "otp": "string", "newPassword": "string" }`

---

### 7.2 Users

#### `GET /api/users`
Returns list of all users (admin only).

#### `GET /api/users/[id]`
Returns a single user by ID.

#### `PATCH /api/users/[id]`
Update user fields. Accepts: `fullName`, `email`, `password`, `contactNo`, `birthday`, `profileImageUrl`, `isApproved`, `isBlocked`.

#### `DELETE /api/users/[id]`
Delete a user account.

#### `GET /api/users/birthdays`
Returns users with a birthday today (for birthday popup).

---

### 7.3 User Permissions

#### `GET /api/user-permissions/[id]`
Returns the permission object for a user.

**Response:**
```json
{
  "canAccessSetup": true,
  "canAccessCest": true,
  "canAccessMaps": true,
  "canAccessCalendar": true,
  "canAccessArchival": true,
  "canManageUsers": false
}
```

#### `PUT /api/user-permissions/[id]`
Update permissions. Accepts same fields as above.

---

### 7.4 SETUP Projects

#### `GET /api/setup-projects`
Returns projects. Query params: `status`, `search`, `assignee`.

#### `POST /api/setup-projects`
Create a new SETUP project.

#### `GET /api/setup-projects/[id]`
Returns full project details including `dropdownData`.

#### `PATCH /api/setup-projects/[id]`
Update project fields.

#### `DELETE /api/setup-projects/[id]`
Delete project and all associated documents.

#### `GET /api/setup-projects/[id]/documents`
Returns all documents for a project.

#### `POST /api/setup-projects/[id]/documents`
Upload a document. Body: `{ phase, templateItemId, fileName, fileData, mimeType }`.

#### `PATCH /api/setup-projects/[id]/documents/[docId]`
Update document metadata (e.g., `qrPin`).

#### `DELETE /api/setup-projects/[id]/documents/[docId]`
Delete a document.

#### `GET /api/setup-projects/[id]/documents/[docId]/download`
Download document binary data.

#### `POST /api/setup-projects/import`
Bulk import projects from a JSON array.

#### `POST /api/setup-projects/geocode-batch`
Geocode addresses for a batch of projects.

---

### 7.5 CEST Projects

Same CRUD structure as SETUP projects. Endpoint base: `/api/cest-projects`.

Additional:
- `GET /api/cest-dropdown-options?type=<type>` — Get dropdown values
- `POST /api/cest-dropdown-options` — Add dropdown value
- `DELETE /api/cest-dropdown-options` — Remove dropdown value

---

### 7.6 Notifications

#### `GET /api/notifications`
Returns all notifications for the authenticated user. Requires `x-user-id` header.

#### `PATCH /api/notifications/[id]`
Mark notification as read. Body: `{ "read": true }`.

#### `DELETE /api/notifications/[id]`
Delete a notification.

#### `GET /api/notifications/deadline-check`
Generates deadline notifications for projects within 365 days of deadline. Returns notification array with `daysRemaining`, `status`, `isUrgent`.

**Deadline formula:**
```
deadline = fundReleaseDate + 12 months + sum(PDE extension months)
```

**Urgency levels:**
| Days Remaining | Status |
|---|---|
| ≤ 0 | DEADLINE REACHED |
| 1 – 30 | URGENT |
| 31 – 90 | Due Soon |
| 91 – 180 | Approaching |
| > 180 | On Track (not shown) |

#### `GET /api/notifications/pending-approvals`
Admin only. Returns count and list of users with `isApproved: false` and `isBlocked: false`.

---

### 7.7 Calendar Events

#### `GET /api/calendar-events`
Returns all events.

#### `POST /api/calendar-events`
Create event. Body: `{ title, date, location, bookedBy, bookedService, bookedPersonnel, priority, staffInvolved, staffInvolvedIds }`.

#### `PATCH /api/calendar-events/[id]`
Update event fields.

#### `DELETE /api/calendar-events/[id]`
Delete event.

---

### 7.8 Map Pins

#### `GET /api/map-pins`
Returns all pins. Query params: `program`, `district`.

#### `POST /api/map-pins`
Create pin. Body: `{ lat, lng, label, district, program }`.

#### `PATCH /api/map-pins/[id]`
Update pin position or label.

#### `DELETE /api/map-pins/[id]`
Delete pin.

---

### 7.9 Archival Records

#### `GET /api/archival`
Returns records. Query param: `search`.

#### `POST /api/archival`
Create record. Body: `{ userName, title, company, contact, year }`.

#### `GET /api/archival/[id]`
Get single record.

#### `PATCH /api/archival/[id]`
Update record.

#### `DELETE /api/archival/[id]`
Delete record.

---

### 7.10 Conversations & Messaging

#### `GET /api/conversations`
Returns conversations the current user participates in.

#### `POST /api/conversations`
Create a conversation. Body: `{ participantIds: string[], name?: string, isGroup?: boolean }`.

#### `GET /api/conversations/[id]/messages`
Returns all messages in a conversation.

#### `POST /api/conversations/[id]/messages`
Send a message. Body: `{ content: string }`.

#### `PATCH /api/conversations/[id]/read`
Mark all messages in a conversation as read.

---

### 7.11 Database Configuration

#### `GET /api/db-config`
Returns: `{ activeDb: "cloud" | "local", lastSync: string | null, lastSyncDirection: string | null }`.

#### `POST /api/db-config`
Switch active database. Body: `{ activeDb: "cloud" | "local" }`. Takes effect immediately (no restart required).

#### `POST /api/db-sync`
Sync data between databases. Body: `{ from: "cloud" | "local", to: "cloud" | "local" }`.

---

### 7.12 Other Endpoints

#### `GET /api/local-ip`
Returns the Windows LAN IP address (WSL2-aware). Used for QR code generation.

#### `GET /api/view-doc/[docId]`
Public endpoint. Returns document metadata and binary data for public viewing.

#### `GET /api/time-records`
Returns time records. Query params: `userId`, `date`, `month`, `year`.

#### `POST /api/time-records`
Create or update a time record. Body: `{ userId, date, amTimeIn?, amTimeOut?, pmTimeIn?, pmTimeOut? }`.

#### `GET /api/address/provinces`
Returns all Philippine provinces.

#### `GET /api/address/municipalities?provinceId=<id>`
Returns municipalities for a province.

#### `GET /api/address/barangays?municipalityId=<id>`
Returns barangays for a municipality.

---

## 8. Database Schema

### 8.1 Prisma Configuration

- **Cloud schema:** `prisma/schema.prisma` → CockroachDB
- **Local schema:** `prisma/schema.local.prisma` → PostgreSQL
- **Generated client:** `app/generated/prisma`
- **Runtime DB switching:** `db-config.json` + `lib/prisma.ts` Proxy

---

### 8.2 Models

#### User
```prisma
model User {
  id                  String    @id @default(uuid())
  email               String    @unique
  passwordHash        String
  fullName            String
  role                Role      @default(STAFF)
  birthday            DateTime?
  contactNo           String?
  resetOtp            String?
  resetOtpExpiresAt   DateTime?
  profileImageUrl     String?
  isApproved          Boolean   @default(false)
  isBlocked           Boolean   @default(false)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

#### SetupProject
```prisma
model SetupProject {
  id                  String         @id @default(uuid())
  code                String         @unique
  title               String
  firm                String
  typeOfFirm          String
  address             String
  coordinates         String?
  corporatorName      String
  contactNumbers      String[]
  emails              String[]
  status              SetupStatus    @default(PROPOSAL)
  prioritySector      String
  firmSize            String
  fund                String
  typeOfFund          String
  assignee            String
  assigneeProfileUrl  String?
  companyLogoUrl      String?
  year                Int
  dropdownData        Json?
  documents           ProjectDocument[]
}
```

#### ProjectDocument
```prisma
model ProjectDocument {
  id              String         @id @default(uuid())
  projectId       String
  phase           DocumentPhase
  templateItemId  String
  fileName        String
  fileUrl         String?
  fileData        Bytes?
  mimeType        String         @default("application/octet-stream")
  qrPin           String?
  project         SetupProject   @relation(...)
}
```

#### CestProject
```prisma
model CestProject {
  id                      String   @id @default(uuid())
  code                    String?  @unique
  projectTitle            String
  location                String
  coordinates             String?
  beneficiaries           String
  typeOfBeneficiary       String
  programFunding          String
  status                  String
  approvedAmount          Float?
  releasedAmount          Float?
  counterpartAmount       Float?
  projectDuration         String
  staffAssigned           String
  assigneeProfileUrl      String?
  year                    Int
  dateOfApproval          String?
  companyLogoUrl          String?
  partnerLGUs             Json?
  categories              Json?
  emails                  Json?
  contactNumbers          Json?
  stakeholderCounterparts Json?
  dropdownData            Json?
  documents               CestProjectDocument[]
}
```

#### Notification
```prisma
model Notification {
  id                  String   @id @default(uuid())
  userId              String
  type                String   // 'deadline' | 'pending_approval' | others
  title               String
  message             String
  eventId             String?
  read                Boolean  @default(false)
  bookedByUserId      String?
  bookedByName        String?
  bookedByProfileUrl  String?
  createdAt           DateTime @default(now())
}
```

#### Conversation & Message
```prisma
model Conversation {
  id           String   @id @default(uuid())
  name         String?
  isGroup      Boolean  @default(false)
  createdAt    DateTime @default(now())
  participants ConversationParticipant[]
  messages     Message[]
}

model Message {
  id             String   @id @default(uuid())
  conversationId String
  senderId       String
  content        String
  createdAt      DateTime @default(now())
}
```

#### Enums
```prisma
enum Role           { ADMIN STAFF }
enum SetupStatus    { PROPOSAL APPROVED ONGOING WITHDRAWN TERMINATED EVALUATED GRADUATED }
enum DocumentPhase  { INITIATION IMPLEMENTATION MONITORING }
enum MapProgram     { SETUP CEST SSCP LGIA }
```

---

## 9. Components Reference

### 9.1 Layout Components

#### `DashboardLayout`
Wraps all authenticated pages. Renders `Sidebar` + `Header` + main content area.

Props: `{ activePath: string, children: ReactNode }`

#### `Sidebar`
Left navigation bar. Permission-aware — hides nav items the current user does not have access to.

Menu items: Dashboard, SETUP Projects, CEST Projects, Maps, Calendar, Archival Records, Recent Activity.

#### `Header`
Top bar with DOST logo, Maps shortcut, MessengerDropdown, NotificationDropdown, and user profile dropdown.

Polls `/api/users/[id]` and `/api/user-permissions/[id]` every 3 seconds to reflect live permission changes.

#### `AuthLayout`
Wrapper for public pages (login, signup, forgot-password). Renders the DOST background and centered card layout.

---

### 9.2 Notification Components

#### `NotificationDropdown` (`app/components/notification.tsx`)
Bell icon dropdown in the header. Features:
- Fetches `/api/notifications` every 5 seconds
- Fetches `/api/notifications/deadline-check` every 5 minutes
- Fetches `/api/notifications/pending-approvals` every 5 minutes (admin only)
- Shows login toast burst once per session (staggered 800ms apart, 10s duration each)
- Color-coded items: deadline = red, pending_approval = emerald, others = cyan
- Click handlers: deadline → `/setup/[projectId]`, pending_approval → `/profile`

#### `BirthdayPopup` (`app/components/BirthdayPopup.tsx`)
Modal popup shown once per session when the logged-in user has a birthday today. Fetches `/api/users/birthdays`.

---

### 9.3 Messaging Components

#### `MessengerDropdown` (`app/components/MessengerDropdown.tsx`)
Chat icon in the header. Opens an inline message panel.

#### `Messenger` (`app/components/Messenger.tsx`)
Full messaging interface with conversation list and message thread.

#### `UserMentionInput` (`app/components/UserMentionInput.tsx`)
Text input with `@username` autocomplete for mentioning users in messages.

---

### 9.4 Utility Components

#### `IconifySetup` (`app/components/IconifySetup.tsx`)
Registers all icon collections locally (mdi, bi, game-icons, lets-icons) via `addCollection()`. Prevents CDN fetches when the browser cache is cleared.

Rendered once in `app/layout.tsx`.

#### `LoadingProvider` / `LoadingScreen`
Context provider that shows a full-page loading screen during navigation.

---

## 10. Authentication & Authorization

### 10.1 Authentication Flow

```
1. User submits email + password to POST /api/auth/login
2. Server hashes password with bcryptjs and compares to stored hash
3. On success: JWT signed with JWT_SECRET, set as HttpOnly cookie "auth-token"
4. User data stored in localStorage (id, role, fullName, profileImageUrl)
5. proxy.ts checks "auth-token" cookie on every request
6. Protected routes: redirect to "/" if no valid cookie
7. Public routes: redirect to "/dashboard" if valid cookie exists
```

### 10.2 Role-Based Access

| Feature | ADMIN | STAFF |
|---|---|---|
| All SETUP features | ✅ | Permission-based |
| All CEST features | ✅ | Permission-based |
| Maps | ✅ | Permission-based |
| Calendar | ✅ | Permission-based |
| Archival Records | ✅ | Permission-based |
| User Management | ✅ | ❌ |
| Database Settings | ✅ | ❌ |
| Pending Approvals | ✅ | ❌ |
| View own logs | ✅ | ✅ |
| View all logs | ✅ | ❌ |

### 10.3 Account States

| State | `isApproved` | `isBlocked` | Can Login |
|---|---|---|---|
| Pending | false | false | ❌ |
| Active | true | false | ✅ |
| Blocked | true | true | ❌ |

New registrations start as `isApproved: false` and require admin approval via the User Management panel.

### 10.4 API Authentication

All API routes use the `getUserIdFromRequest(req)` helper from `lib/activity-log.ts` which reads the `x-user-id` header. The frontend `api-client.ts` wrapper automatically injects this header from localStorage.

---

## 11. Notification System

### 11.1 Notification Types

| Type | Trigger | Who Sees It |
|---|---|---|
| `deadline` | Project within 365 days of deadline | Project assignee (staff) / All admins |
| `pending_approval` | User accounts awaiting approval | Admins only |
| `general` | Manual system notifications | Target user |

### 11.2 Deadline Calculation

```typescript
deadline = fundReleaseDate + 12 months + Σ(PDE extension months)
daysRemaining = deadline - today
```

Notifications are created once per project per day (deduplicated by `eventId` + date window).

### 11.3 Login Toast Burst

On first page load of a session (`hasShownDeadlineToasts` not in sessionStorage):
1. Fetch deadline notifications for the current user
2. Fetch pending approvals (admin only)
3. Display staggered toasts (800ms delay between each, 10s display duration)
4. Set `sessionStorage.hasShownDeadlineToasts = 'true'` to prevent repeats

### 11.4 Polling Intervals

| Check | Interval |
|---|---|
| General notifications | Every 5 seconds |
| Deadline check | Every 5 minutes |
| Pending approvals | Every 5 minutes |
| Header user data | Every 3 seconds |

---

## 12. Database Configuration

### 12.1 Runtime Database Switching

The application supports switching between cloud and local databases at runtime without restarting the server.

**Mechanism:** `lib/prisma.ts` wraps two cached Prisma clients in a JavaScript `Proxy`. On every property access, it reads `db-config.json` to determine which client to use:

```typescript
const prismaProxy = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient(getActiveDb()); // reads db-config.json
    const value = client[prop];
    if (typeof value === 'function') return value.bind(client);
    return value;
  },
});
```

**To switch:** Call `POST /api/db-config` with `{ activeDb: "local" }` or `{ activeDb: "cloud" }`. The `db-config.json` file is updated on disk, and the next DB call uses the new client.

### 12.2 Data Synchronization

The `POST /api/db-sync` endpoint copies all records from one database to the other. It truncates the destination tables and re-inserts all data from the source.

Synchronized models: users, setupProjects, projectDocuments, cestProjects, cestDocuments, mapPins, calendarEvents, archivalRecords, conversations, messages, notifications, provinces, municipalities, barangays.

---

## 13. File & Document Management

### 13.1 Document Storage

Documents are stored as binary data (`Bytes` / `fileData`) directly in the database. This avoids file system dependencies and ensures documents are included in DB sync operations.

### 13.2 Document Upload Flow

```
1. User selects file in the browser
2. File read as ArrayBuffer via FileReader
3. Converted to Base64 string
4. POST to /api/setup-projects/[id]/documents with { fileName, fileData, mimeType, phase, templateItemId }
5. Server stores Bytes in ProjectDocument.fileData
```

### 13.3 Document Download Flow

```
1. GET /api/setup-projects/[id]/documents/[docId]/download
2. Server reads fileData from DB
3. Returns binary response with correct Content-Type and Content-Disposition headers
```

### 13.4 QR Pin

Each document can be assigned a `qrPin` — a short alphanumeric code. The QR code encodes a URL pointing to `/view-doc/[docId]`, allowing mobile scanning to open the public document viewer.

The LAN IP for QR codes is fetched from `GET /api/local-ip`, which uses PowerShell on WSL2 to return the Windows network IP (not the WSL2 virtual IP).

---

## 14. Maps & Geolocation

### 14.1 Technology

- **Leaflet 1.9.4** for interactive map rendering
- **react-leaflet 5.0.0** for React integration
- OpenStreetMap tiles as the base layer

### 14.2 Map Pins

Each `MapPin` record stores:
- `lat` / `lng` (Float)
- `label` (project name or description)
- `district` (integer, 1–5 for Misamis Oriental)
- `program` (SETUP | CEST | SSCP | LGIA)

Pins are color-coded by program and filterable by district and program type.

### 14.3 Geocoding

The `/geocode-batch` endpoints call a geocoding API to convert text addresses to coordinates and update all `coordinates` fields in bulk.

---

## 15. Messaging System

### 15.1 Data Model

```
User ─── ConversationParticipant ─── Conversation ─── Message
```

- One conversation can have many participants (group or 1:1)
- Messages are ordered by `createdAt`
- `lastReadAt` on ConversationParticipant tracks unread state

### 15.2 User Mention

The `UserMentionInput` component detects `@` in the text and queries `/api/users` for matching names, displaying an autocomplete dropdown.

---

## 16. Configuration Files

### `next.config.mjs`
```js
const nextConfig = {
  devIndicators: false  // Hides the Next.js debug overlay in development
};
```

### `proxy.ts` (Auth Middleware)
Runs on every request. Public routes (no auth check): `/`, `/signup`, `/forgot-password`, `/view-doc/*`, `/api/*`, `/_next/*`, `/favicon.ico`, static files.

Behavior:
- No `auth-token` cookie + accessing protected route → redirect to `/`
- Valid `auth-token` cookie + accessing public route → redirect to `/dashboard`

### `db-config.json`
```json
{
  "activeDb": "local",
  "lastSync": "2026-04-26T20:00:59.143Z",
  "lastSyncDirection": "local → cloud"
}
```

Written by `POST /api/db-config`. Read by `lib/prisma.ts` on every database call.

### `postcss.config.mjs`
Uses `@tailwindcss/postcss` for Tailwind CSS v4 processing (LightningCSS-based).

---

## 17. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | CockroachDB connection string |
| `LOCAL_DATABASE_URL` | Yes | Local PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `EMAIL_USER` | Yes | Gmail address for sending OTP emails |
| `EMAIL_PASSWORD` | Yes | Gmail app password |

---

## 18. Development Guide

### Running the Dev Server

```bash
npm run dev
# Accessible at http://localhost:3000
# Also accessible on LAN: http://<windows-ip>:3000
```

### Running on WSL2

The dev server must be started from **Windows** (PowerShell/CMD), not from the WSL2 terminal. WSL2 installs Linux binaries which are incompatible with the Windows Node.js runtime that Next.js uses.

If running from WSL2:
```bash
# From WSL, launch the Windows Node.js directly:
cmd.exe /c "cd /d C:\Users\Admin\Desktop\Main\DOST-Document-Archival-System && npm run dev"
```

### Rebuilding after `node_modules` changes

After `npm install`, the post-install script (`scripts/fix-wsl-binaries.cjs`) runs automatically to place Windows-native `.node` binary files in the correct locations.

If you see `Cannot find module '../lightningcss.win32-x64-msvc.node'`:
```bash
node scripts/fix-wsl-binaries.cjs
```

### Clearing the Build Cache

```bash
rm -rf .next
npm run dev
```

### Prisma Schema Changes

After modifying `prisma/schema.prisma`:
```bash
npx prisma migrate dev --name describe-change
npx prisma generate
```

For local schema changes:
```bash
npx prisma db push --config prisma.local.config.ts
```

### Adding New Icon Sets

Edit `app/components/IconifySetup.tsx` and add:
```typescript
import newIconSet from '@iconify-json/new-set/icons.json';
addCollection(newIconSet);
```

Install first:
```bash
npm install @iconify-json/new-set
```

---

## 19. Deployment

### Build for Production

```bash
npm run build
npm start
```

The build script automatically runs `prisma generate` before building.

### Production Checklist

- [ ] Set all environment variables in the hosting environment
- [ ] Run `npx prisma migrate deploy` against the production database
- [ ] Ensure `db-config.json` exists with `{ "activeDb": "cloud" }` on the server
- [ ] Confirm `JWT_SECRET` is a long, random string
- [ ] Confirm Gmail app password is set (not account password)
- [ ] Verify `DATABASE_URL` points to production CockroachDB cluster
- [ ] Set `NODE_ENV=production`

### Database Migrations

Before deploying schema changes to production:
```bash
npx prisma migrate deploy
```

To generate a new migration:
```bash
npx prisma migrate dev --name add-field-name
```

---

## 20. Troubleshooting

### Cannot find module '../lightningcss.win32-x64-msvc.node'

**Cause:** WSL2 npm installed Linux binaries. Windows Node.js needs the Win32 DLL.

**Fix:**
```bash
node scripts/fix-wsl-binaries.cjs
# or
npm install lightningcss-win32-x64-msvc
```

### Icons missing after clearing browser cache

**Cause:** Iconify was fetching from CDN; cached icons are gone after cache clear.

**Fix:** Already resolved — `IconifySetup.tsx` bundles all icon sets locally via `addCollection()`. No CDN fetch needed.

### "Failed to fetch" on notifications after DB switch

**Cause:** Old Prisma client pointing to wrong database.

**Fix:** Already resolved — `lib/prisma.ts` Proxy reads `db-config.json` on every call. Switching via Settings takes effect immediately.

### QR codes showing wrong IP address (WSL2)

**Cause:** `os.networkInterfaces()` returns the WSL2 virtual IP, not the Windows LAN IP.

**Fix:** Already resolved — `GET /api/local-ip` calls `powershell.exe` to get the real Windows IP.

### User stuck on "Pending Approval"

Admin must approve from Profile → User Management → find user → click Approve.

### "Middleware" deprecation warning in Next.js 16

**Fix:** Already resolved — `middleware.ts` renamed to `proxy.ts` with `export { proxy as middleware }` convention.

### Prisma migration errors on local DB

```bash
npx prisma db push --config prisma.local.config.ts --force-reset
```

> **Warning:** `--force-reset` drops all data. Use only in development.

---

*Documentation generated for DOST Document Archival System v0.1.0 — April 2026*
