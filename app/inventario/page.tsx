'use client'

import React from "react";
import { Box } from "@chakra-ui/react";
import InventoryABC from '@/app/components/InventoryABC'; // ajusta la ruta según tu proyecto

export default function InventoryPage() {
  return (
    <Box p={6}>
      <InventoryABC />
    </Box>
  );
}
