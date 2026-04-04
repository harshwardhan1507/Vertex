# Vertex — Campus Operating System

> Where campus life connects.

Vertex is a campus event management platform built for Indian college students and organizers. It eliminates the chaos of WhatsApp groups, manual certificates, and paper attendance by bringing everything into one unified system.

---

## What It Does

**For Students**
- Discover and register for campus events in one place
- Get push notifications 1 day and 1 hour before events
- Receive certificates automatically after attending
- Get OD letters sent directly to your professor
- Build a VScore — a real-time campus participation grade

**For Organizers**
- Create and manage events with an approval workflow
- Mark attendance via QR code scanner
- Generate and email certificates to all attendees in one click
- Send OD letters to students and their professors automatically
- View registration and attendance analytics

**For Admin**
- Approve or reject events before they go live
- Manage clubs and organizers
- Send college-wide announcements
- View platform-wide engagement data

---

## Feature Modules

| Module | Description |
|---|---|
| **EventPass** | Event discovery, registration, QR ticket |
| **PulseAlert** | Push notifications and reminders |
| **ClubHub** | Club pages, follow system |
| **RollCall** | QR-based attendance marking |
| **CertifyMe** | Auto certificate generation and delivery |
| **ODPass** | OD letter generation and professor delivery |
| **TrustMark** | Public document verification via unique ID |
| **VScore** | Real-time campus participation scoring |
| **InsightBoard** | Analytics for organizers and admin |
| **GateKeeper** | Admin controls and approvals |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | Lucide React, clsx, tailwind-merge |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (@supabase/ssr) |
| Storage | Supabase Storage |
| Notifications | Firebase Cloud Messaging |
| PDF Generation | pdf-lib |
| Email | Resend |
| QR Code | qrcode (npm) |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| Date Utilities | date-fns |
| Theming | next-themes |
| Deployment | Vercel |
| PWA | next-pwa |

---

## Project Structure

