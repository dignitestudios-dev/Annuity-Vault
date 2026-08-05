# Annuity Vault — Web Application Frontend Documentation

## 1. Executive Overview

**Annuity Vault** is a modern, high-performance web application designed for financial advisors and annuity specialists to manage client portfolios, annuity contracts, policy anniversaries, daily tasks, audit logs, and compliance records.

This project is currently operating in **Frontend-First Design & Implementation Mode**. The primary objective is building out a pixel-perfect, highly responsive, interactive visual interface based on page-by-page and screen-by-screen Figma designs, CSS specifications, and screenshots.

---

## 2. Technology Stack

| Architecture Layer | Technology Selection | Version / Notes |
| :--- | :--- | :--- |
| **Core Framework** | Next.js (App Router) | `16.2.12` (React Server Components enabled) |
| **UI Library** | React & React DOM | `19.2.4` |
| **Component Primitives**| Shadcn UI + Base UI | `base-nova` style configuration |
| **Styling & CSS** | Tailwind CSS v4 | `@tailwindcss/postcss`, `tw-animate-css` |
| **Icons & Visuals** | Lucide React | `lucide-react` |
| **State Management** | Redux Toolkit & React-Redux | `@reduxjs/toolkit` `2.12.0`, `react-redux` `9.3.0` |
| **Data Fetching** | TanStack React Query + Axios | `@tanstack/react-query` `5.101.4`, `axios` `1.19.0` |
| **Forms & Validation** | React Hook Form + Zod | `react-hook-form` `7.84.0`, `zod` `4.4.3` |
| **Pickers & UI Tools** | Date-fns, React Day Picker, CMDK | `date-fns` `4.4.0`, `react-day-picker`, `cmdk` |
| **Language & Build** | TypeScript + PostCSS | `TypeScript 5.x` |

---

## 3. Directory & Architecture Structure

```
web-app/
├── src/
│   ├── app/                         # Next.js App Router Pages & Layouts
│   │   ├── auth/                    # Authentication Flow
│   │   │   ├── login/               # Sign In Screen
│   │   │   ├── forgot-password/     # Password Recovery Screen
│   │   │   └── reset-password/      # New Password Setup Screen
│   │   ├── dashboard/               # Main Dashboard App Shell & Sub-routes
│   │   │   ├── activity/            # Audit Log & Activity Stream
│   │   │   ├── anniversaries/       # Policy Anniversaries Tracking
│   │   │   ├── archived/            # Archived Clients & Contracts Repository
│   │   │   ├── clients/             # Client Folder Table & [id] Detail View
│   │   │   ├── contracts/           # Contracts Table & [id] Detail View
│   │   │   ├── notifications/       # User Notifications Center
│   │   │   ├── settings/            # User Settings (Profile, Security, Calendar, etc.)
│   │   │   ├── tasks/               # Task Management Workspace
│   │   │   ├── layout.tsx           # Dashboard Layout Shell (Sidebar + DashboardHeader)
│   │   │   └── page.tsx             # Dashboard Main Overview Screen
│   │   ├── globals.css              # Global Styling, CSS Variables & Design Tokens
│   │   ├── layout.tsx               # Root Application Layout
│   │   ├── not-found.tsx            # Custom 404 Error Page
│   │   └── page.tsx                 # Root Redirect Handler
│   ├── components/
│   │   ├── shared/                  # Universal UI Layout & Feedback Modals
│   │   │   ├── sidebar.tsx          # Navigation Sidebar with Active Route Highlighting
│   │   │   ├── dashboard-header.tsx # Top Header with Greeting & Notifications
│   │   │   ├── success-modal.tsx    # Standardized Success Notification Modal
│   │   │   ├── delete-modal.tsx     # Standardized Deletion Confirmation Modal
│   │   │   ├── archive-modal.tsx    # Standardized Archive Notification Modal
│   │   │   ├── navbar.tsx           # Public Navigation Header
│   │   │   └── footer.tsx           # Public Footer Component
│   │   └── ui/                      # Shadcn UI Base Primitives
│   │       ├── badge.tsx, button.tsx, calendar.tsx, card.tsx, command.tsx
│   │       ├── dialog.tsx, input.tsx, input-group.tsx, label.tsx
│   │       ├── popover.tsx, searchable-select.tsx, select.tsx, table.tsx, textarea.tsx
│   ├── features/                    # Feature-based Modular Components & Logic
│   │   ├── auth/                    # Auth Forms (`login-form`, `forgot-password-form`, `reset-password-form`)
│   │   ├── clients/                 # Client Table, Dialogs (`new-client`, `edit-client`), Profile Tabs
│   │   ├── contracts/               # Contract Modals (`new-contract`, `edit-contract`)
│   │   └── dashboard/               # Dashboard Cards (`metric-cards`, `clients-table-card`, etc.)
│   ├── config/                      # Global Route Configurations (`routes.ts`)
│   ├── lib/                         # Client Setup (`axios.ts`, `query-client.ts`, `utils.ts`)
│   ├── providers/                   # App Providers (Redux, React Query, Auth Rehydrator)
│   ├── store/                       # Redux Store (`index.ts`, `slices/auth.slice.ts`)
│   ├── types/                       # TypeScript Type Declarations (`common.d.ts`)
│   └── utils/                       # Utility Helpers (`cn.ts`, `constants.ts`)
├── components.json                  # Shadcn UI Configuration (`base-nova` style)
├── package.json                     # Project Dependencies & Build Scripts
└── AGENTS.md                        # UI Conventions & Next.js Agent Guidelines
```

