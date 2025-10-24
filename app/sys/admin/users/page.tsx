'use client';

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Badge,
  Spinner,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiTrash2, FiRotateCcw} from 'react-icons/fi';

interface User {
  id: number;
  userName: string;
  name: string;
  phone?: string;
  role: string;
  statusAccount: string;
  createdAt: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'restore' | 'delete'>('delete');

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/system/users');
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); 

  const filterUsers = useCallback(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) 
      );
    }

    // Filtrar por rol
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.statusAccount === 'active' : user.statusAccount === 'inactive'
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleAction = async () => {
    if (!selectedUser) return;

    try {
      const endpoint = actionType === 'restore' ? '/api/system/users/restore' : '/api/system/users/delete';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: selectedUser.id }),
      });

      if (!response.ok) {
        throw new Error(`Error al ${actionType === 'restore' ? 'restaurar' : 'eliminar'} usuario`);
      }

      // Actualizar la lista de usuarios
      await fetchUsers();
      setShowConfirm(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const openConfirmModal = (user: User, action: 'restore' | 'delete') => {
    setSelectedUser(user);
    setActionType(action);
    setShowConfirm(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'stockroom': return 'blue';
      case 'sales': return 'green';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <VStack gap={4}>
          <Spinner size="lg" color="blue.500" />
          <Text>Cargando usuarios...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Box 
          bg="red.50" 
          border="1px" 
          borderColor="red.200" 
          borderRadius="md" 
          p={4}
          color="red.700"
        >
          {error}
        </Box>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Gestión de Usuarios</Heading>
          <Text color="gray.600">Administra todos los usuarios del sistema</Text>
        </Box>

        {/* Filters */}
        <Box
          bg="white"
          p={4}
          borderRadius="lg"
          boxShadow="md"
          border="1px"
          borderColor="gray.200"
        >
          <VStack gap={4} align="stretch">
            <HStack gap={4}>
              <Box position="relative" maxW="300px">
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  pl={10}
                />
                <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                  <FiSearch color="gray" />
                </Box>
              </Box>
            </HStack>
            
            <HStack gap={4} wrap="wrap">
              <Button
                size="sm"
                colorScheme={roleFilter === 'all' ? 'blue' : 'gray'}
                onClick={() => setRoleFilter('all')}
              >
                Todos
              </Button>
              <Button
                size="sm"
                colorScheme={roleFilter === 'admin' ? 'red' : 'gray'}
                onClick={() => setRoleFilter('admin')}
              >
                Admin
              </Button>
              <Button
                size="sm"
                colorScheme={roleFilter === 'stockroom' ? 'blue' : 'gray'}
                onClick={() => setRoleFilter('stockroom')}
              >
                Stockroom
              </Button>
              <Button
                size="sm"
                colorScheme={roleFilter === 'sales' ? 'green' : 'gray'}
                onClick={() => setRoleFilter('sales')}
              >
                Sales
              </Button>
            </HStack>

            <HStack gap={4}>
              <Button
                size="sm"
                colorScheme={statusFilter === 'all' ? 'blue' : 'gray'}
                onClick={() => setStatusFilter('all')}
              >
                Todos los estados
              </Button>
              <Button
                size="sm"
                colorScheme={statusFilter === 'active' ? 'green' : 'gray'}
                onClick={() => setStatusFilter('active')}
              >
                Activos
              </Button>
              <Button
                size="sm"
                colorScheme={statusFilter === 'inactive' ? 'red' : 'gray'}
                onClick={() => setStatusFilter('inactive')}
              >
                Inactivos
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Users List */}
        <VStack gap={4} align="stretch">
          {filteredUsers.map((user) => (
            <Box
              key={user.id}
              bg="white"
              p={4}
              borderRadius="lg"
              boxShadow="md"
              border="1px"
              borderColor="gray.200"
            >
              <Grid templateColumns="1fr 1fr 1fr 1fr 1fr auto" gap={4} alignItems="center">
                <GridItem>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
                    Usuario
                  </Text>
                  <Text fontWeight="medium">{user.userName}</Text>
                </GridItem>
                
                <GridItem>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
                    Nombre
                  </Text>
                  <Text>{user.name}</Text>
                </GridItem>
                
                <GridItem>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
                    Teléfono
                  </Text>
                  <Text>{user.phone || '-'}</Text>
                </GridItem>
                
                <GridItem>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
                    Rol
                  </Text>
                  <Badge colorScheme={getRoleBadgeColor(user.role)}>
                    {user.role.toUpperCase()}
                  </Badge>
                </GridItem>
                
                <GridItem>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
                    Estado
                  </Text>
                  <Badge colorScheme={user.statusAccount === 'active' ? 'green' : 'red'}>
                    {user.statusAccount === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </GridItem>
                
                <GridItem>
                  <HStack gap={2}>
                    {user.statusAccount === 'inactive' ? (
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => openConfirmModal(user, 'restore')}
                      >
                        <FiRotateCcw style={{ marginRight: 4 }} />
                        Restaurar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => openConfirmModal(user, 'delete')}
                      >
                        <FiTrash2 style={{ marginRight: 4 }} />
                        Eliminar
                      </Button>
                    )}
                  </HStack>
                </GridItem>
              </Grid>
            </Box>
          ))}
        </VStack>

        {filteredUsers.length === 0 && (
          <Box 
            bg="white"
            p={8} 
            textAlign="center"
            borderRadius="lg"
            boxShadow="md"
            border="1px"
            borderColor="gray.200"
          >
            <Text color="gray.500">No se encontraron usuarios</Text>
          </Box>
        )}

        {/* Confirmation Modal */}
        {showConfirm && selectedUser && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              boxShadow="xl"
              maxW="400px"
              w="90%"
            >
              <VStack gap={4} align="stretch">
                <Heading size="md">
                  Confirmar {actionType === 'restore' ? 'restauración' : 'eliminación'}
                </Heading>
                
                <Text>
                  ¿Estás seguro de que deseas {actionType === 'restore' ? 'restaurar' : 'eliminar'} la cuenta de{' '}
                  <strong>{selectedUser.name}</strong>?
                </Text>
                
                <HStack gap={3} justify="flex-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowConfirm(false);
                      setSelectedUser(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    colorScheme={actionType === 'restore' ? 'green' : 'red'}
                    onClick={handleAction}
                  >
                    {actionType === 'restore' ? 'Restaurar' : 'Eliminar'}
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}
      </VStack>
    </Box>
  );
}