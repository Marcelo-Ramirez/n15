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
                username: user.username,
                twoFactorEnabled: user.twoFactorEnabled,
                requires2FA: true,
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
            username: user.username,
            twoFactorEnabled: user.twoFactorEnabled,
            requires2FA: false,
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
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.requires2FA = user.requires2FA || false;
        token.twoFactorEnabled = user.twoFactorEnabled || false;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).requires2FA = token.requires2FA || false;
        (session.user as any).twoFactorEnabled = token.twoFactorEnabled || false;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET || "tu-secreto-aqui",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
