"use client";
import { Box, Heading, Text, Button, Stack, Card, VStack } from "@chakra-ui/react";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10} px={4}>
      <Stack gap={8} maxW="4xl" mx="auto">
        {/* Header */}
        <Stack gap={4} textAlign="center">
          <Heading size="3xl" color="blue.600">
            Dashboard Principal
          </Heading>
          <Text fontSize="lg" color="gray.600">
            ¡Bienvenido {user?.name || user?.email}! 
          </Text>
        </Stack>

        {/* Dashboard Content */}
        <Card.Root>
          <Card.Body p={8}>
            <VStack gap={6} align="stretch">
              <Heading size="xl" color="gray.700">
                Panel de Control
              </Heading>
              
              <Text color="gray.600">
                Esta es tu área privada. Solo usuarios autenticados pueden ver este contenido.
              </Text>

              <Stack gap={4}>
                <Card.Root variant="outline">
                  <Card.Body p={4}>
                    <Text fontWeight="semibold">Estado de Sesión</Text>
                    <Text color="green.500">✅ Autenticado con NextAuth</Text>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="outline">
                  <Card.Body p={4}>
                    <Text fontWeight="semibold">Información del Usuario</Text>
                    <Text>Nombre: {user?.name || "No disponible"}</Text>
                    <Text>Email: {user?.email}</Text>
                    <Text>ID: {(user as any)?.id || "No disponible"}</Text>
                  </Card.Body>
                </Card.Root>
              </Stack>

              <Button 
                onClick={handleLogout} 
                colorScheme="red" 
                size="lg"
                w="fit-content"
                mx="auto"
              >
                Cerrar Sesión
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Stack>
    </Box>
  );
}
