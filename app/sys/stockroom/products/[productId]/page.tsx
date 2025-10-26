"use client";

import { useRouter, useParams } from "next/navigation";
// ✅ 1. Importar useCallback
import { useEffect, useState, useCallback, Suspense } from "react";
import { ArrowLeft, Plus, Loader2 } from "lucide-react"; // Iconos
import { toast } from 'sonner'; // Notificaciones

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Definición de interfaces
interface ProductDetails {
  id: number;
  name: string;
  type: string;
  flavor: string;
  currentStock: number; // Asumo que este es el nombre correcto
  pricePerUnit?: number;
}

interface Movement {
  id: number;
  movementType: string;
  reason: string;
  quantity: number;
  createdAt: string;
  user: {
    name: string;
  };
}

// --- Componente Lógico Interno ---
function ProductHistoryInner() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string; // Asumo que es productId basado en el fetch

  const [movements, setMovements] = useState<Movement[]>([]);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerData, setRegisterData] = useState({
    movementType: '',
    reason: '',
    quantity: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  // registerSuccess se maneja con toast

  // Determina el rol basado en la URL (Mantenido)
  const isStockroomRole = typeof window !== 'undefined' && 
    globalThis.location.pathname.includes('/stockroom/');
  const role = isStockroomRole ? 'stockroom' : 'sale';

  // --- Lógica de Fetch (Mantenida) ---
  const fetchHistory = useCallback(async () => {
    if (!productId) return; 

    setIsLoading(true);
    try {
      // Usamos la API corregida
      const res = await fetch(`/api/system/inventory/products/history?id=${encodeURIComponent(productId as string)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener historial");
      
      setMovements(data.movements || []);
      setProduct(data.product || null);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);
  
  // --- Lógica de Modal (Mantenida) ---
  const handleOpenRegister = () => {
    setRegisterData({ movementType: '', reason: '', quantity: '' });
    setRegisterError(null);
    setShowRegisterModal(true);
  };

  const handleRegisterCancel = () => {
    setShowRegisterModal(false);
    setRegisterError(null);
  };

  const handleRegisterAccept = async () => {
    if (!registerData.movementType || !registerData.reason || !registerData.quantity) {
      setRegisterError('Completa todos los campos');
      return;
    }
    
    setRegisterLoading(true);
    setRegisterError(null);
    
    try {
      // Usamos la API corregida
      const res = await fetch('/api/system/inventory/products/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId, 
          movementType: registerData.movementType,
          reason: registerData.reason,
          quantity: Number(registerData.quantity)
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar movimiento');
      
      setShowRegisterModal(false);
      toast.success('¡Movimiento registrado exitosamente!');
      setRegisterData({ movementType: '', reason: '', quantity: '' });
      await fetchHistory(); // Recarga los datos
      
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setRegisterLoading(false);
    }
  };

  // --- Lógica de Razones (Mantenida) ---
  const getMovementReasons = () => {
    const baseReasons = [
      { value: 'produccion', label: 'Producción' },
      { value: 'ajuste_inventario', label: 'Ajuste de Inventario' },
      { value: 'devolucion', label: 'Devolución' },
      { value: 'dano', label: 'Daño/Pérdida' }
    ];

    if (role === 'sale') {
      return [
        ...baseReasons,
        { value: 'venta', label: 'Venta' },
        { value: 'promocion', label: 'Promoción' }
      ];
    } else { // stockroom
      return [
        ...baseReasons,
        { value: 'compra', label: 'Compra' },
        { value: 'transferencia_venta', label: 'Transferencia a Venta' }
      ];
    }
  };

  // --- Función de Renderizado (Migrada) ---
  const renderMovementList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Cargando historial...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Card className="p-4 border-destructive bg-destructive/10 text-destructive border-2">
          <p className="font-medium">Error: {error}</p>
        </Card>
      );
    }

    if (movements.length === 0) {
      return (
        <Card className="p-8 text-center border-dashed border-2">
          <p className="text-muted-foreground text-lg">No hay movimientos registrados</p>
          <p className="text-muted-foreground text-sm mt-2">
            Los movimientos aparecerán aquí cuando se registren
          </p>
        </Card>
      );
    }
  
    return (
      <div className="space-y-3">
        {movements.map((movement) => {
          const isEntry = movement.movementType === 'entrada';
          const quantityDisplay = `${movement.quantity > 0 ? "+" : ""}${movement.quantity}`;
          
          return (
            <Card key={movement.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start flex-wrap gap-2">
                
                {/* Detalles */}
                <div className="flex flex-col gap-1">
                  <Badge 
                    variant={isEntry ? "default" : "destructive"} 
                    className={cn("w-fit uppercase text-xs font-bold", isEntry && "bg-green-600")}
                  >
                    {movement.movementType}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Motivo:</span> {movement.reason}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Usuario:</span> {movement.user?.name || "Sistema"}
                  </p>
                </div>
                
                {/* Cantidad y Fecha */}
                <div className="text-right">
                  <p className={cn("font-extrabold text-xl", isEntry ? "text-green-600" : "text-red-600")}>
                    {quantityDisplay}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(movement.createdAt).toLocaleString('es-ES', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  // --- JSX Principal (Migrado) ---
  return (
    <div className="p-4 md:p-6 space-y-6">
      
      {/* Botón Volver */}
      <Button variant="ghost" onClick={() => router.back()} className="text-sm text-primary hover:bg-accent w-fit">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      <div className="space-y-6">
        
        {/* Información del Producto */}
        <Card className="p-5">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {role === 'stockroom' ? 'Producto - Stockroom' : 'Producto - Venta'}
            </CardTitle>
          </CardHeader>
          
          {product ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="font-bold text-lg text-foreground">
                  {product.name}
                </p>
                <Badge 
                  variant={product.currentStock > 0 ? "default" : "destructive"} 
                  className={cn("text-base px-3 py-1", product.currentStock > 0 && "bg-green-600")}
                >
                  Stock: {product.currentStock}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <p><span className="font-medium">Tipo:</span> {product.type}</p>
                <p><span className="font-medium">Sabor:</span> {product.flavor}</p>
                {role === 'sale' && (
                  <p><span className="font-medium">Precio:</span> ${product.pricePerUnit?.toFixed(2) || "0.00"}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-bold text-lg text-foreground">Cargando...</p>
              <p className="text-sm text-muted-foreground">Cargando información del producto...</p>
            </div>
          )}
        </Card>

        <Separator />

        {/* Header del Historial */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-foreground">Historial de Movimientos</h2>
          <Button onClick={handleOpenRegister} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Movimiento
          </Button>
        </div>

        {/* Lista de Movimientos */}
        {renderMovementList()} 
      </div>

      {/* --- MODAL DE REGISTRO (Dialog) --- */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Movimiento</DialogTitle>
            <DialogDescription>
              Producto: <strong>{product?.name || "N/A"}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Tipo de Movimiento */}
            <div className="space-y-2">
              <Label htmlFor="movementType">Tipo de Movimiento</Label>
              <Select
                  value={registerData.movementType}
                  onValueChange={(value: string) => setRegisterData(d => ({ ...d, movementType: value }))}
              >
                  <SelectTrigger id="movementType">
                      <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="salida">Salida</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            
            {/* Razón */}
            <div className="space-y-2">
              <Label htmlFor="reason">Razón</Label>
              <Select
                  value={registerData.reason}
                  onValueChange={(value: string) => setRegisterData(d => ({ ...d, reason: value }))}
              >
                  <SelectTrigger id="reason">
                      <SelectValue placeholder="Selecciona razón" />
                  </SelectTrigger>
                  <SelectContent>
                      {getMovementReasons().map(reason => (
                          <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
            
            {/* Cantidad */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="Ingrese la cantidad"
                value={registerData.quantity}
                onChange={(e) => setRegisterData(d => ({ ...d, quantity: e.target.value }))}
              />
            </div>
          </div>
          
          {registerError && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
              <p className="text-destructive text-sm font-medium">{registerError}</p>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleRegisterCancel} disabled={registerLoading}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterAccept} disabled={registerLoading}>
              {registerLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente Wrapper para Suspense
export default function ProductHistoryPage() {
  return (
    <Suspense fallback={
        <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    }>
      <ProductHistoryInner />
    </Suspense>
  );
}