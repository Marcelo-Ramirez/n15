'use client'

import { Box, Heading, Text, VStack, HStack, Button } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FiUser, FiMail, FiPhone, FiShield, FiCalendar } from 'react-icons/fi'

interface UserData {
  id: number
  userName: string
  name: string
  phone?: string
  role: string
  createdAt: string
}

export default function UserPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          setUserData(data.user)
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <Box>
        <Text>Cargando datos del usuario...</Text>
      </Box>
    )
  }

  if (!userData) {
    return (
      <Box>
        <Text color="red.500">Error al cargar los datos del usuario</Text>
      </Box>
    )
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Perfil de Usuario</Heading>
          <Text color="gray.600">
            Información de tu cuenta y configuración personal
          </Text>
        </Box>

        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="md"
          border="1px"
          borderColor="gray.200"
        >
          <VStack gap={4} align="stretch">
            <HStack gap={4}>
              <Box
                w={16}
                h={16}
                bg="blue.500"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="full"
                fontSize="2xl"
                fontWeight="bold"
              >
                {userData.name.charAt(0).toUpperCase()}
              </Box>
              <Box>
                <Heading size="md">{userData.name}</Heading>
                <Text color="gray.600">@{userData.userName}</Text>
              </Box>
            </HStack>

            <Box h="1px" bg="gray.200" />

            <VStack gap={4} align="stretch">
              <HStack gap={3}>
                <FiUser size={20} color="gray" />
                <Box>
                  <Text fontWeight="medium">Nombre de Usuario</Text>
                  <Text color="gray.600">{userData.userName}</Text>
                </Box>
              </HStack>

              <HStack gap={3}>
                <FiUser size={20} color="gray" />
                <Box>
                  <Text fontWeight="medium">Nombre Completo</Text>
                  <Text color="gray.600">{userData.name}</Text>
                </Box>
              </HStack>

              {userData.phone && (
                <HStack gap={3}>
                  <FiPhone size={20} color="gray" />
                  <Box>
                    <Text fontWeight="medium">Teléfono</Text>
                    <Text color="gray.600">{userData.phone}</Text>
                  </Box>
                </HStack>
              )}

              <HStack gap={3}>
                <FiShield size={20} color="gray" />
                <Box>
                  <Text fontWeight="medium">Rol</Text>
                  <Text 
                    color="white" 
                    bg={
                      userData.role === 'admin' ? 'red.500' :
                      userData.role === 'stockroom' ? 'blue.500' :
                      userData.role === 'sales' ? 'green.500' : 'gray.500'
                    }
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                    fontWeight="medium"
                    display="inline-block"
                  >
                    {userData.role.toUpperCase()}
                  </Text>
                </Box>
              </HStack>

              <HStack gap={3}>
                <FiCalendar size={20} color="gray" />
                <Box>
                  <Text fontWeight="medium">Miembro desde</Text>
                  <Text color="gray.600">
                    {new Date(userData.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </Box>
              </HStack>
            </VStack>

            <Box h="1px" bg="gray.200" />

            <VStack gap={3} align="stretch">
              <Heading size="sm">Acciones</Heading>
              <HStack gap={3}>
                <Button colorScheme="blue" size="sm">
                  Editar Perfil
                </Button>
                <Button colorScheme="gray" variant="outline" size="sm">
                  Cambiar Contraseña
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}
