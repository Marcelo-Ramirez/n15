"use client";

import { Box, Container, Text, SimpleGrid, Input, Button, HStack, Spinner } from "@chakra-ui/react";
// ✅ 1. Importar Image de next/image y useEffect/useState
import { useState, useEffect } from "react";
import Image from 'next/image'; 
// ❌ 1. 'PublicHeader' eliminado porque no se usa
// import { PublicHeader } from "@/components/layout/PublicHeader"; 
import { PublicFooter } from "@/components/layout/PublicFooter";

interface Product {
  id: number;
  name: string;
  type: string;
  flavor: string;
  pricePerUnit: number;
  currentQuantity: number;
  imageUrl?: string | null;
  description?: string | null; 
}

export default function CatalogPage() {
  // ✅ Variables 'products' y 'searchTerm' se mantienen porque SÍ se usan para calcular 'filteredProducts'
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null); 

  useEffect(() => {
    const fetchProducts = async () => {
      // ... (fetch logic remains the same - ensuring API returns all products) ...
      try {
        setLoading(true);
        setFetchError(null);
        const res = await fetch("/api/inventory/products"); 
        if (!res.ok) {
           const errorData = await res.json().catch(() => ({}));
           throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        
        if (data.success && Array.isArray(data.products)) {
           setProducts(data.products); 
        } else {
            console.warn("API response was not successful or products array is missing:", data);
            setProducts([]); 
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error desconocido al cargar productos";
        console.error("Error fetching products:", err);
        setFetchError(errorMsg); 
        setProducts([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ 2. Definición de 'filteredProducts' RE-AÑADIDA
  // Filtrar productos basado en searchTerm y la exclusión
  const filteredProducts = products
    .filter(
      (p) => !/galleta|pan|torta/i.test(p.name) // Excluir nombres específicos (case-insensitive)
    )
    .filter(
      (p) => // Filtrar por término de búsqueda (case-insensitive)
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.flavor.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <Box minH="100vh" bg="gray.50">
      {/* ❌ 1. Componente <PublicHeader /> eliminado si no se usa */}
      {/* <PublicHeader /> */} 
      
      <Container maxW="7xl" py={8} mx="auto"> 
        <Box mb={8} textAlign="center"> 
          <Text fontSize="3xl" fontWeight="bold" mb={4}>
            Our Gummies Catalog
          </Text>
          <Text fontSize="lg" color="gray.600" mb={6}>
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

        {/* Renderizado Condicional */}
        {loading ? (
          <Box textAlign="center" py={12}>
            <Spinner size="xl" color="blue.500" />
            <Text mt={4} color="gray.600">Cargando productos...</Text>
          </Box>
        ) : fetchError ? ( 
            <Box textAlign="center" py={12} color="red.500">
               <Text fontWeight="bold">Error al cargar productos:</Text>
               <Text>{fetchError}</Text>
               <Button mt={4} colorScheme="blue" onClick={() => window.location.reload()}>Recargar Página</Button>
            </Box>
        // ✅ 2. Usar 'filteredProducts' aquí (ahora está definido)
        ) : filteredProducts.length === 0 ? ( 
          <Text textAlign="center" color="gray.500" py={12}>
            {searchTerm ? `No se encontraron productos para "${searchTerm}"` : "No hay productos disponibles"}
          </Text>
        ) : (
          <SimpleGrid 
            columns={{ base: 1, sm: 2, lg: 3 }} 
            gap={8} 
            justifyItems="center" 
            maxW="1200px" 
            mx="auto"
          >
            {/* ✅ 3. Añadido tipo explícito 'Product' al parámetro */}
            {filteredProducts.map((product: Product) => ( 
              <Box
                key={product.id}
                // ... (resto de props de Box)
                w={{ base: "90%", sm: "320px", md:"360px" }} 
                minH="420px"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                <Box
                  position="relative" 
                  h="200px"
                  bg="gray.100" 
                  rounded="md"
                  mb={4}
                  overflow="hidden" 
                >
                  {product.imageUrl ? (
                    <Image 
                      src={product.imageUrl} 
                      alt={product.name} 
                      fill={true} 
                      style={{ objectFit: 'contain' }}
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 33vw" 
                      priority={filteredProducts.indexOf(product) < 3} 
                    />
                  ) : (
                    <Text color="gray.400" h="100%" display="flex" alignItems="center" justifyContent="center">
                      Imagen no disponible
                    </Text>
                  )}
                </Box>
                
                <Box flexGrow={1} mb={4}> 
                  {/* ✅ 4. Prop 'noOfLines' eliminada */}
                  <Text fontWeight="semibold" fontSize="lg" mb={2}> 
                    {product.name}
                  </Text>
                  {/* ✅ 4. Prop 'noOfLines' eliminada */}
                  <Text color="gray.600" mb={4}> 
                    {product.description || `Delicioso sabor ${product.flavor}`}
                  </Text>
                </Box>

                 <Box> 
                   <HStack justify="center" align="center" gap={4} mb={4}>
                     <Text fontSize="xl" fontWeight="bold" color="blue.600">
                       Bs {product.pricePerUnit.toFixed(2)} 
                     </Text>
                     <Text fontSize="sm" color="gray.500">
                       Stock: {product.currentQuantity}
                     </Text>
                   </HStack>
                   <Button 
                     colorScheme="blue" 
                     w="full" 
                     disabled={product.currentQuantity === 0}
                     // onClick={() => addToCart(product.id)} 
                   >
                     {product.currentQuantity === 0 ? 'Agotado' : 'Añadir al Carrito'}
                   </Button>
                 </Box>

              </Box>
            ))}
          </SimpleGrid>
        )}
      </Container>

      <PublicFooter />
    </Box>
  );
}