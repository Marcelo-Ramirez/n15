"use client";

import { Box, Container, Text, SimpleGrid, Input, Button, HStack } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  stock: number;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Simulate API call to fetch products
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockProducts: Product[] = [
          { id: 1, name: "Strawberry Gummies", description: "Delicious strawberry flavored gummies", price: 9.99, stock: 50 },
          { id: 2, name: "Orange Gummies", description: "Citrus burst orange gummies", price: 8.99, stock: 30 },
          { id: 3, name: "Mixed Berry Gummies", description: "Assorted berry flavors", price: 12.99, stock: 25 },
          { id: 4, name: "Tropical Gummies", description: "Exotic tropical fruit mix", price: 11.99, stock: 40 },
          { id: 5, name: "Sour Apple Gummies", description: "Tangy sour apple flavor", price: 10.99, stock: 35 },
          { id: 6, name: "Cherry Gummies", description: "Sweet cherry flavored treats", price: 9.49, stock: 45 },
        ];
        
        setProducts(mockProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Text>Loading products...</Text>
          </Box>
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
                _hover={{ shadow: "md", transform: "translateY(-2px)" }}
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
                  <Text color="gray.500">Product Image</Text>
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
                  {product.description}
                </Text>
                <HStack justify="center" align="center" gap={4}>
                  <Text fontSize="xl" fontWeight="bold" color="blue.600">
                    ${product.price}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Stock: {product.stock}
                  </Text>
                </HStack>
                <Button 
                  colorScheme="blue" 
                  w="full" 
                  mt={4}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        )}

        {!loading && filteredProducts.length === 0 && (
          <Box textAlign="center" py={12}>
            <Text fontSize="lg" color="gray.500">
              No products found matching your search.
            </Text>
          </Box>
        )}
      </Container>

      <PublicFooter />
    </Box>
  );
}
