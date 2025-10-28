// app/api/inventory/products/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET: Obtener producto por ID
export async function GET(req: Request, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const paramsObj = 'then' in context.params
    ? await context.params
    : context.params;
  const idParam = paramsObj.id;
  console.log(`LOG: Solicitud GET recibida para producto con ID: ${idParam}`); // ✅ Log de inicio
  
  if (!idParam) {
    console.warn("WARN: Solicitud GET sin ID de producto.");
    return NextResponse.json(
      { success: false, error: "ID de producto no proporcionado" },
      { status: 400 }
    );
  }

  const id = parseInt(idParam);
  try {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      console.log(`LOG: Producto con ID ${id} no encontrado.`);
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }
    
    console.log(`LOG: Producto con ID ${id} encontrado. Respondiendo con éxito.`); // ✅ Log de éxito
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error(`ERROR: Error al obtener producto con ID ${id}:`, error);
    return NextResponse.json(
      { success: false, error: "Error al obtener producto" },
      { status: 500 }
    );
  }
}

// PATCH: Actualizar producto por ID
export async function PATCH(req: Request, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const paramsObj = 'then' in context.params
    ? await context.params
    : context.params;
  const idParam = paramsObj.id;
  console.log(`LOG: Solicitud PATCH recibida para producto con ID: ${idParam}`);
  const session = await getServerSession(authOptions);
  
  if (!session) {
    console.warn(`WARN: Intento de actualizar producto ${idParam} sin autenticación.`);
    return NextResponse.json(
      { success: false, error: "Usuario no autenticado" },
      { status: 401 }
    );
  }
  
  try {
    const id = parseInt(idParam);
    const dataToUpdate = await req.json();
    console.log(`LOG: Datos de actualización para el ID ${id}:`, dataToUpdate); // ✅ Log con datos
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });
    
    console.log(`LOG: Producto con ID ${id} actualizado exitosamente.`);
    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error(`ERROR: Error al actualizar producto con ID ${idParam}:`, error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar producto por ID
export async function DELETE(req: Request, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const paramsObj = 'then' in context.params
    ? await context.params
    : context.params;
  const idParam = paramsObj.id;
  console.log(`LOG: Solicitud DELETE recibida para producto con ID: ${idParam}`);
  const session = await getServerSession(authOptions);

  if (!session) {
    console.warn(`WARN: Intento de eliminar producto ${idParam} sin autenticación.`);
    return NextResponse.json(
      { success: false, error: "Usuario no autenticado" },
      { status: 401 }
    );
  }
  
  try {
    const id = parseInt(idParam);
    await prisma.product.delete({ where: { id } });

    console.log(`LOG: Producto con ID ${id} eliminado exitosamente.`);
    return NextResponse.json({ success: true, message: "Producto eliminado" });
  } catch (error) {
    console.error(`ERROR: Error al eliminar producto con ID ${idParam}:`, error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}