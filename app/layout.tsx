// app/layout.tsx
import { Providers } from './providers';
import { Toaster as Sonner } from "@/components/ui/sonner"; 
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <div id="page-wrapper" className="min-h-screen transition-transform duration-300 ease-in-out md:translate-x-0">
            {children}
          </div>
          <Sonner /> 
        </Providers>
      </body>
    </html>
  );
}