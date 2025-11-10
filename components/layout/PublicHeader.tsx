// PublicHeader.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import logoImg from '@/app/images/logo/logo.png';
import Link from 'next/link';
import { Menu, User, Package, ListOrdered, LogOut, Moon, Sun, X, ShoppingBag } from 'lucide-react'; // Iconos
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { ClientLoginModal } from '@/components/auth/ClientLoginModal';
import { ClientRegisterModal } from '@/components/auth/ClientRegisterModal';

import { Button } from "@/components/ui/button";

const NavLinks = [
  { href: '/catalog', label: 'Tienda', icon: Package },
  { href: '/orders', label: 'Mis Pedidos', icon: ListOrdered },
  { href: '/profile', label: 'Mi Cuenta', icon: User },
];

export function PublicHeader() {
  const router = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado animación abierta/cerrada
  const [isSidebarMounted, setIsSidebarMounted] = useState(false); // Controla montaje para animación
  const { status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();

  const commonClasses = "text-sm font-medium text-foreground hover:text-primary transition-colors";

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    if (isSidebarOpen) {
      setIsSidebarMounted(true);
      document.body.style.overflow = 'hidden'; // Bloquear scroll
      document.body.classList.add('mobile-menu-open');
    } else {
      timeout = setTimeout(() => setIsSidebarMounted(false), 300);
      document.body.style.overflow = ''; // Restaurar scroll
      document.body.classList.remove('mobile-menu-open');
    }

    return () => {
      document.body.style.overflow = '';
      if (timeout) clearTimeout(timeout);
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isSidebarOpen]);

  const isDark = resolvedTheme === 'dark';
  const overlayColor = isDark ? 'bg-black/70' : 'bg-white/50';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  const [totalItemsInCart, setTotalItemsInCart] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const storedCart = localStorage.getItem('userCart');
        if (storedCart) {
          const cart = JSON.parse(storedCart);
          const total = Object.values(cart as Record<string, { quantity: number }>).reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
          setTotalItemsInCart(total);
        } else {
          setTotalItemsInCart(0);
        }
      } catch {
        setTotalItemsInCart(0);
      }
    };

    updateCartCount();
    globalThis.addEventListener('storage', updateCartCount);
    globalThis.addEventListener('cartUpdate', updateCartCount);
    return () => {
      globalThis.removeEventListener('storage', updateCartCount);
      globalThis.removeEventListener('cartUpdate', updateCartCount);
    };
  }, []);

  const dynamicTitle = pathname === '/catalog' ? 'Gomitas Saludables' : 'MuytunaSys';

  return (
    <>
    {/* Header principal */}
    <header className="bg-white dark:bg-background backdrop-blur-sm shadow-sm sticky top-0 z-40">
      {/* Reemplaza Container con div centrado y ancho máximo */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HStack principal con ajustes responsivos */}
        <div className="flex items-center h-20 gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {pathname !== '/catalog' && (
              <button
                type="button"
                className="flex items-center space-x-4 cursor-pointer mx-auto md:mx-0"
                onClick={() => router.push("/")}
              >
                <Image
                  src={logoImg}
                  alt="MuytunaSys"
                  width={65}
                  height={40}
                  className="object-contain"
                  priority={true}
                />
              </button>
            )}

            <nav className="hidden md:flex items-center gap-6">
              {NavLinks.map((link) => {
                if (link.href === '/profile') {
                  if (status === 'authenticated') {
                    return (
                      <button
                        key={link.href}
                        onClick={() => signOut({ callbackUrl: `${globalThis.location.origin}` })}
                        className={`${commonClasses} flex items-center gap-2`}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={link.href}
                      onClick={() => setIsLoginOpen(true)}
                      className={`${commonClasses} flex items-center gap-2`}
                    >
                      <link.icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </button>
                  );
                }

                return (
                  <Link key={link.href} href={link.href} className={`${commonClasses} flex items-center gap-2`}>
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {pathname === '/catalog' && (
            <div className="flex flex-1 justify-center text-center">
              <h1 className="text-2xl font-bold text-foreground">
                {dynamicTitle}
              </h1>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 flex-1">
            <div className="hidden md:flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                className="text-foreground hover:bg-primary"
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>

            {pathname.includes('/catalog') && (
              <div className="hidden md:flex">
                <Button
                  variant="outline"
                  className="relative h-12 w-12 rounded-full shadow-none hover:bg-zinc-200/50 dark:hover:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                  onClick={() => globalThis.dispatchEvent(new Event('openCartModal'))}
                  size="icon"
                  title="Ver Carrito"
                >
                  <ShoppingBag className="h-6 w-6 text-foreground" />
                  {totalItemsInCart > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-zinc-900 bg-yellow-500 dark:bg-primary rounded-full">
                      {totalItemsInCart}
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* Botón flotante para menú móvil */}
    {!isSidebarOpen && (
      <div className="md:hidden fixed top-4 left-4 z-[55]">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className={`backdrop-blur-sm shadow-md border border-border ${isDark ? 'bg-background/90' : 'bg-background/80'} hover:bg-background`}
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    )}

    {/* Botón flotante de carrito móvil solo en catalog */}
    {pathname.includes('/catalog') && (
      <div className="md:hidden fixed top-4 right-4 z-[55]">
        <Button
          variant="outline"
          className="relative h-12 w-12 rounded-full shadow-md border-zinc-300 dark:border-zinc-600 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
          onClick={() => globalThis.dispatchEvent(new Event('openCartModal'))}
          size="icon"
          title="Ver Carrito"
        >
          <ShoppingBag className="h-6 w-6 text-foreground" />
          {totalItemsInCart > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-zinc-900 bg-yellow-500 dark:bg-primary rounded-full">
              {totalItemsInCart}
            </span>
          )}
        </Button>
      </div>
    )}

    {/* Sidebar Lateral (Móvil) */}
    {isSidebarMounted && (
      <>
        {/* Overlay */}
        <div
          className={`fixed inset-0 z-30 md:hidden transition-opacity duration-300 ${overlayColor} ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsSidebarOpen(false)}
          role="button"
          tabIndex={-1}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsSidebarOpen(false); }}
        />
        {/* Sidebar */}
        <div
          className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-background shadow-lg z-50 md:hidden flex flex-col border-r border-border transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Header del Sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Menú</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} aria-label="Cerrar menú">
              <X className="h-5 w-5" />
            </Button>
          </div>
          {/* Enlaces del Sidebar */}
          <nav className="flex-1 p-4 space-y-4">
            {NavLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  if (link.href === '/profile') {
                    if (status === 'authenticated') {
                      signOut({ callbackUrl: `${globalThis.location.origin}` });
                    } else {
                      setIsLoginOpen(true);
                    }
                  } else {
                    router.push(link.href);
                  }
                  setIsSidebarOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left p-2 rounded-md hover:bg-primary transition-colors text-foreground"
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </button>
            ))}
            <hr className="border-t border-border" />
            {/* Toggle Tema */}
            <label className="flex items-center justify-between w-full p-2 rounded-md hover:bg-primary transition-colors cursor-pointer text-foreground">
              <span className="flex items-center gap-3">
                {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span>Modo Oscuro</span>
              </span>
              <input
                type="checkbox"
                checked={isDark}
                onChange={toggleTheme}
                className="sr-only"
              />
              <div className="relative">
                <div className={`w-10 h-6 rounded-full shadow-inner transition-colors ${isDark ? 'bg-amber-500/80' : 'bg-muted'}`}></div>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDark ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
            </label>
            {status === 'authenticated' ? (
              <button
                onClick={() => {
                  signOut({ callbackUrl: `${globalThis.location.origin}` });
                  setIsSidebarOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left p-2 rounded-md hover:bg-primary transition-colors text-foreground"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsSidebarOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left p-2 rounded-md hover:bg-primary transition-colors text-foreground"
              >
                <User className="h-5 w-5" />
                <span>Ingresar</span>
              </button>
            )}
          </nav>
        </div>
      </>
    )}

    {/* Auth modals controlled by header */}
    <ClientLoginModal
      isOpen={isLoginOpen}
      onClose={() => setIsLoginOpen(false)}
      onLoginSuccess={() => { setIsLoginOpen(false); globalThis.location.reload(); }}
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