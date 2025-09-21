'use client'

import { Box, Text, HStack, Badge } from '@chakra-ui/react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: 'increase' | 'decrease'
  }
  icon?: React.ReactNode
}

export default function StatsCard({ title, value, change, icon }: StatsCardProps) {
  return (
    <Box
      bg="white"
      p={6}
      rounded="lg"
      shadow="sm"
      border="1px"
      borderColor="gray.200"
    >
      <HStack justify="space-between" align="start">
        <Box>
          <Text fontSize="sm" color="gray.600" mb={1}>
            {title}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="gray.900">
            {value}
          </Text>
          {change && (
            <Badge
              colorScheme={change.type === 'increase' ? 'green' : 'red'}
              fontSize="xs"
              mt={2}
            >
              {change.type === 'increase' ? '↗' : '↘'} {change.value}
            </Badge>
          )}
        </Box>
        {icon && (
          <Box fontSize="2xl" color="gray.400">
            {icon}
          </Box>
        )}
      </HStack>
    </Box>
  )
}
