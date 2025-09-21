'use client'

import { Box, Text, Button, VStack } from '@chakra-ui/react'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export default function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction, 
  icon 
}: EmptyStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={8}
      textAlign="center"
      minH="400px"
    >
      <VStack gap={4}>
        {icon && (
          <Box fontSize="4xl" color="gray.400">
            {icon}
          </Box>
        )}
        
        <Text fontSize="xl" fontWeight="semibold" color="gray.700">
          {title}
        </Text>
        
        {description && (
          <Text color="gray.500" maxW="400px">
            {description}
          </Text>
        )}
        
        {actionLabel && onAction && (
          <Button colorScheme="blue" onClick={onAction} mt={4}>
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  )
}
