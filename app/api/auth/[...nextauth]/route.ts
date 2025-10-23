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
        username: { label: "Nombre de Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
        token2FA: { label: "Token 2FA", type: "text" },
      },
      async authorize(credentials) {

        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const user = await verifyUser(credentials.username, credentials.password);

          if (!user) {
            return null;
          }

          if (user.twoFactorEnabled) {

            if (!credentials.token2FA) {
              return {
                id: user.id.toString(),
                name: user.name,
                username: user.userName,
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
            username: user.userName,
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
  session: { strategy: "jwt" as const },

  callbacks: {
    async jwt({ token, user, trigger, session: newSessionData }: { token: any; user?: any; trigger?: string; session?: any }) {
      // Si la sesión se actualiza (desde UserProfile.tsx), actualizamos el token
      if (trigger === "update" && newSessionData) {
        // esto es nuevo
        if (newSessionData?.requires2FA !== undefined) {
          token.requires2FA = newSessionData.requires2FA;
        }
        if (newSessionData?.twoFactorEnabled !== undefined) {
          token.twoFactorEnabled = newSessionData.twoFactorEnabled;
        }
      }
    
      // En el inicio de sesión inicial, poblamos el token
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.username = user.username;
        token.role = user.role;
        token.requires2FA = user.requires2FA || false;
        token.twoFactorEnabled = user.twoFactorEnabled || false;
        token.createdAt = user.createdAt;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).name = token.name;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).requires2FA = token.requires2FA || false;
        (session.user as any).twoFactorEnabled = token.twoFactorEnabled || false;
        (session.user as any).createdAt = token.createdAt;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET || "tu-secreto-aqui",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };