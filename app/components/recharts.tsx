'use client'

import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
  Tick
} from 'chart.js'
import ChartDataLabels, { Context as DatalabelsContext } from 'chartjs-plugin-datalabels'
import annotationPlugin from 'chartjs-plugin-annotation'
import { Chart } from 'react-chartjs-2'
import { Box, Button } from '@chakra-ui/react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
  annotationPlugin
)

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
  chartHeight = 500,
}: ParetoChartProps) => {
  const [showABC, setShowABC] = useState(false)

  const labels = data.map(d => d.name)
  const values = data.map(d => d.value)
  const accumulated = data.map(d => d.accumulated)

  // Definir colores ABC
  const categories = [
    { name: 'A', maxAccum: thresholds.A, color: '#e53e3e' }, // rojo
    { name: 'B', maxAccum: thresholds.B, color: '#3182ce' }, // azul
    { name: 'C', maxAccum: thresholds.C, color: '#38a169' }, // verde
  ]

  const dataChart = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Valor',
        data: values,
        backgroundColor: '#4299e1', // azul claro para las barras
        borderColor: '#2b6cb0',
        borderWidth: 1,
        yAxisID: 'y1',
      },
      {
        type: 'line' as const,
        label: 'Acumulado',
        data: accumulated,
        borderColor: '#f56500', // naranja
        backgroundColor: '#f56500',
        yAxisID: 'y2',
        tension: 0.2,
        fill: false,
        pointBackgroundColor: '#f56500',
        pointBorderColor: '#c53030',
        pointRadius: 4,
        borderWidth: 3,
      },
    ],
  }

  // Anotaciones solo si showABC es true
  const abcAnnotations = showABC
    ? categories.reduce((acc, cat) => {
        acc[cat.name + '_line'] = {
          type: 'line' as const,
          yMin: cat.maxAccum,
          yMax: cat.maxAccum,
          borderColor: cat.color,
          borderWidth: 2,
          borderDash: [5, 5], // línea punteada
          yScaleID: 'y2',
        }
        acc[cat.name + '_label'] = {
          type: 'label' as const,
          xValue: Math.floor(labels.length / 2),
          yValue: cat.maxAccum,
          xScaleID: 'x',
          yScaleID: 'y2',
          backgroundColor: cat.color,
          color: 'white',
          font: { size: 12, weight: 'bold' },
          content: [`Categoría ${cat.name}`],
          yAdjust: 15,
          position: 'center',
          borderRadius: 4,
          padding: 2,
        }
        return acc
      }, {} as Record<string, any>)
    : {}

  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        labels: { 
          color: '#2d3748', // texto oscuro
          font: { size: 12, weight: 'bold' }
        } 
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#2d3748',
        bodyColor: '#2d3748',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        callbacks: {
          label: function (tooltipItem: TooltipItem<'bar' | 'line'>) {
            if (tooltipItem.dataset.type === 'line') {
              return `Acumulado: ${(tooltipItem.raw as number).toFixed(1)}%`
            }
            const value = tooltipItem.raw as number
            return `Valor: ${value.toLocaleString()}`
          },
        },
      },
      datalabels: {
        color: '#2d3748', // texto oscuro
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 3,
        padding: 2,
        font: { size: 10, weight: 'bold' },
        anchor: 'end',
        align: 'top',
        formatter: (value: number, context: DatalabelsContext) => {
          if (context.dataset.type === 'line') {
            return (value as number).toFixed(1) + '%';
          }
          return value.toLocaleString();
        },
      },
      annotation: {
        annotations: abcAnnotations,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#2d3748', // texto oscuro
          font: { size: 11 }
        },
        grid: {
          color: '#e2e8f0', // gris claro
          lineWidth: 1,
        }
      },
      y1: {
        type: 'linear',
        position: 'left',
        ticks: {
          color: '#2d3748', // texto oscuro
          font: { size: 11 }
        },
        grid: {
          color: '#e2e8f0', // gris claro
          lineWidth: 1,
        },
        title: { 
          display: true, 
          text: 'Valor', 
          color: '#2d3748',
          font: { size: 12, weight: 'bold' }
        },
      },
      y2: {
        type: 'linear',
        position: 'right',
        ticks: {
          color: '#f56500', // naranja para el eje acumulado
          font: { size: 11 },
          callback: (tickValue: string | number, index: number, ticks: Tick[]) =>
            typeof tickValue === 'number' ? `${tickValue}%` : tickValue,
        },
        grid: { 
          drawOnChartArea: false,
          color: '#fed7aa', // naranja claro
        },
        title: { 
          display: true, 
          text: 'Acumulado %', 
          color: '#f56500',
          font: { size: 12, weight: 'bold' }
        },
      },
    },
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
        <Chart type="bar" data={dataChart} options={options} />
      </Box>
    </Box>
  )
}

export default ParetoChart