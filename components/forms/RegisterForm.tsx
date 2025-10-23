'use client'

import { 
  Box,
  Button,
  Input,
  VStack,
  Text
} from '@chakra-ui/react'
import { useState } from 'react'

interface RegisterFormProps {
  onSubmit: (data: { 
    username: string
    email: string
    password: string
    confirmPassword: string 
  }) => void
  isLoading?: boolean
  error?: string
}

export default function RegisterForm({ onSubmit, isLoading = false, error }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      return
    }
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const passwordsMatch = formData.password === formData.confirmPassword
  const showPasswordError = formData.confirmPassword.length > 0 && !passwordsMatch

  return (
    <Box as="form" onSubmit={handleSubmit} w="100%" maxW="400px">
      <VStack gap={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={4}>
          Register
        </Text>

        {error && (
          <Box bg="red.100" color="red.800" p={3} rounded="md">
            {error}
          </Box>
        )}

        <Box>
          <Text mb={1} fontWeight="medium">Username</Text>
          <Input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />
        </Box>

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

        <Box>
          <Text mb={1} fontWeight="medium">Confirm Password</Text>
          <Input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            borderColor={showPasswordError ? 'red.500' : undefined}
          />
          {showPasswordError && (
            <Text fontSize="sm" color="red.500" mt={1}>
              Passwords do not match
            </Text>
          )}
        </Box>

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          loading={isLoading}
          disabled={!passwordsMatch || formData.password.length === 0}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </VStack>
    </Box>
  )
}
