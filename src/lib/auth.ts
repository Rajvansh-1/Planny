import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

function buildWelcomeEmail(name: string, email: string) {
  const planUrl = `${SITE_URL}/plan?email=${encodeURIComponent(email)}`;
  const firstName = (name || 'friend').split(' ')[0];
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #FFB6C1, #f9a8d4); padding: 40px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Planny, ${firstName}! 🐾</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">Your AI-powered daily planner is ready!</p>
      </div>
      <div style="background: white; padding: 32px;">
        <p style="color: #444; font-size: 17px; margin: 0 0 16px;">Here's how Planny works:</p>
        <div style="border-left: 4px solid #FFB6C1; padding: 16px 20px; background: #FFF0F5; border-radius: 0 10px 10px 0; margin-bottom: 20px;">
          <p style="margin: 0 0 10px; color: #333; font-size: 15px;">🌙 <strong>Every night at 10 PM</strong> — You'll get an email showing your day's completed tasks and a link to plan tomorrow (takes 2 min!).</p>
          <p style="margin: 0; color: #333; font-size: 15px;">☀️ <strong>Every morning at 7 AM</strong> — You'll wake up to your task list for the day + an AI-generated motivational quote.</p>
        </div>
        <p style="color: #555; font-size: 15px;">No app to download. No dashboard. <strong>Everything in your inbox.</strong></p>
        <div style="text-align: center; margin: 28px 0 20px;">
          <a href="${planUrl}" style="background: linear-gradient(135deg, #FFB6C1, #f9a8d4); color: white; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Plan My First Day 🌸
          </a>
        </div>
        <p style="color: #aaa; font-size: 13px; text-align: center; margin: 0;">You're all set — see you tonight at 10 PM! 💌</p>
      </div>
    </div>`;
}

export const authOptions: NextAuthOptions = {
  // @ts-ignore
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: process.env.EMAIL_FROM || '"Planny 🐾" <hello@planny.app>',
      sendVerificationRequest: async ({ identifier: email, url, provider: { server, from } }) => {
        const result = await sendEmail({
          to: email,
          subject: "Sign in to Planny 🐾",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; border: 1px solid #f3e8ff;">
              <div style="background: linear-gradient(135deg, #FFB6C1, #f9a8d4); padding: 40px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Planny! 🐾</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">Your AI-powered daily planner is ready.</p>
              </div>
              <div style="background: white; padding: 32px;">
                <p style="color: #444; font-size: 17px; margin: 0 0 16px;">Here's how Planny works:</p>
                <div style="border-left: 4px solid #FFB6C1; padding: 16px 20px; background: #FFF0F5; border-radius: 0 10px 10px 0; margin-bottom: 20px;">
                  <p style="margin: 0 0 10px; color: #333; font-size: 15px;">🌙 <strong>Every night at 10 PM</strong> — You'll get an email showing your day's completed tasks and a link to plan tomorrow (takes 2 min!).</p>
                  <p style="margin: 0; color: #333; font-size: 15px;">☀️ <strong>Every morning at 7 AM</strong> — You'll wake up to your task list for the day + an AI-generated motivational quote.</p>
                </div>
                <p style="color: #555; font-size: 15px;">No app to download. No dashboard. <strong>Everything in your inbox.</strong></p>
                <div style="text-align: center; margin: 32px 0 24px;">
                  <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #FFB6C1, #f9a8d4); color: white; padding: 16px 36px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(249,168,212,0.4);">
                    Log In & Plan My First Day 🌸
                  </a>
                </div>
                <p style="color: #aaa; font-size: 12px; text-align: center; margin: 0;">If you didn't request this email, you can safely ignore it.</p>
              </div>
            </div>
          `
        });
        if (!result) throw new Error("Failed to send verification email");
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  events: {
    async createUser({ user }) {
      // Welcome email fires ONLY on first-ever creation of the user (via Google)
      if (user.email) {
        try {
          await sendEmail({
            to: user.email,
            subject: 'Welcome to Planny 🐾 – Your daily AI planner is ready!',
            html: buildWelcomeEmail(user.name || '', user.email),
          });
          console.log(`Welcome email sent to Google user: ${user.email}`);
        } catch (err) {
          console.error('Failed to send welcome email to Google user:', err);
        }
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
