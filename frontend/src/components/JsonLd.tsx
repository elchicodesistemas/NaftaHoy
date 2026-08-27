export default function JsonLd() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NaftaHoy",
    url: "https://naftahoy.com",
    description: "Consulta y comparación de precios de combustibles informados por fuentes oficiales en Argentina.",
    inLanguage: "es-AR",
  };

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "https://naftahoy.com" },
      { "@type": "ListItem", position: 2, name: "Precios de combustibles", item: "https://naftahoy.com/#precios" },
      { "@type": "ListItem", position: 3, name: "Mapa de estaciones", item: "https://naftahoy.com/#mapa" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }} />
    </>
  );
}
