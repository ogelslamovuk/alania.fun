import { contacts, faq, siteUrl, trips } from "./data/content";

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      name: "alania.fun — поездки по Северной Осетии",
      url: siteUrl,
      inLanguage: "ru-RU",
    },
    {
      "@type": "WebPage",
      "@id": siteUrl,
      url: siteUrl,
      name: "Поездки по Северной Осетии из Владикавказа",
      isPartOf: { "@id": `${siteUrl}#website` },
      mainEntity: { "@id": `${siteUrl}#service` },
      primaryImageOfPage: `${siteUrl}images/og-ossetia.jpg`,
      inLanguage: "ru-RU",
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}#elbrus`,
      name: "Эльбрус",
      description: "Местный водитель и проводник, родился и вырос в Верхнем Фиагдоне. Показывает горы, рассказывает о культуре и истории Северной Осетии.",
      telephone: contacts.phoneHref.slice(4),
      homeLocation: { "@type": "Place", name: "Верхний Фиагдон, Северная Осетия — Алания" },
      knowsLanguage: "ru",
      image: `${siteUrl}images/elbrus-portrait-1.jpg`,
      url: `${siteUrl}#about`,
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}#service`,
      "name": "Индивидуальные поездки по Северной Осетии",
      "description": "Поездки по Осетии под ваши планы: на полдня, день или несколько дней, трансферы по всему Кавказу. Chevrolet Blazer с кожаным салоном, до 4 гостей. Заберём, покажем выбранные места и привезём обратно. Машина и сопровождение включены, еда и билеты отдельно.",
      "areaServed": [
        "Республика Северная Осетия — Алания",
        "Владикавказ",
        "Верхний Фиагдон",
        "Даргавс",
        "Кармадон",
        "Верхний Бирагзанг",
        "Мамисон",
        "Минеральные Воды",
        "Кавказ"
      ],
      "serviceType": [
        "Индивидуальные экскурсии",
        "Поездки в горы",
        "Трансферы по Кавказу",
        "Маршруты по Северной Осетии"
      ],
      "provider": { "@id": `${siteUrl}#elbrus` },
      "url": siteUrl
    },
    {
      "@type": "ItemList",
      "@id": `${siteUrl}#routes`,
      name: "Примеры маршрутов по Осетии",
      itemListElement: trips.map((trip, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: trip.title,
        description: trip.text,
        url: `${siteUrl}#trips`,
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}#faq`,
      mainEntity: faq.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}#breadcrumbs`,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "alania.fun — поездки по Северной Осетии",
          "item": siteUrl
        }
      ]
    },
  ],
};
