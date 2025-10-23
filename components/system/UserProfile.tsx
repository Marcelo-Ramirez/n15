'use client';

import { useState } from "react";
import {
  Box,
  Button,
  ButtonProps,
  Text,
  VStack,
  Spinner,
  Input,
  Image,
  Badge,
  Heading,
  HStack,
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
import { FiUser, FiMail, FiShield } from 'react-icons/fi';
const ConfirmButton: React.FC<ButtonProps> = (props) => <Button {...props} />;
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
      await update({ twoFactorEnabled: false });
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
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <Spinner />
        <Text ml={4}>Cargando datos del usuario...</Text>
      </Box>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <Box>
        <Text color="red.500">Error al cargar los datos del usuario. Acceso denegado.</Text>
      </Box>
    );
  }

  const userData = session.user;

  return (
    <>
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        border="1px"
        borderColor="gray.200"
      >
        <VStack gap={4} align="stretch">
          <HStack gap={4}>
            <Box
              w={16}
              h={16}
              bg="blue.500"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              fontSize="2xl"
              fontWeight="bold"
            >
              {userData.name?.charAt(0).toUpperCase()}
            </Box>
            <Box>
              <Heading size="md">{userData.name}</Heading>
              <Text color="gray.600">@{userData.username}</Text>
            </Box>
          </HStack>

          <Box h="1px" bg="gray.200" />

          <VStack gap={4} align="stretch">
            <HStack gap={3}>
              <FiUser size={20} color="gray" />
              <Box>
                <Text fontWeight="medium">Nombre de Usuario</Text>
                <Text color="gray.600">{userData.username}</Text>
              </Box>
            </HStack>

            <HStack gap={3}>
              <FiUser size={20} color="gray" />
              <Box>
                <Text fontWeight="medium">Nombre Completo</Text>
                <Text color="gray.600">{userData.name}</Text>
              </Box>
            </HStack>

            <HStack gap={3}>
              <FiMail size={20} color="gray" />
              <Box>
                <Text fontWeight="medium">Email</Text>
                <Text color="gray.600">{userData.email}</Text>
              </Box>
            </HStack>

            <HStack gap={3}>
              <FiShield size={20} color="gray" />
              <Box>
                <Text 
                  color="white" 
                  bg={
                    userData.role === 'admin' ? 'red.500' :
                    userData.role === 'almacen' ? 'blue.500' :
                    userData.role === 'ventas' ? 'green.500' : 'gray.500'
                  }
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="sm"
                  fontWeight="medium"
                  display="inline-block"
                >
                  {userData.role?.toUpperCase()}
                </Text>
              </Box>
            </HStack>

            <HStack gap={3}>
              <FiUser size={20} color="gray" />
              <Box>
                <Text fontWeight="medium">Miembro desde</Text>
                <Text color="gray.600">{new Date(userData.createdAt).toLocaleDateString()}</Text>
              </Box>
            </HStack>
          </VStack>

          <Box h="1px" bg="gray.200" />

          <VStack gap={3} align="stretch">
            <Heading size="sm">Acciones</Heading>
            <HStack gap={3}>
              <Button colorScheme="gray" variant="outline" size="sm">
                Editar Perfil
              </Button>
            </HStack>
          </VStack>

          <Box h="1px" bg="gray.200" />

          <VStack gap={3} align="stretch">
            <Heading size="sm">Seguridad</Heading>
            <HStack gap={3}>
              {userData.twoFactorEnabled ? (
                <Button onClick={handleDisable2FA} colorScheme="red" size="sm" variant="outline">
                  Desactivar 2FA
                </Button>
              ) : (
                <Button onClick={handleEnable2FA} colorScheme="blue" size="sm">
                  Activar 2FA
                </Button>
              )}
              <Button colorScheme="gray" variant="outline" size="sm">
                Cambiar Contraseña
              </Button>
            </HStack>
             {userData.twoFactorEnabled && (
                <Badge colorScheme="green" variant="subtle" w="fit-content">2FA Activado</Badge>
             )}
          </VStack>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Activar Autenticación en Dos Pasos</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoading ? (
              <Spinner />
            ) : (
              <VStack gap={4}>
                <Text>Escanea este código QR con tu app de autenticación (ej. Google Authenticator).</Text>
                {qrCode && <Image src={qrCode} alt="2FA QR Code" />}
                <Text>Luego, ingresa el código de 6 dígitos de tu app.</Text>
                <Input
                  placeholder="123456"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  maxLength={6}
                />
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
           <ConfirmButton // Usamos el componente tipado
              colorScheme="blue"
              onClick={handleConfirm2FA}
            //  isLoading={isConfirming}
              disabled={!token || token.length < 6}
            >
              Confirmar y Activar
            </ConfirmButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}