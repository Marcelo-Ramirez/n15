// app/api/inventory/product-image/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const POST = async (req: Request) => {
  try {
    // Convertimos la request a FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No se recibió ningún archivo." }, { status: 400 });
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Solo se permiten imágenes." }, { status: 400 });
    }

    // Crear carpeta si no existe
    const imagesDir = path.join(process.cwd(), "public/images/products");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Generar nombre único para la imagen
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const fileName = `product_${timestamp}.${ext}`;
    const filePath = path.join(imagesDir, fileName);

    // Guardar archivo
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    // Devolver la URL pública
    const imageUrl = `/images/products/${fileName}`;
    return NextResponse.json({ success: true, imageUrl });

  } catch (error) {
    console.error("Error al subir imagen:", error);
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
};
