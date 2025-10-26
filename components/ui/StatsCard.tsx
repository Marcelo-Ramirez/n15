'use client';

// No necesitas imports de Chakra UI
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'; // Iconos para el cambio

// Importa componentes Shadcn UI
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; // Para combinar clases

// --- Tipos de Datos (Mantenidos) ---
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode; // Acepta el icono como nodo React (ej. un componente Lucide)
}

// --- Componente ---
export default function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const isIncrease = change?.type === 'increase';

  return (
    // Reemplaza Box con Card (Contenedor principal con sombra y bordes)
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-card">
      <CardContent className="p-6"> {/* Padding */}
        {/* Reemplaza HStack con div flex justify-between */}
        <div className="flex items-start justify-between"> 
          
          {/* Columna de Texto y Valor */}
          <div className="flex flex-col">
            
            {/* Título */}
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            
            {/* Valor Principal */}
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              {value}
            </h2>
            
            {/* Indicador de Cambio */}
            {change && (
              <Badge
                variant="outline" // Variante outline o default para mejor contraste
                className={cn(
                  "mt-2 text-xs w-fit flex items-center gap-1",
                  isIncrease ? "border-green-300 text-green-700 bg-green-50 dark:border-green-600 dark:bg-green-900/20" : "border-red-300 text-red-700 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                )}
              >
                {/* Icono de Lucide para el cambio */}
                {isIncrease 
                  ? <ArrowUpRight className="h-3 w-3" /> 
                  : <ArrowDownRight className="h-3 w-3" />
                }
                {change.value}
              </Badge>
            )}
          </div>
          
          {/* Columna de Icono */}
          {icon && (
            <div className="text-3xl text-muted-foreground/60 flex-shrink-0 pt-1">
              {/* El icono (componente Lucide) se renderiza aquí */}
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}