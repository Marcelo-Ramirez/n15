"use client";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
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
  HStack,
  Alert,
} from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
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
        email,
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

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
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

                {/* Email */}
                <Field.Root>
                  <Field.Label>Email</Field.Label>
                  <Input 
                    type="email" 
                    placeholder="test@test.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field.Root>

                {/* Password */}
                <Field.Root>
                  <Field.Label>Contraseña</Field.Label>
                  <Input 
                    type="password" 
                    placeholder="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Field.Root>

                {/* Remember Me */}
                <HStack justify="space-between">
                  <Checkbox.Root defaultChecked={false}>
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>Recordarme</Checkbox.Label>
                  </Checkbox.Root>
                  <Link color="blue.500" href="#" fontSize="sm">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </HStack>

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

                {/* Register Link */}
                <Text textAlign="center" color="gray.600">
                  ¿No tienes cuenta?{" "}
                  <Link color="blue.500" href="/register" fontWeight="medium">
                    Crear cuenta
                  </Link>
                </Text>
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>

        {/* Alternative Login */}
        <Card.Root>
          <Card.Body p={6}>
            <VStack gap={4}>
              <Text color="gray.600" textAlign="center">
                O inicia sesión con
              </Text>
              <HStack gap={4} w="full">
                <Button variant="outline" flex={1} onClick={handleGoogleSignIn}>
                  🔍 Google
                </Button>
                <Button variant="outline" flex={1}>
                  📘 Facebook
                </Button>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Credenciales de prueba */}
        <Card.Root bg="blue.50" borderColor="blue.200">
          <Card.Body p={4}>
            <Text fontSize="sm" color="blue.800" textAlign="center">
              <strong>Credenciales de prueba:</strong><br />
              Email: test@test.com<br />
              Password: password
            </Text>
          </Card.Body>
        </Card.Root>
      </Stack>
    </Box>
  );
}
