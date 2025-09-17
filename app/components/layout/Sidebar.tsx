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
import { useRouter, usePathname } from "next/navigation";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  description?: string;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "🏠",
    href: "/dashboard",
    description: "Página principal"
  },
  {
    id: "inventory",
    label: "Inventario",
    icon: "📦",
    href: "/inventory",
    description: "Gestión de inventario"
  },
  {
    id: "reports",
    label: "Reportes",
    icon: "📊",
    href: "/reports",
    description: "Análisis y reportes"
  },
  {
    id: "config",
    label: "Configuración",
    icon: "⚙️",
    href: "/config",
    description: "Ajustes del sistema"
  },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ 
  isOpen, 
  onToggle
}: SidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
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
              N15 App
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
          <Box 
            p={4} 
            borderBottom="1px solid" 
            borderColor="gray.200"
            cursor="pointer"
            _hover={{ bg: "gray.50" }}
            transition="background-color 0.2s"
            onClick={() => handleNavigation("/profile")}
          >
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
              variant={isActiveRoute(item.href) ? "solid" : "ghost"}
              colorScheme={isActiveRoute(item.href) ? "blue" : "gray"}
              justifyContent={isOpen ? "flex-start" : "center"}
              size="md"
              h="48px"
              onClick={() => handleNavigation(item.href)}
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
