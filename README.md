<div align="center">

<img src="public/favicon.ico" width="80" alt="Planny Logo" />

# 🐾 Planny

**Your cute, magical AI productivity assistant.**  
Planny checks in every night to learn your goals — and delivers a personalized, motivational plan to your inbox every morning.

[![Live App](https://img.shields.io/badge/Live%20App-planny.app-f9a8d4?style=for-the-badge&logo=vercel&logoColor=white)](https://planny.vercel.app)
[![Built with Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Powered by Groq AI](https://img.shields.io/badge/AI-Groq-orange?style=for-the-badge)](https://groq.com)

</div>

---

## ✨ What is Planny?

Planny is a **paid AI productivity SaaS** that automates your daily planning with the power of AI. Every night at **10 PM**, Planny sends you an email to collect your tasks and goals for the next day. Every morning at **7 AM**, it delivers a beautifully formatted, AI-generated plan with a motivational quote — straight to your inbox.

No manual setup. No complicated apps. Just smart, automated planning that feels like magic. 🌸

---

## 🚀 Core Features

| Feature | Description |
|---|---|
| 🌙 **10 PM Evening Check-in** | Automated email asks what you want to achieve tomorrow |
| ☀️ **7 AM Morning Digest** | AI-crafted schedule + motivational quote delivered to your inbox |
| 📅 **Interactive Calendar** | Visual calendar view to track tasks and plans across days |
| 🔐 **Google Sign-In** | One-click authentication via Google OAuth — no passwords needed |
| 🤖 **Groq AI Engine** | Ultra-fast AI generates your daily plan using the Llama model |
| 📬 **Smart Email Automation** | Beautiful HTML emails via Nodemailer with personalized content |
| 🌍 **Timezone-Aware** | Schedule delivery is calibrated to each user's local timezone |
| ✉️ **Email Waitlist** | Let users join a waitlist before onboarding — no friction |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) + TypeScript |
| **Frontend** | React 19, TailwindCSS 4 |
| **Auth** | [NextAuth.js v4](https://next-auth.js.org) with Google OAuth + Prisma Adapter |
| **Database** | PostgreSQL via [Prisma ORM](https://www.prisma.io) + Prisma Accelerate |
| **AI** | [Groq SDK](https://groq.com) — Llama 3 for plan & quote generation |
| **Email** | [Nodemailer](https://nodemailer.com) for transactional email delivery |
| **Cron Jobs** | [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) for scheduled tasks |
| **Deployment** | [Vercel](https://vercel.com) — edge-optimized, serverless |

---

## 🔄 How It Works

```
User signs in → adds tasks for tomorrow
          ↓
   [10 PM Cron Job]
   Planny emails every user → "What are your goals for tomorrow?"
          ↓
   User clicks link → fills in their task list (web form)
          ↓
   [7 AM Cron Job]
   Groq AI reads tasks → generates a personalized daily plan + quote
   Planny sends the beautiful morning email 🌅
          ↓
   User opens calendar → views their planned day
```

---

## 📸 App Screens

| Landing Page | Plan Form | Calendar View |
|---|---|---|
| Sign in with Google or join the waitlist | Add your tasks for tomorrow | View your daily plan visually |

---

## ⚠️ License & Usage

> **This is a proprietary, commercially licensed product.**

- 🚫 **Do not clone, fork, or copy** this repository or any part of its source code.
- 🚫 **Do not redistribute** or republish any portion of this codebase.
- 🚫 **Do not use** this code to build competing or derivative products.
- ✅ **Personal use** of the live app at [planny.vercel.app](https://planny.vercel.app) is subject to our Terms of Service.

All rights reserved © 2026 Planny. Unauthorized use, reproduction, or distribution of this software is strictly prohibited.

---

## 📬 Contact

Have questions, feedback, or partnership inquiries?

- **Email:** [hello@planny.app](mailto:hello@planny.app)
- **Live App:** [planny.vercel.app](https://planny-mu.vercel.app/)

---

<div align="center">
  <sub>Made with 💖 and a little AI magic &nbsp;•&nbsp; © 2026 Planny 🐾</sub>
  <br/><br/>
  <sub>Designed & Developed by</sub>
  <br/>

  [![Rajvansh](https://img.shields.io/badge/%F0%9F%91%A8%E2%80%8D%F0%9F%92%BB%20Rajvansh-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Rajvansh-1)
</div>
