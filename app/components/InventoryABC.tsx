'use client'

import { Box, Badge, Input } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { enrichProducts } from '@/lib/abcUtils'
import { InventoryMovement, Ingredient } from '@/types/inventory'
import ABCSummary from './ABCsummary'
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
const mapInventoryToProducts = (ingredients: Ingredient[], movements: InventoryMovement[]): InventoryProduct[] => {
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
  const criterio: 'valor' | 'precio' | 'utilidad' = 'valor'

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
    <Box>
      {/* Inputs para thresholds */}
      <Box mb={4} display="flex" gap={4}>
        <Box>
          <label style={{ fontSize: '0.8rem', display: 'block', color: '#000' }}>A (%)</label>
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
            width="80px"
            size="sm"
            bg="white"
            color="black"
          />
        </Box>
        <Box>
          <label style={{ fontSize: '0.8rem', display: 'block', color: '#000' }}>B (%)</label>
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
            width="80px"
            size="sm"
            bg="white"
            color="black"
          />
        </Box>
      </Box>

      {/* Tabla de inventario ABC */}
      <Box mt={8} overflowX="auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Ingrediente</th>
              <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Precio Unitario</th>
              <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Consumo Anual</th>
              <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Valor Anual</th>
              <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Porcentaje Individual %</th>
              <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Acumulado %</th>
              <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Categoría ABC</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map(p => (
              <tr
                key={p.id}
                style={{
                  color: '#000',
                  backgroundColor:
                    p.abcCategory === 'A' ? '#ffe5e5' :
                    p.abcCategory === 'B' ? '#e5f0ff' :
                    '#e5ffe5'
                }}
              >
                <td style={{ padding: '8px' }}>{p.name}</td>
                <td style={{ padding: '8px' }}>
                  Bs {p.unitPrice.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '8px' }}>{p.annualConsumption.toLocaleString('es-BO')}</td>
                <td style={{ padding: '8px' }}>
                  Bs {(p.annualValue || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '8px' }}>
                  {p.individualPercentage?.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                </td>
                <td style={{ padding: '8px' }}>
                  {p.accumulatedPercentage?.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                </td>
                <td style={{ padding: '8px' }}>
                  <Badge
                    colorScheme={p.abcCategory === 'A' ? 'red' : p.abcCategory === 'B' ? 'blue' : 'green'}
                    variant="solid"
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="md"
                  >
                    {p.abcCategory}
                  </Badge>
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
  )
}

export default InventoryABC
