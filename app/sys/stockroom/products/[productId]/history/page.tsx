'use client';

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
} from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";

// Definimos las interfaces para productos y movimientos
interface ProductDetails {
  id: number;
  name: string;
  type: string;
  flavor: string;
  currentStock: number;
}

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

export default function StockroomProductHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;
  const role = "stockroom"; // Rol codificado

  const [movements, setMovements] = useState<Movement[]>([]);
  const [product, setProduct] = useState<ProductDetails | null>(null);
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
    fetchHistory();
  }, [productId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const productRes = await fetch(`/api/inventory/products/${productId}/history`);
      const productData = await productRes.json();
      if (!productRes.ok) throw new Error(productData.error || "Error al obtener detalles del producto");
      setProduct(productData.product);

      const historyRes = await fetch(`/api/inventory/products/${productId}/history`);
      const historyData = await historyRes.json();
      if (!historyRes.ok) throw new Error(historyData.error || "Error al obtener historial");
      setMovements(historyData.movements);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRegister = () => {
    setRegisterData({
      movementType: '',
      reason: '',
      quantity: ''
    });
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
      const res = await fetch(`/api/inventory/products/${productId}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setRegisterLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }
  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  return (
    <Box p={6}>
      <Button variant="ghost" mb={4} onClick={() => router.back()}>
        <HStack>
          <FiArrowLeft />
          <Text>Volver</Text>
        </HStack>
      </Button>
      <VStack align="stretch" gap={4}>
        <Box>
          <Heading size="lg" mb={2}>Producto (Stockroom)</Heading>
          <Text fontWeight="bold">Nombre: {product?.name || "N/A"}</Text>
          <Text color="gray.400" fontSize="sm">Sabor: {product?.flavor || "-"}</Text>
          <Text color="gray.400" fontSize="sm">Tipo: {product?.type || "-"}</Text>
        </Box>
        <Box h="1px" bg="gray.200" my={2} />
        <HStack justify="space-between" align="center">
          <Heading size="md">Historial de Movimientos</Heading>
          <Button colorScheme="blue" size="sm" onClick={handleOpenRegister}>
            Registrar Movimiento
          </Button>
        </HStack>
        
        {/* Aquí va tu lista de movimientos */}
        {movements.length === 0 ? (
          <Text color="gray.500">No hay movimientos registrados</Text>
        ) : (
          movements.map((m) => (
            <Box key={m.id} borderWidth="1px" borderRadius="lg" p={4} mb={2}>
              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="bold">{m.movementType} {m.quantity > 0 ? "+" : "-"}{Math.abs(m.quantity)}</Text>
                  <Text fontSize="sm">Motivo: {m.reason}</Text>
                  <Text fontSize="sm">nameUser: {m.user?.name || "-"}</Text>
                </Box>
                <Text fontSize="sm" color="gray.600">{new Date(m.createdAt).toLocaleString()}</Text>
              </HStack>
            </Box>
          ))
        )}
      </VStack>
      
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
              <Heading size="md">Registrar Movimiento</Heading>
              <VStack gap={3} align="stretch">
                <Box>
                  <Text fontWeight="medium" mb={2}>Tipo de Movimiento</Text>
                  <Select
                    value={registerData.movementType}
                    onChange={(e) => setRegisterData(d => ({ ...d, movementType: e.target.value }))}
                  >
                    <option value="">Selecciona tipo</option>
                    <option value="entrada">Entrada</option>
                  </Select>
                </Box>
                <Box>
                  <Text fontWeight="medium" mb={2}>Razón</Text>
                  <Select
                    value={registerData.reason}
                    onChange={(e) => setRegisterData(d => ({ ...d, reason: e.target.value }))}
                  >
                    <option value="">Selecciona razón</option>
                    <option value="produccion">Producción</option>
                    <option value="compra">Compra</option>
                  </Select>
                </Box>
                <Box>
                  <Text fontWeight="medium" mb={2}>Cantidad</Text>
                  <Input
                    type="number"
                    placeholder="Cantidad"
                    value={registerData.quantity}
                    onChange={e => setRegisterData(d => ({ ...d, quantity: e.target.value }))}
                  />
                </Box>
              </VStack>
              {registerError && <Text color="red.500">{registerError}</Text>}
              {registerSuccess && <Text color="green.600">{registerSuccess}</Text>}
              <HStack gap={3} justify="flex-end" mt={4}>
                <Button variant="ghost" onClick={handleRegisterCancel} disabled={registerLoading}>
                  Cancelar
                </Button>
                <Button colorScheme="blue" onClick={handleRegisterAccept} loading={registerLoading}>
                  Aceptar
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
}