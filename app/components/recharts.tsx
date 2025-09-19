'use client'

import { useState } from 'react'
import { Box, Button } from '@chakra-ui/react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  LabelList
} from 'recharts'

type ParetoData = {
  name: string
  value: number
  accumulated: number
}

type ParetoChartProps = {
  data: ParetoData[]
  thresholds?: { A: number; B: number; C: number }
  chartHeight?: number
}

const ParetoChart = ({
  data,
  thresholds = { A: 70, B: 90, C: 100 },
  chartHeight = 600,
}: ParetoChartProps) => {
  const [showABC, setShowABC] = useState(false)

  // Mantener datos exactamente como el original
  const chartData = data.map(item => ({
    name: item.name,
    value: item.value,
    accumulated: item.accumulated
  }))

  // Tooltip exacto al original
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          color: '#2d3748',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          padding: '8px'
        }}>
          <p style={{ margin: '0 0 4px 0' }}>{label}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey === 'accumulated') {
              return <p key={index} style={{ margin: '0', color: entry.color }}>
                Acumulado: {(entry.value as number).toFixed(1)}%
              </p>
            } else {
              return <p key={index} style={{ margin: '0', color: entry.color }}>
                Valor: {(entry.value as number).toLocaleString()}
              </p>
            }
          })}
        </div>
      )
    }
    return null
  }

  // Labels para barras mejorados - posición ajustada para evitar solapamiento
  const renderBarLabel = (props: any) => {
    const { x, y, width, value } = props
    return (
      <g>
        <rect
          x={x + width/2 - 25}
          y={y - 25}
          width="50"
          height="18"
          fill="rgba(255, 255, 255, 0.9)"
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth="1"
          rx="4"
        />
        <text
          x={x + width/2}
          y={y - 12}
          fill="#2d3748"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
        >
          {value.toLocaleString()}
        </text>
      </g>
    )
  }

  // Labels para línea mejorados - posición ajustada
  const renderLineLabel = (props: any) => {
    const { x, y, value } = props
    return (
      <g>
        <rect
          x={x - 20}
          y={y + 8}
          width="40"
          height="16"
          fill="rgba(255, 255, 255, 0.9)"
          stroke="rgba(245, 101, 0, 0.3)"
          strokeWidth="1"
          rx="3"
        />
        <text
          x={x}
          y={y + 20}
          fill="#f56500"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
        >
          {(value as number).toFixed(1)}%
        </text>
      </g>
    )
  }

  // Componente personalizado para los labels de categorías ABC mejorado
  const CustomReferenceLabel = ({ viewBox, value, color }: any) => {
    const { x, y, width } = viewBox
    const centerX = Math.floor(width / 2)
    
    return (
      <g>
        <rect
          x={centerX - 35}
          y={y + 0}
          width="70"
          height="22"
          fill={color}
          rx="6"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
        />
        <text
          x={centerX}
          y={y+20}
          fill="white"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
        >
          Cat. {value}
        </text>
      </g>
    )
  }

  return (
    <Box w="100%" bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
      <Button
        mb={4}
        colorScheme="teal"
        onClick={() => setShowABC(prev => !prev)}
        size="sm"
      >
        {showABC ? 'Ocultar Líneas ABC' : 'Mostrar Líneas ABC'}
      </Button>
      
      <Box w="100%" h={`${chartHeight}px`} bg="gray.50" borderRadius="md" p={2}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData} 
            margin={{ top: 50, right: 50, left: 60, bottom: 80 }}
          >
            {/* Grid igual al original */}
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            
            {/* Eje X mejorado - nombres en vertical y mejor espaciado */}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: '#2d3748' }}
              axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
              tickLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            
            {/* Eje Y izquierdo mejorado - más espacio para evitar solapamiento */}
            <YAxis 
              yAxisId="y1"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickCount={8}
              tick={{ fontSize: 11, fill: '#2d3748' }}
              axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
              tickLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
              tickFormatter={(value) => value.toLocaleString()}
              width={50}
              label={{ 
                value: 'Valor', 
                angle: -90, 
                position: 'insideLeft',
                style: { 
                  textAnchor: 'middle', 
                  fill: '#2d3748',
                  fontSize: '12px',
                  fontWeight: 'bold'
                },
                offset: -10
              }}
            />
            
            {/* Eje Y derecho mejorado - más espacio */}
            <YAxis 
              yAxisId="y2" 
              orientation="right"
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fontSize: 11, fill: '#f56500' }}
              axisLine={{ stroke: '#fed7aa', strokeWidth: 1 }}
              tickLine={{ stroke: '#fed7aa', strokeWidth: 1 }}
              tickFormatter={(value) => `${value}%`}
              width={50}
              label={{ 
                value: 'Acumulado %', 
                angle: 90, 
                position: 'insideRight',
                style: { 
                  textAnchor: 'middle', 
                  fill: '#f56500',
                  fontSize: '12px',
                  fontWeight: 'bold'
                },
                offset: -10
              }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#2d3748'
              }}
            />
            
            {/* Barras exactas al original */}
            <Bar 
              yAxisId="y1"
              dataKey="value" 
              fill="#4299e1"
              stroke="#2b6cb0"
              strokeWidth={1}
              name="Valor"
            >
              <LabelList content={renderBarLabel} />
            </Bar>
            
            {/* Línea exacta al original */}
            <Line 
              yAxisId="y2"
              type="monotone" 
              dataKey="accumulated" 
              stroke="#f56500" 
              strokeWidth={3}
              dot={{ fill: '#f56500', stroke: '#c53030', strokeWidth: 2, r: 4 }}
              name="Acumulado"
            >
              <LabelList content={renderLineLabel} />
            </Line>
            
            {/* Líneas ABC con labels personalizados mejorados */}
            {showABC && (
              <>
                <ReferenceLine 
                  yAxisId="y2"
                  y={thresholds.A} 
                  stroke="#e53e3e" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  label={<CustomReferenceLabel value="A" color="#e53e3e" />}
                />
                <ReferenceLine 
                  yAxisId="y2"
                  y={thresholds.B} 
                  stroke="#3182ce" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  label={<CustomReferenceLabel value="B" color="#3182ce" />}
                />
                <ReferenceLine 
                  yAxisId="y2"
                  y={thresholds.C} 
                  stroke="#38a169" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  label={<CustomReferenceLabel value="C" color="#38a169" />}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

export default ParetoChart