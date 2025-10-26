'use client'

import { Loader2 } from 'lucide-react' // Icono de carga de Lucide
import { cn } from '@/lib/utils' // Utilidad para combinar clases

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
}

// Mapeo de tamaño de Chakra/Tailwind al tamaño de Lucide Icons
const getSizeClass = (size: 'sm' | 'md' | 'lg' | 'xl'): string => {
  switch (size) {
    case 'sm':
      return 'h-6 w-6'; // 1.5rem
    case 'md':
      return 'h-8 w-8'; // 2rem
    case 'lg':
      return 'h-10 w-10'; // 2.5rem (El valor por defecto original)
    case 'xl':
      return 'h-12 w-12'; // 3rem
    default:
      return 'h-10 w-10';
  }
};

export default function LoadingSpinner({ size = 'lg', text = 'Loading...' }: LoadingSpinnerProps) {
  const spinnerSizeClass = getSizeClass(size);

  return (
    // Reemplaza Center con div y clases Flexbox para centrar
    <div className="flex items-center justify-center p-8 w-full">
      {/* Reemplaza Box con div (contenedor de alineación central) */}
      <div className="flex flex-col items-center text-center">
        
        {/* Reemplaza Spinner con Loader2 de Lucide */}
        <Loader2 
          className={cn(
            'animate-spin text-primary dark:text-blue-400', // Clase de animación, color primario
            spinnerSizeClass // Aplica la clase de tamaño
          )}
        />
        
        {text && (
          // Reemplaza Text con p y clases de Tailwind
          <p className="mt-4 text-sm text-muted-foreground">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}