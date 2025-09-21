'use client'

import { Box, HStack, Text, Button } from '@chakra-ui/react'
import { FiBell, FiSettings, FiLogOut } from 'react-icons/fi'

interface SystemHeaderProps {
  username?: string
  role?: string
}

export default function SystemHeader({ username = 'User', role = 'admin' }: SystemHeaderProps) {
  return (
    <Box
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      px={6}
      py={4}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <HStack justify="space-between" align="center">
        <Box>
          <Text fontSize="lg" fontWeight="semibold">
            System Dashboard
          </Text>
          <Text fontSize="sm" color="gray.600">
            {role.charAt(0).toUpperCase() + role.slice(1)} Panel
          </Text>
        </Box>

        <HStack gap={4}>
          <Button variant="ghost" size="sm">
            <FiBell />
          </Button>
          
          <Button variant="ghost" size="sm">
            <FiSettings />
          </Button>

          <HStack gap={2}>
            <Box
              w={8}
              h={8}
              bg="blue.500"
              color="white"
              rounded="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="sm"
              fontWeight="bold"
            >
              {username.charAt(0).toUpperCase()}
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="medium">
                {username}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {role}
              </Text>
            </Box>
          </HStack>

          <Button variant="ghost" size="sm" colorScheme="red">
            <FiLogOut />
          </Button>
        </HStack>
      </HStack>
    </Box>
  )
}
