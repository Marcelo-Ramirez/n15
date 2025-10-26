'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings} from 'lucide-react'; // Iconos de Lucide
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Componentes y lógica de negocio (asumo que estas rutas son correctas)
import { enrichProducts } from '@/lib/abcUtils';
import ABCSummary from '@/components/ABCsummary';
import ParetoChart from '@/components/recharts'; 
import { PrintButtons } from '@/components/PrintableSection'; 

// --- Tipos de Datos (Mantenidos) ---
interface InventoryMovement { ingredientId: number; movementType: 'salida' | 'entrada'; quantity: number; }
interface Ingredient { id: number; name: string; pricePerUnit: number; provider: string; createdAt: string; }
interface InventoryProduct {
  id: number;
  name: string;
  unitPrice: number;
  annualConsumption: number;
  annualValue?: number;
  individualPercentage?: number;
  accumulatedPercentage?: number;
  abcCategory?: 'A' | 'B' | 'C';
}

// Lógica de mapeo (Mantenida)
const mapInventoryToProducts = (ingredients: Ingredient[], movements: InventoryMovement[]): InventoryProduct[] => {
  return ingredients.map(ingredient => {
    const salidaMovs = movements.filter(m => m.ingredientId === ingredient.id && m.movementType === 'salida')
    const totalSalida = salidaMovs.reduce((sum, m) => sum + m.quantity, 0)
    return {
      id: ingredient.id,
      name: ingredient.name,
      unitPrice: ingredient.pricePerUnit,
      annualConsumption: totalSalida,
    }
  })
}

