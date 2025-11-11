'use client'

// Ya no necesitas importar nada de @chakra-ui/react
import UserProfile from '@/components/system/UserProfile'

export default function UserProfilePage() {
  return (
    // Reemplaza Box con div, usando padding responsivo
    <div className="p-4 md:p-6">
      {/* Reemplaza VStack con un div usando flex y gap */}
      <div className="flex flex-col gap-6 items-stretch">
        
        {/* Encabezado (Reemplaza Box) */}
        <div>
          {/* Reemplaza Heading size="lg" */}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
            Perfil de Usuario
          </h1>
          {/* Reemplaza Text color="gray.600" */}
          <p className="text-sm text-muted-foreground">
            Gestiona tu información personal y la configuración de seguridad.
          </p>
        </div>
        
        {/* Renderiza el componente UserProfile (asume que ya está en Tailwind/Shadcn) */}
        <UserProfile />
      </div>
    </div>
  )
}