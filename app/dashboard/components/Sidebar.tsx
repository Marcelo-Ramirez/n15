"use client";
import {
  Box,
  VStack,
  Button,
  Text,
  IconButton,
  Flex,
  Separator,
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "🏠",
    description: "Página principal"
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "📊",
    description: "Estadísticas y métricas"
  },
  {
    id: "users",
    label: "Usuarios",
    icon: "👥",
    description: "Gestión de usuarios"
  },
  {
    id: "settings",
    label: "Configuración",
    icon: "⚙️",
    description: "Ajustes del sistema"
  },
  {
    id: "profile",
    label: "Perfil",
    icon: "👤",
    description: "Mi perfil personal"
  },
  {
    id: "notifications",
    label: "Notificaciones",
    icon: "🔔",
    description: "Centro de notificaciones"
  },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeItem: string;
  onItemSelect: (itemId: string) => void;
}

export default function Sidebar({ 
  isOpen, 
  onToggle, 
  activeItem, 
  onItemSelect 
}: SidebarProps) {
  const { user } = useAuth();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Box
      position="fixed"
      left="0"
      top="0"
      h="100vh"
      w={isOpen ? "250px" : "60px"}
      bg="white"
      boxShadow="lg"
      transition="width 0.3s ease"
      zIndex="1000"
      borderRight="1px solid"
      borderColor="gray.200"
    >
      <VStack gap={0} align="stretch" h="full">
        {/* Header */}
        <Flex
          p={4}
          align="center"
          justify="space-between"
          borderBottom="1px solid"
          borderColor="gray.200"
          h="70px"
        >
          {isOpen && (
            <Text fontSize="xl" fontWeight="bold" color="blue.600">
              Mi App
            </Text>
          )}
          <IconButton
            aria-label="Toggle Sidebar"
            size="sm"
            variant="ghost"
            onClick={onToggle}
          >
            {isOpen ? "←" : "→"}
          </IconButton>
        </Flex>

        {/* User Info */}
        {isOpen && (
          <Box p={4} borderBottom="1px solid" borderColor="gray.200">
            <Flex align="center" gap={3}>
              <Avatar.Root size="sm">
                <Avatar.Fallback>
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </Avatar.Fallback>
              </Avatar.Root>
              <Box>
                <Text 
                  fontSize="sm" 
                  fontWeight="medium" 
                  textOverflow="ellipsis"
                  overflow="hidden"
                  whiteSpace="nowrap"
                >
                  {user?.name || "Usuario"}
                </Text>
                <Text 
                  fontSize="xs" 
                  color="gray.500"
                  textOverflow="ellipsis"
                  overflow="hidden"
                  whiteSpace="nowrap"
                >
                  {user?.email}
                </Text>
              </Box>
            </Flex>
          </Box>
        )}

        {/* Menu Items */}
        <VStack gap={1} p={2} flex="1" align="stretch">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeItem === item.id ? "solid" : "ghost"}
              colorScheme={activeItem === item.id ? "blue" : "gray"}
              justifyContent={isOpen ? "flex-start" : "center"}
              size="md"
              h="48px"
              onClick={() => onItemSelect(item.id)}
              title={isOpen ? undefined : item.label}
            >
              <Flex align="center" gap={3} w="full">
                <Text fontSize="lg">{item.icon}</Text>
                {isOpen && (
                  <Box textAlign="left">
                    <Text fontSize="sm" fontWeight="medium">
                      {item.label}
                    </Text>
                  </Box>
                )}
              </Flex>
            </Button>
          ))}
        </VStack>

        {/* Footer */}
        <Box p={2}>
          <Separator mb={2} />
          <Button
            variant="ghost"
            colorScheme="red"
            justifyContent={isOpen ? "flex-start" : "center"}
            size="md"
            h="48px"
            onClick={handleLogout}
            title={isOpen ? undefined : "Cerrar Sesión"}
            w="full"
          >
            <Flex align="center" gap={3}>
              <Text fontSize="lg">🚪</Text>
              {isOpen && (
                <Text fontSize="sm" fontWeight="medium">
                  Cerrar Sesión
                </Text>
              )}
            </Flex>
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}
