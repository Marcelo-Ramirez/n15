"use client";

import { Box, Heading, Text, VStack, HStack, Button, Input, Link } from "@chakra-ui/react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { signIn, useSession, type SignInResponse } from "next-auth/react";

type UserSession = {
  role?: string;
  requires2FA?: boolean;
}

const roleToPath: { [key: string]: string } = {
    ventas: 'sales',
    almacen: 'stockroom',
    admin: 'admin',
};

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ username: '', password: '' });
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const getRedirectUrl = useCallback((role: string) => {
    const callbackUrl = searchParams.get('callbackUrl');
    if (callbackUrl) return callbackUrl;

    const pathRole = roleToPath[role] || role;
    return `/sys/${pathRole}/user`;
  }, [searchParams])

  useEffect(() => {
    const user = session?.user as unknown as UserSession | undefined;
    if (status === 'authenticated' && user) {
      if (user.requires2FA) {
        router.push('/sys/2fa');
      } else {
        const redirectUrl = getRedirectUrl(user.role || '');
        router.push(redirectUrl);
      }
    }
  }, [status, session, getRedirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result: SignInResponse | undefined = await signIn('credentials', {
      ...formData,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Credenciales inválidas");
    }
    // El bloque 'else' se elimina.
    // El 'useEffect' de arriba se encargará de la redirección
    // cuando detecte el cambio de 'status' a 'authenticated'.
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.900">
      <VStack gap={8} w="full" maxW="400px" p={8}>
        <Box textAlign="center">
            <Heading as="h1" size="lg" mb={2} color="white">System Access</Heading>
            <Text color="gray.400">Inicia sesión para acceder al sistema</Text>
        </Box>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack gap={4} align="stretch">
              <Input
                placeholder="Usuario"
                value={formData.username}
                onChange={e => setFormData(d => ({ ...d, username: e.target.value }))}
                required
              />
              <Input
                placeholder="Contraseña"
                type="password"
                value={formData.password}
                onChange={e => setFormData(d => ({ ...d, password: e.target.value }))}
                required
              />
            </VStack>
            {error && <Text color="red.400" mt={4}>{error}</Text>}
        <Button type="submit" colorScheme="blue" loading={loading} loadingText={"Entrando..."} mt={4} w="full">
          Entrar
        </Button>
        </form>

        <HStack justify="space-between" w="full">
          <Link as={NextLink} href="/sys/register" color="blue.300">
            ¿No tienes cuenta? Regístrate
          </Link>
          <Link as={NextLink} href="/" color="gray.400">
            Volver al inicio
          </Link>
        </HStack>
      </VStack>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}