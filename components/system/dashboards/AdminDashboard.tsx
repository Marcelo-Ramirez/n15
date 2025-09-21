'use client'

import { Box, Grid, Text, VStack } from '@chakra-ui/react'
import StatsCard from '@/components/ui/StatsCard'
import { FiUsers, FiPackage, FiDollarSign, FiTrendingUp } from 'react-icons/fi'

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Total Users',
      value: '156',
      change: { value: '+12%', type: 'increase' as const },
      icon: <FiUsers />
    },
    {
      title: 'Products',
      value: '89',
      change: { value: '+5%', type: 'increase' as const },
      icon: <FiPackage />
    },
    {
      title: 'Revenue',
      value: '$12,426',
      change: { value: '+18%', type: 'increase' as const },
      icon: <FiDollarSign />
    },
    {
      title: 'Growth',
      value: '24%',
      change: { value: '+2%', type: 'increase' as const },
      icon: <FiTrendingUp />
    }
  ]

  return (
    <VStack gap={6} align="stretch">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Admin Dashboard
        </Text>
        <Text color="gray.600">
          Overview of your business metrics and performance
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
            Recent Activity
          </Text>
          <Text color="gray.500">
            Activity feed will be displayed here
          </Text>
        </Box>

        <Box bg="white" p={6} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Quick Actions
          </Text>
          <Text color="gray.500">
            Quick action buttons will be displayed here
          </Text>
        </Box>
      </Grid>
    </VStack>
  )
}
