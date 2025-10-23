"use client";

import { Box, Heading, Text, VStack, HStack, Button, Input, Link } from "@chakra-ui/react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";

function LoginForm() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({ username: '', password: '' });
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const checkSession = async () => {
			try {
				const response = await fetch('/api/auth/session');
				if (response.ok) {
					const data = await response.json();
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
		setError("");
		try {
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
			const userRole = data.user?.role || 'admin';
			const callbackUrl = searchParams.get('callbackUrl');
			if (callbackUrl && callbackUrl.startsWith('/sys/')) {
				router.push(callbackUrl);
			} else {
				router.push(`/sys/${userRole}/user`);
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
						Inicia sesión para acceder al sistema
					</Text>
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
						{error && <Text color="red.400">{error}</Text>}
						<Button type="submit" colorScheme="blue" loading={loading} loadingText="Entrando...">
							Entrar
						</Button>
					</VStack>
				</form>
				<HStack justify="space-between" w="full">
					<Link as={NextLink} href="/register" color="blue.300">
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
