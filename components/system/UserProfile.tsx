'use client';

import { useState } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  Spinner,
  Input,
  Image,
  Badge,
} from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/modal";
import { useDisclosure } from "@chakra-ui/hooks";
import { useToast } from "@chakra-ui/toast";
import { useSession } from "next-auth/react";

export default function UserProfile() {
  const { data: session, status, update } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [token, setToken] = useState("");
  const toast = useToast();

  const handleEnable2FA = async () => {
    onOpen();
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/2fa/generate", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate QR code.");
      }
      setQrCode(data.qrDataUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm2FA = async () => {
    setIsConfirming(true);
    try {
      const response = await fetch("/api/auth/2fa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to confirm 2FA.");
      }
      toast({
        title: "Success",
        description: "2FA has been enabled successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      // esto es nuevo
      // En tu UserProfile.tsx (el frontend)
await update({ 
  twoFactorEnabled: true, 
  requires2FA: false 
});
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm 2FA.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      const response = await fetch('/api/auth/2fa/disable', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA.');
      }
      toast({
        title: 'Success',
        description: '2FA has been disabled.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      await update({ twoFactorEnabled: false }); // Pass updated data
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (status === "loading") {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner />
      </Box>
    );
  }

  if (status === "unauthenticated") {
    return <Text>Access Denied</Text>;
  }

  return (
    <>
      <VStack spacing={4} align="flex-start">
        <Text fontSize="lg">Bienvenido, {session?.user?.name || "User"}!</Text>
        <Text color="gray.400">Email: {session?.user?.email}</Text>
        <Text color="gray.400">Role: {session?.user?.role}</Text>

        {session?.user?.twoFactorEnabled ? (
          <VStack align="flex-start">
            <Badge colorScheme="green">2FA Activado</Badge>
            <Button onClick={handleDisable2FA} colorScheme="red" mt={4}>
              Desactivar Autenticación en Dos Pasos
            </Button>
          </VStack>
        ) : (
          <Button onClick={handleEnable2FA} colorScheme="blue" mt={4}>
            Activar Autenticación en Dos Pasos
          </Button>
        )}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Activar Autenticación en Dos Pasos</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoading ? (
              <Spinner />
            ) : (
              <VStack spacing={4}>
                <Text>Escanea este código QR con tu app de autenticación (ej. Google Authenticator).</Text>
                {qrCode && <Image src={qrCode} alt="2FA QR Code" />}
                <Text>Luego, ingresa el código de 6 dígitos de tu app.</Text>
                <Input
                  placeholder="123456"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  maxLength={6}
                  sx={{ color: "black" }}
                />
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleConfirm2FA}
              isLoading={isConfirming}
              disabled={!token || token.length < 6}
            >
              Confirmar y Activar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
