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
  const [twoFAToken, setTwoFAToken] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log("🔹 Login submit clicked");
    console.log("Username:", username);
    console.log("Password length:", password.length);
    console.log("2FA Token:", twoFAToken);

    try {
      // 1️⃣ Primero verificar si el usuario requiere 2FA
      if (!requires2FA) {
        const checkRes = await fetch("/api/auth/Check2Fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const checkData = await checkRes.json();
        console.log("📌 Check2Fa response:", checkData);

        if (checkRes.ok && checkData.requires2FA) {
          setRequires2FA(true);
          setError(""); // limpiar errores
          setIsLoading(false);
          return; // no hacemos signIn aún
        } else if (!checkRes.ok) {
          setError(checkData.error || "Error verificando credenciales");
          setIsLoading(false);
          return;
        }
      }

      // 2️⃣ Hacer signIn con NextAuth
      const result: any = await signIn("credentials", {
        username,
        password,
        token2FA: twoFAToken || undefined,
        redirect: false,
      });

      console.log("📌 Result from signIn:", result);

      if (result?.error) {
        setError("Credenciales inválidas o token 2FA incorrecto");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("❌ Exception during login:", err);
      setError("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
      console.log("🔹 Login process finished");
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10} px={4}>
      <Stack gap={8} maxW="md" mx="auto">
        <Stack gap={4} textAlign="center">
          <Heading size="3xl" color="blue.600">Iniciar Sesión</Heading>
          <Text fontSize="lg" color="gray.600">
            {requires2FA
              ? "Ingresa tu token de Google Authenticator"
              : "Ingresa tus credenciales para acceder"}
          </Text>
        </Stack>

        <Card.Root boxShadow="md" borderRadius="3xl" overflow="hidden">
          <Card.Body p={8}>
            <form onSubmit={handleLoginSubmit}>
              <VStack gap={6} align="stretch">
                {error && (
                  <Alert.Root status="error">
                    <Alert.Title>{error}</Alert.Title>
                  </Alert.Root>
                )}

                {!requires2FA && (
                  <>
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
                  </>
                )}

                {requires2FA && (
                  <Field.Root>
                    <Field.Label>Token 2FA</Field.Label>
                    <Input
                      type="text"
                      placeholder="123456"
                      value={twoFAToken}
                      onChange={(e) => setTwoFAToken(e.target.value)}
                      required
                    />
                  </Field.Root>
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  mt={4}
                  isLoading={isLoading}
                >
                  {isLoading
                    ? "Procesando..."
                    : requires2FA
                    ? "Verificar Token"
                    : "Iniciar Sesión"}
                </Button>

                {!requires2FA && (
                  <Box textAlign="center">
                    <Link href="/register" fontWeight="medium" fontSize="sm">
                      Register
                    </Link>
                  </Box>
                )}
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>
      </Stack>
    </Box>
  );
}
