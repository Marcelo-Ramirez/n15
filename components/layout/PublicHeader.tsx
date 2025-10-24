'use client'

import { Box, HStack, Button, Container, Image } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export function PublicHeader() {
  const router = useRouter();

  return (
    <Box bg="white" shadow="sm" position="sticky" top="0" zIndex="100">
      <Container maxW="7xl">
        <HStack justify="space-between" py={4} pl={20}>
          <HStack gap={4}>
            <Image
              src="/images/logos/logo.png"
              alt="MuytunaSys"
              height="100px"
              cursor="pointer"
              onClick={() => router.push("/")}
            />
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
            
            
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}
