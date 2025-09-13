import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { verifyUser, getUserByEmail, createUser } from "@/lib/db";

const handler = NextAuth({
  providers: [
    // Provider de credenciales (email/password)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Verificar credenciales contra SQLite
          const user = await verifyUser(credentials.email, credentials.password);
          
          if (user) {
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
            };
          }

          return null;
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      }
    }),
    
    // Provider de Google (opcional)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  
  pages: {
    signIn: "/login",      // Página personalizada de login
  },
  
  session: {
    strategy: "jwt",
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Si es login con Google, crear usuario si no existe
      if (account?.provider === "google") {
        try {
          let existingUser = await getUserByEmail(user.email!);
          
          if (!existingUser) {
            // Crear usuario con datos de Google
            existingUser = await createUser(
              user.email!,
              user.name || "Usuario Google",
              Math.random().toString(36) // Contraseña aleatoria para usuarios de Google
            );
          }
          
          if (existingUser) {
            user.id = existingUser.id.toString();
            return true;
          }
        } catch (error) {
          console.error("Error en signIn callback:", error);
          return false;
        }
      }
      
      return true;
    },
    
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET || "tu-secreto-aqui",
});

export { handler as GET, handler as POST };
