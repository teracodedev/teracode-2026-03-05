import type { NextAuthConfig } from "next-auth";

// Edge Runtime で動作する軽量な設定（Prisma・bcrypt 不使用）
export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.isAdmin = token.isAdmin as boolean;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
};
