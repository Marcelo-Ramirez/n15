// PublicHeader.tsx
'use client';

import { useRouter } from "next/navigation";
import Image from 'next/image';
import Link from 'next/link';
import { Menu, ShoppingCart, User, Package, ListOrdered} from 'lucide-react'; // Iconos

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
  { href: '/cart', label: 'Carrito', icon: ShoppingCart },
  { href: '/profile', label: 'Mi Cuenta', icon: User },
];

export function PublicHeader() {
  const router = useRouter();

  const commonClasses = "text-sm font-medium hover:text-primary transition-colors";

  return (
    // Reemplaza Box con div. Sticky, Shadow y zIndex
    <header className="bg-background dark:bg-gray-950 shadow-sm sticky top-0 z-50 border-b dark:border-gray-800">
      {/* Reemplaza Container con div centrado y ancho máximo */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HStak principal con justify-between y padding */}
        <div className="flex items-center justify-between h-20"> {/* Usamos h-20 fijo */}
          
          {/* LOGO (Izquierda) */}
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => router.push("/")}>
            <Image
              src="/images/logos/logo.png"
              alt="MuytunaSys"
              width={120} // Ancho fijo para Next Image
              height={40} // Altura fija
              className="object-contain"
            />
          </div>

          {/* MENÚ PRINCIPAL (Escritorio) */}
          <nav className="hidden md:flex items-center space-x-6">
            {NavLinks.map((link) => (
              <Link key={link.href} href={link.href} passHref legacyBehavior>
                <a className={commonClasses}>{link.label}</a>
              </Link>
            ))}
          </nav>
          
          {/* MENÚ RESPONSIVO (Móvil) */}
          <div className="md:hidden flex items-center space-x-3">
             
            {/* 1. Botón Carrito (Visible en Móvil) */}
            <Button variant="ghost" size="icon" onClick={() => router.push('/cart')}>
              <ShoppingCart className="h-5 w-5" />
            </Button>

            {/* 2. Menú Desplegable (para Navegación/Cuenta) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {NavLinks.map((link) => (
                    <DropdownMenuItem key={link.href} onClick={() => router.push(link.href)}>
                        <link.icon className="mr-2 h-4 w-4" />
                        <span>{link.label}</span>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/sys/login')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Ingresar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>
    </header>
  );
}