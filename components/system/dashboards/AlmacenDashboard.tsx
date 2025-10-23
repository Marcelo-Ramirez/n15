'use client'

import { Box, Grid, Text, VStack } from '@chakra-ui/react'
import StatsCard from '@/components/ui/StatsCard'
import { FiPackage, FiAlertTriangle, FiTruck, FiRefreshCw } from 'react-icons/fi'

export default function AlmacenDashboard() {
  const stats = [
    {
      title: 'Total Inventory',
      value: '1,234',
      change: { value: '+5%', type: 'increase' as const },
      icon: <FiPackage />
    },
    {
      title: 'Low Stock Items',
      value: '23',
      change: { value: '+3', type: 'increase' as const },
      icon: <FiAlertTriangle />
    },
    {
      title: 'Pending Orders',
      value: '45',
      change: { value: '-2', type: 'decrease' as const },
      icon: <FiTruck />
    },
    {
      title: 'Stock Movements',
      value: '156',
      change: { value: '+12', type: 'increase' as const },
      icon: <FiRefreshCw />
    }
  ]

  return (
    <VStack gap={6} align="stretch">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Warehouse Dashboard
        </Text>
        <Text color="gray.600">
          Monitor inventory levels and warehouse operations
        </Text>
      </Box>

      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
          />
        ))}
      </Grid>

      <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
        <Box bg="white" p={6} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Low Stock Alerts
          </Text>
          <Text color="gray.500">
            Items running low on stock will be displayed here
          </Text>
        </Box>

        <Box bg="white" p={6} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Recent Movements
          </Text>
          <Text color="gray.500">
            Latest inventory movements will be displayed here
          </Text>
        </Box>
      </Grid>
    </VStack>
  )
}
