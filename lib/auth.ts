/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyUser } from '@/lib/db';
import { verify2FA } from '@/lib/twofactor/verify';
import { decrypt } from '@/lib/twofactor/encrypt';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        userName: { label: 'Nombre de Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
        token2FA: { label: 'Token 2FA', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.userName || !credentials?.password) return null;
        try {
          const user = await verifyUser(credentials.userName, credentials.password);
          if (!user) return null;
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
            const secret = decrypt(user.twoFactorSecret || '');
            const isValid = verify2FA(credentials.token2FA, secret);
            if (!isValid) return null;
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
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
  async jwt({ token, user, trigger, session: newSessionData }) {
      if (trigger === 'update' && newSessionData) {
        if (newSessionData?.requires2FA !== undefined) {
          (token as Record<string, unknown>).requires2FA = newSessionData.requires2FA as unknown;
        }
        if (newSessionData?.twoFactorEnabled !== undefined) {
          (token as Record<string, unknown>).twoFactorEnabled = newSessionData.twoFactorEnabled as unknown;
        }
      }
      if (user) {
        const t = token as Record<string, unknown>;
        t.id = user.id as unknown;
        t.name = user.name as unknown;
        t.userName = user.userName as unknown;
        t.role = user.role as unknown;
        t.requires2FA = (user.requires2FA as unknown) || false;
        t.twoFactorEnabled = (user.twoFactorEnabled as unknown) || false;
        t.createdAt = user.createdAt instanceof Date ? user.createdAt.toISOString() : (user.createdAt as unknown);
      }
  return token as any;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const t = token as Record<string, unknown>;
        session.user.id = t.id as any;
        session.user.name = t.name as any;
        session.user.userName = t.userName as any;
        session.user.role = t.role as any;
        session.user.requires2FA = (t.requires2FA as boolean) || false;
        session.user.twoFactorEnabled = (t.twoFactorEnabled as boolean) || false;
        session.user.createdAt = t.createdAt as any;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'tu-secreto-aqui',
};
