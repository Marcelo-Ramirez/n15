// app/sys/stockroom/ingredients/[name]/page.tsx
'use client';

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from 'sonner';

// Componentes Shadcn/UI
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Definición de interfaces (mantenidas del código original)
interface IngredientDetails {
  name: string;
  provider: string;
  reorderPoint: number;
  pricePerUnit: number;
  // Agrega aquí cualquier otra propiedad que venga en data.ingredient
}

interface Movement {
  id: number;
  movementType: 'entrada' | 'salida' | 'ajuste'; // Tipado más estricto
  reason: string;
  quantity: number;
  createdAt: string;
  user: {
    name: string;
  };
}

export default function IngredientHistoryPage() {
  const router = useRouter();
  const params = useParams();
  
  // Mantenemos la lógica de [name] como pediste
  const name = decodeURIComponent(params.name as string); 

  const [movements, setMovements] = useState<Movement[]>([]);
  const [ingredient, setIngredient] = useState<IngredientDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del Modal (estilo Shadcn)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerData, setRegisterData] = useState({
    movementType: '',
    reason: '',
    quantity: ''
  });

  // Función estable para la obtención de datos
  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      // Usamos la API que busca por nombre
      const res = await fetch(`/api/system/inventory/ingredients/history?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener historial");
      setMovements(data.movements);
      setIngredient(data.ingredient);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [name]); // La dependencia sigue siendo 'name'

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Lógica del Modal (adaptada a Shadcn y Sonner/Toast)
  const handleOpenRegister = () => {
    setRegisterData({ movementType: '', reason: '', quantity: '' });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleRegisterAccept = async () => {
    if (!registerData.movementType || !registerData.reason || !registerData.quantity) {
      toast.error('Validación', { description: 'Completa todos los campos' });
      return;
    }
    setRegisterLoading(true);

    try {
      const res = await fetch('/api/system/inventory/ingredients/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, // Enviamos el nombre a la API
          movementType: registerData.movementType,
          reason: registerData.reason,
          quantity: Number(registerData.quantity)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar movimiento');

      toast.success('Movimiento registrado', { description: `${registerData.movementType} de ${registerData.quantity} registrado.` });
      setIsModalOpen(false);
      await fetchHistory(); // Recarga los datos

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      toast.error('Error al registrar', { description: errorMessage });
    } finally {
      setRegisterLoading(false);
    }
  };

  // --- VISTA DE CARGA Y ERROR ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Cargando historial...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border-destructive bg-destructive/10 text-destructive border-2 m-6">
        <p className="font-medium">{error}</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </Card>
    );
  }

  // --- VISTA PRINCIPAL (JSX) ---
  return (
    <div className="p-4 md:p-6 space-y-6">
      
      {/* Botón Volver */}
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Ingredientes
      </Button>

      {/* Detalles del Ingrediente */}
      <Card className="p-6 space-y-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Ingrediente
        </h1>
        <p className="text-lg font-semibold">{ingredient?.name || name}</p>
        <p className="text-sm text-muted-foreground">
          Proveedor: {ingredient?.provider || "-"}
        </p>
        <p className="text-sm text-muted-foreground">
          Punto de Reorden: {ingredient?.reorderPoint ?? "No definido"}
        </p>
        <p className="text-sm text-muted-foreground">
          Precio Unitario: Bs {ingredient?.pricePerUnit?.toFixed(2) ?? "-"}
        </p>
      </Card>

      <Separator />

      {/* Header del Historial */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight">
          Historial de Movimientos
        </h2>
        <Button onClick={handleOpenRegister}>
          Registrar Movimiento
        </Button>
      </div>

      {/* Lista de Movimientos */}
      <div className="space-y-3">
        {movements.length > 0 ? (
          movements.map((m) => (
            <Card key={m.id} className="p-4">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <p className={`font-bold ${m.movementType === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                    {m.movementType.toUpperCase()} ({m.quantity})
                  </p>
                  <p className="text-sm">Motivo: {m.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    Usuario: {m.user?.name || "-"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center border-dashed border-2">
            <p className="text-muted-foreground">No hay movimientos registrados</p>
          </Card>
        )}
      </div>

      {/* Modal para Registrar Movimiento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Movimiento</DialogTitle>
            <DialogDescription>
              Añade una nueva entrada o salida para el ingrediente &quot&{name}&quot&.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            {/* Tipo de Movimiento */}
            <div className="space-y-2">
              <Label htmlFor="movementType">Tipo de Movimiento</Label>
              <Select 
                onValueChange={(value) => setRegisterData(d => ({ ...d, movementType: value }))}
                value={registerData.movementType}
              >
                <SelectTrigger id="movementType">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Razón */}
            <div className="space-y-2">
              <Label htmlFor="reason">Razón</Label>
              <Select
                onValueChange={(value) => setRegisterData(d => ({ ...d, reason: value }))}
                value={registerData.reason}
              >
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Selecciona una razón" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produccion">Uso en Producción</SelectItem>
                  <SelectItem value="compra">Compra a Proveedor</SelectItem>
                  <SelectItem value="merma">Merma / Vencimiento</SelectItem>
                  <SelectItem value="ajuste_inventario">Ajuste de Inventario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cantidad */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={registerData.quantity}
                onChange={e => setRegisterData(d => ({ ...d, quantity: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleModalClose} disabled={registerLoading}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterAccept} disabled={registerLoading}>
              {registerLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}