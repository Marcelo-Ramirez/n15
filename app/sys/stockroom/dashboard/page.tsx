'use client'

import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import AlmacenDashboard from '@/components/system/dashboards/AlmacenDashboard'

export default function StockroomDashboardPage() {
  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Panel de Almacén</Heading>
          <Text color="gray.600">
            Gestión de inventario, stock y movimientos de almacén
          </Text>
        </Box>
        
        <AlmacenDashboard />
      </VStack>
    </Box>
  )
}
