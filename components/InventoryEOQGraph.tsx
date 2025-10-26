'use client';

// No necesitamos Box de Chakra UI
import { Card, CardContent } from '@/components/ui/card'; 
// Componentes Recharts (Mantenidos)
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

// --- Tipos e Interfaces (Mantenidos) ---
interface InventoryEOQGraphProps {
  eoq: number; // Tamaño de orden óptimo (Q*)
  reorderPoint: number; // Punto de reorden (ROP)
  leadTime: number; // Lead time en días
  periods?: number; // Cuántos ciclos mostrar (default: 4)
}

interface EOQDataPoint {
    fecha: Date;
    inventario: number;
}

// --- LÓGICA DE CÁLCULO (Mantenida) ---

// Genera los datos para la gráfica EOQ con fechas reales y pendiente proporcional
function generateEOQDataWithDates(eoq: number, _reorderPoint: number, _leadTime: number, periods: number = 4, _annualDemand?: number): EOQDataPoint[] {
  const data: EOQDataPoint[] = [];
  const startDate = new Date();
  const pedidos = periods;
  const diasEnAnio = 365;
  const tiempoEntrePedidos = diasEnAnio / pedidos;
  let days = 0;
  
  for (let p = 0; p < pedidos; p++) {
    // Inicio de ciclo: inventario máximo (Q*)
    data.push({ fecha: addDays(startDate, days), inventario: eoq });
    
    // Baja lineal hasta 0 en tiempoEntrePedidos días
    days += tiempoEntrePedidos;
    data.push({ fecha: addDays(startDate, days), inventario: 0 });
    
    // Sube instantáneamente por nuevo pedido (salto visual)
    if (p < pedidos - 1) {
      days += 0.01;
      data.push({ fecha: addDays(startDate, days), inventario: eoq });
    }
  }
  return data;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + Math.floor(days));
  if (days % 1 !== 0) d.setHours(d.getHours() + 1);
  return d;
}

function formatDateShort(date: Date) {
  return date.toLocaleDateString('es-BO', { month: 'short', day: 'numeric' });
}

// --- COMPONENTE PRINCIPAL ---
export default function InventoryEOQGraph({ eoq, reorderPoint, leadTime, periods = 4, annualDemand }: InventoryEOQGraphProps & { annualDemand?: number }) {
  if (!eoq || !reorderPoint || !leadTime) return null;
  
  const data = generateEOQDataWithDates(eoq, reorderPoint, leadTime, periods, annualDemand);
  const start = data.at(0)?.fecha;
  const end = data.at(-1)?.fecha;

  if (!start || !end) {
    // Reemplaza Box con div
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-card rounded-lg">
        <p className="text-muted-foreground">No hay datos suficientes para mostrar la gráfica.</p>
      </div>
    );
  }

  return (
    // Reemplaza Box con Card (Contenedor con estilos oscuros y padding)
    <Card className="w-full h-[300px] bg-gray-900 dark:bg-gray-950 text-white rounded-lg shadow-xl p-2">
      <CardContent className="p-0 h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
            
            {/* Grid y Ejes (Estilos adaptados a modo oscuro) */}
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            
            {/* Eje X (Tiempo) */}
            <XAxis
              dataKey="fecha"
              type="number"
              domain={[start ? start.getTime() : 'auto', end ? end.getTime() : 'auto']}
              tickFormatter={v => formatDateShort(new Date(v))}
              label={{ 
                value: `Tiempo (${formatDateShort(start)} - ${formatDateShort(end)})`, 
                position: "insideBottomRight", 
                offset: 0,
                fill: '#fff', // Texto blanco
                fontSize: 12
              }}
              stroke="#fff" // Color de la línea del eje
              tick={{ fill: '#fff', fontSize: 10 }} // Color de las marcas
              scale="time"
            />
            
            {/* Eje Y (Inventario) */}
            <YAxis 
              label={{ value: "Nivel de Inventario", angle: -90, position: "insideLeft", fill: '#fff', fontSize: 12 }} 
              stroke="#fff" 
              tick={{ fill: '#fff', fontSize: 10 }}
            />
            
            {/* Tooltip */}
            <Tooltip 
              labelFormatter={v => `Fecha: ${formatDateShort(new Date(v))}`}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            
            {/* Línea del Inventario */}
            <Line 
              type="stepAfter" // Usar stepAfter para el efecto de inventario constante/salto
              dataKey="inventario" 
              stroke="hsl(var(--primary))" // Usar color primario de Shadcn
              strokeWidth={3} 
              dot={false} 
              isAnimationActive={false} // Desactivar animación si es muy largo
            />
            
            {/* Líneas de Referencia */}
            {/* Inventario Promedio (EOQ/2) */}
            <ReferenceLine 
              y={eoq / 2} 
              stroke="rgb(0, 110, 255)" // Azul brillante
              strokeDasharray="5 5" 
              label={{ value: "Inventario promedio (Q*/2)", fill: 'rgb(0, 110, 255)', position: 'insideTopLeft', fontSize: 12 }} 
            />
            
            {/* ROP (Punto de Reorden) */}
            <ReferenceLine 
              y={reorderPoint} 
              stroke="rgb(255, 0, 0)" // Rojo
              strokeDasharray="5 5" 
              label={{ value: "Punto de Reorden (ROP)", fill: 'rgb(255, 0, 0)', position: 'insideBottomRight', fontSize: 12 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}