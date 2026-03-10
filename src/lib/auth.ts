import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

type AuthUserShape = {
  id: string;
  tokenBalance?: number | null;
  currency?: string | null;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTHORIZE START]: Attempting to sign in user...");

        if (!credentials?.email || !credentials?.password) {
          console.error("[AUTHORIZE FAIL]: Missing email or password.");
          throw new Error("Invalid credentials");
        }

        console.log(
          `[AUTHORIZE STEP 1]: Searching for user with email: ${credentials.email}`,
        );
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) {
          console.error(
            `[AUTHORIZE FAIL]: User not found or password not set for email: ${credentials.email}`,
          );
          throw new Error("Invalid credentials");
        }

        console.log(`[AUTHORIZE STEP 2]: User found. Comparing passwords...`);
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isCorrectPassword) {
          console.error(
            `[AUTHORIZE FAIL]: Password incorrect for email: ${credentials.email}`,
          );
          throw new Error("Invalid credentials");
        }

        console.log(
          `[AUTHORIZE SUCCESS]: Passwords match for user: ${user.id}. Returning user object.`,
        );
        return user;
      },
    }),
  ],
  debug: process.env.NEXTAUTH_DEBUG === "true",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as AuthUserShape;
        token.id = typedUser.id;
        token.tokenBalance = typedUser.tokenBalance ?? 0;
        token.currency = typedUser.currency ?? "GBP";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        const typedToken = token as JWT;
        session.user.id = typedToken.id;
        session.user.tokenBalance = typedToken.tokenBalance;
        session.user.currency = typedToken.currency;
      }
      return session;
    },
  },
};
