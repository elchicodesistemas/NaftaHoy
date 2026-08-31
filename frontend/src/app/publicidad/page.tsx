import type { Metadata } from "next";
import { BarChart3, MapPin, MousePointerClick, Target } from "lucide-react";
import AdvertisingForm from "@/components/AdvertisingForm";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Anunciá en NaftaHoy",
  description: "Promocioná tu negocio ante conductores de todo el país que comparan precios y buscan estaciones de servicio.",
  alternates: { canonical: "/publicidad" },
};

const benefits = [
  { icon: Target, title: "Audiencia relevante", text: "Llegá a personas interesadas en combustibles, movilidad y cuidado del auto." },
  { icon: MapPin, title: "Alcance local o nacional", text: "Presentá tu propuesta en las zonas donde realmente ofrecés tus servicios." },
  { icon: MousePointerClick, title: "Espacios visibles", text: "Explorá formatos dentro del sitio para dar a conocer tu marca o promoción." },
  { icon: BarChart3, title: "Campañas medibles", text: "Podemos acompañar cada campaña con métricas de impresiones y clics." },
];

export default function AdvertisingPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface">
          <div className="mx-auto max-w-content px-4 py-14 text-center sm:py-20">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Publicidad en NaftaHoy</p>
            <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              Llegá a personas que están por comprar
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
              NaftaHoy ayuda a conductores de todo el país a comparar precios y encontrar estaciones de servicio.
            </p>
            <a href="#contacto" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white transition hover:brightness-110">
              Quiero publicitar mi negocio <MousePointerClick className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-content px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Tu negocio, frente a una audiencia en movimiento</h2>
            <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
              Si tenés un negocio relacionado con automóviles, combustibles, lubricantes, seguros, talleres, accesorios o servicios para conductores, podés promocionarte en NaftaHoy.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-dark-border dark:bg-dark-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-bold text-zinc-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{text}</p>
              </article>
            ))}
          </div>

          <div id="contacto" className="mx-auto mt-12 max-w-3xl scroll-mt-20 sm:mt-16">
            <AdvertisingForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
