'use client'

import { Box, Text, Flex } from '@chakra-ui/react'

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
  const maxValue = Math.max(...data.map(d => d.value))

  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)))
  const baseStep = magnitude / 2
  const step = baseStep < 5 ? 5 : baseStep
  const roundedMax = Math.ceil(maxValue / step) * step

  const yTicks = Array.from(
    { length: Math.floor(roundedMax / step) + 1 },
    (_, i) => i * step
  )

  const percentTicks = Array.from({ length: 6 }, (_, i) => i * 20)

  // Categorías ABC dinámicas
  const categories = [
    { name: 'A', maxAccum: thresholds.A },
    { name: 'B', maxAccum: thresholds.B },
    { name: 'C', maxAccum: thresholds.C },
  ]

  // Colores personalizados por categoría
  const categoryColors: Record<string, string> = {
    A: 'red.400',
    B: 'yellow.400',
    C: 'green.400',
  }

  return (
    <Box
      w="100%"
      h={`${chartHeight + 100}px`}
      position="relative"
      border="1px solid gray"
      overflowX="auto"
      overflowY="auto"
      bg="gray.800"
      px={20}
      py={10}
    >
      <Flex h={`${chartHeight}px`} position="relative">
        {/* Eje vertical izquierdo */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          h="100%"
          w="5px"
          bg="gray.800"
          mr={4}
          position="relative"
        >
          {yTicks
            .slice()
            .reverse()
            .map((val, i) => (
              <Text
                key={i}
                fontSize="xs"
                textAlign="right"
                color="whiteAlpha.900"
                position="absolute"
                bottom={`${(val / roundedMax) * chartHeight}px`}
                right={0}
              >
                {val.toLocaleString()}
              </Text>
            ))}
        </Box>

        {/* Área de barras */}
        <Flex
          h="100%"
          align="flex-end"
          gap="16px"
          flex={1}
          bg="gray.800"
          position="relative"
        >
          {data.map((d, i) => {
            const barHeight = (d.value / roundedMax) * chartHeight
            return (
              <Box key={i} w="40.8px" textAlign="center" position="relative">
                {/* Barra */}
                <Box
                  h={`${barHeight}px`}
                  w="100%"
                  bg="blue.400"
                  borderRadius="2px"
                />
                {/* Línea acumulada */}
                <Box
                  position="absolute"
                  bottom={`${(d.accumulated / 100) * chartHeight}px`}
                  left={0}
                  w="100%"
                  h="4px"
                  bg="orange.400"
                />
                {/* Porcentaje sobre barra */}
                <Text
                  position="absolute"
                  bottom={`${(d.accumulated / 100) * chartHeight + 4}px`}
                  left="50%"
                  transform="translateX(-50%)"
                  fontSize="xx-small"
                  color="orange.200"
                >
                  {d.accumulated.toFixed(1)}%
                </Text>
              </Box>
            )
          })}

          {/* Líneas horizontales de ABC */}
          {categories.map((cat, i) => {
            const horizPos = (cat.maxAccum / 100) * chartHeight
            const color = categoryColors[cat.name] || 'gray.400'
            return (
              <Box
                key={i}
                position="absolute"
                top={chartHeight - horizPos}
                left={0}
                w="100%"
              >
                <Box w="100%" h="2px" bg={color} />
                <Text
                  position="absolute"
                  top="6px"
                  left="50%"
                  transform="translateX(-50%)"
                  fontSize="xs"
                  fontWeight="bold"
                  color={color}
                >
                  {cat.name}
                </Text>
              </Box>
            )
          })}
        </Flex>

        {/* Eje vertical derecho */}
        <Box position="relative" w="40px" ml={4}>
          {percentTicks.map((p, i) => (
            <Text
              key={i}
              position="absolute"
              bottom={`${(p / 100) * chartHeight - 2}px`}
              left={0}
              fontSize="xs"
              textAlign="left"
              color="orange.300"
            >
              {p}%
            </Text>
          ))}
        </Box>
      </Flex>

      {/* Nombres de barras */}
      <Flex mt={2} ml="2.5" gap="16px">
        {data.map((d, i) => (
          <Text
            key={i}
            fontSize="xs"
            maxW="45px"
            textAlign="center"
            color="whiteAlpha.900"
          >
            {d.name}
          </Text>
        ))}
      </Flex>
    </Box>
  )
}

export default ParetoChart
