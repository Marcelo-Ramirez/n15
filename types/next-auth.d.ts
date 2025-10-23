import { DefaultSession } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extiende la interfaz de Sesión (usada por useSession y getSession).
   */
  interface Session {
    user: {
      // Propiedades de DefaultSession
      id: string; // La haces obligatoria, lo cual es correcto.
      name?: string | null;
      email?: string | null;
      image?: string | null;
      
      // ✨ Propiedades PERSONALIZADAS
      username: string;
      role: string;
      twoFactorEnabled: boolean;
      requires2FA: boolean; // Usada en tu lógica de login para forzar el token
      createdAt: string; // 💡 ¡ESTO RESUELVE EL ERROR DE TS2339!
      
    } & DefaultSession["user"];
  }

  /**
   * Extiende la interfaz de Usuario (el objeto que viene de 'authorize').
   */
  interface User {
    id: string;
    username: string;
    role: string;
    twoFactorEnabled: boolean;
    requires2FA: boolean;
    createdAt: Date | string; 
  }
}

declare module "next-auth/jwt" {
  /**
   * Extiende la interfaz JWT (el contenido del token encriptado).
   */
  interface JWT extends NextAuthJWT {
    id: string;
    username: string;
    role: string;
    twoFactorEnabled: boolean;
    requires2FA: boolean;
    createdAt: string;
  }
}