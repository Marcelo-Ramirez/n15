"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Shield, Loader2 } from 'lucide-react'; // Iconos

// Importa componentes Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// --- Tipos y Helpers (Mantenidos) ---
type UserSession = {
  role?: string;
  requires2FA?: boolean;
}

// Componente principal para manejar la lógica (Envuelto en Suspense en el export)
function TwoFaLogic() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/sys';
  const { update } = useSession();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- LÓGICA DE REDIRECCIÓN Y VERIFICACIÓN (Mantenida) ---
  useEffect(() => {
    // La función se encapsula para poder usar async dentro de useEffect
    const checkAuthAndRedirect = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        const user = data?.user as UserSession | undefined;

        // Si no se requiere 2FA, redireccionar
        if (!user?.requires2FA) {
          router.push('/sys/login?callbackUrl=/sys/2fa');
        }
      } catch {
        // Fallback al login si hay error de conexión o sesión
        router.push('/sys/login?callbackUrl=/sys/2fa');
      }
    };
    checkAuthAndRedirect();
  }, [router, callbackUrl]);

  // --- LÓGICA DE SUBMIT (Mantenida) ---
  const submit = async () => {
    if (code.length !== 6) {
        setError("El código debe tener 6 dígitos.");
        return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/auth/2fa/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data?.error || 'Token inválido');

      // Marcar que ya no requiere 2FA (funcionalidad original)
      await update({ requires2FA: false });

      router.push(callbackUrl);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  // --- JSX con Shadcn UI y Tailwind ---
  return (
    // Contenedor principal centrado
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <Card className="w-full max-w-sm p-6 shadow-2xl dark:bg-card border-2 border-primary/20">
        <CardHeader className="space-y-3 text-center">
          <Shield className="h-12 w-12 text-primary mx-auto" />
          <CardTitle className="text-2xl font-bold text-foreground">Confirmar Acceso</CardTitle>
          <CardDescription className="text-muted-foreground">
            Ingresa el código de 6 dígitos de tu aplicación de autenticación.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            
            {/* Campo de Código */}
            <div className="space-y-2">
              <Label htmlFor="code-2fa">Código de seguridad</Label>
              <Input
                id="code-2fa"
                placeholder="••••••"
                value={code}
                 onChange={e => setCode(e.target.value.replaceAll(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest h-14"
                type="text"
                inputMode="numeric"
              />
            </div>
            
            {/* Mensaje de Error */}
            {error && (
              <p className="text-sm text-destructive font-medium text-center">{error}</p>
            )}
            
            {/* Botón de Confirmación */}
            <Button 
              onClick={submit} 
              disabled={loading || code.length !== 6} 
              className="w-full h-10 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente LoginPage que usa Suspense
export default function TwoFaPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    }>
      <TwoFaLogic />
    </Suspense>
  );
}