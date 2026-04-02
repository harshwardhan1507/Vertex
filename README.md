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
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Notifications | Firebase Cloud Messaging |
| PDF Generation | pdf-lib |
| Email | Resend |
| QR Code | qrcode (npm) |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| Deployment | Vercel |
| PWA | next-pwa |

---

## Project Structure
```
vertex/
├── app/
│   ├── (auth)/          # Login, Signup
│   ├── (student)/       # Student dashboard, events, clubs
│   ├── (admin)/         # Admin panel
│   ├── api/             # API routes
│   └── organizer/       # Organizer dashboard, event management
├── components/
│   ├── ui/              # Reusable UI components
│   ├── events/          # Event-specific components
│   ├── clubs/           # Club-specific components
│   └── shared/          # Navbar, sidebar, footer
├── lib/                 # Supabase client, utilities
├── store/               # Zustand stores
├── hooks/               # Custom React hooks
└── types/               # TypeScript interfaces
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Firebase account
- Resend account

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

## Roadmap

- [x] Project setup and folder structure
- [x] TypeScript types
- [x] Supabase setup and database schema
- [x] Authentication (email + Google)
- [x] Event browsing and registration
- [x] Organizer Dashboard interface
- [ ] Admin approval flow
- [ ] Push notifications
- [ ] Club pages
- [ ] Certificate generation
- [ ] OD letter system
- [ ] VScore system
- [ ] PWA setup
- [ ] Launch at SRM Haryana

---

## Built By

Harsh Wardhan — B.Tech CSE, SRM University Haryana (2025–2029)

---

*Built for SRM Haryana. Designed to scale.*
