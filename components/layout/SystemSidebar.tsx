'use client'

import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Link, 
  Icon, 
  Button,
  IconButton
} from '@chakra-ui/react'
import { FiHome, FiUsers, FiPackage, FiBarChart, FiSettings, FiLogOut, FiMenu, FiX, FiUser, FiShoppingCart } from 'react-icons/fi'

interface SidebarItem {
  label: string
  href: string
  icon: React.ComponentType
  isUserButton?: boolean
  isLogout?: boolean
}

interface SystemSidebarProps {
  role: string
  isCollapsed?: boolean
  onToggle?: () => void
}

export default function SystemSidebar({ role, isCollapsed = false, onToggle }: SystemSidebarProps) {
  // Definir opciones específicas por rol
  const getSidebarItems = (): SidebarItem[] => {
    const baseItems: SidebarItem[] = [
      {
        label: 'Usuario',
        href: `/sys/${role}/user`,
        icon: FiUser,
        isUserButton: true
      }
    ];

    const roleSpecificItems = {
      admin: [
        {
          label: 'Dashboard',
          href: `/sys/${role}/dashboard`,
          icon: FiHome
        },
        {
          label: 'Gestión de Usuarios',
          href: `/sys/${role}/users`,
          icon: FiUsers
        }
      ],
      stockroom: [
        {
          label: 'Ingredientes',
          href: `/sys/${role}/ingredients`,
          icon: FiBarChart
        },
        {
          label: 'Productos',
          href: `/sys/${role}/products`,
          icon: FiPackage
        }
      ],
      sales: [
        {
          label: 'Productos',
          href: `/sys/${role}/products`,
          icon: FiPackage
        },
        {
          label: 'Pedidos',
          href: `/sys/${role}/orders`,
          icon: FiShoppingCart
        }
      ]
    };

    const logoutItem: SidebarItem = {
      label: 'Cerrar Sesión',
      href: '#',
      icon: FiLogOut,
      isLogout: true
    };

    return [
      ...baseItems,
      ...(roleSpecificItems[role as keyof typeof roleSpecificItems] || []),
      logoutItem
    ];
  };

  const menuItems = getSidebarItems();

  return (
    <Box
      w={isCollapsed ? "60px" : "250px"}
      h="100vh"
      bg="gray.900"
      color="white"
      p={isCollapsed ? 2 : 4}
      position="fixed"
      left={0}
      top={0}
      overflowY="auto"
      transition="all 0.3s ease"
      zIndex={1000}
    >
      <VStack gap={6} align="stretch">
        {/* Toggle Button */}
        <Box display="flex" justifyContent={isCollapsed ? "center" : "flex-end"}>
          <Button
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            size="sm"
            variant="ghost"
            color="white"
            _hover={{ bg: "gray.800" }}
            onClick={onToggle}
            p={2}
          >
            <Icon as={isCollapsed ? FiMenu : FiX} />
          </Button>
        </Box>

        {/* Logo/Title */}
        {!isCollapsed && (
          <Box mb={4}>
            <Text fontSize="xl" fontWeight="bold" textAlign="center">
              System Panel
            </Text>
            <Text fontSize="sm" color="gray.400" textAlign="center" mt={1}>
              {role.toUpperCase()}
            </Text>
          </Box>
        )}

        {/* Separator */}
        <Box h="1px" bg="gray.700" />

        {/* Navigation Menu */}
        <VStack gap={2} align="stretch">
          {menuItems.map((item) => {
            if (item.isLogout) {
              return (
                <HStack
                  key="logout"
                  p={3}
                  rounded="md"
                  _hover={{ bg: 'red.800' }}
                  transition="all 0.2s"
                  cursor="pointer"
                  color="red.300"
                  justify={isCollapsed ? "center" : "flex-start"}
                  title={isCollapsed ? item.label : undefined}
                  onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      window.location.href = '/sys/login';
                    } catch (error) {
                      console.error('Error al cerrar sesión:', error);
                      window.location.href = '/sys/login';
                    }
                  }}
                >
                  <Icon as={item.icon} boxSize={5} />
                  {!isCollapsed && <Text>{item.label}</Text>}
                </HStack>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                _hover={{ textDecoration: 'none' }}
                title={isCollapsed ? item.label : undefined}
              >
                <HStack
                  p={3}
                  rounded="md"
                  _hover={{ bg: item.isUserButton ? 'blue.800' : 'gray.800' }}
                  transition="all 0.2s"
                  justify={isCollapsed ? "center" : "flex-start"}
                  bg={item.isUserButton ? 'blue.700' : 'transparent'}
                >
                  <Icon as={item.icon} boxSize={5} />
                  {!isCollapsed && <Text>{item.label}</Text>}
                </HStack>
              </Link>
            );
          })}
        </VStack>
      </VStack>
    </Box>
  )
}
