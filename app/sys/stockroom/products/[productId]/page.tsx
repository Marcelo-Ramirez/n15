// app/sys/sale/products/[id]/history/page.tsx
// app/sys/stockroom/products/[id]/history/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Spinner,
  Input,
  Badge,
} from "@chakra-ui/react";
import { NativeSelectRoot, NativeSelectField } from "@chakra-ui/react/native-select";
import { useEffect, useState, ChangeEvent } from "react";
import { FiArrowLeft } from "react-icons/fi";

interface Movement {
  id: number;
  movementType: string;
  reason: string;
  quantity: number;
  createdAt: string;
  user: {
    name: string;
  };
}

interface Product {
  id: number;
  name: string;
  type: string;
  flavor: string;
  pricePerUnit: number;
  currentQuantity: number;
  imageUrl?: string | null;
}

export default function ProductHistoryPage() {
  const router = useRouter();
  const params = useParams();
  // ✅ Obtener el ID de la ruta
  const productId = params.id;

  // Determinar el rol basado en la ruta actual
  const isStockroomRole = typeof window !== 'undefined' && 
    window.location.pathname.includes('/stockroom/');
  const role = isStockroomRole ? 'stockroom' : 'sale';

  const [movements, setMovements] = useState<Movement[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerData, setRegisterData] = useState({
    movementType: '',
    reason: '',
    quantity: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Usar productId en el useEffect
    if (productId) {
      fetchHistory();
    }
  }, [productId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      // ✅ Usar el ID en la URL del API
      const res = await fetch(`/api/system/inventory/products/history?id=${encodeURIComponent(productId as string)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener historial");
      setMovements(data.movements || []);
      setProduct(data.product || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRegister = () => {
    setRegisterData({ movementType: '', reason: '', quantity: '' });
    setRegisterError(null);
    setRegisterSuccess(null);
    setShowRegisterModal(true);
  };

  const handleRegisterCancel = () => {
    setShowRegisterModal(false);
    setRegisterError(null);
    setRegisterSuccess(null);
  };

  const handleRegisterAccept = async () => {
    if (!registerData.movementType || !registerData.reason || !registerData.quantity) {
      setRegisterError('Completa todos los campos');
      return;
    }
    
    setRegisterLoading(true);
    setRegisterError(null);
    setRegisterSuccess(null);
    
    try {
      const res = await fetch('/api/system/inventory/products/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // ✅ Enviar el ID en el cuerpo de la petición
          productId, 
          movementType: registerData.movementType,
          reason: registerData.reason,
          quantity: Number(registerData.quantity)
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar movimiento');
      
      setShowRegisterModal(false);
      setRegisterSuccess('¡Movimiento registrado exitosamente!');
      setRegisterData({ movementType: '', reason: '', quantity: '' });
      await fetchHistory();
      
      setTimeout(() => setRegisterSuccess(null), 3000);
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setRegisterLoading(false);
    }
  };

  const getMovementReasons = () => {
    const baseReasons = [
      { value: 'produccion', label: 'Producción' },
      { value: 'ajuste_inventario', label: 'Ajuste de Inventario' },
      { value: 'devolucion', label: 'Devolución' },
      { value: 'dano', label: 'Daño/Pérdida' }
    ];

    if (role === 'sale') {
      return [
        ...baseReasons,
        { value: 'venta', label: 'Venta' },
        { value: 'promocion', label: 'Promoción' }
      ];
    } else {
      return [
        ...baseReasons,
        { value: 'compra', label: 'Compra' },
        { value: 'transferencia_venta', label: 'Transferencia a Venta' }
      ];
    }
  };

  return (
    <Box p={6}>
      {/* Botón Volver */}
      <Button variant="ghost" mb={4} onClick={() => router.back()}>
        <HStack gap={2}>
          <FiArrowLeft />
          <Text>Volver</Text>
        </HStack>
      </Button>

      <VStack align="stretch" gap={4}>
        {/* Información del Producto */}
        <Box
          bg="white"
          p={5}
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor="gray.200"
        >
          <Heading size="lg" mb={3} color="gray.900">
            {role === 'stockroom' ? 'Producto - Stockroom' : 'Producto - Venta'}
          </Heading>
          
          {product ? (
            <VStack align="stretch" gap={2}>
              <HStack justify="space-between">
                <Text fontWeight="bold" fontSize="lg" color="gray.900">
                  {product.name}
                </Text>
                <Badge colorScheme={product.currentQuantity > 0 ? "green" : "red"} fontSize="md" px={3} py={1}>
                  Stock: {product.currentQuantity}
                </Badge>
              </HStack>
              
              <HStack gap={4} flexWrap="wrap">
                <Text color="gray.600" fontSize="sm">
                  <Text as="span" fontWeight="medium">Tipo:</Text> {product.type}
                </Text>
                <Text color="gray.600" fontSize="sm">
                  <Text as="span" fontWeight="medium">Sabor:</Text> {product.flavor}
                </Text>
                {role === 'sale' && (
                  <Text color="gray.600" fontSize="sm">
                    <Text as="span" fontWeight="medium">Precio:</Text> ${product.pricePerUnit?.toFixed(2) || "0.00"}
                  </Text>
                )}
              </HStack>
            </VStack>
          ) : (
            <VStack align="stretch" gap={2}>
              <Text fontWeight="bold" fontSize="lg" color="gray.900">Cargando...</Text>
              <Text color="gray.500" fontSize="sm">Cargando información del producto...</Text>
            </VStack>
          )}
        </Box>

        {/* Separador */}
        <Box h="1px" bg="gray.200" my={2} />

        {/* Header del Historial */}
        <HStack justify="space-between" align="center">
          <Heading size="md" color="gray.900">Historial de Movimientos</Heading>
          <Button colorScheme="blue" size="sm" onClick={handleOpenRegister}>
            Registrar Movimiento
          </Button>
        </HStack>

        {/* Mensaje de éxito */}
        {registerSuccess && (
          <Box
            bg="green.50"
            border="1px"
            borderColor="green.200"
            borderRadius="md"
            p={4}
            color="green.700"
          >
            <Text fontWeight="medium">{registerSuccess}</Text>
          </Box>
        )}

        {/* Lista de Movimientos */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <VStack gap={3}>
              <Spinner size="lg" color="blue.500" />
              <Text color="gray.600">Cargando historial...</Text>
            </VStack>
          </Box>
        ) : error ? (
          <Box
            bg="red.50"
            border="1px"
            borderColor="red.200"
            borderRadius="md"
            p={4}
            color="red.700"
          >
            <Text fontWeight="medium">Error:</Text>
            <Text>{error}</Text>
          </Box>
        ) : movements.length === 0 ? (
          <Box 
            bg="white"
            p={8} 
            textAlign="center"
            borderRadius="lg"
            boxShadow="sm"
            border="1px"
            borderColor="gray.200"
          >
            <Text color="gray.500" fontSize="lg">No hay movimientos registrados</Text>
            <Text color="gray.400" fontSize="sm" mt={2}>
              Los movimientos aparecerán aquí cuando se registren
            </Text>
          </Box>
        ) : (
          <VStack gap={3} align="stretch">
            {movements.map((movement) => (
              <Box 
                key={movement.id} 
                bg="white"
                borderWidth="1px" 
                borderColor="gray.200"
                borderRadius="lg" 
                p={4} 
                boxShadow="sm"
                _hover={{ boxShadow: "md" }}
                transition="all 0.2s"
              >
                <HStack justify="space-between" align="start">
                  <VStack align="start" gap={1} flex={1}>
                    <HStack gap={3}>
                      <Badge 
                        colorScheme={movement.movementType === 'entrada' ? 'green' : 'red'}
                        fontSize="sm"
                        px={2}
                        py={1}
                      >
                        {movement.movementType.toUpperCase()}
                      </Badge>
                      <Text fontWeight="bold" color="gray.900">
                        {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                      </Text>
                    </HStack>
                    
                    <Text fontSize="sm" color="gray.700">
                      <Text as="span" fontWeight="medium">Motivo:</Text> {movement.reason}
                    </Text>
                    
                    <Text fontSize="sm" color="gray.600">
                      <Text as="span" fontWeight="medium">Usuario:</Text> {movement.user?.name || "Sistema"}
                    </Text>
                  </VStack>
                  
                  <Text fontSize="sm" color="gray.500" textAlign="right" minW="140px">
                    {new Date(movement.createdAt).toLocaleString('es-ES', {
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
        )}

        {/* Modal para registrar movimiento */}
        {showRegisterModal && (
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
                <Heading size="md" color="gray.900">Registrar Movimiento</Heading>
                
                <VStack gap={4} align="stretch">
                  <Box>
                    <Text fontWeight="medium" mb={2}>Tipo de Movimiento</Text>
                    <NativeSelectRoot>
                      <NativeSelectField
                        value={registerData.movementType}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                          setRegisterData(d => ({ ...d, movementType: e.target.value }))
                        }
                      >
                        <option value="">Selecciona tipo</option>
                        <option value="entrada">Entrada</option>
                        <option value="salida">Salida</option>
                      </NativeSelectField>
                    </NativeSelectRoot>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="medium" mb={2}>Razón</Text>
                    <NativeSelectRoot>
                      <NativeSelectField
                        value={registerData.reason}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                          setRegisterData(d => ({ ...d, reason: e.target.value }))
                        }
                      >
                        <option value="">Selecciona razón</option>
                        {getMovementReasons().map(reason => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </NativeSelectField>
                    </NativeSelectRoot>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="medium" mb={2}>Cantidad</Text>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Ingrese la cantidad"
                      value={registerData.quantity}
                      onChange={(e) => setRegisterData(d => ({ ...d, quantity: e.target.value }))}
                    />
                  </Box>
                </VStack>
                
                {registerError && (
                  <Box
                    bg="red.50"
                    border="1px"
                    borderColor="red.200"
                    borderRadius="md"
                    p={3}
                  >
                    <Text color="red.600" fontSize="sm">{registerError}</Text>
                  </Box>
                )}
                
                <HStack gap={3} justify="flex-end" mt={4}>
                  <Button 
                    variant="ghost" 
                    onClick={handleRegisterCancel} 
                    disabled={registerLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    colorScheme="blue" 
                    onClick={handleRegisterAccept} 
                    isLoading={registerLoading}
                    loadingText="Registrando..."
                  >
                    Registrar
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