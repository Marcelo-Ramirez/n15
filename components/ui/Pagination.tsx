'use client'

import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  totalItems?: number
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages()

  return (
    <Box>
      <HStack justify="space-between" align="center" mb={4}>
        {totalItems && pageSize && (
          <Text fontSize="sm" color="gray.600">
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{' '}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
          </Text>
        )}
        
        <HStack gap={1}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FiChevronLeft style={{ marginRight: '4px' }} />
            Previous
          </Button>

          {visiblePages.map((page, index) => (
            <Box key={index}>
              {page === '...' ? (
                <Text px={2}>...</Text>
              ) : (
                <Button
                  size="sm"
                  variant={currentPage === page ? 'solid' : 'ghost'}
                  colorScheme={currentPage === page ? 'blue' : 'gray'}
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </Button>
              )}
            </Box>
          ))}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <FiChevronRight style={{ marginLeft: '4px' }} />
          </Button>
        </HStack>
      </HStack>
    </Box>
  )
}
