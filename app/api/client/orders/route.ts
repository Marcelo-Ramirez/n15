// app/api/sales/initiate-order/route.ts
import { NextResponse } from 'next/server';
// ⚠️ ASUME: Tu cliente Prisma está accesible a través de @/lib/prisma
import { prisma } from '@/lib/db'; 
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; 
// Importamos el tipo PrismaClient para tipar la transacción
import { PrismaClient } from '@prisma/client'; 

// Definición de tipos para la carga útil que viene del frontend
interface CartItemPayload {
    productId: number;
    quantity: number;
    pricePerUnit: number; 
}

// 💡 Tipo para el cliente de transacción de Prisma
type PrismaTx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;


export async function POST(req: Request) {
    const session = await getServerSession(authOptions); 
    
    // ... (Verificación de sesión y conversión a clientId) ...
    if (!session || !session.user || !session.user.id) { 
        return NextResponse.json({ error: 'Debe estar logueado para iniciar un pedido.' }, { status: 401 });
    }
    const userIdString = session.user.id; 
    const clientId = parseInt(userIdString, 10); 
    if (isNaN(clientId)) {
        return NextResponse.json({ error: 'ID de usuario inválido.' }, { status: 400 });
    }

    try {
        const { items: cartItems } = await req.json() as { items: CartItemPayload[] };
        if (cartItems.length === 0) {
            return NextResponse.json({ error: 'El pedido no contiene ítems.' }, { status: 400 });
        }
        
        let totalCostOrder = 0;
        
        // 1. VERIFICACIÓN DE STOCK Y CÁLCULO DE TOTAL (Lógica robusta)
        const productIds = cartItems.map(item => item.productId);
        const productsInDB = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, currentQuantity: true, name: true, pricePerUnit: true }
        });
        
        const productsMap = new Map(productsInDB.map(p => [p.id, p]));
        
        const saleProductsData = cartItems.map(item => {
            const product = productsMap.get(item.productId);
            if (!product || product.currentQuantity < item.quantity) {
                throw new Error(`Stock insuficiente para ${product?.name || 'producto desconocido'}.`);
            }
            const subtotal = product.pricePerUnit * item.quantity;
            totalCostOrder += subtotal;
            
            // Datos necesarios para la creación anidada
            return {
                productId: item.productId,
                quantity: item.quantity,
                pricePerUnit: product.pricePerUnit, // Precio de la DB
                subtotal: subtotal // Subtotal para un posible uso futuro
            };
        });

        
        const result = await prisma.$transaction(async (tx: PrismaTx) => {
            
            const firstItem = cartItems[0];
            const orderClient = await tx.orderClient.create({
                // ✅ CORRECCIÓN TS2322: Se pasan todos los campos obligatorios del esquema
                data: {
                    clientId: clientId, 
                    productId: firstItem.productId, 
                    quantity: firstItem.quantity, 
                    status: 'pendiente_verificacion', 
                }
            });

            const saleOrder = await tx.saleOrder.create({
                data: {
                    orderClientId: orderClient.id, 
                    userId: clientId,              
                    totalCostOrder: totalCostOrder,
                    
                    saleProducts: {
                        createMany: {
                            data: saleProductsData.map(data => ({
                                userId: clientId, 
                                productId: data.productId,
                                quantity: data.quantity,
                            })),
                        },
                    },
                },
                select: { id: true } 
            });

            return { orderId: orderClient.id, saleOrderId: saleOrder.id };
        });

        // 3. Devolver la ID
        return NextResponse.json({ 
            success: true, 
            orderId: result.orderId,
            saleOrderId: result.saleOrderId,
            message: 'Pedido registrado y pendiente de verificación de pago.' 
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error al iniciar el pedido:', error);
        
        let errorMessage = 'Error interno del servidor al procesar el pedido.';
        let statusCode = 500;

        if (error instanceof Error) {
            errorMessage = error.message;
            if (errorMessage.includes('Stock insuficiente')) {
                statusCode = 400;
            } else if (error.message.includes('Foreign key constraint failed')) {
                errorMessage = 'Error de relación: Verifique que todos los IDs de productos existan.';
                statusCode = 400;
            }
        }
        
        return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
}