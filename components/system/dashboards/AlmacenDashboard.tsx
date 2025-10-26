'use client';

// No necesitas Box, Grid, Text, VStack de Chakra UI
import { Package, AlertTriangle, Truck, RefreshCw } from 'lucide-react'; // Importa iconos de Lucide
// Asume que StatsCard ya ha sido adaptado a Shadcn UI/Tailwind
import StatsCard from '@/components/ui/StatsCard'; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Tipos de Datos (Mantenidos) ---
interface StatChange {
  value: string;
  type: 'increase' | 'decrease';
}

interface Stat {
  title: string;
  value: string;
  change: StatChange;
  icon: React.ReactNode; 
}
// --- Fin Tipos ---

export default function AlmacenDashboard() {
  // Datos de estadísticas adaptados a Lucide Icons
  const stats: Stat[] = [
    {
      title: 'Total Inventory',
      value: '1,234',
      change: { value: '+5%', type: 'increase' as const },
      icon: <Package className="h-5 w-5 text-muted-foreground" />
    },
    {
      title: 'Low Stock Items',
      value: '23',
      change: { value: '+3', type: 'increase' as const },
      icon: <AlertTriangle className="h-5 w-5 text-destructive" /> // Icono de alerta
    },
    {
      title: 'Pending Orders',
      value: '45',
      change: { value: '-2', type: 'decrease' as const },
      icon: <Truck className="h-5 w-5 text-muted-foreground" />
    },
    {
      title: 'Stock Movements',
      value: '156',
      change: { value: '+12', type: 'increase' as const },
      icon: <RefreshCw className="h-5 w-5 text-muted-foreground" />
    }
  ];

  return (
    // Reemplaza VStack con div space-y-6
    <div className="space-y-6">
      
      {/* 1. Encabezado */}
      <div>
        {/* Reemplaza Text fontSize="2xl" */}
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          Warehouse Dashboard
        </h3>
        {/* Reemplaza Text color="gray.600" */}
        <p className="text-sm text-muted-foreground">
          Monitor inventory levels and warehouse operations
        </p>
      </div>

      {/* 2. Grid para las tarjetas de estadísticas */}
      {/* Reemplaza Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon} 
            // Asumiendo que StatsCard ya está migrado
          />
        ))}
      </div>

      {/* 3. Grid para las secciones inferiores (Widgets) */}
      {/* Reemplaza Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        
        {/* Tarjeta de Alertas de Bajo Stock */}
        <Card className="shadow-sm"> {/* Reemplaza Box bg/p/rounded/shadow/border */}
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Items running low on stock will be displayed here...
            </p>
            {/* Contenido de alertas reales aquí */}
          </CardContent>
        </Card>

        {/* Tarjeta de Movimientos Recientes */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Movements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Latest inventory movements will be displayed here...
            </p>
            {/* Contenido de movimientos reales aquí */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}