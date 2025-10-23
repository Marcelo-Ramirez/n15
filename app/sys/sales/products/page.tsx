// app/sys/stockroom/page.tsx
import React from 'react';
import ProductTable from '@/components/ui/ProductTable';

export default function StockroomPage() {
  return (
    <div>
      <ProductTable role="sales" />
    </div>
  );
}