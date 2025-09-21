'use client'

import { Box, Spinner, Center, Text } from '@chakra-ui/react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
}

export default function LoadingSpinner({ size = 'lg', text = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <Center p={8}>
      <Box textAlign="center">
        <Spinner
          color="blue.500"
          size={size}
        />
        {text && (
          <Text mt={4} color="gray.600">
            {text}
          </Text>
        )}
      </Box>
    </Center>
  )
}
