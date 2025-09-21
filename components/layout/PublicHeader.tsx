'use client'

import { Box, HStack, Text, Button, Container, Image } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export function PublicHeader() {
  const router = useRouter();

  return (
    <Box bg="white" shadow="sm" position="sticky" top="0" zIndex="100">
      <Container maxW="7xl">
        <HStack justify="space-between" py={4}>
          <HStack gap={4}>
            <Image 
              src="/images/logos/logo.png" 
              alt="MuytunaSys" 
              height="40px"
            />
            <Text fontSize="xl" fontWeight="bold" color="green.600">
              MuytunaSys
            </Text>
          </HStack>

          <HStack gap={6}>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/catalog')}
            >
              Catálogo
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => router.push('/orders')}
            >
              Mis Pedidos
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => router.push('/cart')}
            >
              Carrito
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => router.push('/profile')}
            >
              Mi Cuenta
            </Button>
            
            <Button 
              colorScheme="green" 
              size="sm"
              onClick={() => router.push('/auth/login')}
            >
              Entrar
            </Button>
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}
