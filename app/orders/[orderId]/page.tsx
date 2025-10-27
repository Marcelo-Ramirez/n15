// app/(sistema_interno)/orders/[orderId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // useParams para obtener ID de URL
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft } from 'lucide-react';

// --- Tipo de Datos para el Detalle del Pedido ---
interface OrderItemDetail {
    productId: number;
    name: string;
    imageUrl?: string | null;
    quantity: number;
    pricePerUnit: number;
    subtotal: number;
}
interface OrderDetails {
    id: number;
    orderClientId: number;
    date?: string;
    status: string;
    totalCost: number;
    items: OrderItemDetail[];
}
// ---

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string; // Obtener el ID de la URL

    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return; // No hacer fetch si no hay ID

        const fetchOrderDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                // Llama a la nueva API de detalle
                const res = await fetch(`/api/client/orders/${orderId}`); 
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'No se pudo cargar el pedido');
                }
                const data = await res.json();
                setOrder(data.order);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]); // Dependencia del ID de la URL

    // Función para obtener color según estado
    const getStatusClass = (status: string = '') => {
        switch (status.toLowerCase()) {
            case 'confirmado': case 'entregado': return 'text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-md';
            case 'pendiente_verificacion': return 'text-yellow-600 font-semibold bg-yellow-100 px-2 py-1 rounded-md';
            case 'cancelado': return 'text-red-600 bg-red-100 px-2 py-1 rounded-md';
            default: return 'text-gray-500 bg-gray-100 px-2 py-1 rounded-md';
        }
    };


    if (loading) {
        return <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
    }

    if (error) {
        return (
            <div className="p-12 text-center text-red-600">
                <p>Error: {error}</p>
                <Button variant="link" onClick={() => router.back()}>Volver</Button>
            </div>
        );
    }

    if (!order) {
         return <div className="p-12 text-center text-muted-foreground">Pedido no encontrado.</div>;
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">Detalle del Pedido #{order.orderClientId}</CardTitle>
                    <CardDescription>Fecha: {order.date || 'N/A'}</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <p className="text-sm font-medium">Estado:</p>
                    <p className={`text-lg inline-block ${getStatusClass(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                    </p>
                </div>

                <Separator className="my-4" />

                <h3 className="text-lg font-semibold mb-3">Productos Comprados ({order.items.length})</h3>
                <div className="space-y-4">
                    {order.items.map(item => (
                        <div key={item.productId} className="flex items-center space-x-4 p-3 border rounded-md bg-muted/50">
                            <div className="relative h-16 w-16 bg-white rounded-md overflow-hidden flex items-center justify-center">
                                {item.imageUrl ? (
                                    <Image src={item.imageUrl} alt={item.name} fill style={{ objectFit: 'contain'}} />
                                ) : (
                                    <span className="text-xs text-muted-foreground">No img</span>
                                )}
                            </div>
                            <div className="flex-grow">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {item.quantity} x Bs {item.pricePerUnit?.toFixed(2) || 'N/A'}
                                </p>
                            </div>
                            <p className="font-semibold text-lg">Bs {item.subtotal?.toFixed(2) || 'N/A'}</p>
                        </div>
                    ))}
                </div>

                <Separator className="my-6" />

                <div className="flex justify-end">
                    <div className="text-right">
                        <p className="text-muted-foreground">Subtotal:</p>
                        <p className="text-muted-foreground">Envío:</p>
                        <p className="text-xl font-bold mt-1">Total Pagado:</p>
                    </div>
                     <div className="text-right ml-6">
                        <p className="text-muted-foreground">Bs {order.totalCost.toFixed(2)}</p>
                        <p className="text-muted-foreground">Bs 0.00</p>
                        <p className="text-xl font-bold text-primary mt-1">Bs {order.totalCost.toFixed(2)}</p>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}