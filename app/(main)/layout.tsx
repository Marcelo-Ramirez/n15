"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Box, Spinner, Center, Flex } from "@chakra-ui/react";
import Sidebar from "@/app/components/layout/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />
      
      {/* Main Content Area */}
      <Box 
        flex="1" 
        ml={isSidebarOpen ? "250px" : "60px"} 
        transition="margin-left 0.3s ease"
        p={6}
      >
        {children}
      </Box>
    </Flex>
  );
}
