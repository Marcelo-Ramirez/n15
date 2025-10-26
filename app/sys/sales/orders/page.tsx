"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Calendar } from 'lucide-react'; // Iconos

// Importa componentes Shadcn UI
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Select estilizado
import { Separator } from "@/components/ui/separator";

// --- Tipos e Interfaces (Mantenidos) ---
interface OrderClient {
  id: number;
  clientId: number;
  quantity: number;
  status: string;
  createdAt: string;
  product: {
    name: string;
    type: string;
    flavor: string;
    pricePerUnit: number;
  };
  user?: {
    userName: string;
    name: string;
  };
}

// --- HELPERS ---
const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'sale': return 'default'; // Vendido
    case 'reserv': return 'secondary'; // Reservado
    default: return 'outline';
  }
};

const formatPrice = (price: number) => {
    return price.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


// --- COMPONENTE PRINCIPAL ---
export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<OrderClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  // --- Lógica de Fetch (Mantenida) ---
  useEffect(() => {
    fetch("/api/system/sales/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  // --- Lógica de Filtrado (Migrada a useMemo) ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => !filter || order.status === filter);
  }, [orders, filter]);


  // --- JSX PRINCIPAL (Migrado) ---
  return (
    <div className="p-4 md:p-6 space-y-6"> {/* Reemplaza Box y VStack con padding y space-y */}
      
      {/* Header y Filtro */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pedidos</h1>
        
        {/* Filtro de Estado (Reemplaza el select nativo con Shadcn Select) */}
        <div className="w-full sm:w-auto min-w-[150px]">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="reserv">Reservados</SelectItem>
              <SelectItem value="sale">Vendidos</SelectItem>
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
              const statusText = order.status === 'reserv' ? 'Reservado' : 'Vendido';
              
              return (
                <Card 
                  key={order.id} 
                  className="shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800"
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
                      <div className="flex items-center gap-3">
                        {/* Estado */}
                        <Badge variant={getStatusVariant(order.status)} className="uppercase">
                          {statusText}
                        </Badge>

                        {/* Acciones */}
                        <Button variant="outline" size="sm">
                          {order.status === 'reserv' ? 'Confirmar Venta' : 'Ver Detalle'}
                        </Button>
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
                            (x ${formatPrice(order.product.pricePerUnit)})
                        </p>
                      </div>
                      
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
              <p className="text-muted-foreground">No hay pedidos {filter ? `(${filter})` : 'registrados'}.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}