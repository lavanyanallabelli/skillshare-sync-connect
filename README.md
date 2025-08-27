# 🔄 SkillSync – Peer-to-Peer Skill Exchange Platform

SkillSync is a collaborative learning platform that empowers users to trade skills with one another instead of money. It facilitates live, meaningful exchanges through matchmaking, scheduling, messaging, and personalized progress tracking.

---

## 🧩 Key Features

- 🔁 **Skill Exchange System:** Match with peers to trade skills in real-time.
  
- 🧑‍💻 **Role-Based Access:** Secure authentication for users and admins using JWT.
  
- 📹 **Live Sessions:** Integrates with Google Meet or Zoom for video calls.
- 📨 **Real-Time Messaging:** Chat during or between sessions.
- 📅 **Smart Scheduling:** Schedule and reschedule sessions with calendar integration.
- 🧠 **Gamified Learning:** Track skill progress and earn feedback.
- 🗂️ **Skill Catalog:** Browse and discover skills across various domains.
- 🌟 **Review & Rating System:** Leave feedback post-session to build credibility.
- 🛡️ **Reporting & Admin Tools:** Flag abuse and manage content with admin dashboard.

---

## ⚙️ Tech Stack

### 🖥️ Front-End
- **React.js** (Hooks, Routing, Component Architecture)
- **Tailwind CSS** (Responsive UI)
- **Framer Motion** (Animations)

### 🔧 Back-End
- **Node.js** + **Express.js**
- **PostgreSQL** for database
- **Redis** (Session & Matchmaking Cache)
- **JWT** for Authentication
- **Google Meet/Zoom API** for video integration

### ☁️ DevOps & Deployment
- **Docker** for containerized deployment
- **Microsoft Azure** for cloud services
- **GitHub Actions** (CI/CD)
- **Postman** for API testing

---

## 🗃️ Database Design

Includes collections for:

- Users
- Skills
- Sessions
- Messages
- Reviews
- Admin Flags

Relationship mapping ensures referential integrity and efficient query performance.

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/skillsync.git
cd skillsync

# Install dependencies for both frontend and backend
npm install --prefix client
npm install --prefix server

# Run the app
npm run dev
