import { Box, Card, Image, Text, Button, Badge, VStack, HStack } from "@chakra-ui/react";

interface Product {
  id: number;
  name: string;
  flavor: string;
  type: string;
  pricePerUnit: number;
  imageUrl: string;
  currentQuantity: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isInStock = product.currentQuantity > 0;

  return (
    <Card.Root 
      overflow="hidden" 
      bg="white" 
      shadow="sm"
      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      <Box position="relative" height="200px" overflow="hidden">
        <Image
          src={product.imageUrl || "/images/products/placeholder.jpg"}
          alt={product.name}
          width="100%"
          height="100%"
          objectFit="cover"
        />
        {!product.imageUrl && (
          <Box 
            position="absolute" 
            top="0" 
            left="0" 
            right="0" 
            bottom="0" 
            bg="gray.100" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
          >
            <Text color="gray.500">Sin imagen</Text>
          </Box>
        )}
      </Box>
      
      <Card.Body>
        <VStack align="start" gap={3}>
          <Badge colorScheme={isInStock ? "green" : "red"} size="sm">
            {isInStock ? "Disponible" : "Agotado"}
          </Badge>
          
          <Text fontWeight="bold" fontSize="lg" lineHeight="short">
            {product.name}
          </Text>
          
          <Text color="gray.600" fontSize="sm">
            Sabor: {product.flavor}
          </Text>
          
          <HStack justify="space-between" w="full">
            <Text fontSize="xl" fontWeight="bold" color="green.600">
              ${product.pricePerUnit.toFixed(2)}
            </Text>
            
            {isInStock && onAddToCart && (
              <Button 
                size="sm" 
                colorScheme="green"
                onClick={() => onAddToCart(product)}
              >
                Agregar
              </Button>
            )}
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
