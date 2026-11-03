import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function DirectoryPage({ title, description, items, breadcrumbs = [] }: { title: string; description: string; items: { label: string; href: string; detail?: string }[]; breadcrumbs?: { label: string; href?: string }[] }) {
  const trail = [...breadcrumbs, { label: title }];
  return <><Navbar /><main className="max-w-content mx-auto px-4 py-10"><nav className="flex flex-wrap gap-2 text-xs text-ink-3" aria-label="Breadcrumb"><Link href="/" className="hover:text-accent-ink dark:hover:text-accent">Inicio</Link>{trail.map((item, index) => <span key={`${item.label}-${index}`} className="flex gap-2"><span>/</span>{item.href ? <Link href={item.href} className="hover:text-accent-ink dark:hover:text-accent">{item.label}</Link> : <span className="text-ink-1 dark:text-ink-dark-1">{item.label}</span>}</span>)}</nav><h1 className="mt-5 text-3xl font-extrabold text-ink-1 dark:text-white">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-ink-2 dark:text-ink-dark-2">{description}</p><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <Link key={item.href} href={item.href} className="rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-accent dark:border-line-dark dark:bg-panel2-dark"><p className="font-bold text-ink-1 dark:text-ink-dark-1">{item.label}</p>{item.detail && <p className="mt-1 text-xs text-ink-3">{item.detail}</p>}</Link>)}</div></main><Footer /></>;
}
