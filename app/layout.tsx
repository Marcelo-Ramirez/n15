// app/layout.tsx
import { Providers } from './providers';
import { Toaster as Sonner } from "@/components/ui/sonner"; 
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Sonner /> 
        </Providers>
      </body>
    </html>
  );
}