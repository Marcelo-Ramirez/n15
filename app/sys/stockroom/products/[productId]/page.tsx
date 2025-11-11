"use client";

import { useRouter, useParams } from "next/navigation";
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
// Mantenemos Select en los imports por si acaso
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Definición de interfaces
interface ProductDetails {
    id: number;
    name: string;
    type: string;
    flavor: string;
    currentQuantity: number;
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
    
    // ⭐ CAMBIO 1: Inicializar con movementType='entrada' y reason predefinido
    const [registerData, setRegisterData] = useState({
        movementType: 'entrada',
        reason: 'ajuste_inventario', // Razón por defecto para cumplir con la API
        quantity: ''
    });
    
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerError, setRegisterError] = useState<string | null>(null);

    // Determina el rol basado en la URL (Mantenido)
    const isStockroomRole = typeof window !== 'undefined' &&
        globalThis.location.pathname.includes('/stockroom/');
    const role = isStockroomRole ? 'stockroom' : 'sales';

    // --- Lógica de Fetch (Mantenida) ---
    const fetchHistory = useCallback(async () => {
        if (!productId) return;

        setIsLoading(true);
        try {
            // Usamos la API corregida
            const res = await fetch(`/api/system/inventory/products/${productId}/history`);
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

    // --- Lógica de Modal (Modificada) ---
    const handleOpenRegister = () => {
        // ⭐ CAMBIO 2: Reiniciar solo con los campos visibles y los predefinidos
        setRegisterData({ 
            movementType: 'entrada', 
            reason: 'ajuste_inventario', 
            quantity: '' 
        });
        setRegisterError(null);
        setShowRegisterModal(true);
    };

    const handleRegisterCancel = () => {
        setShowRegisterModal(false);
        setRegisterError(null);
    };

    const handleRegisterAccept = async () => {
        // ⭐ CAMBIO 3: Solo validar la cantidad
        if (!registerData.quantity || Number(registerData.quantity) <= 0) {
            setRegisterError('La cantidad debe ser un número positivo.');
            return;
        }

        setRegisterLoading(true);
        setRegisterError(null);

        try {
            // Usamos la API corregida
            const res = await fetch(`/api/system/inventory/products/${productId}/history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    movementType: registerData.movementType, // Usará 'entrada'
                    reason: registerData.reason,             // Usará 'ajuste_inventario'
                    quantity: Number(registerData.quantity)
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al registrar movimiento');

            setShowRegisterModal(false);
            toast.success('¡Entrada de inventario registrada exitosamente!');
            setRegisterData({ movementType: 'entrada', reason: 'ajuste_inventario', quantity: '' }); // Reiniciar
            await fetchHistory(); // Recarga los datos

        } catch (err) {
            setRegisterError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setRegisterLoading(false);
        }
    };

    // --- Función de Renderizado (Mantenida) ---
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
                    // Nota: Movimiento de cantidad es positivo en la DB, solo agregamos el signo "+" si es entrada
                    const quantityDisplay = `${isEntry ? "+" : "-"}${movement.quantity}`; 

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

    // --- JSX Principal (Modificado en el Dialog) ---
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
                                    variant={product.currentQuantity > 0 ? "default" : "destructive"}
                                    className={cn("text-base px-3 py-1", product.currentQuantity > 0 && "bg-green-600")}
                                >
                                    Stock: {product.currentQuantity}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <p><span className="font-medium">Tipo:</span> {product.type}</p>
                                <p><span className="font-medium">Sabor:</span> {product.flavor}</p>
                                {role === 'sales' && (
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
                        Registrar **Entrada**
                    </Button>
                </div>

                {/* Lista de Movimientos */}
                {renderMovementList()}
            </div>

            {/* --- MODAL DE REGISTRO (Dialog) --- */}
            <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Registrar Entrada de Inventario</DialogTitle>
                        <DialogDescription>
                            Producto: <strong>{product?.name || "N/A"}</strong>
                            <span className="block text-xs mt-1 text-muted-foreground/70">
                                Tipo de movimiento: **Entrada** (ajuste)
                            </span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">

                        {/* Cantidad - ÚNICO CAMPO VISIBLE */}
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Cantidad a Ingresar</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                placeholder="Ingrese la cantidad de entrada"
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
                            Registrar Entrada
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