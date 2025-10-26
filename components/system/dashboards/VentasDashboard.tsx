'use client';

// No necesitas Box, Grid, Text, VStack de Chakra UI
import { ShoppingCart, DollarSign, Users, TrendingUp } from 'lucide-react'; // Importa iconos de Lucide

// Importa componentes Shadcn UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Asume que StatsCard ya ha sido adaptado a Shadcn UI/Tailwind
import StatsCard from '@/components/ui/StatsCard'; 

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

export default function VentasDashboard() {
  // Datos de estadísticas adaptados a Lucide Icons
  const stats: Stat[] = [
    {
      title: 'Total Sales',
      value: '$8,420',
      change: { value: '+15%', type: 'increase' as const },
      icon: <DollarSign className="h-5 w-5 text-muted-foreground" />
    },
    {
      title: 'Orders Today',
      value: '34',
      change: { value: '+8', type: 'increase' as const },
      icon: <ShoppingCart className="h-5 w-5 text-muted-foreground" />
    },
    {
      title: 'Active Customers',
      value: '89',
      change: { value: '+12%', type: 'increase' as const },
      icon: <Users className="h-5 w-5 text-muted-foreground" />
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: { value: '+0.5%', type: 'increase' as const },
      icon: <TrendingUp className="h-5 w-5" />
    }
  ];

  return (
    // Reemplaza VStack con div space-y-6
    <div className="space-y-6">
      
      {/* 1. Encabezado */}
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          Sales Dashboard
        </h3>
        <p className="text-sm text-muted-foreground">
          Track sales performance and customer metrics
        </p>
      </div>

      {/* 2. Grid para las tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon} 
            // Asumiendo que StatsCard recibe estas props y las renderiza con Shadcn Card
          />
        ))}
      </div>

      {/* 3. Grid para las secciones inferiores (Widgets) */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        
        {/* Tarjeta de Órdenes Recientes */}
        <Card className="shadow-sm"> {/* Reemplaza Box bg/p/rounded/shadow/border */}
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Latest customer orders will be displayed here
            </p>
            {/* Contenido de órdenes reales aquí */}
          </CardContent>
        </Card>

        {/* Tarjeta de Productos Principales */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Best selling products will be displayed here
            </p>
            {/* Contenido de productos principales aquí */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}