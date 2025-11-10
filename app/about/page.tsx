"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/button";
import { Leaf, HeartPulse, ShoppingBag } from "lucide-react";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCMvrHdwoa1ZWIkffYjhjchsI3rUwiIWMQf7kHN_vABwXcwCiWMXOWBf4IhIfe96VfdiHu2CSjYEIVURRu4qVhlcH7ja2kchjzm11tdgTdQFbPyRgn6-Ll5RKX9HOXhYoW2Jcpp1OusCvpD0wvAw6-oso8BHwfVoCJ0Sbr_a2DB4khTNfdM-LPDafPm3US1DE_n4b5fOuvGYa5rpOUUEz0JTO6N2WCPyOcfOOnmHVqRAPLBLA8Vc_8AO8fp_-RwvDs2wHMpgad1Ro-Z";

const beginningsImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAzzGzyTYuJ_u6N0G0sKBBGG6R7PXbVPsXsKTDHfhiD8P79F461tg82D5BtlDGOR8XHxHkZ8U_1BqwCBlizSuP9hgMl2G8G7Sq-7W9_btACHS2KQEyAEYiLd7P0zInrxRwoaSKVvFPYMqlAvYCTPIrYKjwmW7kcgdUJAXwXHoURjtuj8OalOM5ZetwZak-pSoZ0MZGE5aVYPCZpOCzfSWF9bw_phICxdAYgvgGx4zyXDJe8YHeoOIUQ_tVKw7RFtlrHUrUyhEJh-XAG";

const teamMembers = [
  {
    name: "Ana & Juan",
    role: "Fundadores",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDXjhg3ykqGd3KhGjN7GJWcDUBuBuMuOtUWwtbrjJ47zdKsKhNVHb62u7Pqw-pcKWmcIxSFnSgq61mvcoLIhTkPhjQImjQAhmCeNFsERgmMMupEuG7COP5lMTzE3G17BJvVs6SvJD5v9JAT2t89rvgRluES-Veh7cTdCI72iRBnZjpct3GDHmwEm4eBTPqYI5Ro9QyQ4835iCTJGCYKX2kNMl8tegu0Eypr9eWqdgAKYxFvF49Y9xbjYT33w1sLEfApU1nKGrlFZy0G",
  },
  {
    name: "Equipo de Cocina",
    role: "Magos del Sabor",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDd-7u9xJWarPHHFfzBxyCmS84EHohPUzYkIIrW_Be0WAAnIwZsGcw08fe7oiMgS1AcSDQ7-OLysMNX2GQJ7F_VeXreHziG_o60iFqbBvuhX4Lxv3rIHsOf6sAXdSUUY0WzNbDa0CXb8hAGZ-dVhR5FMBjm31VlmTtbjIOIFyDcftn-LkA4LOx0c499zZtzojLnEtz3xbWRZX4XRR-JdQR-AVY69ABTwwr2tKWTWNj2VTA0hMosT5ihkxP-InG6bmz1Hz9XIPx0VqI-",
  },
];

const highlights = [
  {
    icon: Leaf,
    title: "100% Natural",
    description: "Sin colorantes ni sabores artificiales.",
  },
  {
    icon: HeartPulse,
    title: "Saludable y Delicioso",
    description: "Endulzadas naturalmente con la propia fruta.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        <section
          className="relative h-72 w-full bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent dark:from-background/90 dark:via-background/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-transparent dark:from-background/80 dark:via-transparent" />
          <div className="absolute inset-0 bg-white/25 backdrop-blur-sm dark:bg-transparent dark:backdrop-blur-0" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center space-y-2 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-extrabold drop-shadow-sm">
                Nuestra Dulce Historia
              </h2>
              <p className="text-sm md:text-base text-muted-foreground font-medium">
                Hecho con amor y fruta de verdad
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 md:py-16 space-y-10 md:space-y-14 max-w-4xl mx-auto">
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-[#f8842b] dark:text-[#f4c025]">Nuestra Misión</h3>
            <p className="leading-relaxed text-muted-foreground">
              Ofrecer una explosión de sabor en cada gomita, utilizando solo pulpa de fruta natural y los ingredientes más puros. Queremos ser tu opción saludable para un capricho delicioso y divertido.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-[#f8842b] dark:text-[#f4c025]">Nuestra Visión</h3>
            <p className="leading-relaxed text-muted-foreground">
              Convertirnos en la marca líder de gomitas naturales, inspirando momentos de alegría y bienestar en personas de todas las edades, mientras promovemos un estilo de vida consciente y saludable.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-[#f8842b] dark:text-[#f4c025]">El Comienzo</h3>
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <div
                className="w-full md:w-1/2 h-48 md:h-56 rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${beginningsImage})` }}
              />
              <p className="leading-relaxed text-muted-foreground flex-1">
                Todo comenzó en una pequeña cocina, con la idea de crear un dulce que nuestros hijos pudieran disfrutar sin culpas. Cansados de las golosinas artificiales, decidimos volver a lo básico: fruta de verdad. Lo que empezó como un hobby familiar pronto se convirtió en una pasión por compartir el sabor auténtico y natural con el mundo.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-[#f8842b] dark:text-[#f4c025]">Ingredientes que cuentan</h3>
            <div className="space-y-4">
              {highlights.map(({ icon: Icon, title, description }) => {
                return (
                  <div
                    key={title}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full text-[#f4c025] dark:bg-primary dark:text-zinc-900">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base md:text-lg">{title}</h4>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-[#f8842b] dark:text-[#f4c025]">Nuestro Equipo</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="flex flex-col items-center text-center space-y-2"
                >
                  <div
                    className="w-24 h-24 rounded-full bg-cover bg-center shadow"
                    style={{ backgroundImage: `url(${member.image})` }}
                  />
                  <p className="font-semibold text-sm md:text-base">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-card shadow-lg p-6 md:p-8 text-center space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold">¿Listo para probar nuestras gomitas?</h3>
            <p className="text-muted-foreground">
              Visita nuestra tienda y descubre todas las variaciones que tenemos listas para ti.
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-full text-base font-semibold bg-[#f4c025] text-zinc-900 hover:bg-[#f4c025]/90 dark:bg-primary dark:text-zinc-900 dark:hover:bg-primary/80"
            >
              <Link href="/catalog" className="flex items-center justify-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Ir a la tienda
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
