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

const ingredientsImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCAk6yZe-55sgglVhAwl25qPuIGfXyk46Ir-37ARyvkMnCchiCWEM6Lvgft-zwVO-idso-UwUpm8m5xb77N9cMcXD9O9I_GwIMloJWGVhC63SajKC04y14bawanOvhUgrGqMv0DU5oyi9hYjMWpXlzyjBjjq40gSqnYtDNR14jAxGEvVTnRujdILBFjKyE8CTAe2NKUl8irkaDkUFhkzzq_bJjUKEOJKPnhzOMAYBgWTv4JggrsI1b6KrOuy_zohwgCw1NNo60O0Xu0";

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
    title: "Ingredientes Seleccionados",
    description: "Trabajamos con fruta madura y proveedores locales para preservar su sabor real.",
  },
  {
    icon: HeartPulse,
    title: "Saludable y Delicioso",
    description: "Endulzadas naturalmente con la propia fruta, sin colorantes ni sabores artificiales.",
  },
  {
    icon: ShoppingBag,
    title: "Proceso Artesanal",
    description: "Cocinamos lento, moldeamos a mano y empaquetamos con cariño cada lote.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        <section
          className="relative h-72 w-full bg-cover bg-center overflow-hidden rounded-3xl max-w-5xl mx-auto mt-6 md:mt-12 mb-8 md:mb-3"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent dark:from-background/90 dark:via-background/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-transparent dark:from-background/80 dark:via-transparent" />
          <div className="absolute inset-0 bg-white/25 backdrop-blur-sm dark:bg-transparent dark:backdrop-blur-0" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center space-y-3 max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold text-primary drop-shadow-sm">
                Sobre Nosotros
              </h2>
              <p className="text-sm md:text-base text-muted-foreground font-medium">
                Hecho con amor y fruta de verdad
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 md:py-16 space-y-10 md:space-y-14 max-w-5xl mx-auto">
          <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-12 md:rounded-3xl md:bg-card/80 md:shadow-lg md:p-10">
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-[#f8842b] dark:text-[#f4c025]">Nuestra Misión</h3>
              <p className="leading-relaxed text-muted-foreground">
                Crear las gomitas más deliciosas y saludables del mercado utilizando únicamente pulpa de fruta 100% natural. Buscamos ofrecer una alternativa honesta y transparente, libre de aditivos artificiales, para que cada bocado sea una experiencia de sabor puro y alegría, nutriendo a nuestros clientes y al planeta.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-[#f8842b] dark:text-[#f4c025]">Nuestra Visión</h3>
              <p className="leading-relaxed text-muted-foreground">
               Aspiramos a ser la marca líder y de mayor confianza en snacks de fruta natural a nivel global. Soñamos con un futuro en el que Gummy Co. sea sinónimo de calidad, sostenibilidad e innovación, inspirando a personas de todas las edades a elegir opciones más saludables y a conectarse con la verdadera esencia de la naturaleza.
              </p>
            </div>
          </div>

          <div className="grid gap-10 md:grid-cols-2 md:items-stretch">
            <div className="space-y-4 md:space-y-6 p-0 md:p-10 md:rounded-3xl md:bg-card/80 md:shadow-lg md:min-h-[16rem] flex flex-col md:justify-center order-1">
              <h3 className="text-2xl md:text-3xl font-bold text-[#f8842b] dark:text-[#f4c025]">Nuestra Historia</h3>
              <div
                className="h-48 rounded-xl bg-cover bg-center md:hidden"
                style={{ backgroundImage: `url(${beginningsImage})` }}
              />
              <p className="leading-relaxed text-muted-foreground">
                Todo comenzó en la cocina de nuestra abuela, donde aprendimos el arte de transformar frutas frescas en delicias irresistibles. Fascinados por los sabores puros y la alegría que un simple dulce podía traer, decidimos compartir nuestra pasión con el mundo. Gummy Co. nació del deseo de volver a lo básico: ingredientes reales, recetas sencillas y un amor incondicional por la fruta. Cada gomita es un pedacito de esa tradición familiar, hecha con el mismo cuidado y dedicación de siempre.
              </p>
            </div>
            <div className="hidden md:block md:rounded-3xl md:overflow-hidden md:bg-card/80 md:shadow-lg md:min-h-[16rem] order-2">
              <div
                className="h-48 md:h-full md:min-h-[16rem] bg-cover bg-center"
                style={{ backgroundImage: `url(${beginningsImage})` }}
              />
            </div>
          </div>

          <div className="rounded-3xl bg-card/80 shadow-lg p-6 md:p-10 space-y-4 md:hidden">
            <h3 className="text-2xl md:text-3xl font-bold text-[#f8842b] dark:text-[#f4c025]">Ingredientes que cuentan</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background/80 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8842b]/10 text-[#f4c025]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base md:text-lg">{title}</h4>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:grid gap-10 md:grid-cols-2 md:items-stretch">
            <div className="rounded-xl md:rounded-3xl overflow-hidden order-1 md:order-none md:bg-card/80 md:shadow-lg md:min-h-[16rem]">
              <div
                className="h-48 md:h-full md:min-h-[16rem] bg-cover bg-center"
                style={{ backgroundImage: `url(${ingredientsImage})` }}
              />
            </div>
            <div className="space-y-4 order-2 md:order-none flex flex-col md:justify-center md:min-h-[16rem] p-0 md:px-6 md:py-8 md:rounded-3xl md:bg-card/80 md:shadow-lg">
              <div className="space-y-4 w-full">
                <h3 className="text-2xl md:text-3xl font-bold text-[#f8842b] dark:text-[#f4c025]">Ingredientes y Proceso</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Seleccionamos cada ingrediente pensando en su origen, estacionalidad y valor nutritivo. Creemos en la transparencia, por eso contamos la historia de nuestra fruta y trabajamos con aliados que comparten nuestra pasión por lo natural.
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  Lavamos, pelamos y preparamos la fruta a mano para conservar su frescura. Cocinamos en pequeñas cantidades y dejamos reposar cada lote para lograr la textura perfecta sin conservantes artificiales.
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  Cada gomita se corta con precisión y se empaca al instante, garantizando que llegue a ti con la máxima calidad, frescura y cariño.
                </p>
              </div>
              <div className="hidden md:flex">
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center rounded-full bg-[#f4c025] px-6 py-3 text-base font-semibold text-zinc-900 transition hover:bg-[#f4c025]/90"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Conoce Nuestros Sabores
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6 md:hidden">
            <h3 className="text-2xl font-bold text-[#f8842b] dark:text-[#f4c025]">Nuestro Equipo</h3>
            <div className="grid grid-cols-2 gap-6">
              {teamMembers.map((member) => (
                <div key={member.name} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className="w-20 h-20 rounded-full bg-cover bg-center shadow"
                    style={{ backgroundImage: `url(${member.image})` }}
                  />
                  <p className="font-semibold text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-card shadow-lg p-6 md:p-8 text-center space-y-4 md:hidden">
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

      <div className="hidden md:block">
        <PublicFooter />
      </div>
    </div>
  );
}
