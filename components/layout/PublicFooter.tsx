// PublicFooter.tsx
"use client";
import Link from 'next/link';
import { Home, Info, Mail, HelpCircle, LogIn } from 'lucide-react';

export function PublicFooter() {
  return (
    // Reemplaza Box (contenedor principal) con div. bg, color, py
    <footer className="bg-background text-foreground border-t border-border py-12">
      {/* Reemplaza Container con div + clases de ancho máximo y centrado */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Reemplaza SimpleGrid con grid de Tailwind */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center"
        >
          {/* Columna 1: Logo/Descripción */}
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <h3 className="text-xl font-bold">MuytunaSys</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Gomitas naturales de la más alta calidad, 
              hechas con ingredientes frescos y amor.
            </p>
          </div>
          
          {/* Columna 2: Enlaces */}
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <h4 className="font-bold text-base">Enlaces</h4>
            {/* VStack de enlaces */}
            <nav className="flex flex-col gap-2 items-center md:items-start text-sm">
              <Link href="/catalog" className="flex items-center text-muted-foreground hover:text-foreground transition-colors"><Home className="mr-2 h-4 w-4" />Tienda</Link>
              <Link href="/about" className="flex items-center text-muted-foreground hover:text-foreground transition-colors"><Info className="mr-2 h-4 w-4" />Sobre Nosotros</Link>
              <Link href="/contact" className="flex items-center text-muted-foreground hover:text-foreground transition-colors"><Mail className="mr-2 h-4 w-4" />Contacto</Link>
              <Link href="/faq" className="flex items-center text-muted-foreground hover:text-foreground transition-colors"><HelpCircle className="mr-2 h-4 w-4" />FAQ</Link>
              {/* enlace discreto al sistema - parece texto pero es funcional */}
              <Link href="/sys/login" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"><LogIn className="mr-2 h-4 w-4" />sys</Link>
            </nav>
          </div>
          
          {/* Columna 3: Contacto */}
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <h4 className="font-bold text-base">Contacto</h4>
            {/* VStack de Contacto */}
            <div className="flex flex-col gap-2 items-center md:items-start text-sm">
              <p className="text-muted-foreground">info@muytunasys.com</p>
              <p className="text-muted-foreground">+1 234 567 8900</p>
              <p className="text-muted-foreground">Ciudad de La Paz - Bolivia</p>
            </div>
          </div>
        </div>
        
        {/* Sección de Copyright */}
        <div className="mt-8 pt-8 border-t border-border"> {/* Reemplaza Box/borderTop/mt/pt */}
          <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"> {/* Reemplaza HStack/justify */}
            <p>
              2025 MuytunaSys. Todos los derechos reservados.
            </p>
            <p>
              Términos | Privacidad
            </p>
          </div>
        </div>
        
      </div>
    </footer>
  );
}