'use client'

import { Box } from '@chakra-ui/react'

type ABCRow = {
  n: number
  participationN: number
  totalValue: number
  participationSales: number
}

type ABCSummaryProps = {
  summary: ABCRow[]
  thresholds: { A: number; B: number; C: number } // Recibimos thresholds dinámicos
}

const ABCSummary = ({ summary, thresholds }: ABCSummaryProps) => {
  // Generamos textos dinámicos según thresholds
  const rangeTexts = [
    `0–${thresholds.A}`,                   // Categoría A
    `${thresholds.A + 1}–${thresholds.B}`, // Categoría B
    `${thresholds.B + 1}–${thresholds.C}`  // Categoría C
  ]

  return (
    <Box mt={8} overflowX="auto">
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Rango %</th>
            <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}># de productos</th>
            <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Participación N %</th>
            <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Valor anual</th>
            <th style={{ padding: '8px', textAlign: 'left', color: '#000' }}>Participación en ventas %</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((row, index) => (
            <tr key={index} style={{ color: '#000', backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
              <td style={{ padding: '8px' }}>{rangeTexts[index % 3]}</td>
              <td style={{ padding: '8px' }}>{row.n}</td>
              <td style={{ padding: '8px' }}>
                {row.participationN.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
              </td>
              <td style={{ padding: '8px' }}>
                Bs {row.totalValue.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td style={{ padding: '8px' }}>
                {row.participationSales.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  )
}

export default ABCSummary
