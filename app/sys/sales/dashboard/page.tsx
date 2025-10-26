'use client'

// Ya no necesitas importar nada de @chakra-ui/react
import VentasDashboard from '@/components/system/dashboards/VentasDashboard'

export default function SalesDashboardPage() {
  return (
    // Reemplaza Box (contenedor principal) con un div con padding
    <div className="p-4 md:p-6">
      {/* Reemplaza VStack con un div usando flex y gap */}
      <div className="flex flex-col gap-6 items-stretch">
        
        {/* Encabezado (Reemplaza Box) */}
        <div>
          {/* Reemplaza Heading size="lg" */}
          <h2 className="text-2xl font-semibold tracking-tight mb-1 text-foreground">
            Panel de Ventas
          </h2>
          {/* Reemplaza Text color="gray.600" */}
          <p className="text-sm text-muted-foreground">
            Gestión de pedidos, clientes y reportes de ventas
          </p>
        </div>
        
        {/* Renderiza el componente de Dashboard (asume que ya está en Tailwind/Shadcn) */}
        <VentasDashboard />
      </div>
    </div>
  )
}