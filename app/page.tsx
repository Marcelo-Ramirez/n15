"use client";

import { useState, useEffect } from "react";
import { 
  Box, 
  Container, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  SimpleGrid, 
  Spinner, 
  Image 
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

interface Product {
  id: number;
  name: string;
  flavor: string;
  pricePerUnit: number;
  imageUrl?: string | null;
}

export default function HomePage() {
  const router = useRouter();
  return (
    <Box minH="100vh" bg="gray.50">
      <PublicHeader />
      <Container maxW="7xl" py={12} mx="auto" textAlign="center">
        <VStack gap={12} align="center" width="100%">
          <VStack gap={8} textAlign="center" mb={0} align="center">
            <Text fontSize="4xl" fontWeight="bold" color="gray.800">
              Bienvenido a Nuestra Tienda de Gomitas
            </Text>
            <Text fontSize="xl" color="gray.600" maxW="600px">
              Descubre nuestra deliciosa colección de gomitas premium elaboradas con los mejores ingredientes.
            </Text>
            <HStack gap={4} justify="center">
              <Button 
                colorScheme="blue" 
                size="lg"
                onClick={() => router.push('/catalog')}
              >
                Ver Catálogo
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => router.push('/sys/login')}
              >
                Ingresar al Sistema
              </Button>
            </HStack>
          </VStack>
          {/* Sección de Productos Destacados */}
          <Box width="100%">
            <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center">
              Productos Destacados
            </Text>
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              gap={6}
              justifyItems="center"
              maxW="1100px"
              mx="auto"
            >
              {[1, 2, 3].map((index) => (
                <Box 
                  key={index}
                  bg="white" 
                  p={6} 
                  rounded="lg" 
                  shadow="sm"
                  textAlign="center"
                  mx="auto"
                  maxW="320px"
                >
                  <Box 
                    h="200px" 
                    bg="gray.200" 
                    rounded="md" 
                    mb={4}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="gray.500">Imagen del Producto</Text>
                  </Box>
                  <Text fontWeight="semibold" mb={2}>
                    Gomita de Muestra {index}
                  </Text>
                  <Text color="gray.600" mb={4}>
                    Deliciosas gomitas con sabor a frutas
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.600">
                    $9.99
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
      <PublicFooter />
    </Box>
  );
}