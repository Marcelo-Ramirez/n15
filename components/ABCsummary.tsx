'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button' // Componente Button de Shadcn
import { Card } from '@/components/ui/card' // Usar Card como contenedor principal
import { cn } from '@/lib/utils' // Para combinar clases

// --- Tipos (Mantenidos) ---
type ABCRow = {
  n: number
  participationN: number
  totalValue: number
  participationSales: number
  category: string // Agregué category para mayor claridad, aunque se usa categories[index]
}

type ABCSummaryProps = {
  summary: ABCRow[]
  thresholds: { A: number; B: number; C: number }
}

const ABCSummary = ({ summary, thresholds }: ABCSummaryProps) => {
  const [showTable, setShowTable] = useState(false) // controla si se muestra la tabla

  // Lógica para definir los rangos de texto (Mantenida)
  const rangeTexts = [
    `0–${thresholds.A}%`,
    `${thresholds.A + 1}–${thresholds.B}%`,
    `${thresholds.B + 1}–${thresholds.C}%`
  ]


  return (
    // Reemplaza Box con div. mt-8 y overflow-x-auto
    <div className="mt-8 overflow-x-auto"> 
      <Button 
        className="mb-4 bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600"
        onClick={() => setShowTable(prev => !prev)}
      >
        {showTable ? 'Ocultar Resumen ABC' : 'Mostrar Resumen ABC'}
      </Button>

      {showTable && (
        <Card className="w-full"> {/* Usar Card como contenedor para la tabla */}
          <div className="overflow-x-auto"> {/* Contenedor de la tabla */}
            <table className="w-full border-collapse bg-white dark:bg-card text-foreground">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
                  <th className="p-2 text-left text-sm font-semibold whitespace-nowrap">Categoría</th>
                  <th className="p-2 text-left text-sm font-semibold whitespace-nowrap">Rango %</th>
                  <th className="p-2 text-right text-sm font-semibold whitespace-nowrap"># Prod.</th>
                  <th className="p-2 text-right text-sm font-semibold whitespace-nowrap">Part. N (%)</th>
                  <th className="p-2 text-right text-sm font-semibold whitespace-nowrap">Valor Anual</th>
                  <th className="p-2 text-right text-sm font-semibold whitespace-nowrap">Part. Ventas (%)</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row, index) => {
                  // Determina el color de la fila
                  const isEven = index % 2 === 0;
                  const rowClass = cn(
                      "border-b border-gray-200 dark:border-gray-800",
                      isEven ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-950'
                  );
                  
                  // Colores de borde lateral para la categoría (A, B, C)
                  let categoryBorderColor = 'border-l-gray-500';
                  if (row.category === 'A') categoryBorderColor = 'border-l-red-500';
                  else if (row.category === 'B') categoryBorderColor = 'border-l-blue-500';
                  else if (row.category === 'C') categoryBorderColor = 'border-l-green-500';
                  
                  return (
                    <tr 
                      key={`abc-category-${row.category}-${row.n}-${row.totalValue}`} 
                      className={cn(rowClass, categoryBorderColor, "border-l-4")} // Aplicar borde izquierdo
                    >
                      {/* Categaría A, B, C */}
                      <td className="p-2 font-bold whitespace-nowrap">{row.category}</td>
                      {/* Rango */}
                      <td className="p-2 whitespace-nowrap text-sm">{rangeTexts[index]}</td>
                      {/* # Productos */}
                      <td className="p-2 text-right whitespace-nowrap">{row.n.toLocaleString('es-BO')}</td>
                      {/* Participación N */}
                      <td className="p-2 text-right whitespace-nowrap">
                        {row.participationN.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                      </td>
                      {/* Valor Anual */}
                      <td className="p-2 text-right whitespace-nowrap font-semibold">
                        Bs {row.totalValue.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      {/* Participación Ventas */}
                      <td className="p-2 text-right whitespace-nowrap font-semibold">
                        {row.participationSales.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default ABCSummary