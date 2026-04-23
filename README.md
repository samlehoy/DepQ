# DepQ - Quran Memorization Manager

DepQ is a sophisticated, premium web application designed to manage, track, and enhance the Qur'an memorization (Hafalan) journey. Built with a mobile-first philosophy, it serves as a bridge between students (Santri) and their teachers (Ustadz), providing an immersive and structured learning experience.

## ✨ Key Features

### 🛡️ Role-Based Access Control (RBAC)
- **Santri (Student) Portal:** A focused environment for reading the Qur'an, recording daily recitations, and tracking personal memorization progress.
- **Ustadz (Teacher) Dashboard:** A protected, high-level management dashboard for reviewing submissions, managing the student roster, and analyzing memorization velocity.

### 🎙️ Interactive Hafalan & Review
- **Voice Recording:** Students can directly record their daily memorization (Setoran) within the browser.
- **Ustadz Evaluation:** Teachers can play back the submitted audio recordings from their dashboard and immediately approve or provide feedback on the student's tajwid and fluency.

### 📖 Immersive Qur'an Reading Experience
- **Dynamic Audio Playback:** Fetch and play verse-by-verse or full surah audio via the `quran.com` API.
- **Transliteration & Translations:** Built-in Latin transliteration to assist beginners.
- **Bookmark System:** Save specific Ayahs or Surahs for quick access and continuous study.

### 📊 Progress Analytics
- **Visual Dashboards:** Beautiful charts that break down a student's memorization velocity and setoran consistency over time.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS (Custom Design System)
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (for Hafalan Audio)
- **Icons & Typography:** Google Material Symbols, Plus Jakarta Sans, Noto Serif

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Supabase Project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/DepQ.git
   cd DepQ
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🔒 Database Setup

This project heavily relies on **Supabase Row Level Security (RLS)**. Ensure the following tables are created in your Supabase instance:
- `profiles` (with `role` and `full_name` columns)
- `setorans` (tracks student submissions, includes `audio_url`)
- `bookmarks`
- **Storage Bucket:** Create a public bucket named `hafalan_audio` for voice recording features to work properly.
