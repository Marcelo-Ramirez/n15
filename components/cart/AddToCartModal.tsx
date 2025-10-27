'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; // Asumo que usas un componente Dialog/Modal
import { ShoppingCart } from 'lucide-react';

// Tipos de datos simplificados
interface ModalProduct {
    id: number;
    name: string;
    pricePerUnit: number;
    currentQuantity: number;
    imageUrl?: string | null;
}

interface AddToCartModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: ModalProduct | null;
    onConfirmAdd: (productId: number, quantity: number) => void;
}

export function AddToCartModal({ isOpen, onClose, product, onConfirmAdd }: AddToCartModalProps) {
    // Inicializar la cantidad en 1 o la cantidad máxima si es menor a 1 (aunque no debería pasar)
    const [quantity, setQuantity] = useState(1);

    // Resetear la cantidad cada vez que el producto o la apertura cambia
    useEffect(() => {
        if (product) {
            setQuantity(1);
        }
    }, [product]);

    // Función para manejar la confirmación
    const handleConfirm = () => {
        if (product) {
            onConfirmAdd(product.id, quantity);
            onClose(); // Cerrar el modal después de añadir
        }
    };

    // Función segura para manejar el cambio de cantidad
    const handleQuantityChange = useCallback((value: string) => {
        const valueNum = parseInt(value, 10);
        const maxStock = product?.currentQuantity || 0;

        if (isNaN(valueNum) || valueNum < 1) {
            setQuantity(1);
        } else if (valueNum > maxStock) {
            setQuantity(maxStock);
        } else {
            setQuantity(valueNum);
        }
    }, [product]);

    if (!product) return null; // No renderizar si no hay producto seleccionado

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{product.name}</DialogTitle>
                    <DialogDescription className="text-xl font-bold text-primary mt-2">
                        Bs {product.pricePerUnit.toFixed(2)}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col space-y-4 py-4">
                    {/* Imagen del Producto */}
                    <div className="relative h-48 w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {product.imageUrl ? (
                            <Image 
                                src={product.imageUrl} 
                                alt={product.name} 
                                fill={true} 
                                style={{ objectFit: 'contain' }}
                            />
                        ) : (
                            <p className="text-muted-foreground">Imagen no disponible</p>
                        )}
                    </div>
                    
                    {/* Información y Stock */}
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Stock Disponible:</span>
                        <span className="font-semibold text-foreground">{product.currentQuantity}</span>
                    </div>

                    {/* Selector de Cantidad */}
                    <div className="flex items-center justify-between pt-2">
                        <label className="font-semibold">Cantidad:</label>
                        <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            min="1"
                            max={product.currentQuantity}
                            className="w-1/3 text-center"
                            disabled={product.currentQuantity === 0}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button 
                        onClick={handleConfirm}
                        disabled={product.currentQuantity === 0 || quantity < 1 || quantity > product.currentQuantity}
                        className="w-full"
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {product.currentQuantity === 0 ? 'Agotado' : 'Añadir al Carrito'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}