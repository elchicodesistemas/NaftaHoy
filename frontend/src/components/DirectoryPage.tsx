import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function DirectoryPage({ title, description, items }: { title: string; description: string; items: { label: string; href: string; detail?: string }[] }) {
  return <><Navbar /><main className="max-w-content mx-auto px-4 py-10"><nav className="text-xs text-zinc-500"><Link href="/">Inicio</Link> / {title}</nav><h1 className="mt-5 text-3xl font-extrabold text-zinc-900 dark:text-white">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <Link key={item.href} href={item.href} className="rounded-2xl border border-surface-200 bg-white p-5 transition-colors hover:border-brand-primary dark:border-dark-border dark:bg-dark-card"><p className="font-bold text-zinc-800 dark:text-zinc-100">{item.label}</p>{item.detail && <p className="mt-1 text-xs text-zinc-500">{item.detail}</p>}</Link>)}</div></main><Footer /></>;
}
