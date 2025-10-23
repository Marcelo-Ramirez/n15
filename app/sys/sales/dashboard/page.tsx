'use client'

import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import VentasDashboard from '@/components/system/dashboards/VentasDashboard'

export default function SalesDashboardPage() {
  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Panel de Ventas</Heading>
          <Text color="gray.600">
            Gestión de pedidos, clientes y reportes de ventas
          </Text>
        </Box>
        
        <VentasDashboard />
      </VStack>
    </Box>
  )
}
