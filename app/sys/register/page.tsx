'use client'

import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Container,
  Link,
  Heading
} from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'

interface FormData {
  userName: string
  name: string
  phone: string
  password: string
  confirmPassword: string
  role: string
  registrationKey: string
}

interface FormErrors {
  [key: string]: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    registrationKey: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validar userName
    if (!formData.userName.trim()) {
      newErrors.userName = 'El nombre de usuario es requerido'
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'El nombre de usuario debe tener al menos 3 caracteres'
    }

    // Validar name
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre completo es requerido'
    }

    // Validar phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    // Validar confirmPassword
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmar contraseña es requerido'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    // Validar role
    if (!formData.role) {
      newErrors.role = 'El rol es requerido'
    }

    // Validar registrationKey
    if (!formData.registrationKey.trim()) {
      newErrors.registrationKey = 'La clave de registro es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setServerError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro')
      }

      // Registro exitoso, redirigir al login
      router.push('/sys/login?message=Registro exitoso. Por favor inicia sesión.')
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Container maxW="md">
        <Box
          bg="white"
          p={8}
          borderRadius="lg"
          boxShadow="md"
          border="1px"
          borderColor="gray.200"
        >
          <VStack gap={6} align="stretch">
            <VStack gap={2}>
              <Heading size="lg" textAlign="center" color="gray.700">
                Registro de Usuario del Sistema
              </Heading>
              <Text color="gray.600" textAlign="center">
                Complete la información para crear una cuenta
              </Text>
            </VStack>

            {serverError && (
              <Box bg="red.100" color="red.800" p={3} borderRadius="md">
                {serverError}
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                <Box w="full">
                  <Text mb={1} fontWeight="medium" color="gray.700">
                    Nombre de Usuario
                  </Text>
                  <Input
                    type="text"
                    value={formData.userName}
                    onChange={handleInputChange('userName')}
                    placeholder="Ingrese su nombre de usuario"
                    borderColor={errors.userName ? 'red.300' : 'gray.300'}
                  />
                  {errors.userName && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.userName}
                    </Text>
                  )}
                </Box>

                <Box w="full">
                  <Text mb={1} fontWeight="medium" color="gray.700">
                    Nombre Completo
                  </Text>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    placeholder="Ingrese su nombre completo"
                    borderColor={errors.name ? 'red.300' : 'gray.300'}
                  />
                  {errors.name && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.name}
                    </Text>
                  )}
                </Box>

                <Box w="full">
                  <Text mb={1} fontWeight="medium" color="gray.700">
                    Teléfono
                  </Text>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="Ingrese su número de teléfono"
                    borderColor={errors.phone ? 'red.300' : 'gray.300'}
                  />
                  {errors.phone && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.phone}
                    </Text>
                  )}
                </Box>

                <Box w="full">
                  <Text mb={1} fontWeight="medium" color="gray.700">
                    Contraseña
                  </Text>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    placeholder="Ingrese su contraseña"
                    borderColor={errors.password ? 'red.300' : 'gray.300'}
                  />
                  {errors.password && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.password}
                    </Text>
                  )}
                </Box>

                <Box w="full">
                  <Text mb={1} fontWeight="medium" color="gray.700">
                    Confirmar Contraseña
                  </Text>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    placeholder="Confirme su contraseña"
                    borderColor={errors.confirmPassword ? 'red.300' : 'gray.300'}
                  />
                  {errors.confirmPassword && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </Box>

                <Box w="full">
                  <Text mb={1} fontWeight="medium" color="gray.700">
                    Rol
                  </Text>
                  <select
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: `1px solid ${errors.role ? '#FC8181' : '#D2D6DC'}`,
                      borderRadius: '6px',
                      backgroundColor: 'white'
                    }}
                    value={formData.role}
                    onChange={handleInputChange('role')}
                  >
                    <option value="">Seleccione un rol</option>
                    <option value="admin">Administrador</option>
                    <option value="stockroom">Almacén</option>
                    <option value="sales">Ventas</option>
                  </select>
                  {errors.role && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.role}
                    </Text>
                  )}
                </Box>

                <Box w="full">
                  <Text mb={1} fontWeight="medium" color="gray.700">
                    Clave de Registro
                  </Text>
                  <Input
                    type="password"
                    value={formData.registrationKey}
                    onChange={handleInputChange('registrationKey')}
                    placeholder="Ingrese la clave de registro"
                    borderColor={errors.registrationKey ? 'red.300' : 'gray.300'}
                  />
                  {errors.registrationKey && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.registrationKey}
                    </Text>
                  )}
                </Box>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  loading={isLoading}
                  loadingText="Registrando..."
                >
                  Registrarse
                </Button>
              </VStack>
            </form>

            <HStack justify="center" gap={2}>
              <Text color="gray.600">¿Ya tienes una cuenta?</Text>
              <Link asChild color="blue.500" fontWeight="medium">
                <NextLink href="/sys/login">Iniciar Sesión</NextLink>
              </Link>
            </HStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}
