'use client';

// Ya no necesitas importar nada de @chakra-ui/react
// import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import UserProfile from '@/components/system/UserProfile'; // Asegúrate que la ruta sea correcta

export default function UserProfilePage() {
  return (
    // Usa divs con clases de Tailwind en lugar de Box/VStack
    // Añade padding responsivo (p-4 en móvil, p-6 en pantallas medianas y más grandes)
    <div className="p-4 md:p-6">
      {/* Equivalente a VStack con gap-6 */}
      <div className="flex flex-col gap-6 items-stretch">
        {/* Encabezado de la página */}
        <div>
          {/* Equivalente a Heading size="lg" */}
          <h2 className="text-2xl font-semibold tracking-tight mb-1 text-foreground">
            Perfil de Usuario
          </h2>
          {/* Equivalente a Text color="gray.600" */}
          <p className="text-sm text-muted-foreground">
            Gestiona tu información personal y la configuración de seguridad.
          </p>
        </div>

        {/* Renderiza el componente UserProfile (que ya está hecho con Shadcn) */}
        <UserProfile />

      </div>
    </div>
  );
}