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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/inventory/products");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error al cargar los productos.");
        }

        // ✅ Obtener los primeros 3 productos de la lista
        const featuredProducts = data.products.slice(0, 3);
        setProducts(featuredProducts);
        
      } catch (err) {
        console.error("Error al obtener productos:", err);
        setError("No se pudieron cargar los productos. Inténtalo de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Box minH="100vh" bg="gray.50">
      <PublicHeader />
      
      <Container maxW="7xl" py={12}>
        <VStack gap={8} textAlign="center" mb={12}>
          <Text fontSize="4xl" fontWeight="bold" color="gray.800">
            Bienvenido a Nuestra Tienda de Gomitas 🍬
          </Text>
          <Text fontSize="xl" color="gray.600" maxW="600px">
            Descubre nuestra deliciosa colección de gomitas premium, elaboradas con los mejores ingredientes.
          </Text>
          <HStack gap={4}>
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
              Acceso al Sistema
            </Button>
          </HStack>
        </VStack>

        {/* Sección de Productos Destacados */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center">
            Productos Destacados
          </Text>
          
          {isLoading ? (
            <VStack py={10}><Spinner size="xl" color="blue.500" /></VStack>
          ) : error ? (
            <Text textAlign="center" color="red.500" py={10}>{error}</Text>
          ) : products.length === 0 ? (
            <Text textAlign="center" color="gray.500" py={10}>No hay productos para mostrar.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {products.map((product) => (
                <Box 
                  key={product.id}
                  bg="white" 
                  p={6} 
                  rounded="lg" 
                  shadow="sm"
                  textAlign="center"
                  _hover={{ shadow: "md", transform: "translateY(-5px)" }}
                  transition="all 0.2s"
                >
                  <Box 
                    h="200px" 
                    mb={4}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {product.imageUrl ? (
                      <Image 
                        src={product.imageUrl} 
                        alt={product.name}
                        objectFit="cover"
                        rounded="md"
                        w="100%"
                        h="100%"
                      />
                    ) : (
                      <Text color="gray.500">Imagen no disponible</Text>
                    )}
                  </Box>
                  <Text fontWeight="semibold" mb={2} color="gray.800">
                    {product.name}
                  </Text>
                  <Text color="gray.600" mb={4}>
                    {product.flavor}
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.600">
                    ${product.pricePerUnit?.toFixed(2) || "0.00"}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Container>

      <PublicFooter />
    </Box>
  );
}