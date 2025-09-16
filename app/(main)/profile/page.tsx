"use client";
import { useState } from "react";
import { Box, Heading, Text, Button, Input, VStack, HStack } from "@chakra-ui/react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const [qrCode, setQrCode] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate2FA = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/2fa/generate", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al generar código QR");
      }
      
      const data = await res.json();
      
      if (!data.qrDataUrl) {
        throw new Error("No se pudo generar el código QR");
      }
      
      setQrCode(data.qrDataUrl);
      setMessage("Escanea el código QR con tu aplicación de autenticación");
    } catch (err: any) {
      console.error("Error generating 2FA:", err);
      setError(err.message || "Error al generar 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Token inválido");
      }

      // Actualizar la sesión para reflejar el estado 2FA
      await update();
      
      setMessage("2FA activado correctamente");
      setQrCode("");
      setToken("");
      
    } catch (err: any) {
      console.error("Error verifying 2FA:", err);
      setError(err.message || "Error al verificar token. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Heading mb={6} size="lg" color="gray.700">
        Mi Perfil
      </Heading>
      
      {/* Información Personal */}
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200" mb={6}>
        <Text fontWeight="semibold" mb={4} color="gray.700">Información Personal</Text>
        <VStack align="start" gap={2}>
          <Text><strong>Nombre:</strong> {user?.name || "No disponible"}</Text>
          <Text><strong>Email:</strong> {user?.email}</Text>
          <Text><strong>ID de Usuario:</strong> {user?.id}</Text>
          <Text>
            <strong>2FA:</strong>{" "}
            <Text as="span" color={user?.twoFactorEnabled ? "green.500" : "red.500"}>
              {user?.twoFactorEnabled ? "Activado" : "Desactivado"}
            </Text>
          </Text>
        </VStack>
      </Box>

      {/* Configuración 2FA */}
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
        <Heading size="md" mb={4} color="gray.700">
          Autenticación de Dos Factores (2FA)
        </Heading>

        {/* Mensajes */}
        {message && (
          <Box bg="green.50" border="1px" borderColor="green.200" borderRadius="md" p={4} mb={4}>
            <Text color="green.700">✅ {message}</Text>
          </Box>
        )}
        
        {error && (
          <Box bg="red.50" border="1px" borderColor="red.200" borderRadius="md" p={4} mb={4}>
            <Text color="red.700">❌ {error}</Text>
          </Box>
        )}

        {user?.twoFactorEnabled ? (
          /* 2FA Ya Activado */
          <VStack align="start" gap={4}>
            <Text color="green.600" fontWeight="medium">
              ✅ La autenticación de dos factores está activada en tu cuenta.
            </Text>
            <Text color="gray.600" fontSize="sm">
              Tu cuenta está protegida con autenticación de dos factores. 
              Necesitarás tu aplicación de autenticación para iniciar sesión.
            </Text>
          </VStack>
        ) : (
          /* Configurar 2FA */
          <VStack align="start" gap={4}>
            <Text color="gray.600">
              Mejora la seguridad de tu cuenta activando la autenticación de dos factores.
            </Text>

            {!qrCode ? (
              <Button 
                colorScheme="blue" 
                onClick={handleGenerate2FA}
                loading={loading}
              >
                Activar 2FA
              </Button>
            ) : (
              <VStack align="start" gap={4}>
                <Text fontWeight="medium">Paso 1: Escanea el código QR</Text>
                <Box p={4} bg="white" borderRadius="md" border="2px" borderColor="gray.200">
                  <img src={qrCode} alt="QR Code para 2FA" />
                </Box>
                
                <Text fontWeight="medium">Paso 2: Ingresa el código de tu app</Text>
                <HStack>
                  <Input
                    placeholder="Código de 6 dígitos"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    maxLength={6}
                    width="200px"
                  />
                  <Button 
                    colorScheme="green" 
                    onClick={handleVerify2FA}
                    loading={loading}
                    disabled={token.length !== 6}
                  >
                    Verificar
                  </Button>
                </HStack>
                
                <Text fontSize="sm" color="gray.500">
                  Usa apps como Google Authenticator, Authy, o Microsoft Authenticator
                </Text>
              </VStack>
            )}
          </VStack>
        )}
      </Box>
    </Box>
  );
}
