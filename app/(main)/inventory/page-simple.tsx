"use client";
import { 
  Box, 
  Heading, 
  Text, 
  Badge,
  Button,
  HStack,
  VStack,
  Input,
  Spinner
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ingredient, InventoryStats, CreateIngredientData } from "@/types/inventory";

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/ingredients');
      if (response.ok) {
        const data = await response.json();
        setIngredients(data);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = (ingredientId: number) => {
    router.push(`/inventory/historial/${ingredientId}`);
  };

  if (loading) {
    return (
      <Box p={8} display="flex" justifyContent="center" alignItems="center" minH="200px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={8}>
      <VStack align="stretch" gap={6}>
        <Heading size="lg">Inventario de Ingredientes</Heading>
        
        {ingredients.length > 0 ? (
          <VStack align="stretch" gap={4}>
            {ingredients.map((ingredient) => (
              <Box 
                key={ingredient.id} 
                border="1px solid" 
                borderColor="gray.200" 
                borderRadius="md" 
                p={4}
              >
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <Text fontSize="lg" fontWeight="bold">{ingredient.name}</Text>
                    <Text>
                      Stock: {ingredient.currentQuantity} {ingredient.unit}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Precio: ${ingredient.pricePerUnit} por {ingredient.unit}
                    </Text>
                    <Badge 
                      colorScheme={ingredient.currentQuantity <= ingredient.minStock ? 'red' : 'green'}
                    >
                      {ingredient.currentQuantity <= ingredient.minStock ? 'Stock Bajo' : 'Stock OK'}
                    </Badge>
                  </VStack>
                  <Button
                    size="sm"
                    onClick={() => handleViewHistory(ingredient.id)}
                  >
                    Ver Historial
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
        ) : (
          <Box textAlign="center" py={8}>
            <Text>No hay ingredientes registrados</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
