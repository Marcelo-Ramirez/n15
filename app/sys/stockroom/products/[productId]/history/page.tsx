"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import { ArrowLeft, Plus, Loader2 } from "lucide-react"; // Iconos de Lucide
import { toast } from "sonner"; // Notificaciones Shadcn

// Importa componentes Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
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

// --- Definición de interfaces (Mantenidas) ---
interface ProductDetails {
  id: number;
  name: string;
  type: string;
  flavor: string;
  currentStock: number; // Asumiendo que este es el nombre correcto
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
  const productId = params.productId as string;

  const [movements, setMovements] = useState<Movement[]>([]);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerData, setRegisterData] = useState({
    movementType: '',
    reason: '',
    quantity: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  // registerSuccess se maneja ahora con toast

  // --- Lógica de Fetch (Mantenida) ---
  const fetchHistory = useCallback(async () => {
    if (!productId) return; 
    setIsLoading(true);
    try {
      const res = await fetch(`/api/inventory/products/${productId}/history`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener historial");
      
      setProduct(data.product);
      setMovements(data.movements);

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
    setIsRegisterModalOpen(true);
  };

  const handleRegisterCancel = () => {
    setIsRegisterModalOpen(false);
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
      const res = await fetch(`/api/inventory/products/${productId}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movementType: registerData.movementType,
          reason: registerData.reason,
          quantity: Number(registerData.quantity)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar movimiento');
      
      setIsRegisterModalOpen(false);
      toast.success('¡Movimiento registrado exitosamente!');
      setRegisterData({ movementType: '', reason: '', quantity: '' });
      await fetchHistory(); 
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setRegisterLoading(false);
    }
  };

  // --- Vistas Condicionales (Migradas) ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border-destructive bg-destructive/10 text-destructive border-2 m-6">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  // --- JSX Principal (Migrado) ---
  return (
    <div className="p-4 md:p-6 space-y-6">
      
      {/* Botón Volver */}
      <Button variant="ghost" onClick={() => router.back()} className="text-sm text-primary hover:bg-accent">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>
      
      <div className="space-y-6">
        {/* 1. Detalles del Producto */}
        <Card className="p-6">
            <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl font-bold tracking-tight">Producto (Stockroom)</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{product?.name || "N/A"}</CardDescription>
            </CardHeader>
            <Separator className="mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <Label className="text-xs text-muted-foreground">Sabor</Label>
                    <p className="font-medium text-foreground">{product?.flavor || "-"}</p>
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Tipo</Label>
                    <p className="font-medium text-foreground">{product?.type || "-"}</p>
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Cantidad Actual</Label>
                    <p className="font-medium text-foreground">{product?.currentStock || 0}</p>
                </div>
            </div>
        </Card>
        
        <Separator />

        {/* 2. Sección de Historial y Botón de Acción */}
        <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-foreground">Historial de Movimientos</h2>
            <Button onClick={handleOpenRegister} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Registrar Movimiento
            </Button>
        </div>
            
        {/* 3. Lista de Movimientos */}
        {movements.length === 0 ? (
            <p className="text-muted-foreground text-center p-8 border border-dashed rounded-lg">No hay movimientos registrados</p>
        ) : (
            <div className="space-y-3">
                {movements.map((m) => {
                    const isEntry = m.movementType === 'entrada';
                    const quantityDisplay = `${m.quantity > 0 ? "+" : "-"}${Math.abs(m.quantity)}`;
                    
                    return (
                        <Card key={m.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                {/* Detalles */}
                                <div className="flex flex-col">
                                    <p className={cn("font-bold text-lg", isEntry ? "text-green-600" : "text-red-600")}>
                                        {m.movementType.toUpperCase()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Motivo: {m.reason}</p>
                                    <p className="text-xs text-muted-foreground">Usuario: {m.user?.name || "-"}</p>
                                </div>
                                {/* Cantidad y Fecha */}
                                <div className="text-right">
                                    <p className={cn("font-extrabold text-xl", isEntry ? "text-green-600" : "text-red-600")}>
                                        {quantityDisplay}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(m.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        )}
      </div>

      {/* --- MODAL DE REGISTRO (Dialog) --- */}
      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Registrar Movimiento</DialogTitle>
                <DialogDescription>
                    Registra una entrada o salida de inventario para: **{product?.name || "N/A"}**
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
                            <SelectItem value="produccion">Producción</SelectItem>
                            <SelectItem value="compra">Compra</SelectItem>
                            <SelectItem value="ajuste">Ajuste</SelectItem>
                            <SelectItem value="merma">Merma</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Cantidad */}
                <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input
                        id="quantity"
                        type="number"
                        placeholder="Cantidad"
                        value={registerData.quantity}
                        onChange={e => setRegisterData(d => ({ ...d, quantity: e.target.value }))}
                    />
                </div>
            </div>
            
            {registerError && <p className="text-sm text-destructive font-medium text-center">{registerError}</p>}

            <DialogFooter className="mt-4">
                <Button variant="outline" onClick={handleRegisterCancel} disabled={registerLoading}>
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

// Componente Wrapper para Suspense
export default function StockroomProductHistoryPage() {
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