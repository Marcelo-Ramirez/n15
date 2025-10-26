'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Shield } from 'lucide-react'; // Iconos
import { Label } from "@/components/ui/label"; //
// Importa componentes Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Componente principal para manejar la lógica (Envuelto en Suspense abajo)
function TwoFaLogic() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/sys';
  // Obtenemos update de useSession para actualizar el estado del usuario
  const { update } = useSession(); 
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lógica de Redirección (Verifica si el usuario *debe* estar aquí)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Llama a una API para verificar el estado de la sesión, ya que useSession 
        // no siempre expone requires2FA en el cliente inmediatamente después del inicio de sesión.
        // Si tu sesión expone requires2FA, puedes usar: 
        // if (!session?.user?.requires2FA) router.push(...);
        const res = await fetch('/api/auth/session'); // Endpoint que devuelve la sesión
        const data = await res.json();
        
        // Verifica si la sesión existe y si *no* requiere 2FA
        if (!data?.user || !data.user.requires2FA) {
          // Si no requiere 2FA (ya autenticó o no lo tiene activado), lo enviamos a su destino.
          router.push(callbackUrl);
        }
      } catch {
        // Si la llamada falla (no hay sesión o error), lo enviamos al login
        router.push('/sys/login?callbackUrl=/sys/2fa');
      }
    };
    checkAuthStatus();
  }, [router, callbackUrl]);


  // Lógica de Confirmación
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
      
      if (!res.ok) throw new Error(data?.error || 'Token inválido.');

      // Actualizar la sesión en el cliente para marcar que ya no necesita 2FA
      await update({ requires2FA: false });

      router.push(callbackUrl);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- JSX con Shadcn UI y Tailwind ---
  return (
    // Contenedor principal: Centrado, full height, fondo oscuro
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <Card className="w-full max-w-sm p-6 shadow-2xl dark:bg-gray-900 border-primary">
        <CardHeader className="text-center space-y-3 pb-4">
          <Shield className="h-10 w-10 text-primary mx-auto" />
          <CardTitle className="text-xl font-bold">Autenticación en Dos Pasos</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Ingresa el código de 6 dígitos de tu aplicación de autenticación.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Campo de Código */}
          <div className="space-y-2">
            <Label htmlFor="code-2fa">Código de seguridad</Label>
            <Input
              id="code-2fa"
              placeholder="••••••"
              value={code}
              onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} // Limita y acepta solo números
              maxLength={6}
              className="text-center text-xl font-mono tracking-widest h-12"
              type="text" // Usar text y limitar caracteres es mejor para OTP
              inputMode="numeric" // Sugiere teclado numérico en móvil
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
        </CardContent>
      </Card>
    </div>
  );
}

// Envuelve el componente con Suspense para manejar useSearchParams
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