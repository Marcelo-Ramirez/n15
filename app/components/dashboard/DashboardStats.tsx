"use client";
import {
  Box,
  Heading,
  Text,
  VStack,
  Grid,
} from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardStats() {
  const { user } = useAuth();

  return (
    <VStack gap={6} align="stretch">
      <Heading size="lg" color="gray.700">
        Dashboard
      </Heading>

      {/* Stats Cards */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
          <Text fontSize="sm" color="gray.600" mb={2}>Productos en Inventario</Text>
          <Text fontSize="3xl" fontWeight="bold" color="blue.500">1,234</Text>
          <Text fontSize="sm" color="green.500">↗️ +12% desde el mes pasado</Text>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
          <Text fontSize="sm" color="gray.600" mb={2}>Valor Total Inventario</Text>
          <Text fontSize="3xl" fontWeight="bold" color="green.500">$45,678</Text>
          <Text fontSize="sm" color="green.500">↗️ +23% desde el mes pasado</Text>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
          <Text fontSize="sm" color="gray.600" mb={2}>Productos Categoría A</Text>
          <Text fontSize="3xl" fontWeight="bold" color="purple.500">47</Text>
          <Text fontSize="sm" color="red.500">↘️ -5% desde el mes pasado</Text>
        </Box>
      </Grid>

      {/* Recent Activity */}
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
        <Heading size="lg" mb={4}>Actividad Reciente</Heading>
        <VStack gap={4} align="stretch">
          {[
            { action: "Nuevo producto agregado al inventario", time: "Hace 5 minutos", type: "success" },
            { action: "Análisis ABC actualizado", time: "Hace 12 minutos", type: "info" },
            { action: "Stock bajo detectado en 3 productos", time: "Hace 1 hora", type: "warning" },
          ].map((activity, index) => (
            <Box key={index} p={3} bg="gray.50" borderRadius="md" display="flex" justifyContent="space-between" alignItems="center">
              <Text>{activity.action}</Text>
              <Text fontSize="sm" color="gray.500">{activity.time}</Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
}
