'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// --- Tipos Corregidos con readonly ---
interface StatsCardProps {
  // ✅ AÑADIDO: 'readonly' explícito para satisfacer al linter estricto
  readonly title: string; 
  readonly value: string | number;
  readonly change?: { 
    readonly value: string;
    readonly type: 'increase' | 'decrease';
  };
  readonly icon?: React.ReactNode; 
}

// --- Componente ---
export default function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const isIncrease = change?.type === 'increase';

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between"> 
          
          {/* Columna de Texto y Valor */}
          <div className="flex flex-col">
            
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              {value}
            </h2>
            
            {/* Indicador de Cambio */}
            {change && (
              <Badge
                variant="outline"
                className={cn(
                  "mt-2 text-xs w-fit flex items-center gap-1",
                  isIncrease 
                    ? "border-green-300 text-green-700 bg-green-50 dark:border-green-600 dark:bg-green-900/20" 
                    : "border-red-300 text-red-700 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
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
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}