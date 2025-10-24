'use client';

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Grid,
  GridItem,
  Spinner,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiBarChart, FiClock } from 'react-icons/fi';

interface Ingredient {
  id: number;
  name: string;
  unit: string;
  currentQuantity: number;
  pricePerUnit: number;
  provider: string;
  createdAt: string;
}

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    unit: '',
    pricePerUnit: '',
    provider: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [ingredientToEdit, setIngredientToEdit] = useState<Ingredient | null>(null);
  const [editIngredient, setEditIngredient] = useState({
    name: '',
    unit: '',
    pricePerUnit: '',
    provider: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/system/inventory/ingredients');
      
      if (!response.ok) {
        throw new Error('Error al obtener ingredientes');
      }
      
      const data = await response.json();
      setIngredients(data.ingredients || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };
const handleCalculateABC = () => {
  globalThis.location.href = `/sys/stockroom/ingredients/abc`;
  
};
  const handleAddIngredient = () => {
    setShowAddModal(true);
  };

  const handleModalCancel = () => {
    setShowAddModal(false);
    setNewIngredient({
      name: '',
      unit: '',
      pricePerUnit: '',
      provider: ''
    });
  };

  const handleModalAccept = async () => {
    // Validar que todos los campos estén llenos
    if (!newIngredient.name || !newIngredient.unit || !newIngredient.pricePerUnit || !newIngredient.provider) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/system/inventory/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newIngredient.name,
          unit: newIngredient.unit,
          pricePerUnit: newIngredient.pricePerUnit,
          provider: newIngredient.provider
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear ingrediente');
      }

      // Cerrar modal y limpiar formulario
      setShowAddModal(false);
      setNewIngredient({
        name: '',
        unit: '',
        pricePerUnit: '',
        provider: ''
      });

      // Recargar la lista de ingredientes
      await fetchIngredients();

      console.log('Ingrediente creado exitosamente:', data.ingredient);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      alert('Error al agregar ingrediente: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIngredient = (ingredient: Ingredient) => {
    setIngredientToDelete(ingredient);
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setIngredientToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!ingredientToDelete) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/system/inventory/ingredients?id=${ingredientToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar ingrediente');
      }

      // Cerrar modal
      setShowDeleteModal(false);
      setIngredientToDelete(null);

      // Recargar la lista de ingredientes
      await fetchIngredients();

      console.log('Ingrediente eliminado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      alert('Error al eliminar ingrediente: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <VStack gap={4}>
          <Spinner size="lg" color="blue.500" />
          <Text>Cargando ingredientes...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Box 
          bg="red.50" 
          border="1px" 
          borderColor="red.200" 
          borderRadius="md" 
          p={4}
          color="red.700"
        >
          {error}
        </Box>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>Ingredientes</Heading>
            <Text color="gray.600">Gestiona el inventario de ingredientes</Text>
          </Box>
          <HStack gap={3}>
            <Button
              colorScheme="green"
              onClick={handleAddIngredient}
            >
              <HStack gap={2}>
                <FiPlus />
                <Text>Add Ingredient</Text>
              </HStack>
            </Button>
            <Button
              colorScheme="blue"
               onClick={handleCalculateABC} 
            >
              <HStack gap={2}>
                <FiBarChart />
                <Text>Calculate ABC</Text>
              </HStack>
            </Button>
          </HStack>
        </HStack>

        {/* Ingredients Table Header */}
        <Box
          bg="gray.50"
          p={4}
          borderRadius="lg"
          border="1px"
          borderColor="gray.200"
        >
          <Grid templateColumns="1fr 1fr 1fr 1fr auto" gap={4} alignItems="center">
            <GridItem>
              <Text fontWeight="bold" fontSize="sm" color="gray.700">
                Name
              </Text>
            </GridItem>
            <GridItem>
              <Text fontWeight="bold" fontSize="sm" color="gray.700">
                Unit
              </Text>
            </GridItem>
            <GridItem>
              <Text fontWeight="bold" fontSize="sm" color="gray.700">
                Stock
              </Text>
            </GridItem>
            <GridItem>
              <Text fontWeight="bold" fontSize="sm" color="gray.700">
                Price Per Unit
              </Text>
            </GridItem>
            <GridItem>
              <Text fontWeight="bold" fontSize="sm" color="gray.700">
                Acciones
              </Text>
            </GridItem>
          </Grid>
        </Box>

        {/* Ingredients List */}
        <VStack gap={2} align="stretch">
          {ingredients.map((ingredient) => (
            <Box
              key={ingredient.id}
              bg="white"
              p={4}
              borderRadius="lg"
              boxShadow="sm"
              border="1px"
              borderColor="gray.200"
              _hover={{ boxShadow: "md" }}
              transition="all 0.2s"
            >
              <Grid templateColumns="1fr 1fr 1fr 1fr auto" gap={4} alignItems="center">
                <GridItem>
                  <Text fontWeight="medium">{ingredient.name}</Text>
                  <Text fontSize="sm" color="gray.500">{ingredient.provider}</Text>
                </GridItem>
                <GridItem>
                  <Text>{ingredient.unit}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="medium">{ingredient.currentQuantity}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="medium">${ingredient.pricePerUnit.toFixed(2)}</Text>
                </GridItem>
                <GridItem>
                  <HStack gap={2}>
                    <Button
                      size="sm"
                      colorScheme="gray"
                      onClick={() => {
                        // Navegar a la página de historial del ingrediente
                        const encodedName = encodeURIComponent(ingredient.name);
                        globalThis.location.href = `/sys/stockroom/ingredients/${encodedName}`;
                      }}
                    >
                      <HStack gap={1}>
                        <FiClock />
                        <Text>History</Text>
                      </HStack>
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => {
                        setIngredientToEdit(ingredient);
                        setEditIngredient({
                          name: ingredient.name,
                          unit: ingredient.unit,
                          pricePerUnit: ingredient.pricePerUnit.toString(),
                          provider: ingredient.provider
                        });
                        setEditError(null);
                        setShowEditModal(true);
                      }}
                    >
                      <HStack gap={1}>
                        <FiEdit />
                        <Text>Edit</Text>
                      </HStack>
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="orange"
                      onClick={() => {
                        globalThis.location.href = `/sys/stockroom/ingredients/eoq-model?ingredientId=${ingredient.id}`;
                      }}
                    >
                      <HStack gap={1}>
                        <FiBarChart />
                        <Text>EOQ</Text>
                      </HStack>
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDeleteIngredient(ingredient)}
                    >
                      <HStack gap={1}>
                        <FiTrash2 />
                        <Text>Delete</Text>
                      </HStack>
                    </Button>
                  </HStack>
                </GridItem>
              </Grid>
            </Box>
          ))}
        </VStack>

        {ingredients.length === 0 && (
          <Box 
            bg="white"
            p={8} 
            textAlign="center"
            borderRadius="lg"
            boxShadow="md"
            border="1px"
            borderColor="gray.200"
          >
            <Text color="gray.500">No hay ingredientes registrados</Text>
          </Box>
        )}

        {/* Add Ingredient Modal */}
        {/* Edit Ingredient Modal */}
        {showEditModal && ingredientToEdit && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              boxShadow="xl"
              maxW="400px"
              w="90%"
            >
              <VStack gap={4} align="stretch">
                <Heading size="md">Edit ingredient</Heading>
                <VStack gap={4} align="stretch">
                  <Box>
                    <Text fontWeight="medium" mb={2}>name</Text>
                    <Input
                      value={editIngredient.name}
                      onChange={e => setEditIngredient(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2}>unit</Text>
                    <Input
                      value={editIngredient.unit}
                      onChange={e => setEditIngredient(prev => ({ ...prev, unit: e.target.value }))}
                    />
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2}>pricePerUnit</Text>
                    <Input
                      type="number"
                      value={editIngredient.pricePerUnit}
                      onChange={e => setEditIngredient(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                    />
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2}>providerName</Text>
                    <Input
                      value={editIngredient.provider}
                      onChange={e => setEditIngredient(prev => ({ ...prev, provider: e.target.value }))}
                    />
                  </Box>
                </VStack>
                {editError && <Text color="red.500">{editError}</Text>}
                <HStack gap={3} justify="flex-end" mt={4}>
                  <Button
                    variant="ghost"
                    onClick={() => setShowEditModal(false)}
                    disabled={editLoading}
                  >
                    cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={async () => {
                      if (!editIngredient.name || !editIngredient.unit || !editIngredient.pricePerUnit || !editIngredient.provider) {
                        setEditError('Completa todos los campos');
                        return;
                      }
                      setEditLoading(true);
                      setEditError(null);
                      try {
                        const res = await fetch(`/api/system/inventory/ingredients?id=${ingredientToEdit.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            name: editIngredient.name,
                            unit: editIngredient.unit,
                            pricePerUnit: editIngredient.pricePerUnit,
                            provider: editIngredient.provider
                          })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || 'Error al editar ingrediente');
                        setShowEditModal(false);
                        setIngredientToEdit(null);
                        await fetchIngredients();
                      } catch (err) {
                        setEditError(err instanceof Error ? err.message : 'Error desconocido');
                      } finally {
                        setEditLoading(false);
                      }
                    }}
                    loading={editLoading}
                  >
                    Accept
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}
        {showAddModal && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              boxShadow="xl"
              maxW="500px"
              w="90%"
            >
              <VStack gap={4} align="stretch">
                <Heading size="md">Add New Ingredient</Heading>
                
                <VStack gap={4} align="stretch">
                  <Box>
                    <Text fontWeight="medium" mb={2}>Name</Text>
                    <Input
                      placeholder="Ingredient name"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </Box>
                  
                  <Box>
                    <Text fontWeight="medium" mb={2}>Unit</Text>
                    <Input
                      placeholder="Unit (kg, g, l, ml, etc.)"
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
                    />
                  </Box>
                  
                  <Box>
                    <Text fontWeight="medium" mb={2}>Price Per Unit</Text>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newIngredient.pricePerUnit}
                      onChange={(e) => setNewIngredient(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                    />
                  </Box>
                  
                  <Box>
                    <Text fontWeight="medium" mb={2}>Provider Name</Text>
                    <Input
                      placeholder="Provider name"
                      value={newIngredient.provider}
                      onChange={(e) => setNewIngredient(prev => ({ ...prev, provider: e.target.value }))}
                    />
                  </Box>
                </VStack>
                
                <HStack gap={3} justify="flex-end" mt={4}>
                  <Button
                    variant="ghost"
                    onClick={handleModalCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="green"
                    onClick={handleModalAccept}
                  >
                    Accept
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && ingredientToDelete && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              boxShadow="xl"
              maxW="500px"
              w="90%"
            >
              <VStack gap={4} align="stretch">
                <Heading size="md" color="red.600">Eliminar Ingrediente</Heading>
                
                <VStack gap={3} align="stretch">
                <Text>... <strong>&quot;{ingredientToDelete.name}&quot;</strong>?</Text>
                  
                  <Box
                    bg="red.50"
                    border="1px"
                    borderColor="red.200"
                    borderRadius="md"
                    p={4}
                  >
                    <VStack gap={2} align="stretch">
                      <Text fontWeight="bold" color="red.700" fontSize="sm">
                        ⚠️ Advertencia
                      </Text>
                      <Text color="red.600" fontSize="sm">
                        Esta acción también eliminará todo el historial de movimientos 
                        asociado a este ingrediente. Esta acción es <strong>irreversible</strong>.
                      </Text>
                    </VStack>
                  </Box>
                  
                  <Text fontSize="sm" color="gray.600">
                    Proveedor: {ingredientToDelete.provider}
                  </Text>
                </VStack>
                
                <HStack gap={3} justify="flex-end" mt={4}>
                  <Button
                    variant="ghost"
                    onClick={handleDeleteCancel}
                  >
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={handleDeleteConfirm}
                  >
                    Eliminar Definitivamente
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
