"use client";

import { Box, Container, Text, Button, VStack, HStack, SimpleGrid } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function HomePage() {
  const router = useRouter();

  return (
    <Box minH="100vh" bg="gray.50">
      <PublicHeader />
      
      <Container maxW="7xl" py={12}>
        <VStack gap={8} textAlign="center" mb={12}>
          <Text fontSize="4xl" fontWeight="bold" color="gray.800">
            Welcome to Our Gummies Store
          </Text>
          <Text fontSize="xl" color="gray.600" maxW="600px">
            Discover our delicious collection of premium gummies made with the finest ingredients.
          </Text>
          <HStack gap={4}>
            <Button 
              colorScheme="blue" 
              size="lg"
              onClick={() => router.push('/catalog')}
            >
              Browse Catalog
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/sys/login')}
            >
              System Login
            </Button>
          </HStack>
        </VStack>

        {/* Featured Products Section */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center">
            Featured Products
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {[1, 2, 3].map((index) => (
              <Box 
                key={index}
                bg="white" 
                p={6} 
                rounded="lg" 
                shadow="sm"
                textAlign="center"
              >
                <Box 
                  h="200px" 
                  bg="gray.200" 
                  rounded="md" 
                  mb={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="gray.500">Product Image</Text>
                </Box>
                <Text fontWeight="semibold" mb={2}>
                  Sample Gummy {index}
                </Text>
                <Text color="gray.600" mb={4}>
                  Delicious fruit-flavored gummies
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.600">
                  $9.99
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Container>

      <PublicFooter />
    </Box>
  );
}