```
vertex/
├── app/
│   ├── (auth)/           # Login, Signup, Auth Callback
│   ├── (student)/        # Student dashboard, events, clubs
│   ├── admin/            # Admin panel
│   ├── attend/           # Attendance marking flow
│   ├── organizer/        # Organizer dashboard, event management
│   └── api/              # API routes
├── components/
│   ├── ui/               # Reusable UI components
│   ├── events/           # Event-specific components
│   ├── clubs/            # Club-specific components
│   └── shared/           # Navbar, sidebar, footer
├── lib/                  # Supabase client, utilities
├── store/                # Zustand stores
├── hooks/                # Custom React hooks
├── types/                # TypeScript interfaces
├── supabase/             # Database schema and migrations
├── scripts/              # Utility scripts
├── public/               # Static assets, PWA manifest
└── tracker.html          # Implementation progress tracker
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Firebase account (for push notifications)
- Resend account (for email delivery)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/vertex.git
cd vertex

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## Implementation Roadmap

The project follows a 10-phase plan across 94 tasks. Progress is tracked in [`tracker.html`](tracker.html).

### Phase 1 — Foundation ✅
> Weeks 1–2 · Core setup

- [x] Next.js project setup with TypeScript + Tailwind
- [x] Folder structure — auth, student, organizer, admin, api
- [x] TypeScript interfaces for all data models
- [x] Supabase project creation (Mumbai region)
- [x] Full database schema — 8 tables with RLS policies
- [x] Auto-profile trigger on new user signup
- [x] Supabase client setup — browser, server, admin clients
- [x] Environment variables and .env.example
- [x] Email + Google auth with Supabase Auth
- [x] Login page — email + Google button
- [x] Signup page with role selector (student/organizer)
- [x] Middleware for route protection with session refresh
- [x] Auth callback route for Google OAuth
- [x] PWA setup — manifest.json + next-pwa config
- [x] Mobile-first student layout with bottom nav
- [x] Student dashboard — real Supabase data
- [x] README.md with full project documentation

---

### Phase 2 — EventPass 🔵
> Week 3 · Event discovery + registration

- [x] Events listing page with search and category filters
- [x] Event detail page with full info
- [x] One-click registration flow
- [x] QR ticket generation on registration (qrcode npm)
- [x] My registrations page — upcoming and past
- [x] Organizer — create event form
- [ ] Organizer — edit and delete event
- [x] Organizer dashboard layout (desktop sidebar)
- [x] Organizer — view registrations list for each event
- [x] Admin — event approval / rejection flow
- [x] Admin dashboard layout
- [x] API route `POST /api/events`
- [x] API route `POST /api/register`

---

### Phase 3 — ClubHub + PulseAlert 🔵
> Week 4 · Clubs and notifications

- [x] Club profile pages with bio, logo, social links
- [x] Browse all clubs page
- [ ] Follow / unfollow clubs
- [ ] Firebase Cloud Messaging setup
- [ ] Push notification — 1 day before event
- [ ] Push notification — 1 hour before event
- [ ] Supabase Edge Function cron job for notifications
- [ ] Organizer — send custom notification to registrants
- [ ] Organizer — club profile management page
- [ ] Admin — college-wide announcements
- [ ] Notifications inbox for students

---

### Phase 4 — RollCall 🔵
> Week 5 · QR attendance system

- [x] QR code generator UI for organizer
- [x] Mark attendance endpoint `POST /api/attendance`
- [x] Live attendance counter on organizer event page
- [ ] Attendance sheet PDF generation (pdf-lib)
- [ ] Download attendance sheet button for organizer
- [x] Attendance data stored in registrations table

---

### Phase 5 — CertifyMe + ODPass
> Week 6 · Documents and verification

- [ ] Certificate PDF template design (pdf-lib)
- [ ] One-click certificate generation for all attendees
- [ ] Email certificates via Resend to each student
- [ ] Student certificate collection page
- [ ] Download certificate as PDF
- [ ] LinkedIn share button for certificates
- [ ] OD letter PDF template with student and event info
- [ ] Auto-send OD letter to student email
- [ ] Auto-send OD letter to professor email
- [ ] Student OD letters page — view and download
- [ ] Organizer one-click send OD to all present

---

### Phase 6 — TrustMark
> Week 6 · Document verification

- [ ] UUID generation for every certificate and OD letter
- [ ] QR code on every document linking to verify page
- [ ] Public `/verify/[id]` page — shows document validity
- [ ] Certificates table in Supabase with verification status
- [ ] `GET /api/verify/[id]` endpoint

---

### Phase 7 — VScore
> Week 7 · Participation scoring

- [ ] Score calculation logic — attended, organized, volunteer, no-show
- [ ] Auto-update score when attendance marked via RollCall
- [ ] Grade assignment — S, A, B, C, D, E based on percentage
- [ ] Percentile calculation across all students
- [ ] VScore detail page for student
- [ ] Campus leaderboard page — top students by score
- [ ] Organizer — filter students by VScore grade for inductions
- [ ] Organizer — volunteer finder filtered by grade and availability

---

### Phase 8 — InsightBoard
> Week 7 · Analytics

- [ ] Organizer analytics — registrations over time chart
- [ ] Organizer analytics — attendance rate per event
- [ ] Organizer analytics — club follower growth
- [ ] Admin dashboard — platform-wide event and user stats
- [ ] Admin — most active clubs and students

---

### Phase 9 — Polish + PWA
> Week 8 · Production ready

- [ ] PWA icons — 192px and 512px
- [ ] PWA install prompt handling
- [ ] Full mobile responsiveness audit
- [ ] Loading states and skeleton screens for all pages
- [ ] Empty states for events, clubs, certificates, OD letters
- [ ] Error handling and toast notifications
- [ ] Form validation on all forms with Zod
- [ ] Supabase Storage setup for banners, logos, signatures
- [ ] Image upload component for event banners and club logos
- [ ] Profile page — student can update name, branch, semester, professor email
- [ ] Dark mode toggle

---

### Phase 10 — Launch 🚀
> Week 8 · Go live

- [ ] Deploy to Vercel with production environment variables
- [ ] Custom domain setup (vertexcampus.in or similar)
- [ ] Vercel Analytics setup
- [ ] Onboard first organizer — senior tech club lead
- [ ] Create first real event on the platform
- [ ] Share with 50 students — collect feedback
- [ ] Fix critical bugs from real user feedback

---

## Progress Summary

| Metric | Count |
|---|---|
| Total Tasks | 94 |
| Completed | 35 |
| Remaining | 59 |
| Total Phases | 10 |
| Current Phase | Phase 2, 3, 4 In Progress |

Open `tracker.html` in your browser for an interactive, filterable implementation tracker.

---

## Built By

Harsh Wardhan — B.Tech CSE, SRM University Haryana (2025–2029)

---

*Built for SRM Haryana. Designed to scale.*
