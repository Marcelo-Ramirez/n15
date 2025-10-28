// PublicHeader.tsx
'use client';

import { useRouter } from "next/navigation";
import Image from 'next/image';
import logoImg from '@/app/images/logo/logo.png';
import Link from 'next/link';
import { Menu, ShoppingCart, User, Package, ListOrdered, LogOut } from 'lucide-react'; // Iconos
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { ClientLoginModal } from '@/components/auth/ClientLoginModal';
import { ClientRegisterModal } from '@/components/auth/ClientRegisterModal';

// Importa componentes Shadcn UI
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const NavLinks = [
  { href: '/catalog', label: 'Catálogo', icon: Package },
  { href: '/orders', label: 'Mis Pedidos', icon: ListOrdered },
  { href: '/profile', label: 'Mi Cuenta', icon: User },
];

export function PublicHeader() {
  const router = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { data: session, status } = useSession();

  const commonClasses = "text-sm font-medium hover:text-primary transition-colors";

  return (
    <>
    {/* Reemplaza Box con div. Sticky, Shadow y zIndex */}
    <header className="bg-background dark:bg-gray-950 shadow-sm sticky top-0 z-50 border-b dark:border-gray-800">
      {/* Reemplaza Container con div centrado y ancho máximo */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HStak principal con justify-between y padding */}
        <div className="flex items-center justify-between h-20"> {/* Usamos h-20 fijo */}
          
          {/* LOGO (Izquierda) */}
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => router.push("/")}>
            <Image
              src={logoImg}
              alt="MuytunaSys"
              width={65}
              height={40}
              className="object-contain"
              priority={true}
            />
          </div>

          {/* MENÚ PRINCIPAL (Escritorio) */}
          <nav className="hidden md:flex items-center space-x-6">
              {NavLinks.map((link) => (
              link.href === '/profile' ? (
                status === 'authenticated' ? (
                  <button key={link.href} onClick={() => signOut({ callbackUrl: `${window.location.origin}` })} className={`${commonClasses} flex items-center gap-2`}>
                    {/* redirect to same origin to avoid hardcoded localhost */}
                    <LogOut className="h-4 w-4 text-gray-200" />
                    <span>Cerrar Sesión</span>
                  </button>
                ) : (
                  <button key={link.href} onClick={() => setIsLoginOpen(true)} className={`${commonClasses} flex items-center gap-2`}>
                    <link.icon className="h-4 w-4 text-gray-200" />
                    <span>{link.label}</span>
                  </button>
                )
              ) : (
                <Link key={link.href} href={link.href} passHref legacyBehavior>
                  <a className={`${commonClasses} flex items-center gap-2`}>
                    {/* desktop icon next to label */}
                    <link.icon className="h-4 w-4 text-gray-200" />
                    <span>{link.label}</span>
                  </a>
                </Link>
              )
            ))}
          </nav>
          
          {/* MENÚ RESPONSIVO (Móvil) */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Botón Catálogo visible en móvil */}
            <Button variant="ghost" size="sm" onClick={() => router.push('/catalog')} className="flex items-center gap-2 px-3">
              <Package className="h-4 w-4" />
              <span className="text-sm">Catálogo</span>
            </Button>

            {/* 2. Menú Desplegable (para Navegación/Cuenta) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background dark:bg-gray-950 shadow-lg rounded-md">
        {NavLinks.map((link) => (
          <DropdownMenuItem key={link.href} onClick={() => link.href === '/profile' ? (status === 'authenticated' ? signOut({ callbackUrl: `${window.location.origin}` }) : setIsLoginOpen(true)) : router.push(link.href)}>
            <link.icon className="mr-2 h-4 w-4" />
            <span>{link.label}</span>
          </DropdownMenuItem>
        ))}
                <DropdownMenuSeparator />
        {status === 'authenticated' ? (
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: `${window.location.origin}` })}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => setIsLoginOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Ingresar</span>
          </DropdownMenuItem>
        )}
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>
    </header>
    {/* Auth modals controlled by header */}
    <ClientLoginModal
      isOpen={isLoginOpen}
      onClose={() => setIsLoginOpen(false)}
      onLoginSuccess={() => { setIsLoginOpen(false); location.reload(); }}
      onOpenRegister={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }}
    />
    <ClientRegisterModal
      isOpen={isRegisterOpen}
      onClose={() => setIsRegisterOpen(false)}
      onOpenLogin={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }}
    />
    </>
  );
}