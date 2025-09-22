"use client";

import { Box, Container, Text, SimpleGrid, Input, Button, HStack, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

interface Product {
  id: number;
  name: string;
  type: string;
  flavor: string;
  pricePerUnit: number;
  currentQuantity: number;
  imageUrl?: string | null;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/inventory/products");
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.flavor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box minH="100vh" bg="gray.50">
      <PublicHeader />

      <Container maxW="7xl" py={8}>
        <HStack maxW="400px" mx="auto" mb={8}>
          <Input
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="white"
          />
          <Button colorScheme="blue">Buscar</Button>
        </HStack>

        {loading ? (
          <Box textAlign="center" py={12}>
            <Spinner size="lg" color="blue.500" />
            <Text mt={2}>Cargando productos...</Text>
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Text textAlign="center" color="gray.500">
            No se encontraron productos
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {filteredProducts.map((product) => (
              <Box
                key={product.id}
                bg="white"
                p={6}
                rounded="lg"
                shadow="sm"
                border="1px"
                borderColor="gray.200"
                _hover={{ shadow: "md" }}
                transition="all 0.2s"
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
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} style={{ maxHeight: "100%", maxWidth: "100%" }} />
                  ) : (
                    <Text color="gray.500">Imagen</Text>
                  )}
                </Box>

                <Text fontWeight="semibold" fontSize="lg" mb={2}>
                  {product.name}
                </Text>
                <Text color="gray.600" mb={4}>
                  {product.type} - {product.flavor}
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="blue.600">
                  ${product.pricePerUnit.toFixed(2)}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Stock: {product.currentQuantity}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Container>

      <PublicFooter />
    </Box>
  );
}
