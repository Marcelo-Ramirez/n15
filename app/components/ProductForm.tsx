'use client'

import { Box, Badge, Input } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { enrichProducts } from '@/lib/abcUtils'
import { ProductInput } from '@/types/product'
import ABCSummary from './ABCsummary'
import ParetoChart from './recharts'

const ProductForm = () => {
  const [products, setProducts] = useState<ProductInput[]>([])
  const [thresholds, setThresholds] = useState({ A: 85, B: 95, C: 100 }) // cumple tipo Thresholds
  const criterio: 'valor' | 'precio' | 'utilidad' = 'valor'

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
  }, [])

  const enriched = enrichProducts(products, criterio, thresholds)

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
      {/* Inputs para modificar thresholds A y B */}
      <Box mb={4} display="flex" gap={4}>
        <Box>
          <label style={{ fontSize: '0.8rem', display: 'block' }}>A (%)</label>
          <Input
            type="number"
            value={thresholds.A}
            min={0}
            max={thresholds.B - 1} // nunca mayor o igual a B
            onChange={e => {
              const value = Number(e.target.value)
              if (value >= 0 && value < thresholds.B) {
                setThresholds({ ...thresholds, A: value })
              }
            }}
            width="80px"
            size="sm"
          />
        </Box>
        <Box>
          <label style={{ fontSize: '0.8rem', display: 'block' }}>B (%)</label>
          <Input
            type="number"
            value={thresholds.B}
            min={thresholds.A + 1} // siempre mayor que A
            max={100}
            onChange={e => {
              const value = Number(e.target.value)
              if (value > thresholds.A && value <= 100) {
                setThresholds({ ...thresholds, B: value })
              }
            }}
            width="80px"
            size="sm"
          />
        </Box>
      </Box>

      {/* Tabla de productos */}
      <Box mt={8} overflowX="auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left' }}>Producto</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Precio</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Consumo anual</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Valor anual</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Porcentaje individual %</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Acumulado %</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Categoría ABC</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map(p => (
              <tr key={p.id}>
                <td style={{ padding: '8px' }}>{p.name}</td>
                <td style={{ padding: '8px' }}>
                  ${p.unitPrice.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '8px' }}>{p.annualConsumption.toLocaleString('es-BO')}</td>
                <td style={{ padding: '8px' }}>
                  ${(p.annualValue || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '8px' }}>
                  {p.individualPercentage?.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                </td>
                <td style={{ padding: '8px' }}>
                  {p.accumulatedPercentage?.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                </td>
                <td style={{ padding: '8px' }}>
                  <Badge
                    colorScheme={p.abcCategory === 'A' ? 'red' : p.abcCategory === 'B' ? 'orange' : 'green'}
                    variant="solid"
                    color="white"
                    px={2}
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

      {/* Tabla resumen ABC */}
      <ABCSummary summary={summaryABC} />

      {/* Diagrama de Pareto */}
      <Box mt={8}>
       <ParetoChart data={paretoData} thresholds={thresholds} />
      </Box>
    </Box>
  )
}

export default ProductForm
