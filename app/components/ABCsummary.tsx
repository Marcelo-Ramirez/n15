'use client'

import { useState } from 'react'
import { Box, Button } from '@chakra-ui/react'

type ABCRow = {
  n: number
  participationN: number
  totalValue: number
  participationSales: number
}

type ABCSummaryProps = {
  summary: ABCRow[]
  thresholds: { A: number; B: number; C: number }
}

const ABCSummary = ({ summary, thresholds }: ABCSummaryProps) => {
  const [showTable, setShowTable] = useState(false) // controla si se muestra la tabla

  const rangeTexts = [
    `0–${thresholds.A}`,                   
    `${thresholds.A + 1}–${thresholds.B}`, 
    `${thresholds.B + 1}–${thresholds.C}`  
  ]

  return (
    <Box mt={8} overflowX="auto">
      <Button mb={4} colorScheme="teal" onClick={() => setShowTable(prev => !prev)}>
        {showTable ? 'Ocultar Resumen ABC' : 'Mostrar Resumen ABC'}
      </Button>

      {showTable && (
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
      )}
    </Box>
  )
}

export default ABCSummary
