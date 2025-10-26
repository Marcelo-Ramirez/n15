'use client';

// No necesitas importar Box, Heading, Text, VStack de Chakra UI
import AdminDashboard from '@/components/system/dashboards/AdminDashboard'; // Asegúrate que la ruta sea correcta

export default function AdminDashboardPage() {
  return (
    // Usa divs con clases de Tailwind
    // Añade padding responsivo
    <div className="p-4 md:p-6">
      {/* Equivalente a VStack con gap-6 */}
      <div className="flex flex-col gap-6 items-stretch">
        {/* Encabezado */}
        <div>
          {/* Equivalente a Heading size="lg" */}
          <h2 className="text-2xl font-semibold tracking-tight mb-1 text-foreground">
            Panel de Administración
          </h2>
          {/* Equivalente a Text color="gray.600" */}
          <p className="text-sm text-muted-foreground">
            Gestión completa del sistema, usuarios y configuración
          </p>
        </div>

        {/* Renderiza el componente AdminDashboard (asumiendo que ya usa Shadcn/Tailwind) */}
        <AdminDashboard />

      </div>
    </div>
  );
}