'use client'

import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import UserProfile from '@/components/system/UserProfile'

export default function UserProfilePage() {
  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Perfil de Usuario</Heading>
          <Text color="gray.600">
            Gestiona tu información personal y la configuración de seguridad.
          </Text>
        </Box>
        
        <UserProfile />
      </VStack>
    </Box>
  )
}