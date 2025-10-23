'use client'

import { Box, Flex } from '@chakra-ui/react'
import { useState } from 'react'
import SystemSidebar from '@/components/layout/SystemSidebar'

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const userRole = 'stockroom'

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  return (
    <Flex minH="100vh" bg="gray.50">
      <SystemSidebar 
        role={userRole} 
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />
      
      <Box 
        flex="1" 
        display="flex" 
        flexDirection="column"
        ml={isSidebarCollapsed ? "60px" : "250px"}
        transition="margin 0.3s ease"
      >        
        <Box flex="1" p={6}>
          {children}
        </Box>
      </Box>
    </Flex>
  )
}
