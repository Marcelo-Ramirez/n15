"use client";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function ProductsPage() {
  return (
    <Box>
      <Heading mb={6} size="lg" color="gray.700">
        Gestión de Productos
      </Heading>
      
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
        <Text color="gray.600">
          Aquí podrás agregar, editar y administrar todos los productos del inventario.
        </Text>
      </Box>
    </Box>
  );
}
