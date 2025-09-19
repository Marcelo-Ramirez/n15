'use client'

import { Box, Badge, Input, Button } from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { enrichProducts } from '@/lib/abcUtils'
import { InventoryMovement, Ingredient } from '@/types/inventory'
import ABCSummary from './ABCsummary'
import Printer from './printer'
import ParetoChart from './recharts'
  
// Este tipo simula ProductInput usando movimientos de salida
interface InventoryProduct {
  id: number
  name: string
  unitPrice: number
  annualConsumption: number
  annualValue?: number
  individualPercentage?: number
  accumulatedPercentage?: number
  abcCategory?: 'A' | 'B' | 'C'
}

// Mapea inventario a formato que usa enrichProducts
const mapInventoryToProducts = (ingredients: Ingredient[], movements: InventoryMovement[]): 
InventoryProduct[] => {
  return ingredients.map(ingredient => {
    // Solo consideramos salidas
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

const InventoryABC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [thresholds, setThresholds] = useState({ A: 85, B: 95, C: 100 })
  const [showInputs, setShowInputs] = useState(false) // controla si se muestran los inputs de thresholds
  const criterio: 'valor' | 'precio' | 'utilidad' = 'valor'
  
  // Referencia para la impresión
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Traer ingredientes y movimientos
    Promise.all([
      fetch('/api/inventory/ingredients').then(res => res.json()),
      fetch('/api/inventory/inventory-movements').then(res => res.json())
    ]).then(([ing, movs]) => {
      setIngredients(ing)
      setMovements(movs)
    })
  }, [])

  // Transformamos a formato que espera enrichProducts
  const products = mapInventoryToProducts(ingredients, movements)
  const enriched = enrichProducts(products, criterio, thresholds)
  
  // Resumen ABC
  const summaryABC = ['A', 'B', 'C'].map(category => {
    const items = enriched.filter(p => p.abcCategory === category)
    const n = items.length
    const totalN = enriched.length
    const participationN = totalN ? (n / totalN) * 100 : 0
    const totalValue = items.reduce((sum, p) => sum + (p.annualValue || 0), 0)
    const totalSales = enriched.reduce((sum, p) => sum + (p.annualValue || 0), 0)
    const participationSales = totalSales ? (totalValue / totalSales) * 100 : 0

    return {
      category,
      n,
      participationN,
      totalValue,
      participationSales,
    }
  })

  const paretoData = enriched.map(p => ({
    name: p.name,
    value: p.annualValue || 0,
    accumulated: p.accumulatedPercentage || 0,
  }))

  return (
    <Box p={4}>
      {/* Controles que NO se imprimen */}
      <Box mb={4} display="flex" gap={4} alignItems="center">
        <Printer 
          targetRef={printRef} 
          label="Imprimir ABC" 
          colorScheme="teal"
        />
        
        <Button
          colorScheme="blue"
          onClick={() => setShowInputs(prev => !prev)}
        >
          {showInputs ? 'Ocultar Configuración' : 'Configurar Umbrales'}
        </Button>
      </Box>

      {/* Inputs para thresholds - NO se imprimen */}
      {showInputs && (
        <Box mb={6} p={4} bg="gray.50" borderRadius="md">
          <Box display="flex" gap={4} alignItems="end">
            <Box>
              <label style={{ fontSize: '0.8rem', display: 'block', color: '#000', marginBottom: '4px' }}>
                Umbral A (%)
              </label>
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
                width="100px"
                size="sm"
                bg="white"
                color="black"
              />
            </Box>
            <Box>
              <label style={{ fontSize: '0.8rem', display: 'block', color: '#000', marginBottom: '4px' }}>
                Umbral B (%)
              </label>
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
                width="100px"
                size="sm"
                bg="white"
                color="black"
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Contenido que SÍ se imprime */}
      <Box ref={printRef}>
        {/* Título del reporte */}
        <Box mb={6} textAlign="center">
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>
            Análisis ABC de Inventario
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Fecha: {new Date().toLocaleDateString('es-BO')}
          </p>
        </Box>

        {/* Tabla de inventario ABC */}
        <Box overflowX="auto" mb={8}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', color: '#000', borderBottom: '2px solid #ddd' }}>
                  Ingrediente
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#000', borderBottom: '2px solid #ddd' }}>
                  Precio Unitario
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#000', borderBottom: '2px solid #ddd' }}>
                  Consumo Anual
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#000', borderBottom: '2px solid #ddd' }}>
                  Valor Anual
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#000', borderBottom: '2px solid #ddd' }}>
                  % Individual
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#000', borderBottom: '2px solid #ddd' }}>
                  % Acumulado
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'center', color: '#000', borderBottom: '2px solid #ddd' }}>
                  Categoría
                </th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((p, index) => (
                <tr
                  key={p.id}
                  style={{
                    color: '#000',
                    backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9',
                    borderLeft: `4px solid ${
                      p.abcCategory === 'A' ? '#e53e3e' :
                      p.abcCategory === 'B' ? '#3182ce' :
                      '#38a169'
                    }`
                  }}
                >
                  <td style={{ padding: '12px 8px', borderBottom: '1px solid #eee' }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                    Bs {p.unitPrice.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                    {p.annualConsumption.toLocaleString('es-BO')}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                    Bs {(p.annualValue || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                    {p.individualPercentage?.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                    {p.accumulatedPercentage?.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    <span
                      style={{
                        backgroundColor: p.abcCategory === 'A' ? '#e53e3e' : p.abcCategory === 'B' ? '#3182ce' : '#38a169',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      {p.abcCategory}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
                
        {/* Resumen ABC */}
        <ABCSummary summary={summaryABC} thresholds={thresholds} />

        {/* Diagrama Pareto */}
        <Box mt={8}>
          <ParetoChart data={paretoData} thresholds={thresholds} />
        </Box>
      </Box>
    </Box>
  )
}

export default InventoryABC