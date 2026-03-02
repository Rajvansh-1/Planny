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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; padding: 40px 20px;">
      <div style="background-color: #ffffff; border-radius: 24px; border: 4px solid #1e1b4b; overflow: hidden; box-shadow: 4px 4px 0 #1e1b4b;">
        <div style="background: #fdf2f8; padding: 40px 32px; text-align: center; border-bottom: 4px solid #1e1b4b;">
          <h1 style="color: #1e1b4b; margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -0.02em; text-transform: uppercase;">Welcome to Planny, ${firstName}! ✨</h1>
          <p style="color: #4b5563; margin: 12px 0 0; font-size: 18px; font-weight: 700;">Your daily planner is ready.</p>
        </div>
        <div style="padding: 40px 32px;">
          <p style="color: #1e1b4b; font-size: 20px; margin: 0 0 24px; font-weight: 800;">Here's how you'll smash your goals:</p>
          <div style="border-left: 6px solid #f472b6; padding: 20px 24px; background: #fff; border: 3px solid #1e1b4b; border-radius: 16px; margin-bottom: 28px; box-shadow: 2px 2px 0 #1e1b4b;">
            <p style="margin: 0 0 16px; color: #1e1b4b; font-size: 16px; font-weight: 700;">🌙 <strong style="color: #f472b6;">10 PM Check-in</strong> — You'll get an email to review today and plan tomorrow (takes exactly 2 mins).</p>
            <p style="margin: 0; color: #1e1b4b; font-size: 16px; font-weight: 700;">☀️ <strong style="color: #fca5a5;">7 AM Digest</strong> — Wake up to your daily tasks and a personalized quote to get you fired up.</p>
          </div>
          <div style="background: #1e1b4b; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 40px;">
            <p style="color: #fff; font-size: 16px; margin: 0; font-weight: 600; line-height: 1.5;">No apps to install. No messy dashboards.<br><strong style="color: #f472b6; font-size: 18px;">Everything happens right here in your inbox.</strong></p>
          </div>
          <div style="text-align: center; margin: 10px 0 30px;">
            <a href="${planUrl}" style="display: inline-block; background: #f472b6; color: #1e1b4b; padding: 20px 48px; border-radius: 9999px; text-decoration: none; font-weight: 900; font-size: 20px; border: 3px solid #1e1b4b; box-shadow: 4px 4px 0 #1e1b4b; text-transform: uppercase;">
              Plan My First Day 🚀
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0; font-weight: 700;">You're all set. We'll see you tonight at 10 PM! 💌</p>
        </div>
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
          subject: "Log in to Planny 🌸",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; padding: 40px 20px;">
              <div style="background-color: #ffffff; border-radius: 24px; border: 4px solid #1e1b4b; overflow: hidden; box-shadow: 4px 4px 0 #1e1b4b;">
                <div style="background: #c084fc; padding: 48px 32px; text-align: center; border-bottom: 4px solid #1e1b4b;">
                  <h1 style="color: #1e1b4b; margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -0.02em; text-transform: uppercase;">Log in to Planny 🐾</h1>
                  <p style="color: #1e1b4b; margin: 12px 0 0; font-size: 18px; font-weight: 800;">Your daily planner is waiting.</p>
                </div>
                <div style="padding: 40px 32px;">
                  <p style="color: #1e1b4b; font-size: 20px; margin: 0 0 24px; font-weight: 800; text-align: center;">Click the button below to sign securely into your account.</p>
                  
                  <div style="text-align: center; margin: 20px 0 40px;">
                    <a href="${url}" style="display: inline-block; background: #c084fc; color: #1e1b4b; padding: 20px 48px; border-radius: 9999px; text-decoration: none; font-weight: 900; font-size: 20px; border: 3px solid #1e1b4b; box-shadow: 4px 4px 0 #1e1b4b; text-transform: uppercase;">
                      Secure Log In 🔑
                    </a>
                  </div>
                  
                  <div style="background: #fff; border: 3px solid #1e1b4b; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 2px 2px 0 #1e1b4b;">
                    <p style="color: #1e1b4b; font-size: 16px; margin: 0 0 12px; font-weight: 800; text-transform: uppercase;">How Planny works:</p>
                    <p style="margin: 0 0 8px; color: #1e1b4b; font-size: 15px; font-weight: 600;">🌙 <strong style="color: #f472b6;">10 PM</strong>: Evening check-in email.</p>
                    <p style="margin: 0; color: #1e1b4b; font-size: 15px; font-weight: 600;">☀️ <strong style="color: #fca5a5;">7 AM</strong>: Morning digest & quote.</p>
                  </div>
                  
                  <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0; font-weight: 700;">If you didn't request this email, you can safely ignore it.</p>
                </div>
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
