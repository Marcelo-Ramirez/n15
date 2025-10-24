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
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { FiArrowLeft } from "react-icons/fi";

// Definición de interfaces
interface IngredientDetails {
    name: string;
    provider: string;
    reorderPoint: number;
    pricePerUnit: number;
    // Agrega aquí cualquier otra propiedad que venga en data.ingredient
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

export default function IngredientHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const name = decodeURIComponent(params.name as string);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [ingredient, setIngredient] = useState<IngredientDetails | null>(null); // Tipo seguro
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

  // Función estable para la obtención de datos
  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/system/inventory/ingredients/history?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener historial");
      setMovements(data.movements);
      setIngredient(data.ingredient);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [name]); // Dependencia: 'name' es de 'useParams' y es estable.

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]); // Ahora depende de la función estable

  // Lógica del Modal
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
      const res = await fetch('/api/system/inventory/ingredients/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
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

  // 💡 FUNCIÓN AUXILIAR: Resuelve la operación ternaria anidada (SonarQube S3358)
  const renderContent = () => {
    if (isLoading) {
      return <Spinner />;
    }

    if (error) {
      return <Text color="red.500">{error}</Text>;
    }

    if (movements.length === 0) {
      return <Text color="gray.500">No hay movimientos registrados</Text>;
    }

    return (
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
    );
  };

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
          <Heading size="lg" mb={2}>Ingredient</Heading>
          <Text fontWeight="bold">{ingredient?.name || name}</Text>
          <Text color="gray.400" fontSize="sm">Proveedor: {ingredient?.provider || "-"}</Text>
          <Text color="gray.400" fontSize="sm">ReorderPoint: {ingredient?.reorderPoint ?? "undefined/Quantity"}</Text>
          <Text color="gray.400" fontSize="sm">PricePerUnit: ${ingredient?.pricePerUnit?.toFixed(2) ?? "-"}</Text>
        </Box>
        <Box h="1px" bg="gray.200" my={2} />
        <HStack justify="space-between" align="center">
          <Heading size="md">MovementHistory</Heading>
          <Button colorScheme="blue" size="sm" onClick={handleOpenRegister}>
            Registrar Movimiento
          </Button>
        </HStack>
        
        {/* 👇 USO DEL RENDERIZADO CONDICIONAL LIMPIO */}
        {renderContent()}

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
                <Heading size="md">Registrar Movimiento</Heading>
                <VStack gap={3} align="stretch">
                  <Box>
                    <Text fontWeight="medium" mb={2}>Tipo de Movimiento</Text>
                    <select
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E0' }}
                      value={registerData.movementType}
                      onChange={(e) => setRegisterData(d => ({ ...d, movementType: e.target.value }))}
                    >
                      <option value="">Selecciona tipo</option>
                      <option value="entrada">Entrada</option>
                      <option value="salida">Salida</option>
                    </select>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2}>Razón</Text>
                    <select
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E0' }}
                      value={registerData.reason}
                      onChange={(e) => setRegisterData(d => ({ ...d, reason: e.target.value }))}
                    >
                      <option value="">Selecciona razón</option>
                      <option value="produccion">Producción</option>
                      <option value="compra">Compra</option>
                    </select>
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
      </VStack>
    </Box>
  );
}