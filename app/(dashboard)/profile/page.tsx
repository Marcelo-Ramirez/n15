"use client";
import { Box, Heading, Text, Card } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <Box minH="100vh" bg="gray.50" py={10} px={4}>
      <Card.Root maxW="md" mx="auto">
        <Card.Body p={8}>
          <Heading size="xl" color="blue.600" mb={6}>
            Mi Perfil
          </Heading>
          
          <Box>
            <Text fontWeight="semibold" mb={2}>Información Personal</Text>
            <Text>Nombre: {user?.name || "No disponible"}</Text>
            <Text>Email: {user?.email}</Text>
            <Text>ID de Usuario: {user?.id}</Text>
          </Box>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
