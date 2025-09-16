"use client";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function ReportsPage() {
  return (
    <Box>
      <Heading mb={6} size="lg" color="gray.700">
        Reportes y Análisis
      </Heading>
      
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
        <Text color="gray.600">
          Aquí encontrarás reportes detallados del inventario, análisis ABC, 
          y estadísticas de consumo de productos.
        </Text>
      </Box>
    </Box>
  );
}
