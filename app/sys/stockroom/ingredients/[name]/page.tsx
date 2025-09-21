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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
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

export default function IngredientHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const name = decodeURIComponent(params.name as string);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [ingredient, setIngredient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [name]);

  const fetchHistory = async () => {
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
        <Heading size="md">MovementHistory</Heading>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : movements.length === 0 ? (
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
    </Box>
  );
}
