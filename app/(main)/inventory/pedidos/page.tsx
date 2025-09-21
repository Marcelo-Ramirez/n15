"use client";

import React, { useState, useEffect } from "react";
import { Box, VStack, Button, Spinner, Badge, Text } from "@chakra-ui/react";

type Order = {
  id: number;
  user: { id: number; username: string; name: string };
  product: { id: number; name: string };
  quantity: number;
  status: string;
  createdAt: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/inventory/orders");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/inventory/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" />
        <Text mt={2} fontWeight="bold" color="gray.800">
          Cargando pedidos...
        </Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack align="stretch" gap={4}>
        <Text fontSize="2xl" fontWeight="bold" color="gray.900">
          Pedidos
        </Text>

        <Box overflowX="auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f7fafc" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left", color: "#1a202c" }}>Producto</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#1a202c" }}>Usuario</th>
                <th style={{ padding: "12px", textAlign: "center", color: "#1a202c" }}>Cantidad</th>
                <th style={{ padding: "12px", textAlign: "center", color: "#1a202c" }}>Estado</th>
                <th style={{ padding: "12px", textAlign: "center", color: "#1a202c" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                let badgeColor = "red";
                if (o.status === "pendiente") badgeColor = "yellow";
                else if (o.status === "pagado") badgeColor = "green";

                return (
                  <tr key={o.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px", fontWeight: "bold", color: "#2d3748" }}>{o.product.name}</td>
                    <td style={{ padding: "12px", fontWeight: "bold", color: "#2d3748" }}>{o.user.username}</td>
                    <td style={{ padding: "12px", textAlign: "center", fontWeight: "bold", color: "#2d3748" }}>
                      {o.quantity}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <Badge colorScheme={badgeColor} fontWeight="bold">
                        {o.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <Box display="flex" gap="8px" justifyContent="center">
                        {o.status === "pendiente" && (
                          <>
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() => updateStatus(o.id, "pagado")}
                            >
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => updateStatus(o.id, "cancelado")}
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                      </Box>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>

        {orders.length === 0 && (
          <Text textAlign="center" color="gray.700" fontWeight="bold">
            No hay pedidos registrados
          </Text>
        )}
      </VStack>
    </Box>
  );
}
