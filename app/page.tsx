"use client";

import { useRouter } from "next/navigation";
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

// ✅ CORRECCIÓN: Importar PublicHeader y PublicFooter
// Asegúrate que las rutas sean correctas para tu proyecto
import { PublicHeader } from "@/components/layout/PublicHeader"; 
import { PublicFooter } from "@/components/layout/PublicFooter"; 

// Importar componentes Shadcn UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// --- Placeholder para la Tarjeta de Producto (Adaptación de tu Box) ---
import gomitaBeterraga from './images/products/gomita/g-beterraga.png';
import gomitaFrutilla from './images/products/gomita/g-frutilla.png';
import pulpaMandarina from './images/products/pulpa/p-mandarina.png';

interface ProductCardProps {
  title: string;
  description: string;
  price: string;
  imageSrc: any; // StaticImageData | string
  imageAlt: string;
}

const ProductCard = ({ title, description, price, imageSrc, imageAlt }: ProductCardProps) => {
  // If imageSrc is StaticImageData we can access width/height
  const isStatic = typeof imageSrc === 'object' && imageSrc?.width && imageSrc?.height;
  const isPortrait = isStatic ? (imageSrc.height > imageSrc.width) : false;

  // For portrait images increase container height and render with contain and computed dimensions
    if (isPortrait) {
    const ratio = imageSrc.width / imageSrc.height;
    const targetHeight = 200; // px (reduced so it fits unified container)
    const targetWidth = Math.round(targetHeight * ratio);

    return (
      <Card className="w-full max-w-xs shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-0">
          <div className="relative h-56 bg-muted/50 rounded-t-lg overflow-hidden flex items-center justify-center p-4">
            <Image src={imageSrc} alt={imageAlt} width={targetWidth} height={targetHeight} style={{ objectFit: 'contain', objectPosition: 'center' }} />
          </div>
        </CardContent>
        <div className="p-6 text-center">
          <CardTitle className="text-lg font-semibold mb-2 text-foreground">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mb-4">{description}</CardDescription>
          <p className="text-xl font-bold text-primary">{price}</p>
        </div>
      </Card>
    );
  }

  // Default: landscape or unknown size -> fill and cover
  return (
    <Card className="w-full max-w-xs shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="relative h-56 bg-muted/50 rounded-t-lg overflow-hidden flex items-center justify-center p-4">
          <div className="relative w-full h-full">
            <Image src={imageSrc} alt={imageAlt} fill style={{ objectFit: 'cover', objectPosition: 'center' }} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          </div>
        </div>
      </CardContent>
      <div className="p-6 text-center">
        <CardTitle className="text-lg font-semibold mb-2 text-foreground">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-4">{description}</CardDescription>
        <p className="text-xl font-bold text-primary">{price}</p>
      </div>
    </Card>
  );
};
// --- Fin Placeholder ---


export default function HomePage() {
  const router = useRouter();

  const productData: ProductCardProps[] = [
    { title: 'Gomita Beterraga', description: 'Gomita natural sabor beterraga', price: 'Bs 1.5', imageSrc: gomitaBeterraga, imageAlt: 'Gomita Beterraga' },
    { title: 'Gomita Frutilla', description: 'Gomita natural sabor frutilla', price: 'Bs 1.5', imageSrc: gomitaFrutilla, imageAlt: 'Gomita Frutilla' },
    { title: 'Pulpa Mandarina', description: 'Pulpa natural sabor mandarina', price: 'Bs 5', imageSrc: pulpaMandarina, imageAlt: 'Pulpa Mandarina' },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950">
      <PublicHeader /> {/* El error desaparece con la importación */}

      <div className="container max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col gap-12 items-center w-full">
          
          {/* Sección de Bienvenida y Botones */}
          <div className="flex flex-col gap-8 items-center max-w-4xl">
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Bienvenido a Nuestra Tienda de Gomitas
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Descubre nuestra deliciosa colección de gomitas premium elaboradas con los mejores ingredientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              {/* Botones eliminados: la navegación a catálogo está en el header y el acceso al sistema está en el footer como link 'sys' */}
            </div>
          </div>

          <Separator className="w-24 h-1 bg-primary rounded-full mt-8 mb-4" />

          {/* Sección de Productos Destacados */}
          <div className="w-full">
            <h2 className="text-3xl font-bold mb-8 text-foreground text-center">
              Productos Destacados
            </h2>
            <div
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center max-w-6xl mx-auto"
            >
              {productData.map((product, index) => (
                <ProductCard
                  key={index}
                  title={product.title}
                  description={product.description}
                  price={product.price}
                  imageSrc={product.imageSrc}
                  imageAlt={product.imageAlt}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <PublicFooter /> {/* El error desaparece con la importación */}
    </div>
  );
}