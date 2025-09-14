"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  Card,
  Input,
  Field,
  Link,
  VStack,
  Alert,
} from "@chakra-ui/react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales inválidas");
      } else {
        // Login exitoso, redirigir al dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      setError("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10} px={4}>
      <Stack gap={8} maxW="md" mx="auto">
        {/* Header */}
        <Stack gap={4} textAlign="center">
          <Heading size="3xl" color="blue.600">
            Iniciar Sesión
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Ingresa tus credenciales para acceder
          </Text>
        </Stack>

        {/* Login Form */}
        <Card.Root boxShadow="md" borderRadius="3xl" overflow="hidden">
          <Card.Body p={8}>
            <form onSubmit={handleSubmit}>
              <VStack gap={6} align="stretch">
                {error && (
                  <Alert.Root status="error">
                    <Alert.Title>{error}</Alert.Title>
                  </Alert.Root>
                )}

                {/* Username */}
                <Field.Root>
                  <Field.Label>Nombre de Usuario</Field.Label>
                  <Input
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Field.Root>

                {/* Password */}
                <Field.Root>
                  <Field.Label>Contraseña</Field.Label>
                  <Input
                    type="password"
                    placeholder="contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Field.Root>

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  mt={4}
                  loading={isLoading}
                >
                  {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                </Button>

                <Box textAlign="center">
                  <Link href="/register"  fontWeight="medium" fontSize={"sm"}>
                    Register
                  </Link>
                </Box>

              </VStack>
            </form>
          </Card.Body>
        </Card.Root>
      </Stack>
    </Box>
  );
}
