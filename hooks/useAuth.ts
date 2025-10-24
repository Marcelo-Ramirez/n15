"use client";
import { useSession } from "next-auth/react";

export const useAuth = () => {
  const { data: session, status } = useSession();

  // Verificar si el usuario tiene un rol específico del sistema
  const hasSystemRole = (requiredRole?: string) => {
    if (!session?.user) return false;
    
    // TODO: Ajustar según la estructura real de tu usuario
    // Asumiendo que el rol está en session.user.role
    const userRole = (session.user)?.role;
    
    if (!userRole) return false;
    
    const validRoles = ['admin', 'almacen', 'ventas'];
    if (!validRoles.includes(userRole)) return false;
    
    if (requiredRole) {
      return userRole === requiredRole;
    }
    
    return true;
  };

  return {
    isAuthenticated: !!session,
    isLoading: status === "loading",
    user: session?.user || null,
    session,
    hasSystemRole,
    userRole: (session?.user)?.role || null,
    isSystemUser: hasSystemRole(),
  };
};
