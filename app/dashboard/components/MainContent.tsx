"use client";
import {
  Box,
  Heading,
  Text,
  Card,
  VStack,
  HStack,
  Button,
  Stat,
  Grid,
  Badge,
  Avatar,
  Table,
  Flex,
} from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";

interface MainContentProps {
  activeMenuItem: string;
}

// Componente Dashboard
const DashboardContent = () => {
  const { user } = useAuth();
  
  return (
    <VStack gap={6} align="stretch">
      <Box>
        <Heading size="2xl" color="gray.800" mb={2}>
          ¡Bienvenido, {user?.name || "Usuario"}! 👋
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Aquí tienes un resumen de tu actividad
        </Text>
      </Box>

      {/* Stats Cards */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
        <Card.Root>
          <Card.Body p={6}>
            <Stat.Root>
              <Stat.Label>Usuarios Totales</Stat.Label>
              <Stat.ValueText fontSize="3xl" color="blue.500">
                1,234
              </Stat.ValueText>
              <Stat.HelpText>↗️ +12% desde el mes pasado</Stat.HelpText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body p={6}>
            <Stat.Root>
              <Stat.Label>Ingresos</Stat.Label>
              <Stat.ValueText fontSize="3xl" color="green.500">
                $45,678
              </Stat.ValueText>
              <Stat.HelpText>↗️ +23% desde el mes pasado</Stat.HelpText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body p={6}>
            <Stat.Root>
              <Stat.Label>Órdenes</Stat.Label>
              <Stat.ValueText fontSize="3xl" color="purple.500">
                567
              </Stat.ValueText>
              <Stat.HelpText>↘️ -5% desde el mes pasado</Stat.HelpText>
            </Stat.Root>
          </Card.Body>
        </Card.Root>
      </Grid>

      {/* Recent Activity */}
      <Card.Root>
        <Card.Header>
          <Heading size="lg">Actividad Reciente</Heading>
        </Card.Header>
        <Card.Body>
          <VStack gap={4} align="stretch">
            {[
              { action: "Nuevo usuario registrado", time: "Hace 5 minutos", type: "success" },
              { action: "Pago procesado", time: "Hace 12 minutos", type: "info" },
              { action: "Error de sistema resuelto", time: "Hace 1 hora", type: "warning" },
            ].map((activity, index) => (
              <Flex key={index} justify="space-between" align="center" p={3} bg="gray.50" borderRadius="md">
                <Text>{activity.action}</Text>
                <Badge colorScheme={activity.type === "success" ? "green" : activity.type === "warning" ? "orange" : "blue"}>
                  {activity.time}
                </Badge>
              </Flex>
            ))}
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
};

// Componente Analytics
const AnalyticsContent = () => (
  <VStack gap={6} align="stretch">
    <Box>
      <Heading size="2xl" color="gray.800" mb={2}>
        📊 Analytics
      </Heading>
      <Text color="gray.600" fontSize="lg">
        Métricas y estadísticas detalladas
      </Text>
    </Box>

    <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
      <Card.Root>
        <Card.Header>
          <Heading size="md">Tráfico del Sitio Web</Heading>
        </Card.Header>
        <Card.Body>
          <Box h="200px" bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
            <Text color="gray.500">Gráfico de tráfico aquí</Text>
          </Box>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Heading size="md">Conversiones</Heading>
        </Card.Header>
        <Card.Body>
          <Box h="200px" bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
            <Text color="gray.500">Gráfico de conversiones aquí</Text>
          </Box>
        </Card.Body>
      </Card.Root>
    </Grid>
  </VStack>
);

// Componente Users
const UsersContent = () => (
  <VStack gap={6} align="stretch">
    <Flex justify="space-between" align="center">
      <Box>
        <Heading size="2xl" color="gray.800" mb={2}>
          👥 Gestión de Usuarios
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Administra los usuarios del sistema
        </Text>
      </Box>
      <Button colorScheme="blue">Agregar Usuario</Button>
    </Flex>

    <Card.Root>
      <Card.Body>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Usuario</Table.ColumnHeader>
              <Table.ColumnHeader>Email</Table.ColumnHeader>
              <Table.ColumnHeader>Estado</Table.ColumnHeader>
              <Table.ColumnHeader>Registro</Table.ColumnHeader>
              <Table.ColumnHeader>Acciones</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {[
              { name: "Juan Pérez", email: "juan@email.com", status: "Activo", date: "2024-01-15" },
              { name: "María García", email: "maria@email.com", status: "Inactivo", date: "2024-01-10" },
              { name: "Carlos López", email: "carlos@email.com", status: "Activo", date: "2024-01-08" },
            ].map((user, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <HStack>
                    <Avatar.Root size="sm">
                      <Avatar.Fallback>{user.name.charAt(0)}</Avatar.Fallback>
                    </Avatar.Root>
                    <Text>{user.name}</Text>
                  </HStack>
                </Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>
                  <Badge colorScheme={user.status === "Activo" ? "green" : "red"}>
                    {user.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{user.date}</Table.Cell>
                <Table.Cell>
                  <HStack>
                    <Button size="xs" variant="outline">Editar</Button>
                    <Button size="xs" colorScheme="red" variant="outline">Eliminar</Button>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </Card.Root>
  </VStack>
);

// Componente genérico para otras secciones
const GenericContent = ({ title, icon, description }: { title: string; icon: string; description: string }) => (
  <VStack gap={6} align="stretch">
    <Box>
      <Heading size="2xl" color="gray.800" mb={2}>
        {icon} {title}
      </Heading>
      <Text color="gray.600" fontSize="lg">
        {description}
      </Text>
    </Box>

    <Card.Root>
      <Card.Body p={8}>
        <VStack gap={4}>
          <Text fontSize="xl" textAlign="center">
            Esta sección está en desarrollo
          </Text>
          <Text color="gray.500" textAlign="center">
            Aquí aparecerá el contenido de {title.toLowerCase()}
          </Text>
          <Button colorScheme="blue" variant="outline">
            Próximamente
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  </VStack>
);

export default function MainContent({ activeMenuItem }: MainContentProps) {
  const renderContent = () => {
    switch (activeMenuItem) {
      case "dashboard":
        return <DashboardContent />;
      case "analytics":
        return <AnalyticsContent />;
      case "users":
        return <UsersContent />;
      case "settings":
        return <GenericContent title="Configuración" icon="⚙️" description="Ajustes y preferencias del sistema" />;
      case "profile":
        return <GenericContent title="Perfil" icon="👤" description="Información personal y configuración de cuenta" />;
      case "notifications":
        return <GenericContent title="Notificaciones" icon="🔔" description="Centro de notificaciones y alertas" />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <Box>
      {renderContent()}
    </Box>
  );
}