// Lógica principal
const InventoryABC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [thresholds, setThresholds] = useState({ A: 85, B: 95, C: 100 })
  const [showInputs, setShowInputs] = useState(false)
  const router = useRouter(); 
  const printRef = useRef<HTMLDivElement>(null)
  const criterio: 'valor' | 'precio' | 'utilidad' = 'valor'
  
  useEffect(() => {
    // Lógica de fetch mantenida
    Promise.all([
      fetch('/api/inventory/abc').then(res => res.json()),
      fetch('/api/inventory/inventory-movements').then(res => res.json())
    ]).then(([ing, movs]) => {
      setIngredients(ing)
      setMovements(movs)
    })
  }, [])

  // Lógica de cálculo (useMemo para eficiencia)
  const { enriched, summaryABC, paretoData } = useMemo(() => {
    const products = mapInventoryToProducts(ingredients, movements)
    const enriched = enrichProducts(products, criterio, thresholds)
    
    // Calcula el resumen ABC (Mantenido)
    const summaryABC = ['A', 'B', 'C'].map(category => {
      const items = enriched.filter(p => p.abcCategory === category)
      const totalN = enriched.length
      const totalSales = enriched.reduce((sum, p) => sum + (p.annualValue || 0), 0)

      return {
        category,
        n: items.length,
        participationN: totalN ? (items.length / totalN) * 100 : 0,
        totalValue: items.reduce((sum, p) => sum + (p.annualValue || 0), 0),
        participationSales: totalSales ? (items.reduce((sum, p) => sum + (p.annualValue || 0), 0) / totalSales) * 100 : 0,
      }
    })

    // Prepara datos de Pareto (Mantenido)
    const paretoData = enriched.map(p => ({
      name: p.name,
      value: p.annualValue || 0,
      accumulated: p.accumulatedPercentage || 0,
    }))

    return { enriched, summaryABC, paretoData };
  }, [ingredients, movements, criterio, thresholds]);


  const getCategoryColor = (category: 'A' | 'B' | 'C' | undefined) => {
    switch (category) {
      case 'A': return 'bg-red-500 hover:bg-red-600';
      case 'B': return 'bg-blue-500 hover:bg-blue-600';
      case 'C': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      
      {/* 1. Barra de botones (NO IMPRIME) */}
      <div className="flex flex-wrap gap-4 items-center justify-between print:hidden">
        
        {/* Botón Volver */}
        <Button variant="ghost" onClick={() => router.back()} className="text-sm text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        {/* Botón Configuración */}
        <Button
          variant="secondary"
          onClick={() => setShowInputs(prev => !prev)}
          className="text-sm"
        >
          <Settings className="h-4 w-4 mr-2" />
          {showInputs ? 'Ocultar Configuración' : 'Configurar Umbrales'}
        </Button>
        
        {/* Botones de Impresión (Asume PrintButtons migrado) */}
        <PrintButtons 
          targetRef={printRef}
          printLabel="Imprimir Inventario"
          buttonSize="sm"
        />
      </div>

      {/* 2. Inputs para thresholds (NO se imprimen) */}
      {showInputs && (
        <Card className="mb-6 p-4 shadow-sm print:hidden">
          <div className="flex flex-wrap gap-6 items-end">
            {/* Input Umbral A */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Umbral A (%)</Label>
              <Input
                type="number"
                value={thresholds.A}
                min={0}
                max={thresholds.B - 1}
                onChange={e => {
                  const value = Number(e.target.value)
                  if (value >= 0 && value < thresholds.B) {
                    setThresholds({ ...thresholds, A: value })
                  }
                }}
                className="w-[100px]"
                // size="sm" <-- ELIMINADA para evitar el error de tipado
              />
            </div>
            {/* Input Umbral B */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Umbral B (%)</Label>
              <Input
                type="number"
                value={thresholds.B}
                min={thresholds.A + 1}
                max={99}
                onChange={e => {
                  const value = Number(e.target.value)
                  if (value > thresholds.A && value <= 100) {
                    setThresholds({ ...thresholds, B: value })
                  }
                }}
                className="w-[100px]"
                // size="sm" <-- ELIMINADA para evitar el error de tipado
              />
            </div>
          </div>
        </Card>
      )}

      {/* 3. Contenido que SÍ se imprime (Ref para impresión) */}
      <div ref={printRef} className="p-4 md:p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl">
        
        {/* Título del reporte (Adaptado a Tailwind) */}
        <div className="mb-6 text-center print-visible">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Clasificación ABC de Ingredientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Fecha: {new Date().toLocaleDateString('es-BO')}
          </p>
        </div>

        {/* Tabla de inventario ABC */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm text-foreground table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700">
                <th className="p-3 text-left font-bold whitespace-nowrap">Ingrediente</th>
                <th className="p-3 text-right font-bold whitespace-nowrap">Precio Unitario</th>
                <th className="p-3 text-right font-bold whitespace-nowrap">Consumo Anual</th>
                <th className="p-3 text-right font-bold whitespace-nowrap">Valor Anual</th>
                <th className="p-3 text-right font-bold whitespace-nowrap">% Individual</th>
                <th className="p-3 text-right font-bold whitespace-nowrap">% Acumulado</th>
                <th className="p-3 text-center font-bold whitespace-nowrap">Categoría</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((p, index) => (
                <tr
                  key={p.id}
                  className={cn(
                    "border-b border-gray-200 dark:border-gray-800",
                    index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-950',
                  )}
                  style={{
                    // Borde lateral para clasificación (A, B, C)
                    borderLeft: `4px solid ${
                      p.abcCategory === 'A' ? 'rgb(239, 68, 68)' : // red-500
                      p.abcCategory === 'B' ? 'rgb(59, 130, 246)' : // blue-500
                      'rgb(16, 185, 129)' // green-500
                    }`
                  }}
                >
                  <td className="p-3 text-left whitespace-nowrap">{p.name}</td>
                  <td className="p-3 text-right whitespace-nowrap">Bs {p.unitPrice.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-3 text-right whitespace-nowrap">{p.annualConsumption.toLocaleString('es-BO')}</td>
                  <td className="p-3 text-right whitespace-nowrap">Bs {(p.annualValue || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-3 text-right whitespace-nowrap">{p.individualPercentage?.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</td>
                  <td className="p-3 text-right whitespace-nowrap">{p.accumulatedPercentage?.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span
                      className={cn(
                        "px-3 py-1 rounded font-bold text-white",
                        getCategoryColor(p.abcCategory)
                      )}
                    >
                      {p.abcCategory}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Resumen ABC y Diagrama Pareto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-1">
                <h2 className="text-lg font-bold text-foreground mb-4">
                    Resumen de Categorías
                </h2>
                <ABCSummary summary={summaryABC} thresholds={thresholds} />
            </div>

            <div className="col-span-1">
                <h2 className="text-lg font-bold text-foreground mb-4">
                    Diagrama de Pareto
                </h2>
                <ParetoChart data={paretoData} thresholds={thresholds} />
            </div>
        </div>

      </div>
    </div>
  )
}

export default InventoryABC