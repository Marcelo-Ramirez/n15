import { Box } from "@chakra-ui/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

interface InventoryEOQGraphProps {
  eoq: number; // Tamaño de orden óptimo (Q*)
  reorderPoint: number; // Punto de reorden (ROP)
  leadTime: number; // Lead time en días
  periods?: number; // Cuántos ciclos mostrar (default: 4)
}

// Genera los datos para la gráfica EOQ con fechas reales y pendiente proporcional
function generateEOQDataWithDates(eoq: number, reorderPoint: number, leadTime: number, periods: number = 4, annualDemand?: number) {
  const data = [];
  const startDate = new Date();
  // Calcular número de pedidos y tiempo entre pedidos para cubrir 1 año
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
  // Si hay decimales, sumamos horas para el salto visual
  if (days % 1 !== 0) d.setHours(d.getHours() + 1);
  return d;
}

function formatDateShort(date: Date) {
  return date.toLocaleDateString();
}

export default function InventoryEOQGraph({ eoq, reorderPoint, leadTime, periods = 4, annualDemand }: InventoryEOQGraphProps & { annualDemand?: number }) {
  if (!eoq || !reorderPoint || !leadTime) return null;
  const data = generateEOQDataWithDates(eoq, reorderPoint, leadTime, periods, annualDemand);
  const start = data[0]?.fecha;
  const end = data[data.length - 1]?.fecha;
  return (
    <Box w="100%" h="300px" bg="#222" borderRadius="lg" p={2}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#888" />
          <XAxis
            dataKey="fecha"
            type="number"
            domain={[start ? start.getTime() : 'auto', end ? end.getTime() : 'auto']}
            tickFormatter={v => formatDateShort(new Date(v))}
            label={{ value: `Tiempo (${formatDateShort(start)} - ${formatDateShort(end)})`, position: "insideBottomRight", offset: 0 }}
            stroke="#fff"
            scale="time"
          />
          <YAxis label={{ value: "Nivel de Inventario", angle: -90, position: "insideLeft" }} stroke="#fff" />
          <Tooltip labelFormatter={v => formatDateShort(new Date(v))} />
          <Line type="linear" dataKey="inventario" stroke="#ff6600" strokeWidth={2} dot={false} />
          <ReferenceLine y={eoq / 2} stroke="#00f" strokeDasharray="3 3" label="Inventario promedio (Q*/2)" />
          <ReferenceLine y={reorderPoint} stroke="#f00" strokeDasharray="3 3" label="ROP" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
