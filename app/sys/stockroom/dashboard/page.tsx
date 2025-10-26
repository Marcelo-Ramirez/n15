'use client'

// Ya no necesitas importar nada de @chakra-ui/react
import AlmacenDashboard from '@/components/system/dashboards/AlmacenDashboard'

export default function StockroomDashboardPage() {
  return (
    // Reemplaza Box con div, usando padding responsivo
    <div className="p-4 md:p-6">
      {/* Reemplaza VStack con un div usando flex y gap */}
      <div className="flex flex-col gap-6 items-stretch">
        
        {/* Encabezado (Reemplaza Box) */}
        <div>
          {/* Reemplaza Heading size="lg" */}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
            Panel de Almacén
          </h1>
          {/* Reemplaza Text color="gray.600" */}
          <p className="text-sm text-muted-foreground">
            Gestión de inventario, stock y movimientos de almacén
          </p>
        </div>
        
        {/* Renderiza el componente de Dashboard (asume que ya está en Tailwind/Shadcn) */}
        <AlmacenDashboard />
      </div>
    </div>
  )
}