'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation'; 
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; 
import { Separator } from "@/components/ui/separator";
import { Loader2, History, AlertCircle } from 'lucide-react'; 
// ✅ Asegúrate que la ruta sea correcta

// --- Tipos de Datos ---


// Tipo para Pedidos Pendientes (puede ser igual a ConfirmedOrder)
interface PendingOrder { 
    id: number; // SaleOrder ID o OrderClient ID, según lo que devuelva tu API /pending
    saleOrderId?: number; // Opcional si usas OrderClient ID como principal
    orderClientId: number; // Asegúrate de tener este ID para la ruta de detalle
    date: string;
    total: number;
    itemCount: number;
    status: string; // 'pendiente_verificacion'
}

// Tipo para Pedidos del Historial (puede ser igual a PendingOrder)
interface ConfirmedOrder { 
    id: number; // SaleOrder ID
    orderClientId: number; // OrderClient ID
    date: string;
    total: number;
    status: string;
    itemCount: number;
}
// ---

// =====================================
//      PESTAÑA: PEDIDOS PENDIENTES
// =====================================
const PendingOrdersTab = () => {
    const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchPendingOrders = async () => {
            setLoading(true);
            try {
                // ✅ LLAMA A LA API DE PEDIDOS PENDIENTES
                const res = await fetch('/api/client/orders/pending'); 
                if (!res.ok) {
                    if (res.status === 401) { console.error("No autorizado para ver pendientes"); return; }
                    throw new Error('No se pudo cargar los pedidos pendientes');
                }
                const data = await res.json();
                setPendingOrders(data.orders || []);
            } catch (error) { console.error("Error fetching pending orders:", error); setPendingOrders([]); } 
            finally { setLoading(false); }
        };
        fetchPendingOrders();
    }, []);

    // Función para obtener clase de estilo según estado
     const getStatusClass = (status: string = '') => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'pendiente_verificacion') return 'text-yellow-600 font-semibold';
        // Podrías añadir otros estados si son relevantes aquí
        return 'text-gray-500';
    };

    if (loading) { return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>; }

    // JSX para la pestaña de pedidos pendientes
    return (
        <Card className="p-6">
            <CardHeader className="p-0 pb-4">
                <CardTitle>Pedidos Pendientes de Verificación</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Separator className="mb-4" />
                <div className="space-y-4">
                    {pendingOrders.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                            <p>No tienes pedidos pendientes de pago.</p>
                            <Button variant="link" onClick={() => router.push('/catalog')}>Ir al catálogo</Button>
                        </div>
                    ) : (
                        pendingOrders.map(order => (
                            <div key={order.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                                <div>
                                    {/* Usamos orderClientId para la navegación al detalle */}
                                    <p className="font-semibold text-lg">Pedido #{order.orderClientId}</p> 
                                    <p className="text-sm text-muted-foreground">Fecha: {order.date}</p>
                                    <p className={`text-sm ${getStatusClass(order.status)}`}>
                                        Estado: {order.status ? order.status.replace('_', ' ').toUpperCase() : 'PENDIENTE'}
                                    </p>
                                </div>
                                <div className="text-right mt-2 sm:mt-0">
                                    <p className="font-bold text-lg">Bs {order.total.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">({order.itemCount} productos)</p>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        // Navega usando el orderClientId
                                        onClick={() => router.push(`/orders/${order.orderClientId}`)} 
                                        className="h-auto p-0 mt-1 text-primary"
                                    >
                                        Ver Detalle
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};


// =====================================
//      PESTAÑA: HISTORIAL DE PEDIDOS (COMPLETA)
// =====================================
const HistoryTab = () => {
    // ✅ Estados necesarios
    const [orders, setOrders] = useState<ConfirmedOrder[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const router = useRouter(); // Hook para navegación

    useEffect(() => {
        const fetchHistory = async () => {
            setLoadingHistory(true);
            try {
                // ✅ CORRECCIÓN DE RUTA: Llama a la API de historial correcta
                const res = await fetch('/api/client/orders/history'); 
                if (!res.ok) {
                     if (res.status === 401) { 
                         console.error("No autorizado para ver historial."); 
                         setOrders([]);
                         // Aquí podrías mostrar un botón de login si no hay sesión
                         return; 
                     }
                    throw new Error('No se pudo cargar el historial');
                }
                const data = await res.json();
                setOrders(data.orders || []);
            } catch (error) { 
                console.error("Error fetching history:", error); 
                setOrders([]); // Asegurar array vacío en caso de error
            } 
            finally { setLoadingHistory(false); }
        };
        fetchHistory();
    }, []); // Se ejecuta solo una vez al montar

    // Función para obtener clase de estilo según estado
    const getStatusClass = (status: string = '') => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'confirmado' || lowerStatus === 'entregado') return 'text-green-600 font-semibold';
        if (lowerStatus === 'pendiente_verificacion') return 'text-yellow-600 font-semibold'; // Incluido por si acaso
        if (lowerStatus === 'cancelado') return 'text-red-600 font-semibold';
        return 'text-gray-500';
    };

    if (loadingHistory) { return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>; }

    // JSX para la pestaña de historial
    return (
        <Card className="p-6">
            <CardHeader className="p-0 pb-4">
                <CardTitle>Historial de Compras</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Separator className="mb-4" />
                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            <History className="h-8 w-8 mx-auto mb-2" />
                            <p>No tienes pedidos anteriores.</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                                <div>
                                    <p className="font-semibold text-lg">Pedido #{order.orderClientId}</p> 
                                    <p className="text-sm text-muted-foreground">Fecha: {order.date}</p>
                                    <p className={`text-sm ${getStatusClass(order.status)}`}>
                                        Estado: {order.status ? order.status.replace('_', ' ').toUpperCase() : 'DESCONOCIDO'}
                                    </p>
                                </div>
                                <div className="text-right mt-2 sm:mt-0">
                                    <p className="font-bold text-lg">Bs {order.total.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">({order.itemCount} productos)</p>
                                    <Button 
                                        variant="link" 
                                        size="sm" 
                                        onClick={() => router.push(`/orders/${order.orderClientId}`)} 
                                        className="h-auto p-0 mt-1 text-primary"
                                    >
                                        Ver Detalle
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};


// =====================================
//      COMPONENTE PRINCIPAL (PAGE)
// =====================================
export default function OrdersDashboardPage() {
    const [defaultTab, setDefaultTab] = useState('pending');
    // Pestaña por defecto: 'pending' o 'history' - read from window location on client
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            setDefaultTab(params.get('tab') || 'pending');
        } catch (e) {
            setDefaultTab('pending');
        }
    }, []);

    return (
        <Fragment> 
            <Tabs defaultValue={defaultTab} className="w-full" activationMode="manual"> 
                {/* La TabsList vive en el layout padre (app/(sistema_interno)/layout.tsx) */}
                
                {/* Contenido para la pestaña de Pedidos Pendientes */}
                <TabsContent value="pending" className="mt-6">
                    <PendingOrdersTab />
                </TabsContent>
                
                {/* Contenido para la pestaña de Historial */}
                <TabsContent value="history" className="mt-6">
                    <HistoryTab />
                </TabsContent>
            </Tabs>
        </Fragment>
    );
}