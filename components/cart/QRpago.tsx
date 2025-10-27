// components/cart/QrPaymentModal.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCheck, Scan } from 'lucide-react';
import Image from 'next/image';

interface QrPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalCost: number;
    onPaymentSubmitted: () => void; // Función que llama a la API de checkout
}

export function QrPaymentModal({ isOpen, onClose, totalCost, onPaymentSubmitted }: QrPaymentModalProps) {

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-6">
                <DialogHeader className="text-center space-y-3">
                    <Scan className="h-10 w-10 text-primary mx-auto" />
                    <DialogTitle className="text-2xl">Confirmación de Pago</DialogTitle>
                    <DialogDescription>
                        Escanea el código QR de Yape para completar tu compra de:
                        <p className="text-3xl font-extrabold text-primary mt-2">Bs {totalCost.toFixed(2)}</p>
                    </DialogDescription>
                </DialogHeader>

                <div className="my-6 flex justify-center">
                    {/* ✅ Muestra la imagen QR estática desde la carpeta public */}
                    <Image
                        src="/qr.jpg" 
                        alt="Código QR de Yape"
                        width={250}
                        height={250}
                        className="border-4 border-primary rounded-lg"
                        priority // Para asegurar que se cargue rápido
                    />
                </div>

                <DialogFooter className="flex flex-col space-y-3 pt-4">
                    <Button 
                        onClick={onPaymentSubmitted} // Llama a la función que inicia la transacción final
                        className="w-full h-12 bg-green-600 hover:bg-green-700"
                    >
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Ya realicé el Pago
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={onClose} 
                        className="w-full text-sm text-muted-foreground"
                    >
                        Cancelar y Volver
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}