"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link"; // Usa Link de Next.js
import { signIn, useSession, type SignInResponse } from "next-auth/react";
import { Loader2 } from "lucide-react"; // Icono de carga

// Importa componentes Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// --- Tipos y Helpers (sin cambios) ---
type UserSession = {
  role?: string;
  requires2FA?: boolean;
}

const roleToPath: { [key: string]: string } = {
    ventas: 'sales',
    almacen: 'stockroom',
    admin: 'admin',
};

// --- Componente LoginForm con Shadcn UI ---
function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ userName: '', password: '' });
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Lógica de redirección (sin cambios)
  const getRedirectUrl = useCallback((role: string) => {
    const callbackUrl = searchParams.get('callbackUrl');
    if (callbackUrl) return callbackUrl;
    const pathRole = roleToPath[role] || role;
    return `/sys/${pathRole}/user`;
  }, [searchParams]);

  // Efecto para redireccionar al autenticar (sin cambios)
  useEffect(() => {
    const user = session?.user as unknown as UserSession | undefined;
    if (status === 'authenticated' && user) {
      if (user.requires2FA) {
        router.push('/sys/2fa');
      } else {
        const redirectUrl = getRedirectUrl(user.role || '');
        router.push(redirectUrl);
      }
    }
  }, [status, session, getRedirectUrl, router]);

  // Manejador del submit (sin cambios en la lógica, solo el toast si lo usaras)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result: SignInResponse | undefined = await signIn('credentials', {
      ...formData,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Credenciales inválidas. Inténtalo de nuevo."); // Mensaje más descriptivo
    }
    // No hay 'else', el useEffect maneja la redirección exitosa
  };

  // --- JSX con Shadcn UI y Tailwind ---
  return (
    // Contenedor principal centrado
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 px-4">
      <Card className="w-full max-w-sm shadow-lg"> {/* Ancho máximo para el Card */}
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">System Access</CardTitle>
          <CardDescription>Inicia sesión para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4"> {/* Espaciado entre elementos del form */}
            {/* Campo Usuario */}
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                placeholder="tu_usuario"
                value={formData.userName}
                onChange={e => setFormData(d => ({ ...d, userName: e.target.value }))}
                required
                autoComplete="username" // Ayuda al autocompletado del navegador
              />
            </div>
            {/* Campo Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData(d => ({ ...d, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
            {/* Mensaje de Error */}
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
            {/* Botón de Submit */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center text-sm pt-4 border-t"> {/* Footer responsivo */}
          <Link href="/sys/register" className="text-primary hover:underline font-medium mb-2 sm:mb-0">
            ¿No tienes cuenta? Regístrate
          </Link>
          <Link href="/" className="text-muted-foreground hover:underline">
            Volver al inicio
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// Componente LoginPage que usa Suspense (sin cambios)
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}> {/* Añade un fallback a Suspense */}
      <LoginForm />
    </Suspense>
  );
}