import { redirect } from 'next/navigation';

export default function InventoryDefaultPage() {
  redirect('/inventory/ingredient');
}
