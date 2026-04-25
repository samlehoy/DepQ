# DepQ - Project Scan & Development Plan

## 📌 Part 1: Current Condition (What Has Been Built)
This section details the existing architecture, completed features, and the current operational state of the application.

### 📁 Codebase Architecture
The repository is a **Modern Single Page Application (SPA)** using **React.js, Vite, and TailwindCSS v4**. It is a mobile-first app designed for managing Qur'an memorization submissions (setoran) and reading the Qur'an.

**Directory Structure & Component Roles:**
All application code is housed within the `/src/` directory:
- **`main.jsx` & `App.jsx`:** Entry points and React Router configuration with `PrivateRoute` for authenticated access.
- **`components/` (Reusable UI Components):**
  - `Layout.jsx`: The main app shell wrapper that handles routing outlets.
  - `Sidebar.jsx`: Desktop-only left navigation with an emerald glass effect.
  - `TopBar.jsx`: Glassmorphic top bar with notifications and user profile.
  - `BottomNav.jsx`: Mobile-only floating pill bottom navigation.
- **`pages/` (Application Routes):**
  - **Auth:** `Login.jsx`, `Register.jsx`
  - **Core:** `Home.jsx`, `Quran.jsx`, `Surah.jsx` (standalone immersive view), `Setoran.jsx`, `History.jsx`, `Quote.jsx`, `QuoteDetail.jsx`
  - **Ustadz:** `UstadzDashboard.jsx` (For teachers to review setoran)
  - **User:** `Profile.jsx`, `Settings.jsx`
- **`/index.css`:** Core Tailwind v4 setup and the "Spiritual Sophistication" design system (Plus Jakarta Sans for UI, Noto Serif for Arabic, deep emerald theme, glassmorphism).

### ✅ Completed Core Features & Milestones
- **[DONE] Qur'an API Integration:** Connected to `api.quran.com` for random verses, Surah lists, and Uthmani verse reading.
- **[DONE] High-End UI/UX Refactoring:** Completely migrated the UI to a premium "Spiritual Sophistication" design system with glassmorphism, responsive navigation (sidebar/topbar/bottom nav), and Material Symbols.
- **[DONE] Authentication & Database:** Integrated Supabase for BaaS (Authentication and Database).
- **[DONE] Core Student Flow:** Completed the student-side experience, including login, registration, viewing Qur'an, making a setoran submission, and tracking personal history.
- **[DONE] Ustadz Dashboard UI:** Built the teacher view (`UstadzDashboard.jsx`) to list incoming setoran and provide "Terima" (Approve) and "Tolak" (Reject) actions, aligned with the new design system.

---

## 🚀 Part 2: Upcoming Plan (Future Features & Enhancements)
This section outlines the roadmap for implementing advanced features now that the core UI revamp is complete.

### ✅ Phase 1: Complete Role-Based Access Control (RBAC) 
*Secure the application and enforce strict data isolation between roles.*
- **[DONE] Two Distinct Roles:** The system will officially support 2 types of roles: **santri** (student) and **ustadz** (teacher).
- **[DONE] Protected Ustadz Dashboard:** Modify `src/pages/UstadzDashboard.jsx` to be strictly visible and accessible **only** by users with the `ID_Ustadz` role (Teacher). Students attempting to access this route should be redirected.
- **[DONE] Database Rules:** Enforce Row Level Security (RLS) in Supabase based on user roles, ensuring `santri` only see their own data, and `ustadz` can manage their assigned students' data.
- **[DONE] Conditional Routing & UI:** Fully implement `UstadzRoute` vs `StudentRoute` wrappers. The Ustadz and Santri should have completely isolated experiences and navigation menus.

### ✅ Phase 2: Advanced Ustadz Features & Analytics
*Provide deeper insights and better management tools for the teachers.*
- **[DONE] Student Progress Analytics:** Integrate interactive charts (e.g., using Recharts) showing a student's memorization velocity and progress over time.
- **[DONE] Student Roster Management:** Enhance the student roster on the Ustadz Dashboard to filter by activity and identify students falling behind on their targets.

### ✅ Phase 3: Core Qur'an Reading Enhancements (Partially Completed)
*Improve the primary reading and study experience for all users.*
- **[DONE] Ayah Audio Playback & Transliteration:** Integrated the `quran.com` Audio API to play specific verses and added a global "Play All" auto-scrolling feature. Also added Latin transliteration reading support.
- **[DONE] Bookmark System:** Allow users (both Santri and Ustadz) to save and quickly jump to specific Ayahs or Surahs they are currently reading or studying.

### Phase 4: Gamification & Engagement (For Santri)
*Keep students motivated to continue their memorization journey.*
- **[DONE] Voice Recording for Hafalan:** Implement an audio recording feature allowing Santri to record their recitation (hafalan) during setoran submissions. The Ustadz can then examine, play back, and evaluate the audio on their dashboard.
- **[DONE] Streaks & Badges:** Reward students for daily Qur'an reading, consistent setoran submissions, or finishing a Juz. Implemented a `badges` and `user_badges` table with 10 badge definitions across 4 categories (streak, submission, quran, general). Created a `useStreaksAndBadges` hook that calculates real consecutive-day streaks and automatically awards badges. Badges are displayed on the Home dashboard and Profile page.
- **[DONE] Real-time Notifications:** Implemented a full in-app notification system using Supabase Realtime. Created a `notifications` table with RLS, a `NotificationContext` with live subscription via `postgres_changes`, and a polished dropdown panel in the TopBar. Notifications are triggered when an Ustadz approves/rejects a setoran and when a new badge is earned. Supports mark-as-read, mark-all, and delete.
- **[DONE] Language Customization:** Implemented a full i18n system with `LanguageContext`, translation files (`src/i18n/id.js`, `src/i18n/en.js`), and a language toggle in Settings. Covers all pages: Login, Register, Home, Setoran, History, Quran, Profile, Settings, TopBar, Sidebar, and BottomNav. Language preference is persisted to localStorage. Default language is Bahasa Indonesia.
- **[DONE] Quran Language Customization:** Quran chapter list and verse translations now switch based on the app's language setting. Indonesian uses translation ID 33 (Kemenag RI), English uses ID 85 (M.A.S. Abdel Haleem). API `language` param, surah metadata, and all hardcoded UI strings in `Surah.jsx` are now fully language-aware.
- **[DONE] Dark Mode:** Add a feature to switch between light and dark mode for the UI.
---
