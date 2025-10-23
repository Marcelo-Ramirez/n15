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
        let apiProducts: Product[] = [];
        if (data.success) apiProducts = data.products;

        // Productos locales con imágenes
          const localProducts: Product[] = [
            {
              id: 1001,
              name: "Pulpa Mandarina",
              type: "Pulpa",
              flavor: "Mandarina",
              pricePerUnit: 5,
              currentQuantity: 20,
              imageUrl: "/images/products/pulaMandarina.png"
            },
            {
              id: 1002,
              name: "Pulpa Manzana",
              type: "Pulpa",
              flavor: "Manzana",
              pricePerUnit: 5,
              currentQuantity: 15,
              imageUrl: "/images/products/pulmaManzana.png"
            },
            {
              id: 1003,
              name: "Pulpa Beterraga",
              type: "Pulpa",
              flavor: "Beterraga",
              pricePerUnit: 5,
              currentQuantity: 10,
              imageUrl: "/images/products/pulpaBeterraga.png"
            },
            {
              id: 1004,
              name: "Pulpa Frutilla",
              type: "Pulpa",
              flavor: "Frutilla",
              pricePerUnit: 5,
              currentQuantity: 18,
              imageUrl: "/images/products/pulpaFrutilla.png"
            },
            {
              id: 1005,
              name: "Pulpa Limón",
              type: "Pulpa",
              flavor: "Limón",
              pricePerUnit: 5,
              currentQuantity: 25,
              imageUrl: "/images/products/pulpaLimon.png"
            },
            {
              id: 1006,
              name: "Pulpa Manzanilla",
              type: "Pulpa",
              flavor: "Manzanilla",
              pricePerUnit: 5,
              currentQuantity: 12,
              imageUrl: "/images/products/pulpaManzanilla.png"
            },
            {
              id: 1007,
              name: "Pulpa Zanahoria",
              type: "Pulpa",
              flavor: "Zanahoria",
              pricePerUnit: 5,
              currentQuantity: 30,
              imageUrl: "/images/products/pulpaZanahoria.png"
            }
          ];

        // Productos locales tipo Gomita
        const gomitaProducts: Product[] = [
          {
            id: 2001,
            name: "Gomita Beterraga",
            type: "Gomita",
            flavor: "Beterraga",
            pricePerUnit: 1.5,
            currentQuantity: 40,
            imageUrl: "/images/products/gomitaBeterraga.png"
          },
          {
            id: 2002,
            name: "Gomita Frutilla",
            type: "Gomita",
            flavor: "Frutilla",
            pricePerUnit: 1.5,
            currentQuantity: 35,
            imageUrl: "/images/products/gomitaFrutilla.png"
          },
          {
            id: 2003,
            name: "Gomita Limón",
            type: "Gomita",
            flavor: "Limón",
            pricePerUnit: 1.5,
            currentQuantity: 50,
            imageUrl: "/images/products/gomitaLimon.png"
          },
          {
            id: 2004,
            name: "Gomita Mandarina",
            type: "Gomita",
            flavor: "Mandarina",
            pricePerUnit: 1.5,
            currentQuantity: 45,
            imageUrl: "/images/products/gomitaMandarina.png"
          },
          {
            id: 2005,
            name: "Gomita Manzana",
            type: "Gomita",
            flavor: "Manzana",
            pricePerUnit: 1.5,
            currentQuantity: 38,
            imageUrl: "/images/products/gomitaManzana.png"
          },
          {
            id: 2006,
            name: "Gomita Manzanilla",
            type: "Gomita",
            flavor: "Manzanilla",
            pricePerUnit: 1.5,
            currentQuantity: 32,
            imageUrl: "/images/products/gomitaManzanilla.png"
          },
          {
            id: 2007,
            name: "Gomita Zanahoria",
            type: "Gomita",
            flavor: "Zanahoria",
            pricePerUnit: 1.5,
            currentQuantity: 28,
            imageUrl: "/images/products/gomitaZanahoria.png"
          }
        ];

        // Unir productos API, locales y gomitas
        setProducts([...apiProducts, ...localProducts, ...gomitaProducts]);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Eliminar productos con nombre 'galleta', 'pan' o 'torta'
  const filteredProducts = products
    .filter(
      (p) =>
        !/galleta|pan|torta/i.test(p.name)
    )
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.flavor.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <Box minH="100vh" bg="gray.50">
      <PublicHeader />
      
  <Container maxW="7xl" py={8} mx="auto" textAlign="center">
        <Box mb={8}>
          <Text fontSize="3xl" fontWeight="bold" mb={4} textAlign="center">
            Our Gummies Catalog
          </Text>
          <Text fontSize="lg" color="gray.600" mb={6} textAlign="center">
            Discover our delicious collection of premium gummies
          </Text>
          
          <HStack maxW="400px" mx="auto">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="white"
            />
            <Button colorScheme="blue">Search</Button>
          </HStack>
        </Box>

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
          <SimpleGrid 
            columns={{ base: 1, md: 2, lg: 3 }} 
            gap={8} 
            justifyItems="center" 
            maxW="1200px" 
            mx="auto"
          >
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
                textAlign="center"
                mx="auto"
                w="360px"
                minH="420px"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
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
                <Text color="gray.600" mb={4} style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {typeof (product as any).description === 'string' && (product as any).description
                    ? (product as any).description
                    : `Pulpa sabor ${product.flavor}`}
                </Text>
                <HStack justify="center" align="center" gap={4}>
                  <Text fontSize="xl" fontWeight="bold" color="blue.600">
                    {product.type === "Pulpa" ? `Bs ${product.pricePerUnit}` : `Bs ${product.pricePerUnit}`}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Stock: {product.currentQuantity}
                  </Text>
                </HStack>
                <Button 
                  colorScheme="blue" 
                  w="full" 
                  mt={4}
                  disabled={product.currentQuantity === 0}
                >
                  {product.currentQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Container>

      <PublicFooter />
    </Box>
  );
}
