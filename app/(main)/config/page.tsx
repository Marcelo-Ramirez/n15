"use client";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function ConfigPage() {
  return (
    <Box>
      <Heading mb={6} size="lg" color="gray.700">
        Configuración del Sistema
      </Heading>
      
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
        <Text color="gray.600">
          Aquí podrás configurar las opciones generales del sistema, gestionar usuarios, 
          y ajustar las preferencias de la aplicación.
        </Text>
      </Box>
    </Box>
  );
}
