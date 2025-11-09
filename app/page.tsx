"use client";

import Image, { StaticImageData } from 'next/image';

import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import gomitaBeterraga from './images/products/gomita/g-beterraga.png';
import gomitaFrutilla from './images/products/gomita/g-frutilla.png';
import pulpaMandarina from './images/products/pulpa/p-mandarina.png';
import gomitaLimon from './images/products/gomita/g-limon.png';

interface ProductCardProps {
  title: string;
  description: string;
  price: string;
  imageSrc: string | StaticImageData;
  imageAlt: string;
}

const isStaticImageData = (src: string | StaticImageData): src is StaticImageData =>
  typeof src === 'object' && src !== null && 'width' in src && 'height' in src;

const ProductCard = ({ title, description, price, imageSrc, imageAlt }: ProductCardProps) => {
  const isStatic = isStaticImageData(imageSrc);
  const isPortrait = isStatic ? imageSrc.height > imageSrc.width : false;

  if (isPortrait && isStatic) {
    const ratio = imageSrc.width / imageSrc.height;
    const targetHeight = 200;
    const targetWidth = Math.round(targetHeight * ratio);

    return (
      <Card className="w-full max-w-xs shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-0">
          <div className="relative h-56 bg-muted/50 rounded-t-lg overflow-hidden flex items-center justify-center p-4">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={targetWidth}
              height={targetHeight}
              style={{ objectFit: 'contain', objectPosition: 'center' }}
            />
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

  return (
    <Card className="w-full max-w-xs shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="relative h-56 bg-muted/50 rounded-t-lg overflow-hidden flex items-center justify-center p-4">
          <div className="relative w-full h-full">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
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

export default function HomePage() {
  const productData: ProductCardProps[] = [
    {
      title: 'Gomita Beterraga',
      description: 'Gomita natural sabor beterraga',
      price: 'Bs 1.5',
      imageSrc: gomitaBeterraga,
      imageAlt: 'Gomita Beterraga',
    },
    {
      title: 'Gomita Frutilla',
      description: 'Gomita natural sabor frutilla',
      price: 'Bs 1.5',
      imageSrc: gomitaFrutilla,
      imageAlt: 'Gomita Frutilla',
    },
    {
      title: 'Pulpa Mandarina',
      description: 'Pulpa natural sabor mandarina',
      price: 'Bs 5',
      imageSrc: pulpaMandarina,
      imageAlt: 'Pulpa Mandarina',
    },
    {
      title: 'Gomita Limón',
      description: 'Gomita natural sabor limón',
      price: 'Bs 1.5',
      imageSrc: gomitaLimon,
      imageAlt: 'Gomita Limón',
    },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950">
      <PublicHeader />

      <div className="container max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col gap-12 items-center w-full">
          <div className="flex flex-col gap-8 items-center max-w-4xl">
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Bienvenido a Nuestra Tienda de Gomitas
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Descubre nuestra deliciosa colección de gomitas premium elaboradas con los mejores ingredientes.
            </p>
          </div>

          <Separator className="w-24 h-1 bg-primary rounded-full mt-8 mb-4" />

          <div className="w-full">
            <h2 className="text-3xl font-bold mb-8 text-foreground text-center">Productos Destacados</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center max-w-6xl mx-auto">
              {productData.map((product) => (
                <ProductCard
                  key={product.title}
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
      <PublicFooter />
    </div>
  );
}