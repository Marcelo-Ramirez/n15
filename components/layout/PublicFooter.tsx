import { Box, Container, Text, HStack, VStack, SimpleGrid } from "@chakra-ui/react";

export function PublicFooter() {
  return (
    <Box bg="gray.800" color="white" py={12}>
      <Container maxW="7xl" mx="auto" textAlign="center">
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} justifyItems="center" mx="auto" textAlign="center">
          <VStack align={{ base: "center", md: "start" }} gap={4}>
            <Text fontSize="lg" fontWeight="bold">MuytunaSys</Text>
            <Text color="gray.400" fontSize="sm">
              Gomitas naturales de la más alta calidad, 
              hechas con ingredientes frescos y amor.
            </Text>
          </VStack>
          <VStack align={{ base: "center", md: "start" }} gap={4}>
            <Text fontWeight="bold">Enlaces</Text>
            <VStack align={{ base: "center", md: "start" }} gap={2}>
              <Text color="gray.400" fontSize="sm">Catálogo</Text>
              <Text color="gray.400" fontSize="sm">Sobre Nosotros</Text>
              <Text color="gray.400" fontSize="sm">Contacto</Text>
              <Text color="gray.400" fontSize="sm">FAQ</Text>
            </VStack>
          </VStack>
          <VStack align={{ base: "center", md: "start" }} gap={4}>
            <Text fontWeight="bold">Contacto</Text>
            <VStack align={{ base: "center", md: "start" }} gap={2}>
              <Text color="gray.400" fontSize="sm">info@muytunasys.com</Text>
              <Text color="gray.400" fontSize="sm">+1 234 567 8900</Text>
              <Text color="gray.400" fontSize="sm">Ciudad de México, México</Text>
            </VStack>
          </VStack>
        </SimpleGrid>
        <Box borderTop="1px" borderColor="gray.700" mt={8} pt={8}>
          <HStack justify="center" flexWrap="wrap" gap={4}>
            <Text color="gray.500" fontSize="sm">
              © 2025 MuytunaSys. Todos los derechos reservados.
            </Text>
            <Text color="gray.500" fontSize="sm">
              Términos | Privacidad
            </Text>
          </HStack>
        </Box>
      </Container>
    </Box>
  );
}
