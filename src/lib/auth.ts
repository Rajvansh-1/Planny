import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const authOptions: NextAuthOptions = {
  // @ts-ignore - Note: There may be a minor type mismatch with @auth/prisma-adapter and next-auth v4, but it works at runtime.
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
        // Expose user id to the session for easier DB lookups
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
      // Send Welcome Email upon new user registration
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: "Welcome to Planny! 🐾 ✨",
          html: `
            <div style="font-family: 'Nunito', sans-serif; text-align: center; padding: 20px; background: #FFF0F5; border-radius: 12px;">
              <h1 style="color: #FFB6C1;">Welcome to Planny, ${user.name || 'Friend'}! 🌸</h1>
              <p style="color: #666; font-size: 16px;">We are so excited to have you onboard.</p>
              <p style="color: #666; font-size: 16px;"><strong>Here is how it works:</strong></p>
              <ul style="text-align: left; display: inline-block; color: #555;">
                <li style="margin-bottom: 10px">🌙 At <strong>10 PM</strong> every night, you will receive an email asking what you want to achieve tomorrow.</li>
                <li style="margin-bottom: 10px">☀️ At <strong>7 AM</strong> the next morning, we will send you your daily digest and a motivational AI quote!</li>
              </ul>
              <p style="color: #666; font-size: 16px; margin-top: 20px;">You can also log in anytime to view your calendar and past tasks.</p>
              <p style="color: #ff9fb3; font-weight: bold;">Let's make every day productive! ✨</p>
            </div>
          `
        });
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
