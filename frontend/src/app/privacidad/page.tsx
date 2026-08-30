import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata = { title: "Privacidad" };

export default function PrivacyPage() {
  return <><Navbar /><main className="max-w-content mx-auto px-4 py-10"><article className="max-w-3xl rounded-2xl bg-white dark:bg-dark-card border border-surface-200 dark:border-dark-border p-6 space-y-4"><h1 className="text-2xl font-extrabold">Privacidad y participación</h1><p>NaftaHoy publica precios declarados por fuentes oficiales y opiniones aportadas por visitantes. Las encuestas y valoraciones reflejan experiencias personales, no análisis técnicos de calidad del combustible.</p><p>Para prevenir abuso y medir interacciones podemos usar un identificador anónimo generado en tu navegador. No requiere nombre, correo ni registro y no se usa para identificarte personalmente.</p><p>Si se configura Google Analytics, se registran métricas agregadas de uso, como páginas visitadas, búsquedas e interacciones. No enviamos información personal ni coordenadas de ubicación a Analytics.</p><p>La publicidad puede registrar impresiones y clics con ese identificador anónimo para elaborar métricas de campaña. Podés eliminar los datos almacenados localmente desde la configuración de tu navegador.</p></article></main><Footer /></>;
}
