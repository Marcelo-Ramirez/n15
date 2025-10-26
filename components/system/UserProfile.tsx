'use client';

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from 'next/image'; // Para el QR Code
import { User, Mail, Shield, Loader2, KeyRound, Pencil } from 'lucide-react'; // Iconos de Lucide

// Importa los componentes Shadcn UI desde tu proyecto (ajusta la ruta si es necesario)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner"; // Importa toast desde sonner

// --- Tipos y Helpers ---
// Mapeo de roles a variantes de Badge (ajusta colores/variantes según tu tema)
const getRoleVariant = (role?: string): "default" | "destructive" | "outline" | "secondary" => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'destructive'; // Rojo
    case 'almacen':
      return 'default'; // Azul (primario por defecto)
    case 'ventas':
      return 'secondary'; // Gris/Verde (ajusta según tu tema)
    default:
      return 'outline'; // Borde gris
  }
};

// --- Componente ---
export default function UserProfile() {
  const { data: session, status, update } = useSession();

  const [isDialogOpen, setIsDialogOpen] = useState(false); // Controla el estado del Dialog
  const [qrCode, setQrCode] = useState("");
  const [isLoadingQr, setIsLoadingQr] = useState(false); // Carga específica para QR
  const [isConfirming2FA, setIsConfirming2FA] = useState(false); // Carga para confirmar
  const [isDisabling2FA, setIsDisabling2FA] = useState(false); // Carga para desactivar
  const [token, setToken] = useState("");

  // --- Lógica de API (adaptada para toast de sonner) ---
  const handleEnable2FA = async () => {
    setIsDialogOpen(true); // Abre Dialog
    setIsLoadingQr(true);
    setQrCode("");
    try {
      const response = await fetch("/api/auth/2fa/generate", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo generar el código QR.");
      setQrCode(data.qrDataUrl);
    } catch (error) {
      toast.error("Error al generar QR", {
        description: error instanceof Error ? error.message : "Ocurrió un error desconocido.",
      });
      setIsDialogOpen(false); // Cierra si falla
    } finally {
      setIsLoadingQr(false);
    }
  };

  const handleConfirm2FA = async () => {
    setIsConfirming2FA(true);
    try {
      const response = await fetch("/api/auth/2fa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo confirmar 2FA.");
      toast.success("¡2FA activado correctamente!"); // Usa toast de sonner
      await update({ // Actualiza la sesión de NextAuth
        ...session,
        user: { ...session?.user, twoFactorEnabled: true }
      });
      setToken("");
      setIsDialogOpen(false); // Cierra Dialog
    } catch (error) {
      toast.error("Error al confirmar", { // Usa toast de sonner
        description: error instanceof Error ? error.message : "Fallo al confirmar 2FA.",
      });
    } finally {
      setIsConfirming2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsDisabling2FA(true);
    try {
      const response = await fetch('/api/auth/2fa/disable', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo desactivar 2FA.');
      toast.success("2FA ha sido desactivado."); // Usa toast de sonner
      await update({
         ...session,
         user: { ...session?.user, twoFactorEnabled: false }
      });
    } catch (error) {
      toast.error("Error al desactivar", { // Usa toast de sonner
        description: error instanceof Error ? error.message : 'Ocurrió un error.',
      });
    } finally {
        setIsDisabling2FA(false);
    }
  };

  // --- Renderizado Condicional ---
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10 border-destructive/50 bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Acceso Denegado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error al cargar los datos del usuario.</p>
        </CardContent>
      </Card>
    );
  }

  const userData = session.user;

  // --- JSX con Shadcn UI y Tailwind ---
  return (
    <>
      <Card className="w-full max-w-2xl mx-auto my-8 shadow-lg dark:bg-card rounded-lg border"> {/* Estilo Card */}
        <CardHeader className="pb-4 border-b dark:border-gray-800"> {/* Header con borde */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4"> {/* Layout responsivo */}
            <Avatar className="h-20 w-20 border-2 border-primary"> {/* Avatar más grande */}
              <AvatarFallback className="text-3xl font-semibold bg-primary text-primary-foreground">
                {userData.name?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl font-bold">{userData.name || 'Usuario'}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">@{userData.userName || 'username'}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6 px-4 sm:px-6"> {/* Padding responsivo */}

          {/* Detalles del Usuario */}
          <div className="space-y-4"> {/* Usamos space-y en lugar de grid para simplicidad */}
            <h3 className="text-lg font-semibold text-foreground mb-4">Información Personal</h3>
            {/* Campo */}
            <div className="space-y-1">
              <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">Nombre de Usuario</Label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input id="username" value={userData.userName || ''} readOnly className="pl-9 bg-muted/50 border-input cursor-default h-9 rounded-md text-sm" />
              </div>
            </div>
             {/* Campo */}
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-xs font-medium text-muted-foreground">Nombre Completo</Label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input id="fullName" value={userData.name || ''} readOnly className="pl-9 bg-muted/50 border-input cursor-default h-9 rounded-md text-sm" />
              </div>
            </div>
             {/* Campo */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" value={userData.email || ''} readOnly className="pl-9 bg-muted/50 border-input cursor-default h-9 rounded-md text-sm" />
              </div>
            </div>
            {/* Rol y Miembro Desde en la misma fila en pantallas grandes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Rol */}
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <Badge variant={getRoleVariant(userData.role)} className="uppercase text-xs font-bold px-2.5 py-0.5 rounded-md">
                    {userData.role || 'Indefinido'}
                  </Badge>
                </div>
                {/* Miembro Desde */}
                <div className="flex items-center space-x-2">
                   <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                   <div>
                     <p className="text-xs font-medium text-muted-foreground">Miembro desde</p>
                     <p className="text-sm font-semibold">
                       {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric'}) : 'N/A'}
                     </p>
                   </div>
                </div>
            </div>
          </div>

          <Separator />

          {/* Sección de Acciones */}
          <div className="space-y-3">
             <h3 className="text-lg font-semibold text-foreground">Acciones</h3>
             <Button variant="outline" size="sm" disabled>
               <Pencil className="mr-2 h-4 w-4" /> Editar Perfil
             </Button>
          </div>

          <Separator />

           {/* Sección de Seguridad */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Seguridad</h3>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap"> {/* Flex wrap */}
              {userData.twoFactorEnabled ? (
                <Button onClick={handleDisable2FA} variant="destructive" size="sm" disabled={isDisabling2FA}>
                   {isDisabling2FA && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Desactivar 2FA
                </Button>
              ) : (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleEnable2FA} size="sm">
                      <Shield className="mr-2 h-4 w-4" /> Activar 2FA
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm w-[95%] rounded-lg"> {/* Más pequeño */}
                    <DialogHeader>
                      <DialogTitle className="text-xl">Activar 2FA</DialogTitle> {/* Más corto */}
                      <DialogDescription>
                        Escanea el QR con tu app e ingresa el código.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-5">
                      {isLoadingQr ? (
                        <div className="flex justify-center items-center h-40">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        <>
                          {qrCode ? (
                            <div className="flex justify-center p-2 bg-white rounded-lg border max-w-[180px] mx-auto"> {/* QR más pequeño */}
                              <Image src={qrCode} alt="Código QR 2FA" width={160} height={160} />
                            </div>
                          ) : (
                             <p className="text-center text-destructive font-medium p-3 border border-destructive/50 bg-destructive/10 rounded-md text-sm">No se pudo cargar el código QR.</p>
                          )}
                          <div className="space-y-2 px-2">
                            <Label htmlFor="token-2fa" className="text-center block font-medium text-sm">Código de 6 dígitos</Label>
                            <Input
                              id="token-2fa"
                              placeholder="• • • • • •"
                              value={token}
                              onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                              maxLength={6}
                              className="text-center tracking-[0.5em] text-2xl font-mono font-semibold h-12 w-full max-w-[200px] mx-auto rounded-md" // Input OTP más definido
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
                       <DialogClose asChild>
                         <Button variant="outline" className="w-full sm:w-auto">Cancelar</Button>
                       </DialogClose>
                      <Button
                        onClick={handleConfirm2FA}
                        disabled={!token || token.length !== 6 || isLoadingQr || isConfirming2FA}
                        className="w-full sm:w-auto"
                      >
                        {isConfirming2FA ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirmar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
               <Button variant="outline" size="sm" disabled>
                 <KeyRound className="mr-2 h-4 w-4" /> Cambiar Contraseña
               </Button>
            </div>
             {/* Indicador 2FA */}
            {userData.twoFactorEnabled && (
              <Badge variant="outline" className="border-green-300 bg-green-50 text-green-800 w-fit dark:border-green-700 dark:bg-green-950 dark:text-green-400">
                 <div className="flex items-center gap-1.5 px-1">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-medium">2FA Activado</span>
                 </div>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Asegúrate de tener <Sonner /> en tu layout.tsx */}
    </>
  );
}