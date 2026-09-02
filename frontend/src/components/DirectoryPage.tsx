import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function DirectoryPage({ title, description, items, breadcrumbs = [] }: { title: string; description: string; items: { label: string; href: string; detail?: string }[]; breadcrumbs?: { label: string; href?: string }[] }) {
  const trail = [...breadcrumbs, { label: title }];
  return <><Navbar /><main className="max-w-content mx-auto px-4 py-10"><nav className="flex flex-wrap gap-2 text-xs text-zinc-500" aria-label="Breadcrumb"><Link href="/" className="hover:text-brand-dark">Inicio</Link>{trail.map((item, index) => <span key={`${item.label}-${index}`} className="flex gap-2"><span>/</span>{item.href ? <Link href={item.href} className="hover:text-brand-dark">{item.label}</Link> : <span className="text-zinc-700 dark:text-zinc-200">{item.label}</span>}</span>)}</nav><h1 className="mt-5 text-3xl font-extrabold text-zinc-900 dark:text-white">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <Link key={item.href} href={item.href} className="rounded-2xl border border-surface-200 bg-white p-5 transition-colors hover:border-brand-primary dark:border-dark-border dark:bg-dark-card"><p className="font-bold text-zinc-800 dark:text-zinc-100">{item.label}</p>{item.detail && <p className="mt-1 text-xs text-zinc-500">{item.detail}</p>}</Link>)}</div></main><Footer /></>;
}
