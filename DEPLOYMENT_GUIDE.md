# 🚀 Deploying Planny (SaaS Setup)

Planny is perfectly designed to run on mostly free tiers to get your SaaS business off the ground.

## 1. Environment Variables needed in Production
You will need to set these in your hosting provider (like Vercel):
- `DATABASE_URL` (From Supabase / Prisma Accelerate)
- `DIRECT_URL` (From Supabase / Prisma Accelerate)
- `GROQ_API_KEY` (From Groq Console)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (From Resend, Sendgrid, or Gmail App Passwords)
- `NEXT_PUBLIC_SITE_URL` (Your production domain, e.g., `https://planny.app`)

## 2. Deploying on Vercel
1. Push this entire repository (`Planny`) to GitHub.
2. Go to [Vercel](https://vercel.com/) and Import the GitHub project.
3. Vercel will auto-detect "Next.js".
4. Expand **Environment Variables** and paste the keys from above.
5. Click **Deploy**.

## 3. Setting up CRON Jobs (Vercel Cron)
To make your 10PM and 7AM emails run automatically `24x7`, you need a `vercel.json` file in the root of the project.

Create a `vercel.json` with this configuration:
```json
{
  "crons": [
    {
      "path": "/api/cron/ask",
      "schedule": "0 22 * * *" 
    },
    {
      "path": "/api/cron/send",
      "schedule": "0 7 * * *"
    }
  ]
}
```
*Note: Vercel Cron runs in UTC. Adjust the `schedule` cron tab logic if you need it localized to a specific core timezone for all users, or set up a more complex worker queue.*

## 4. Database Setup (Supabase)
Currently, you are connected using Prisma Accelerate and Prisma DB Push.
When you need to migrate in the future, run:
`npx prisma migrate deploy` 
To apply the database schema.

## 🎉 You're ready to sell!
Send people to your Vercel URL. They will sign up, get logged into the database, and receive the 10PM planning emails and 7AM summaries automatically. 

*Add Stripe later via a `/subscribe` portal to monetize.*
