"use client";
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  Badge,
  HStack,
  VStack,
  Grid,
  Spinner,
  Center,
  Table
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Ingredient, InventoryMovement } from "@/types/inventory";

export default function HistorialPage() {
  const params = useParams();
  const router = useRouter();
  
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const ingredientId = params.id?.toString().replace('historial-', '');

  useEffect(() => {
    if (ingredientId) {
      fetchHistory();
    }
  }, [ingredientId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/inventory/ingredients/${ingredientId}`);
      
      if (response.ok) {
        const data = await response.json();
        setIngredient(data.ingredient);
        setMovements(data.movements);
      } else {
        throw new Error("Error al cargar historial");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementTypeColor = (type: string) => {
    return type === 'entrada' ? 'green' : 'red';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critico': return 'red';
      case 'bajo': return 'yellow';
      default: return 'green';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'critico': return 'Crítico';
      case 'bajo': return 'Bajo';
      default: return 'Normal';
    }
  };

  if (loading) {
    return (
      <Center h="400px">
        <VStack gap={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando historial...</Text>
        </VStack>
      </Center>
    );
  }

  if (!ingredient) {
    return (
      <Center h="400px">
        <VStack gap={4}>
          <Text fontSize="xl" color="red.500">Ingrediente no encontrado</Text>
          <Button onClick={() => router.push('/inventory')}>Volver al inventario</Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <VStack align="start" gap={1}>
          <Heading size="lg" color="gray.700">
            📦 {ingredient.name}
          </Heading>
          <Text color="gray.500">Historial de Movimientos</Text>
        </VStack>
        <Button colorPalette="blue" onClick={() => router.push('/inventory')}>
          ← Volver al Inventario
        </Button>
      </HStack>

      {/* Información actual del ingrediente */}
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200" mb={6}>
        <Text fontWeight="semibold" mb={4} color="gray.700">Información Actual</Text>
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <VStack align="start">
            <Text fontSize="sm" color="gray.600">Cantidad Actual</Text>
            <Text fontSize="2xl" fontWeight="bold">{ingredient.currentQuantity} {ingredient.unit}</Text>
          </VStack>
          <VStack align="start">
            <Text fontSize="sm" color="gray.600">Stock Mínimo</Text>
            <Text fontSize="xl" fontWeight="semibold">{ingredient.minStock} {ingredient.unit}</Text>
          </VStack>
          <VStack align="start">
            <Text fontSize="sm" color="gray.600">Estado</Text>
            <Badge colorPalette={getStatusColor(ingredient.status)} fontSize="md" px={3} py={1}>
              {getStatusText(ingredient.status)}
            </Badge>
          </VStack>
          <VStack align="start">
            <Text fontSize="sm" color="gray.600">Precio por {ingredient.unit}</Text>
            <Text fontSize="xl" fontWeight="semibold">${ingredient.pricePerUnit.toFixed(2)}</Text>
          </VStack>
        </Grid>
      </Box>

      {/* Tabla de historial */}
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
        <Heading size="md" mb={4} color="gray.700">
          Historial de Movimientos
        </Heading>

        {movements.length > 0 ? (
          <Box overflowX="auto">
            <Table.Root variant="outline">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Fecha</Table.ColumnHeader>
                  <Table.ColumnHeader>Usuario</Table.ColumnHeader>
                  <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                  <Table.ColumnHeader>Motivo</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Cantidad</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Stock Resultante</Table.ColumnHeader>
                  <Table.ColumnHeader>Notas</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {movements.map((movement) => (
                  <Table.Row key={movement.id}>
                    <Table.Cell>{new Date(movement.movementDate).toLocaleDateString()}</Table.Cell>
                    <Table.Cell>{movement.user?.name || 'Usuario'}</Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={getMovementTypeColor(movement.movementType)}>
                        {movement.movementType === 'entrada' ? '⬆️ Entrada' : '⬇️ Salida'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell className="capitalize">{movement.reason}</Table.Cell>
                    <Table.Cell textAlign="end">
                      <Text color={movement.movementType === 'entrada' ? 'green.600' : 'red.600'}>
                        {movement.movementType === 'entrada' ? '+' : '-'}{movement.quantity} {ingredient.unit}
                      </Text>
                    </Table.Cell>
                    <Table.Cell textAlign="end" fontWeight="medium">{movement.newQuantity} {ingredient.unit}</Table.Cell>
                    <Table.Cell>{movement.notes || '-'}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        ) : (
          <Center py={8}>
            <Text color="gray.500">No hay movimientos registrados</Text>
          </Center>
        )}
      </Box>
    </Box>
  );
}
