"use client";
import { Box, Heading, Grid, Text } from "@chakra-ui/react";

export default function InventoryPage() {
  return (
    <Box>
      <Heading mb={6} size="lg" color="gray.700">
        Gestión de Inventario
      </Heading>
      
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={8}>
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
          <Text fontSize="sm" color="gray.600" mb={2}>Total Productos</Text>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">1,234</Text>
          <Text fontSize="sm" color="gray.500">En inventario</Text>
        </Box>
        
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
          <Text fontSize="sm" color="gray.600" mb={2}>Valor Total</Text>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">$54,321</Text>
          <Text fontSize="sm" color="gray.500">Inventario actual</Text>
        </Box>
        
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
          <Text fontSize="sm" color="gray.600" mb={2}>Productos Bajo Stock</Text>
          <Text fontSize="2xl" fontWeight="bold" color="red.500">23</Text>
          <Text fontSize="sm" color="gray.500">Requieren reabastecimiento</Text>
        </Box>
      </Grid>
    </Box>
  );
}
