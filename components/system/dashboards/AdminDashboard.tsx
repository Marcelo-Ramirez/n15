'use client';

// No necesitas imports de Chakra UI
import { Users, Package, DollarSign, TrendingUp } from 'lucide-react'; // Importa iconos de Lucide

// Importa componentes Shadcn UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // Para separación visual

// --- Placeholder para StatsCard ---
// Necesitarás crear o adaptar tu propio componente StatsCard
// Este es un ejemplo básico usando Shadcn Card
interface StatsCardProps {
  title: string;
  value: string;
  change?: { value: string; type: 'increase' | 'decrease' };
  icon: React.ReactNode; // Acepta el icono como nodo React
}

function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const isIncrease = change?.type === 'increase';
  const changeColor = isIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {/* Renderiza el icono directamente */}
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${changeColor} mt-1`}>
            {change.value} from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
// --- Fin Placeholder ---


export default function AdminDashboard() {
  // Datos de ejemplo, ahora usando iconos de Lucide directamente
  const stats = [
    {
      title: 'Total Users',
      value: '156',
      change: { value: '+12%', type: 'increase' as const },
      icon: <Users className="h-4 w-4" /> // Usa componente Lucide
    },
    {
      title: 'Products',
      value: '89',
      change: { value: '+5%', type: 'increase' as const },
      icon: <Package className="h-4 w-4" /> // Usa componente Lucide
    },
    {
      title: 'Revenue',
      value: '$12,426',
      change: { value: '+18%', type: 'increase' as const },
      icon: <DollarSign className="h-4 w-4" /> // Usa componente Lucide
    },
    {
      title: 'Growth',
      value: '24%',
      change: { value: '+2%', type: 'increase' as const },
      icon: <TrendingUp className="h-4 w-4" /> // Usa componente Lucide
    }
  ];

  return (
    // Contenedor principal con Tailwind (equivalente a VStack)
    <div className="space-y-6"> {/* space-y-* aplica margen vertical entre hijos */}
      {/* Encabezado */}
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground"> {/* Equivalente a Text fontSize="2xl" */}
          Admin Dashboard
        </h3>
        <p className="text-sm text-muted-foreground"> {/* Equivalente a Text color="gray.600" */}
          Overview of your business metrics and performance
        </p>
      </div>

      {/* Grid para las tarjetas de estadísticas */}
      {/* Usa Grid de Tailwind: grid, grid-cols-*, gap-* */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> {/* Columnas responsivas */}
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon} // Pasa el icono como nodo
          />
        ))}
      </div>

      {/* Grid para las secciones inferiores */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"> {/* Columnas responsivas */}
        {/* Tarjeta de Actividad Reciente */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle> {/* Equivalente a Text fontSize="lg" */}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground"> {/* Equivalente a Text color="gray.500" */}
              Activity feed will be displayed here...
            </p>
            {/* Aquí iría el contenido real */}
          </CardContent>
        </Card>

        {/* Tarjeta de Acciones Rápidas */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Quick action buttons will be displayed here...
            </p>
            {/* Aquí irían los botones reales */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}