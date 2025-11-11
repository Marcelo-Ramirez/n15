// app/providers.tsx
'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes"; // Importa ThemeProvider

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Envuelve con ThemeProvider */}
      <ThemeProvider
        attribute="class" // Usa clases CSS para el tema (estándar con Tailwind)
        defaultTheme="system" // Respeta el tema del sistema al iniciar
        enableSystem // Permite cambiar entre claro/oscuro/sistema
        disableTransitionOnChange // Evita transiciones bruscas al cambiar tema
        storageKey="theme"
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}