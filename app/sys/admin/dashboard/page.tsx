'use client'

import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import AdminDashboard from '@/components/system/dashboards/AdminDashboard'

export default function AdminDashboardPage() {
  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Panel de Administración</Heading>
          <Text color="gray.600">
            Gestión completa del sistema, usuarios y configuración
          </Text>
        </Box>
        
        <AdminDashboard />
      </VStack>
    </Box>
  )
}
