// pages/api/auth/[...nextauth].ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUser } from "@/lib/db";
import { verify2FA } from "@/lib/twofactor/verify";
import { decrypt } from "@/lib/twofactor/encrypt"; // ⚡ Descifrar el secreto TOTP

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        userName: { label: "Nombre de Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
        token2FA: { label: "Token 2FA", type: "text" },
      },
      async authorize(credentials) {

        if (!credentials?.userName || !credentials?.password) {
          return null;
        }

        try {
          const user = await verifyUser(credentials.userName, credentials.password);

          if (!user) {
            return null;
          }

          if (user.twoFactorEnabled) {

            if (!credentials.token2FA) {
              return {
                id: user.id.toString(),
                name: user.name,
                userName: user.userName, 
                role: user.role,
                twoFactorEnabled: user.twoFactorEnabled,
                requires2FA: true,
                createdAt: user.createdAt,
              };
            }

            // ⚡ Descifrar secreto TOTP y validar token
            const secret = decrypt(user.twoFactorSecret || "");
            const isValid = verify2FA(credentials.token2FA, secret);

            if (!isValid) {
              return null;
            }
          }

          return {
            id: user.id.toString(),
            name: user.name,
            userName: user.userName, 
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled,
            requires2FA: false,
            createdAt: user.createdAt,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  pages: { signIn: "/login" },
  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user, trigger, session: newSessionData }) {
      if (trigger === "update" && newSessionData) {
        if (newSessionData?.requires2FA !== undefined) {
          token.requires2FA = newSessionData.requires2FA;
        }
        if (newSessionData?.twoFactorEnabled !== undefined) {
          token.twoFactorEnabled = newSessionData.twoFactorEnabled;
        }
      }
    
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.userName = user.userName; 
        token.role = user.role;
        token.requires2FA = user.requires2FA || false;
        token.twoFactorEnabled = user.twoFactorEnabled || false;
       token.createdAt = user.createdAt instanceof Date 
            ? user.createdAt.toISOString() 
            : user.createdAt;
      }
      return token; 
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.userName = token.userName; 
        session.user.role = token.role;
        session.user.requires2FA = token.requires2FA || false;
        session.user.twoFactorEnabled = token.twoFactorEnabled || false;
        session.user.createdAt = token.createdAt;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET || "tu-secreto-aqui",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };