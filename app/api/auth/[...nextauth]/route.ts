import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUser } from "@/lib/db";

const handler = NextAuth({
  providers: [
    // Provider de credenciales (username/password)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Nombre de Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Verificar credenciales contra la base de datos
          const user = await verifyUser(credentials.username, credentials.password);
          
          if (user) {
            return {
              id: user.id.toString(),
              name: user.name,
              username: user.username,
            };
          }

          return null;
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      }
    })
  ],
  
  pages: {
    signIn: "/login",      // Página personalizada de login
  },
  
  session: {
    strategy: "jwt",
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username as string;
      }
      return session;
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET || "tu-secreto-aqui",
});

export { handler as GET, handler as POST };
