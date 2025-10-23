"use client";
import { useEffect, useState } from "react";
import { Box, Heading, Text, VStack, HStack, Spinner, Grid, GridItem, Button } from "@chakra-ui/react";

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

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<OrderClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch("/api/system/sales/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      });
  }, []);

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg" mb={2}>Pedidos</Heading>
          <select
            style={{ width: 200, padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value)}
          >
            <option value="">Filtrar</option>
            <option value="reserv">Reservados</option>
            <option value="sale">Vendidos</option>
          </select>
        </HStack>
        {loading ? (
          <Spinner size="lg" />
        ) : (
          <VStack gap={4} align="stretch">
            {orders
              .filter(order => !filter || order.status === filter)
              .map((order) => (
                <Box key={order.id} bg="#222" color="#fff" borderRadius="2xl" p={6} boxShadow="md" border="2px solid #fff2" >
                  <VStack align="stretch" gap={2}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold">{order.user?.userName || `User${order.clientId}`}</Text>
                      <HStack gap={2}>
                        <Button size="sm" colorScheme="blue" variant="outline">reserv</Button>
                        <Button size="sm" colorScheme="green" variant="outline">sale</Button>
                      </HStack>
                    </HStack>
                    <Box>
                      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                        <GridItem>
                          <Text fontWeight="bold">{order.product.type}/{order.product.flavor}</Text>
                          <Text fontSize="sm">Cantidad: {order.quantity}</Text>
                        </GridItem>
                        {/* Si hay más productos, aquí se agregarían más GridItems */}
                      </Grid>
                    </Box>
                    <HStack justify="space-between" mt={2}>
                      <Text fontWeight="bold">Totalcost</Text>
                      <Text fontSize="sm">{new Date(order.createdAt).toLocaleString()}</Text>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            {orders.length === 0 && (
              <Box bg="white" p={8} textAlign="center" borderRadius="lg" boxShadow="md" border="1px" borderColor="gray.200">
                <Text color="gray.500">No hay pedidos registrados</Text>
              </Box>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
