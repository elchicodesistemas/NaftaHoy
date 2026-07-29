const newsItems = [
  { tag: "HACE 3 HORAS", title: "YPF ajustó precios un 2,3% en todo el país" },
  { tag: "HACE 5 HORAS", title: "Shell actualizó su lista de precios para CABA" },
  { tag: "AYER", title: "Cambios en impuestos a los combustibles" },
  { tag: "AYER", title: "Puma sumó 12 estaciones nuevas en GBA" },
];

export default function NewsGrid() {
  return (
    <section id="noticias" className="max-w-content mx-auto px-6 pt-9 pb-14">
      <h2 className="font-display text-[30px] tracking-wide uppercase text-ink-1 dark:text-ink-dark-1 mb-5">
        Últimas noticias
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {newsItems.map((item) => (
          <a
            key={item.title}
            href="#"
            className="bg-panel dark:bg-panel-dark border border-line dark:border-line-dark rounded-xl p-[18px] shadow-sm dark:shadow-none hover:border-accent transition-colors"
          >
            <span className="block text-[11px] font-bold tracking-wide text-accent-ink dark:text-accent mb-2">
              {item.tag}
            </span>
            <span className="block text-sm font-semibold text-ink-1 dark:text-ink-dark-1 leading-relaxed text-pretty">
              {item.title}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
