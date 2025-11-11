'use client';

// No necesitas Box, Text, VStack de Chakra UI
import { Button } from '@/components/ui/button'; // Usamos el Button de Shadcn

// --- Tipos (Mantenidos) ---
interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode; // Acepta cualquier componente de React, como un icono Lucide
}

export default function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction, 
  icon 
}: EmptyStateProps) {
  return (
    // Reemplaza Box con div (contenedor principal centrado)
    <div 
      className="flex flex-col items-center justify-center p-8 text-center min-h-[400px] w-full bg-card rounded-lg border border-dashed dark:border-gray-700"
    >
      {/* Reemplaza VStack con div flex-col y gap */}
      <div className="flex flex-col gap-4 items-center max-w-lg">
        
        {/* Ícono */}
        {icon && (
          // Reemplaza Box con div. text-4xl y color de Lucide
          <div className="text-4xl text-muted-foreground/80 mb-2">
            {icon}
          </div>
        )}
        
        {/* Título */}
        <h3 className="text-xl font-semibold text-foreground tracking-tight">
          {title}
        </h3>
        
        {/* Descripción */}
        {description && (
          <p className="text-sm text-muted-foreground max-w-md">
            {description}
          </p>
        )}
        
        {/* Botón de Acción */}
        {actionLabel && onAction && (
          <Button 
            onClick={onAction} 
            className="mt-4" // Margen superior
          >
            {actionLabel}
          </Button>
        )}
        
      </div>
    </div>
  );
}