'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'stockroom' | 'sales';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/sys/login' 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Si no hay usuario, redirigir al login
      if (!user) {
        router.replace(redirectTo);
        return;
      }

      // Si hay un rol requerido y el usuario no lo tiene, redirigir
      if (requiredRole && user.role !== requiredRole) {
        router.replace('/sys/dashboard'); // O a una página de acceso denegado
        return;
      }
    }
  }, [user, isLoading, requiredRole, router, redirectTo]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Si no hay usuario, no mostrar nada (se está redirigiendo)
  if (!user) {
    return null;
  }

  // Si hay rol requerido y no coincide, no mostrar nada
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
}
