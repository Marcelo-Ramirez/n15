'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  Badge,
  Spinner
} from '@chakra-ui/react'
import type { Ingredient, InventoryMovement } from '@/types/inventory'

export default function IngredientHistoryPage() {
  const params = useParams()
  const [ingredient, setIngredient] = useState<Ingredient | null>(null)
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingMovement, setIsAddingMovement] = useState(false)
  const [movementForm, setMovementForm] = useState({
    movementType: 'entrada' as 'entrada' | 'salida',
    quantity: '',
    reason: ''
  })

  const ingredientId = Array.isArray(params.id) ? params.id[0] : params.id

  useEffect(() => {
    if (ingredientId) {
      fetchIngredientData()
    }
  }, [ingredientId])

  const fetchIngredientData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/inventory/ingredients/${ingredientId}`)
      if (response.ok) {
        const data = await response.json()
        setIngredient(data.ingredient)
        setMovements(data.movements || [])
      }
    } catch (error) {
      console.error('Error fetching ingredient:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMovement = async () => {
    if (!movementForm.quantity || !movementForm.reason) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    try {
      const response = await fetch(`/api/inventory/ingredients/${ingredientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movementType: movementForm.movementType,
          quantity: parseFloat(movementForm.quantity),
          reason: movementForm.reason,
        }),
      })

      if (response.ok) {
        alert("Movimiento registrado correctamente")
        setMovementForm({
          movementType: 'entrada',
          quantity: '',
          reason: ''
        })
        setIsAddingMovement(false)
        await fetchIngredientData()
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Error al registrar movimiento")
      }
    } catch (error) {
      console.error('Error adding movement:', error)
      alert("Error de conexión - No se pudo conectar con el servidor")
    }
  }

  if (loading) {
    return (
      <Box p={8} display="flex" justifyContent="center" alignItems="center" minH="200px">
        <Spinner size="xl" />
      </Box>
    )
  }

  if (!ingredient) {
    return (
      <Box p={8}>
        <Text color="red.500">Ingrediente no encontrado</Text>
      </Box>
    )
  }

  return (
    <Box p={8}>
      <VStack align="stretch" gap={6}>
        <HStack justify="space-between">
          <Heading size="lg">Historial de {ingredient.name}</Heading>
          <Button 
            colorScheme="green" 
            onClick={() => setIsAddingMovement(!isAddingMovement)}
          >
            {isAddingMovement ? 'Cancelar' : 'Registrar Movimiento'}
          </Button>
        </HStack>

        {/* Info del ingrediente */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
          <VStack align="start" gap={2}>
            <Text fontSize="lg" fontWeight="bold" color="#2d3748">{ingredient.name}</Text>
            <Text color="#4a5568">Stock Actual: {ingredient.currentQuantity} {ingredient.unit}</Text>
            <Text color="#4a5568">Precio: ${ingredient.pricePerUnit} por {ingredient.unit}</Text>
            <Text color="#4a5568">
              Punto de Reorden: {ingredient.reorderPoint ? `${ingredient.reorderPoint} ${ingredient.unit}` : 'No definido'}
            </Text>
            <Badge 
              colorScheme={
                ingredient.reorderPoint && ingredient.currentQuantity < ingredient.reorderPoint 
                  ? 'red' 
                  : 'green'
              }
            >
              {ingredient.reorderPoint && ingredient.currentQuantity < ingredient.reorderPoint 
                ? 'Stock Bajo' 
                : 'Stock OK'
              }
            </Badge>
          </VStack>
        </Box>

        {/* Formulario para agregar movimiento */}
        {isAddingMovement && (
          <Box border="1px solid" borderColor="blue.200" borderRadius="md" p={4} bg="blue.50">
            <VStack align="stretch" gap={4}>
              <Heading size="md" color="#2d3748">Registrar Movimiento</Heading>
              
              <HStack>
                <Button
                  variant={movementForm.movementType === 'entrada' ? 'solid' : 'outline'}
                  colorScheme="green"
                  onClick={() => setMovementForm({...movementForm, movementType: 'entrada'})}
                >
                  Entrada (+)
                </Button>
                <Button
                  variant={movementForm.movementType === 'salida' ? 'solid' : 'outline'}
                  colorScheme="red"
                  onClick={() => setMovementForm({...movementForm, movementType: 'salida'})}
                >
                  Salida (-)
                </Button>
              </HStack>

              <Input
                placeholder={`Cantidad (${ingredient.unit})`}
                type="number"
                value={movementForm.quantity}
                onChange={(e) => setMovementForm({...movementForm, quantity: e.target.value})}
              />

              <select
                style={{
                  padding: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  width: '100%',
                  fontSize: '16px'
                }}
                value={movementForm.reason}
                onChange={(e) => setMovementForm({...movementForm, reason: e.target.value})}
              >
                <option value="">Selecciona el motivo</option>
                <option value="compra">Compra</option>
                <option value="produccion">Producción</option>
                <option value="ajuste">Ajuste de inventario</option>
                <option value="vencimiento">Vencimiento</option>
                <option value="daño">Daño o pérdida</option>
              </select>

              <HStack>
                <Button 
                  colorScheme="blue" 
                  onClick={handleAddMovement}
                >
                  Registrar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingMovement(false)}
                >
                  Cancelar
                </Button>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Historial de movimientos */}
        <Box>
          <Heading size="md" mb={4} color="#2d3748">Historial de Movimientos</Heading>
          {movements.length > 0 ? (
            <VStack align="stretch" gap={3}>
              {movements.map((movement) => (
                <Box 
                  key={movement.id} 
                  border="1px solid" 
                  borderColor="gray.200" 
                  borderRadius="md" 
                  p={4}
                >
                  <HStack justify="space-between">
                    <VStack align="start" gap={1}>
                      <HStack>
                        <Badge colorScheme={movement.movementType === 'entrada' ? 'green' : 'red'}>
                          {movement.movementType === 'entrada' ? 'Entrada' : 'Salida'}
                        </Badge>
                        <Text fontWeight="bold" color={movement.movementType === 'entrada' ? 'green.500' : 'red.500'}>
                          {movement.movementType === 'entrada' ? '+' : '-'}{movement.quantity} {ingredient.unit}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="#4a5568">Motivo: {movement.reason}</Text>
                      <Text fontSize="sm" color="#718096">
                        Usuario: {movement.user?.name || 'Sistema'}
                      </Text>
                    </VStack>
                    <Text fontSize="sm" color="#718096">
                      {new Date(movement.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : (
            <Text color="#718096" textAlign="center" py={8}>
              No hay movimientos registrados para este ingrediente
            </Text>
          )}
        </Box>
      </VStack>
    </Box>
  )
}
