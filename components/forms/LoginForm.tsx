'use client'

import { 
  Box,
  Button,
  Input,
  VStack,
  Text
} from '@chakra-ui/react'
import { useState } from 'react'

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void
  isLoading?: boolean
  error?: string
}

export default function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Box as="form" onSubmit={handleSubmit} w="100%" maxW="400px">
      <VStack gap={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={4}>
          Login
        </Text>

        {error && (
          <Box bg="red.100" color="red.800" p={3} rounded="md">
            {error}
          </Box>
        )}

        <Box>
          <Text mb={1} fontWeight="medium">Email</Text>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </Box>

        <Box>
          <Text mb={1} fontWeight="medium">Password</Text>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </Box>

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          loading={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </VStack>
    </Box>
  )
}
