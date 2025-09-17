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
}

const ABCSummary = ({ summary }: ABCSummaryProps) => {
  // Lista fija de textos de rango
  const rangeTexts = ['0–80', '81–95', '96–100']

  return (
    <Box mt={8} overflowX="auto">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px', textAlign: 'left' }}>Rango %</th>
            <th style={{ padding: '8px', textAlign: 'left' }}># de productos</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Participación N %</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Ventas (valor anual)</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Participación en ventas %</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((row, index) => (
            <tr key={index}>
              {/* Mostrar los tres textos fijos, uno por fila según el índice modulo 3 */}
              <td style={{ padding: '8px' }}>{rangeTexts[index % 3]}</td>
              <td style={{ padding: '8px' }}>{row.n}</td>
              <td style={{ padding: '8px' }}>
                {row.participationN.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
              </td>
              <td style={{ padding: '8px' }}>
                ${row.totalValue.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
