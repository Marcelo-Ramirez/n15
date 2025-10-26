// app/layout.tsx
import { Providers } from './providers';
// import { Toaster } from "@/components/ui/toaster"; // <-- ELIMINA ESTA LÍNEA
import { Toaster as Sonner } from "@/components/ui/sonner"; // <-- IMPORTA SONNER
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Sonner /> {/* <-- AÑADE SONNER AQUÍ */}
        </Providers>
      </body>
    </html>
  );
}