---

## 4. Design System & Tokens

### Color Palette (Dark Theme Specs)
- **Background**: `#0C1116` (Deep Dark Onyx)
- **Card / Surface**: `#141C24` (Sleek Slate Dark)
- **Primary Brand Accents**: `#66859E` / `#6887A0` (Muted Steel Blue)
- **Secondary / Input**: `#141C24` / `#192430`
- **Destructive / Danger**: `#FF3E46` / `#FF0000`
- **Muted Text / Subtitles**: `#919191`
- **Borders**: `rgba(255, 255, 255, 0.1)`

### Typography
- **Primary Font**: `Inter`, `ui-sans-serif`, `system-ui`, `sans-serif`
- **Weights**: Regular (`400`), Medium (`500`), SemiBold (`600`), Bold (`700`)

---

## 5. UI Enforcement Rules & Component Standards

1. **Shadcn UI Standard**: Always use existing Shadcn primitives (`Button`, `Dialog`, `Card`, `Select`, `Input`, `Badge`, `Table`). Do not build custom UI primitives from scratch.
2. **Universal Control Heights**: Form inputs (`Input`), select dropdown triggers (`SelectTrigger`), and input groups must maintain a universal height of **`h-10` (`40px`)** across all forms, tables, and modals.
3. **Standard Dialog Overlays**:
   - Background Overlay: `bg-black/60 transition-opacity duration-150`
   - Sub-components: `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
   - Alignment: Center aligned without extra background wrappers.
4. **Reusable Feedback Modals**:
   - Success Popups: `SuccessModal` (`@/components/shared/success-modal.tsx`)
   - Delete Confirmation: `DeleteModal` (`@/components/shared/delete-modal.tsx`)
   - Archive Notification: `ArchiveModal` (`@/components/shared/archive-modal.tsx`)
5. **Modular Component Splitting**: Keep components compact and reusable. Split large screens into smaller, focused subcomponents inside the respective `src/features/[feature]/components` subfolder.

---

## 6. Page Inventory & Navigation Routes

| Route | Feature Area | Description / Key Components |
| :--- | :--- | :--- |
| `/auth/login` | Authentication | Sign-in form with email/password, validation, and layout |
| `/auth/forgot-password` | Authentication | Password recovery request form |
| `/auth/reset-password` | Authentication | New password setup form with confirmation |
| `/dashboard` | Main Overview | Metric cards, active clients table card, pending tasks, recent activity, anniversaries |
| `/dashboard/clients` | Client Folder | Interactive client table, filter/search, `NewClientDialog`, `EditClientDialog` |
| `/dashboard/clients/[id]` | Client Profile | Client profile header, info card, and tabs (`Contracts`, `Documents`, `Tasks`, `Notes`, `Activity`) |
| `/dashboard/contracts` | Contracts | Annuity contracts table, status filters, `NewContractDialog`, `EditContractDialog` |
| `/dashboard/contracts/[id]` | Contract Detail | Comprehensive contract inspection, owner details, carrier details, values, policy notes |
| `/dashboard/tasks` | Task Management | Daily tasks list, priority filters, task creation & status toggling |
| `/dashboard/anniversaries` | Anniversaries | Upcoming annuity contract anniversaries, surrender dates, and renewal alerts |
| `/dashboard/activity` | Audit & Activity | System-wide activity logs, user actions, and change tracking |
| `/dashboard/archived` | Archived Vault | Archive repository for deleted/archived clients & contracts with restore options |
| `/dashboard/notifications` | Notifications | Notification inbox, read/unread status, and alert items |
| `/dashboard/settings/*` | Settings Workspace | Profile, Security, Change Password, Data Management, Google Calendar Sync, Notifications, Legal Docs |

---

## 7. Figma Screen-by-Screen Integration Workflow

When receiving Figma screenshots and Figma CSS snippets from the user, the following execution protocol will be followed:

1. **Visual Breakdown**: Inspect the Figma screenshot for exact typography, color hex codes, layout grid, borders, shadows, and interactive element positioning.
2. **Component Mapping**: Match the design with existing Shadcn UI primitives and shared components (`Sidebar`, `DashboardHeader`, `SuccessModal`, etc.).
3. **Tailwind Styling**: Convert Figma CSS rules to Tailwind CSS v4 class names adhering to the established dark theme design system (`#0C1116`, `#141C24`, `#6887A0`).
4. **Interactive States**: Ensure hover, active, focus, empty, and loading states feel vibrant, dynamic, and responsive.
5. **Quality Verification**: Execute `npm run build` or static type check to confirm zero build errors or breaking changes.

---

> [!NOTE]
> This document serves as the authoritative blueprint for the Annuity Vault frontend. When Figma screens and CSS are provided, they will be translated directly into clean React & Tailwind components following these conventions.
