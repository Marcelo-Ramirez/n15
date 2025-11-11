// components/sales/SalesOrdersPage.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Calendar } from 'lucide-react'; 
import { toast } from 'sonner';

// Importa componentes Shadcn UI
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// --- Tipos e Interfaces (ADAPTADA al backend corregido) ---
interface ProductDetails {
    name: string;
    type: string;
    flavor: string;
    pricePerUnit: number;
}

// Interfaz que refleja la estructura anidada de la respuesta del backend
interface OrderClient {
    id: number;
    clientId: number;
    quantity: number;
    status: 'reserv' | 'sale' | 'pendiente' | string; // Asegurar que TypeScript sepa los estados
    createdAt: string;
    product: ProductDetails;
    saleOrder?: { // La venta final (opcional, solo existe si status='sale')
        totalCostOrder: number;
        user: {
            id: number;
            name: string;
        };
    } | null;
}

// --- HELPERS (Mantenidos) ---
const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'sale': return 'default'; // Vendido (verde/azul)
        case 'reserv': return 'secondary'; // Reservado (gris/azul claro)
        case 'pendiente': return 'outline';
        default: return 'outline';
    }
};

const getStatusText = (status: string): string => {
    switch (status) {
        case 'sale': return 'VENDIDO';
        case 'reserv': return 'RESERVADO';
        case 'pendiente': return 'PENDIENTE';
        default: return status.toUpperCase();
    }
};

const formatPrice = (price: number) => {
    // Usamos 'es-BO' para formato local y solo dígitos.
    return price.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


// --- COMPONENTE PRINCIPAL ---
export default function SalesOrdersPage() {
    const [orders, setOrders] = useState<OrderClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // --- Lógica de Fetch ---
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/system/sales/orders");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al cargar pedidos");
            setOrders(data.orders || []);
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Error al cargar pedidos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // --- Lógica de Manejo de Acciones ---
    const handleAction = async (orderId: number, actionType: 'reserv' | 'sale') => {
        setIsProcessing(true);
        
        const endpoint = actionType === 'reserv' 
            ? '/api/system/sales/orders/reserv' 
            : '/api/system/sales/orders/sale';
        
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderClientId: orderId })
            });

            const data = await res.json();

            if (!res.ok) {
                // Mensaje de error más detallado
                const defaultError = `Error al procesar la ${actionType === 'reserv' ? 'reserva' : 'venta'}`;
                const specificError = data.error || defaultError;
                throw new Error(specificError);
            }

            toast.success(`Pedido ${actionType === 'reserv' ? 'reservado' : 'vendido'} con éxito.`);
            await fetchOrders(); // Recargar la lista
            
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error de red o desconocido.");
        } finally {
            setIsProcessing(false);
        }
    };


    // --- Lógica de Filtrado ---
    const filteredOrders = useMemo(() => {
    return orders.filter(order => filter === 'all' || !filter || order.status === filter);
}, [orders, filter]);


    // --- JSX PRINCIPAL ---
    return (
        <div className="p-4 md:p-6 space-y-6">
            
            {/* Header y Filtro */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Pedidos de Venta</h1>
                
                {/* Filtro de Estado */}
                <div className="w-full sm:w-auto min-w-[150px]">
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-full">
                        {/* Muestra un placeholder o el valor seleccionado. */}
                        <SelectValue placeholder="Filtrar por estado" /> 
                    </SelectTrigger>
                    <SelectContent>
                        {/* Usamos 'all' o 'todos' como valor, que NO es la cadena vacía. */}
                        <SelectItem value="all">Todos</SelectItem> 
                        {/* Opciones reales del filtro */}
                        <SelectItem value="reserv">Reservados</SelectItem>
                        <SelectItem value="sale">Vendidos</SelectItem>
                        <SelectItem value="pendiente">Pendientes</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
            
            <Separator />

            {/* Renderizado Condicional */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-4">
                    
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => {
                            const totalCost = order.quantity * order.product.pricePerUnit;
                            const isSold = order.status === 'sale';
                            const isReserved = order.status === 'reserv';
                            const statusText = getStatusText(order.status);
                            
                            // 🐞 CORRECCIÓN DE ERROR: Acceso seguro al nombre del vendedor
                            const salesmanName = order.saleOrder?.user?.name;

                            return (
                                <Card 
                                    key={order.id} 
                                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            
                                            {/* Producto y Cantidad */}
                                            <div className="flex flex-col gap-1">
                                                <p className="font-bold text-xl text-foreground">
                                                    {order.product.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {order.product.type} de {order.product.flavor}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Cantidad: {order.quantity} unidades
                                                </p>
                                            </div>
                                            
                                            {/* Estado y Acciones */}
                                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                                {/* Estado */}
                                                <Badge variant={getStatusVariant(order.status)} className="uppercase min-w-[100px] justify-center">
                                                    {statusText}
                                                </Badge>

                                                {/* Botón Confirmar Venta (si no está vendido) */}
                                                {!isSold && (
                                                    <Button 
                                                        onClick={() => handleAction(order.id, 'sale')}
                                                        disabled={isProcessing}
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirmar Venta'}
                                                    </Button>
                                                )}
                                                
                                                {/* Botón Reservar (solo si está pendiente) */}
                                                {!isSold && !isReserved && (
                                                    <Button 
                                                        onClick={() => handleAction(order.id, 'reserv')}
                                                        disabled={isProcessing}
                                                        variant="secondary"
                                                        size="sm"
                                                    >
                                                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Reservar'}
                                                    </Button>
                                                )}

                                            </div>

                                        </div>
                                        
                                        <Separator className="my-4" />

                                        {/* Footer - Costo y Fecha */}
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-lg text-primary">
                                                    Total: Bs {formatPrice(totalCost)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    (x Bs {formatPrice(order.product.pricePerUnit)})
                                                </p>
                                            </div>
                                            
                                            {/* 🐞 CORRECCIÓN: Usar la variable segura */}
                                            {salesmanName && (
                                                <div className="text-xs text-muted-foreground">
                                                    Vendedor: {salesmanName}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        /* Mensaje de Sin Pedidos */
                        <Card className="p-8 text-center border-dashed">
                            <p className="text-muted-foreground">
                                No hay pedidos {filter ? `(${getStatusText(filter).toLowerCase()})` : 'registrados'}.
                            </p>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}