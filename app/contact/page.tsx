"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Mail, Phone, Facebook, Instagram, Twitter, CheckCircle2 } from "lucide-react";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const socials = [
  { name: "Facebook", href: "https://www.facebook.com/", icon: Facebook },
  { name: "Instagram", href: "https://www.instagram.com/", icon: Instagram },
  { name: "Twitter", href: "https://www.twitter.com/", icon: Twitter },
];

export default function ContactPage() {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    form.reset();
    setIsSuccessOpen(true);
  };

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1 px-6 py-10 md:py-16">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          <section className="text-center space-y-4">
            <h1 className="hidden md:block text-3xl font-bold md:text-4xl">Contáctanos</h1>
            <p className="text-muted-foreground">
              ¿Tienes alguna pregunta o comentario? Estamos aquí para ayudarte. Rellena el formulario o comunícate con nosotros a través de nuestros canales directos.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-muted/40 dark:bg-zinc-800/60 p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold">Información de Contacto</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <a
                  className="font-medium text-foreground hover:text-primary transition-colors"
                  href="mailto:hola@gummygrove.com"
                >
                  hola@gummygrove.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <a
                  className="font-medium text-foreground hover:text-primary transition-colors"
                  href="tel:+1234567890"
                >
                  +1 (234) 567-890
                </a>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Envíanos un mensaje</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="tu.email@ejemplo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Escribe tu consulta aquí..."
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-lg bg-[#f4c025] text-zinc-900 font-semibold py-3 shadow-md hover:bg-[#f4c025]/90 dark:bg-primary dark:text-zinc-900 dark:hover:bg-primary/80"
              >
                Enviar Mensaje
              </Button>
            </form>
          </section>

          <section className="text-center space-y-4 pb-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Síguenos en redes</h3>
              <p className="text-sm text-muted-foreground">
                Mantente al tanto de novedades, promociones y lanzamientos exclusivos.
              </p>
            </div>
            <div className="flex justify-center gap-6">
              {socials.map(({ name, href, icon: Icon }) => (
                <Link
                  key={name}
                  href={href}
                  aria-label={name}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon className="h-8 w-8" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      {isSuccessOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-success-title"
          aria-describedby="contact-success-description"
        >
          <div className="w-full max-w-sm mx-auto rounded-2xl bg-white text-zinc-900 p-8 shadow-2xl dark:bg-zinc-900 dark:text-zinc-100 flex flex-col items-center text-center gap-6">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/50">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 id="contact-success-title" className="text-2xl font-bold">
                ¡Mensaje enviado correctamente!
              </h2>
              <p id="contact-success-description" className="text-sm text-zinc-600 dark:text-zinc-400">
                Gracias por contactarnos. Te responderemos lo antes posible.
              </p>
            </div>
            <Button
              type="button"
              className="w-full rounded-lg bg-[#f4c025] text-zinc-900 font-semibold py-3 shadow-md hover:bg-[#f4c025]/90 dark:bg-primary dark:text-zinc-900 dark:hover:bg-primary/80"
              onClick={() => setIsSuccessOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
