'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, RotateCcw, Loader2, Phone } from 'lucide-react'; // Iconos de Lucide

// Componentes de Shadcn UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils'; // Para combinar clases

// --- Tipos de Datos (Mantenidos) ---
interface User {
  id: number;
  userName: string;
  name: string;
  phone?: string;
  role: string;
  statusAccount: string;
  createdAt: string;
}

type ActionType = 'restore' | 'delete';

// --- Componente ---
export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Estados del Modal de Confirmación
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<ActionType>('delete');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // --- LÓGICA DE FETCH (Mantenida) ---
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system/users');
      if (!response.ok) throw new Error('Error al obtener usuarios');
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

  // --- LÓGICA DE FILTRADO (Mantenida) ---
  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) 
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.statusAccount === 'active' : user.statusAccount === 'inactive'
      );
    }
    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter]);

  // --- LÓGICA DE ACCIÓN (Mantenida) ---
  const handleAction = async () => {
    if (!selectedUser) return;
    setIsProcessingAction(true);

    try {
      const endpoint = actionType === 'restore' ? '/api/system/users/restore' : '/api/system/users/delete';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id }),
      });

      if (!response.ok) throw new Error(`Error al ${actionType === 'restore' ? 'restaurar' : 'eliminar'} usuario`);

      await fetchUsers(); // Re-fetch para actualizar la lista
      setShowConfirm(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const openConfirmModal = (user: User, action: ActionType) => {
    setSelectedUser(user);
    setActionType(action);
    setShowConfirm(true);
  };
  
  // --- HELPERS DE ESTILO (Adaptados a Shadcn) ---
  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (role) {
      case 'admin': return 'destructive'; // Red
      case 'stockroom': return 'default'; // Blue/Primary
      case 'sales': return 'secondary'; // Gray/Green
      default: return 'outline';
    }
  };

  // --- VISTA DE CARGA Y ERROR ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Cargando usuarios...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border-destructive bg-destructive/10 text-destructive border-2">
        <p className="font-medium">{error}</p>
      </Card>
    );
  }

  // --- VISTA PRINCIPAL (JSX) ---
  return (
    <div className="p-4 md:p-6 space-y-6"> {/* Reemplaza Box con Padding y VStack con space-y-6 */}
      
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Gestión de Usuarios</h1>
        <p className="text-base text-muted-foreground">Administra todos los usuarios del sistema</p>
      </div>

      {/* 2. Filters Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filtros</CardTitle>
          <CardDescription>Busca y filtra por rol o estado de cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Fila de Búsqueda */}
          <div className="flex gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
          </div>
          
          {/* Fila de Filtro por Rol */}
          <div className="flex flex-wrap gap-3 items-center">
             <span className="text-sm font-medium text-muted-foreground">Filtrar por Rol:</span>
            {['all', 'admin', 'stockroom', 'sales'].map((role) => (
              <Button
                key={role}
                size="sm"
                variant={roleFilter === role ? 'default' : 'outline'}
                onClick={() => setRoleFilter(role)}
                className={cn(
                    role === 'admin' && roleFilter !== 'admin' && 'hover:bg-destructive/10 hover:text-destructive',
                    role === 'sales' && roleFilter === 'sales' && 'bg-green-600 hover:bg-green-700 text-white',
                )}
              >
                {role === 'all' ? 'Todos' : role.charAt(0).toUpperCase() + role.slice(1)}
              </Button>
            ))}
          </div>

          {/* Fila de Filtro por Estado */}
          <div className="flex flex-wrap gap-3 items-center pt-2">
            <span className="text-sm font-medium text-muted-foreground">Filtrar por Estado:</span>
            {['all', 'active', 'inactive'].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
                className={cn(
                    status === 'active' && statusFilter === 'active' && 'bg-green-600 hover:bg-green-700 text-white',
                    status === 'inactive' && statusFilter === 'inactive' && 'bg-destructive hover:bg-destructive/90 text-white',
                )}
              >
                {status === 'all' ? 'Todos' : status === 'active' ? 'Activos' : 'Inactivos'}
              </Button>
            ))}
          </div>

        </CardContent>
      </Card>

      {/* 3. Users List */}
      <div className="space-y-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user.id} className="p-4 shadow-md transition-shadow hover:shadow-lg">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-6 items-center"> {/* Layout responsivo */}
                
                {/* Datos del usuario */}
                <div className="md:col-span-1">
                    <p className="text-xs font-semibold text-muted-foreground hidden md:block mb-1">USUARIO</p>
                    <p className="font-medium text-base">{user.userName}</p>
                </div>
                
                <div className="md:col-span-1">
                    <p className="text-xs font-semibold text-muted-foreground hidden md:block mb-1">NOMBRE</p>
                    <p className="text-sm">{user.name}</p>
                </div>

                <div className="md:col-span-1">
                    <p className="text-xs font-semibold text-muted-foreground hidden md:block mb-1">TELÉFONO</p>
                    <div className="flex items-center space-x-1">
                       <Phone className="h-4 w-4 text-muted-foreground" />
                       <p className="text-sm">{user.phone || '-'}</p>
                    </div>
                </div>
                
                <div className="md:col-span-1">
                    <p className="text-xs font-semibold text-muted-foreground hidden md:block mb-1">ROL</p>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="uppercase text-xs font-semibold">
                      {user.role}
                    </Badge>
                </div>
                
                <div className="md:col-span-1">
                    <p className="text-xs font-semibold text-muted-foreground hidden md:block mb-1">ESTADO</p>
                    <Badge variant={user.statusAccount === 'active' ? 'default' : 'destructive'}>
                      {user.statusAccount === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                </div>
                
                {/* Botones de Acción */}
                <div className="md:col-span-1 flex justify-end col-span-2"> {/* Col-span-2 en móvil */}
                  {user.statusAccount === 'inactive' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:bg-green-50 hover:text-green-700"
                      onClick={() => openConfirmModal(user, 'restore')}
                      disabled={isProcessingAction}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" /> Restaurar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openConfirmModal(user, 'delete')}
                      disabled={isProcessingAction}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center border-dashed border-2">
            <p className="text-muted-foreground">No se encontraron usuarios que coincidan con los filtros.</p>
          </Card>
        )}
      </div>

      {/* 4. Confirmation Dialog (Modal) */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        {/* DialogTrigger no se usa ya que se controla manualmente */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar {actionType === 'restore' ? 'Restauración' : 'Eliminación'}</DialogTitle>
            <DialogDescription>
              {`¿Estás seguro de que deseas ${actionType === 'restore' ? 'restaurar' : 'eliminar'} la cuenta de ${selectedUser?.name}?`}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirm(false);
                setSelectedUser(null);
              }}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              variant={actionType === 'restore' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={isProcessingAction}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isProcessingAction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === 'restore' ? 'Restaurar Cuenta' : 'Eliminar Cuenta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}