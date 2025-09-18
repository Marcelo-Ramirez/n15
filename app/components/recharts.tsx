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
  const [showABC, setShowABC] = useState(true) // controla si se muestran las líneas

  const labels = data.map(d => d.name)
  const values = data.map(d => d.value)
  const accumulated = data.map(d => d.accumulated)

  // Definir colores ABC
  const categories = [
    { name: 'A', maxAccum: thresholds.A, color: 'red' },
    { name: 'B', maxAccum: thresholds.B, color: 'yellow' },
    { name: 'C', maxAccum: thresholds.C, color: 'green' },
  ]

  const dataChart = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Valor',
        data: values,
        backgroundColor: 'blue',
        yAxisID: 'y1',
      },
      {
        type: 'line' as const,
        label: 'Acumulado',
        data: accumulated,
        borderColor: 'orange',
        backgroundColor: 'orange',
        yAxisID: 'y2',
        tension: 0.2,
        fill: false,
        pointBackgroundColor: 'orange',
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
          yScaleID: 'y2',
        }
        acc[cat.name + '_label'] = {
          type: 'label' as const,
          xValue: Math.floor(labels.length / 2),
          yValue: cat.maxAccum,
          xScaleID: 'x',
          yScaleID: 'y2',
          backgroundColor: 'transparent',
          color: cat.color,
          font: { size: 14, weight: 'bold' },
          content: [cat.name],
          yAdjust: 10,
          position: 'center',
        }
        return acc
      }, {} as Record<string, any>)
    : {}

  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'white' } },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: TooltipItem<'bar' | 'line'>) {
            if (tooltipItem.dataset.type === 'line') {
              return `Acumulado: ${(tooltipItem.raw as number).toFixed(1)}%`
            }
            return `Valor: ${tooltipItem.raw as number}`
          },
        },
      },
      datalabels: {
        color: 'white',
        anchor: 'end',
        align: 'top',
        formatter: (value: number, context: DatalabelsContext) => {
  if (context.dataset.type === 'line') {
    return (value as number).toFixed(1) + '%';
  }
  return value;
},
      },
      annotation: {
        annotations: abcAnnotations,
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
        },
      },
      y1: {
        type: 'linear',
        position: 'left',
        ticks: {
          color: 'white',
        },
        title: { display: true, text: 'Valor', color: 'white' },
      },
      y2: {
        type: 'linear',
        position: 'right',
        ticks: {
          color: 'orange',
          callback: (tickValue: string | number, index: number, ticks: Tick[]) =>
            typeof tickValue === 'number' ? `${tickValue}%` : tickValue,
        },
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Acumulado %', color: 'orange' },
      },
    },
  }

  return (
    <Box w="100%" bg="gray.800" px={4} py={4}>
      <Button
        mb={4}
        colorScheme="teal"
        onClick={() => setShowABC(prev => !prev)}
      >
        {showABC ? 'Ocultar ABC' : 'Mostrar ABC'}
      </Button>
      <Box w="100%" h={`${chartHeight + 100}px`}>
        <Chart type="bar" data={dataChart} options={options} />
      </Box>
    </Box>
  )
}

export default ParetoChart
