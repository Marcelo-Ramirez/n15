"use client";

import { 
  Box, 
  Container, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  SimpleGrid, 
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
// ✅ 1. Importar el componente Image de Next.js
import Image from 'next/image'; 

// ✅ 2. Interfaz 'Product' eliminada porque no se usaba

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
              {/* Gomita Beterraga */}
              <Box
                bg="white"
                p={6}
                rounded="lg"
                shadow="sm"
                textAlign="center"
                mx="auto"
                maxW="320px"
              >
                {/* ✅ 1. Reemplazado <img> con <Image> */}
                <Box
                  position="relative" // Necesario para Image con fill={true}
                  h="200px"
                  bg="gray.200" // Fondo mientras carga o si la imagen es transparente
                  rounded="md"
                  mb={4}
                  overflow="hidden" // Para contener la imagen si usa objectFit
                >
                  <Image 
                    src="/images/products/gomitaBeterraga.png" 
                    alt="Gomita Beterraga" 
                    fill={true} // Llena el contenedor padre
                    style={{ objectFit: 'contain' }} // Asegura que se vea completa
                  />
                </Box>
                <Text fontWeight="semibold" mb={2}>
                  Gomita Beterraga
                </Text>
                <Text color="gray.600" mb={4}>
                  Gomita natural sabor beterraga
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.600">
                  Bs 1.5
                </Text>
              </Box>
              {/* Gomita Frutilla */}
              <Box
                bg="white"
                p={6}
                rounded="lg"
                shadow="sm"
                textAlign="center"
                mx="auto"
                maxW="320px"
              >
                {/* ✅ 1. Reemplazado <img> con <Image> */}
                <Box
                  position="relative" 
                  h="200px"
                  bg="gray.200"
                  rounded="md"
                  mb={4}
                  overflow="hidden"
                >
                  <Image 
                    src="/images/products/gomitaFrutilla.png" 
                    alt="Gomita Frutilla" 
                    fill={true} 
                    style={{ objectFit: 'contain' }} 
                  />
                </Box>
                <Text fontWeight="semibold" mb={2}>
                  Gomita Frutilla
                </Text>
                <Text color="gray.600" mb={4}>
                  Gomita natural sabor frutilla
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.600">
                  Bs 1.5
                </Text>
              </Box>
              {/* Pulpa Mandarina */}
              <Box
                bg="white"
                p={6}
                rounded="lg"
                shadow="sm"
                textAlign="center"
                mx="auto"
                maxW="320px"
              >
                 {/* ✅ 1. Reemplazado <img> con <Image> */}
                <Box
                  position="relative" 
                  h="200px"
                  bg="gray.200"
                  rounded="md"
                  mb={4}
                  overflow="hidden"
                >
                  <Image 
                    src="/images/products/pulaMandarina.png" 
                    alt="Pulpa Mandarina" 
                    fill={true} 
                    style={{ objectFit: 'contain' }} 
                  />
                </Box>
                <Text fontWeight="semibold" mb={2}>
                  Pulpa Mandarina
                </Text>
                <Text color="gray.600" mb={4}>
                  Pulpa natural sabor mandarina
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.600">
                  Bs 5
                </Text>
              </Box>
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
      <PublicFooter />
    </Box>
  );
}