"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Spinner,
  Badge
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import type { Ingredient } from "@/types/inventory";

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    unit: '',
    reorderPoint: '',
    pricePerUnit: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    unit: '',
    pricePerUnit: ''
  });
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

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setEditForm({
      name: ingredient.name,
      unit: ingredient.unit,
      reorderPoint: ingredient.reorderPoint?.toString() || '',
      pricePerUnit: ingredient.pricePerUnit.toString()
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingIngredient) return;

    try {
      const response = await fetch(`/api/inventory/ingredients/${editingIngredient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          unit: editForm.unit,
          reorderPoint: editForm.reorderPoint ? parseFloat(editForm.reorderPoint) : null,
          pricePerUnit: parseFloat(editForm.pricePerUnit)
        })
      });

      if (response.ok) {
        alert("Ingrediente actualizado exitosamente");
        fetchIngredients();
        setShowEditModal(false);
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      alert("Error al actualizar el ingrediente");
    }
  };

  const handleAddIngredient = async () => {
    if (!addForm.name || !addForm.unit || !addForm.pricePerUnit) {
      alert("Por favor completa todos los campos requeridos (nombre, unidad, precio)");
      return;
    }

    try {
      const response = await fetch('/api/inventory/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addForm.name,
          unit: addForm.unit,
          pricePerUnit: parseFloat(addForm.pricePerUnit)
          // reorderPoint se establece como null por defecto en el backend
        })
      });

      if (response.ok) {
        alert("Ingrediente agregado exitosamente");
        fetchIngredients();
        setShowAddModal(false);
        setAddForm({
          name: '',
          unit: '',
          pricePerUnit: ''
        });
      } else {
        throw new Error('Error al agregar');
      }
    } catch (error) {
      alert("Error al agregar el ingrediente");
    }
  };

  const viewHistory = (ingredientId: number) => {
    router.push(`/inventory/historial/${ingredientId}`);
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack>
          <Spinner size="xl" />
          <Text>Cargando inventario...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack align="stretch">
        <HStack justify="space-between" align="center">
          <Heading size="lg" color="gray.900">Inventario de Ingredientes</Heading>
          <Button 
            colorScheme="green" 
            onClick={() => setShowAddModal(true)}
          >
            Agregar Ingrediente
          </Button>
        </HStack>
        
        {/* Tabla con HTML tradicional */}
        <Box overflowX="auto">
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f7fafc' }}>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  borderBottom: '1px solid #e2e8f0',
                  fontWeight: 'bold',
                  color: '#2d3748'
                }}>
                  Nombre
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  borderBottom: '1px solid #e2e8f0',
                  fontWeight: 'bold',
                  color: '#2d3748'
                }}>
                  Unidad
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  borderBottom: '1px solid #e2e8f0',
                  fontWeight: 'bold',
                  color: '#2d3748'
                }}>
                  Stock Actual
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  borderBottom: '1px solid #e2e8f0',
                  fontWeight: 'bold',
                  color: '#2d3748'
                }}>
                  Punto de Reorden
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  borderBottom: '1px solid #e2e8f0',
                  fontWeight: 'bold',
                  color: '#2d3748'
                }}>
                  Precio/Unidad
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  borderBottom: '1px solid #e2e8f0',
                  fontWeight: 'bold',
                  color: '#2d3748'
                }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient, index) => (
                <tr 
                  key={ingredient.id}
                  style={{ 
                    backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f3ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f9f9f9'}
                >
                  <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    <Text fontWeight="medium" color="#2d3748">{ingredient.name}</Text>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    <Text color="#4a5568">{ingredient.unit}</Text>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    <Badge 
                      colorScheme={
                        ingredient.reorderPoint && ingredient.currentQuantity < ingredient.reorderPoint 
                          ? "red" 
                          : "green"
                      }
                    >
                      {ingredient.currentQuantity || 0}
                    </Badge>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    <Text color="#4a5568">
                      {ingredient.reorderPoint ? ingredient.reorderPoint : 'No definido'}
                    </Text>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    <Text color="#4a5568">${ingredient.pricePerUnit}</Text>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    <HStack>
                      <Button 
                        size="sm" 
                        colorScheme="blue" 
                        onClick={() => viewHistory(ingredient.id)}
                      >
                        Historial
                      </Button>
                      <Button 
                        size="sm" 
                        colorScheme="green" 
                        onClick={() => handleEdit(ingredient)}
                      >
                        Editar
                      </Button>
                    </HStack>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        {ingredients.length === 0 && (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">No hay ingredientes registrados</Text>
          </Box>
        )}
      </VStack>

      {/* Modal para agregar ingrediente */}
      {showAddModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0,0,0,0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="1000"
        >
          <Box
            bg="white"
            p={6}
            borderRadius="md"
            boxShadow="lg"
            width="400px"
          >
            <Heading size="md" mb={4}>Agregar Nuevo Ingrediente</Heading>
            
            <VStack>
              <Box width="100%">
                <Text fontSize="sm" fontWeight="bold" mb={1} color="#2d3748">Nombre *</Text>
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                  placeholder="Ej: Miel orgánica"
                />
              </Box>
              
              <Box width="100%">
                <Text fontSize="sm" fontWeight="bold" mb={1} color="#2d3748">Unidad *</Text>
                <Input
                  value={addForm.unit}
                  onChange={(e) => setAddForm({...addForm, unit: e.target.value})}
                  placeholder="Ej: kg, litros, unidades"
                />
              </Box>
              
              <Box width="100%">
                <Text fontSize="sm" fontWeight="bold" mb={1} color="#2d3748">Precio por Unidad *</Text>
                <Input
                  type="number"
                  step="0.01"
                  value={addForm.pricePerUnit}
                  onChange={(e) => setAddForm({...addForm, pricePerUnit: e.target.value})}
                  placeholder="Ej: 15.50"
                />
              </Box>
              
              <HStack pt={4}>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  colorScheme="green" 
                  onClick={handleAddIngredient}
                >
                  Agregar
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Modal para editar ingrediente (usando div simple) */}
      {showEditModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0,0,0,0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="1000"
        >
          <Box
            bg="white"
            p={6}
            borderRadius="md"
            boxShadow="lg"
            width="400px"
          >
            <Heading size="md" mb={4}>Editar Ingrediente</Heading>
            
            <VStack>
              <Box width="100%">
                <Text fontSize="sm" fontWeight="bold" mb={1} color="#2d3748">Nombre</Text>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </Box>
              
              <Box width="100%">
                <Text fontSize="sm" fontWeight="bold" mb={1} color="#2d3748">Unidad</Text>
                <Input
                  value={editForm.unit}
                  onChange={(e) => setEditForm({...editForm, unit: e.target.value})}
                />
              </Box>
              
              <Box width="100%">
                <Text fontSize="sm" fontWeight="bold" mb={1} color="#2d3748">
                  Punto de Reorden <Text as="span" fontSize="xs" color="#718096">(Opcional)</Text>
                </Text>
                <Input
                  type="number"
                  value={editForm.reorderPoint}
                  onChange={(e) => setEditForm({...editForm, reorderPoint: e.target.value})}
                  placeholder="Dejar vacío si no se calculó EOQ"
                />
              </Box>
              
              <Box width="100%">
                <Text fontSize="sm" fontWeight="bold" mb={1} color="#2d3748">Precio por Unidad</Text>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.pricePerUnit}
                  onChange={(e) => setEditForm({...editForm, pricePerUnit: e.target.value})}
                />
              </Box>
              
              <HStack pt={4}>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handleSaveEdit}
                >
                  Guardar
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
}
