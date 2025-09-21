"use client";

import { Box, Heading, Text, VStack, HStack, Button, Input, Link } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";

export default function SystemLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ username: '', password: '' });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Verificar si ya está autenticado al cargar la página
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          // Ya está autenticado, redirigir a su dashboard
          router.push(`/sys/${data.user.role}/dashboard`);
        }
      } catch (error) {
        // No está autenticado, continuar en login
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Implementar lógica de login real
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // En caso de éxito, redirigir al dashboard según el rol o callback URL
      const userRole = data.user?.role || 'admin';
      const callbackUrl = searchParams.get('callbackUrl');
      
      if (callbackUrl && callbackUrl.startsWith('/sys/')) {
        router.push(callbackUrl);
      } else {
        router.push(`/sys/${userRole}/dashboard`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.900">
      <VStack gap={8} w="full" maxW="400px" p={8}>
        <Box textAlign="center">
          <Heading as="h1" size="lg" mb={2} color="white">
            System Access
          </Heading>
          <Text color="gray.400">
            Sign in to access the management system
          </Text>
        </Box>

        <Box as="form" w="100%" onSubmit={handleSubmit}>
          <VStack gap={4}>
            {error && (
              <Box bg="red.100" color="red.800" p={3} rounded="md" w="100%">
                {error}
              </Box>
            )}
            
            <Box w="100%">
              <Text mb={1} fontWeight="medium" color="gray.300">Username</Text>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter your username"
                required
                bg="gray.800"
                color="white"
                borderColor="gray.600"
                _placeholder={{ color: "gray.500" }}
              />
            </Box>
            
            <Box w="100%">
              <Text mb={1} fontWeight="medium" color="gray.300">Password</Text>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                required
                bg="gray.800"
                color="white"
                borderColor="gray.600"
                _placeholder={{ color: "gray.500" }}
              />
            </Box>
            
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              w="100%"
              loading={loading}
            >
              {loading ? 'Signing in...' : 'Access System'}
            </Button>
          </VStack>
        </Box>

        <VStack gap={2}>
          <HStack gap={2}>
            <Text fontSize="sm" color="gray.500">¿No tienes una cuenta?</Text>
            <Link asChild color="blue.400" fontSize="sm" fontWeight="medium">
              <NextLink href="/sys/register">Registrarse</NextLink>
            </Link>
          </HStack>
          
          <Text fontSize="sm" color="gray.500">
            <Button variant="ghost" colorScheme="blue" onClick={() => router.push('/')}>
              ← Back to Store
            </Button>
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}
