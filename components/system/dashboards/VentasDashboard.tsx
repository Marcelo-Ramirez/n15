'use client'

import { Box, Grid, Text, VStack } from '@chakra-ui/react'
import StatsCard from '@/components/ui/StatsCard'
import { FiShoppingCart, FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi'

export default function VentasDashboard() {
  const stats = [
    {
      title: 'Total Sales',
      value: '$8,420',
      change: { value: '+15%', type: 'increase' as const },
      icon: <FiDollarSign />
    },
    {
      title: 'Orders Today',
      value: '34',
      change: { value: '+8', type: 'increase' as const },
      icon: <FiShoppingCart />
    },
    {
      title: 'Active Customers',
      value: '89',
      change: { value: '+12%', type: 'increase' as const },
      icon: <FiUsers />
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: { value: '+0.5%', type: 'increase' as const },
      icon: <FiTrendingUp />
    }
  ]

  return (
    <VStack gap={6} align="stretch">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Sales Dashboard
        </Text>
        <Text color="gray.600">
          Track sales performance and customer metrics
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
            Recent Orders
          </Text>
          <Text color="gray.500">
            Latest customer orders will be displayed here
          </Text>
        </Box>

        <Box bg="white" p={6} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Top Products
          </Text>
          <Text color="gray.500">
            Best selling products will be displayed here
          </Text>
        </Box>
      </Grid>
    </VStack>
  )
}
