import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Play,
  Plus,
  X,
} from "lucide-react";
import {
  about,
  bookingSteps,
  contacts,
  faq,
  faqTitle,
  formSuccess,
  hero,
  prices,
  reviews,
  trips,
  tripsIntro,
  whatsappLink,
} from "./data/content";
import { trackGoal } from "./analytics";

const leadEndpoint = import.meta.env.VITE_LEAD_ENDPOINT?.trim();
const leadTimeoutMs = 12_000;
type RequestStatus = "idle" | "sending" | "success" | "error";
const formValue = (data: FormData, key: string) =>
  String(data.get(key) ?? "").trim();

function Photo({
  image,
  alt,
  className = "",
}: {
  image: typeof hero.image;
  alt: string;
  className?: string;
}) {
  return (
    <picture className={className}>
      <source srcSet={image.webp} type="image/webp" />
      <img
        src={image.jpg}
        width={image.width}
        height={image.height}
        alt={alt}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
function WhatsApp({
  children = "Написать в WhatsApp",
  className = "",
  message,
}: {
  children?: React.ReactNode;
  className?: string;
  message?: string;
}) {
  return (
    <a
      className={`button ${className}`}
      href={message ? whatsappLink(message) : contacts.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackGoal("click_whatsapp")}
    >
      <span>{children}</span>
      <ArrowUpRight size={19} aria-hidden="true" />
    </a>
  );
}

function App() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileContactsHidden, setMobileContactsHidden] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");
  const [requestMessage, setRequestMessage] = useState("");
  const sending = useRef(false);
  useEffect(() => setReady(true), []);
  useEffect(() => {
    const visibleSections = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleSections.add(entry.target);
        else visibleSections.delete(entry.target);
      }
      setMobileContactsHidden(visibleSections.size > 0);
    });
    for (const id of ["faq", "contacts"]) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formValue(formData, "name"),
      contact: formValue(formData, "contact"),
      date: formValue(formData, "date"),
      guests: formValue(formData, "guests"),
      message: formValue(formData, "message"),
      source: "co_elbrus_landing",
      page: window.location.origin + window.location.pathname,
    };
    if (!payload.name || !payload.contact) {
      setRequestStatus("error");
      setRequestMessage("Укажите имя и контакт для связи.");
      return;
    }
    if (!leadEndpoint) {
      setRequestStatus("idle");
      setRequestMessage("");
      const details = [
        "Эльбрус, здравствуйте! Хочу обсудить поездку по Осетии.",
        `Имя: ${payload.name}`,
        `Контакт: ${payload.contact}`,
        payload.date && `Дата: ${payload.date}`,
        payload.guests && `Гостей: ${payload.guests}`,
        payload.message && `Пожелания: ${payload.message}`,
      ];
      trackGoal("click_whatsapp");
      window.open(
        whatsappLink(details.filter(Boolean).join("\n")),
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }
    sending.current = true;
    setRequestStatus("sending");
    setRequestMessage("");
    try {
      const response = await fetch(leadEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(leadTimeoutMs),
      });
      if (!response.ok || (await response.json())?.ok !== true)
        throw new Error("Unconfirmed lead delivery");
      setRequestStatus("success");
      setRequestMessage(formSuccess);
      form.reset();
      trackGoal("submit_form");
    } catch {
      setRequestStatus("error");
      setRequestMessage(
        "Не удалось подтвердить отправку. Напишите Эльбрусу в WhatsApp или позвоните ему.",
      );
    } finally {
      sending.current = false;
    }
  };
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a className="skip-link" href="#main">
        Перейти к содержанию
      </a>
      <header className="header wrap">
        <a className="brand" href="#main" aria-label="alania.fun — в начало">
          <span className="brand__name">
            alania<span>.fun</span>
          </span>
          <span className="brand__caption">Северная Осетия</span>
        </a>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav
          className={`nav${menuOpen ? " nav--open" : ""}`}
          id="main-nav"
          aria-label="Главная навигация"
        >
          <a href="#trips" onClick={closeMenu}>
            Маршруты
          </a>
          <a href="#prices" onClick={closeMenu}>
            Стоимость
          </a>
          <a href="#reviews" onClick={closeMenu}>
            Отзывы
          </a>
          <a className="nav__contact" href="#contacts" onClick={closeMenu}>
            Контакты <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </nav>
        <div
          className="header-contactbar"
          aria-label="Прямая связь с Эльбрусом"
        >
          <a
            className="header-phone"
            href={contacts.phoneHref}
            onClick={() => trackGoal("click_phone")}
          >
            <Phone size={16} aria-hidden="true" />
            {contacts.phoneLabel}
          </a>
          <a
            className="header-messenger"
            href={contacts.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGoal("click_whatsapp")}
          >
            WhatsApp
          </a>
          <a
            className="header-messenger"
            href={contacts.telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGoal("click_telegram")}
          >
            Telegram
          </a>
        </div>
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <picture className="hero__photo">
            <source
              media="(max-width: 700px)"
              type="image/avif"
              srcSet={hero.mobileAvif}
            />
            <source type="image/avif" srcSet={hero.avif} />
            <source
              media="(max-width: 700px)"
              type="image/webp"
              srcSet={hero.mobileWebp}
            />
            <source type="image/webp" srcSet={hero.image.webp} />
            <img
              src={hero.image.jpg}
              width={hero.image.width}
              height={hero.image.height}
              alt={hero.imageAlt}
              fetchPriority="high"
            />
          </picture>
          <div className="hero__content">
            <p className="hero__location">
              <MapPin size={16} aria-hidden="true" />
              {hero.caption}
            </p>
            <h1 id="hero-title">{hero.title}</h1>
            <p className="hero__intro">{hero.subtitle}</p>
            <div className="hero__actions">
              <WhatsApp className="button--light">
                Обсудить поездку в WhatsApp
              </WhatsApp>
              <a className="hero__explore" href="#trips">
                Выбрать маршрут <ArrowDown size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
          <span className="hero__photo-note">Летняя Дигория</span>
        </section>
        <div className="trip-facts wrap">
          {hero.facts.map((fact) => (
            <span key={fact}>
              <Check size={17} aria-hidden="true" />
              {fact}
            </span>
          ))}
        </div>

        <section
          className="trips section wrap"
          id="trips"
          aria-labelledby="trips-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">Маршруты из Владикавказа</p>
              <h2 id="trips-title">Куда поехать</h2>
            </div>
            <p>{tripsIntro}</p>
          </div>
          <div className="route-grid">
            {trips.map((trip, index) => (
              <article className="route-card" key={trip.title}>
                <div className="route-card__photo">
                  <Photo image={trip.image} alt={trip.imageAlt} />
                  <span className="route-card__number">0{index + 1}</span>
                  {trip.illustration && (
                    <span className="route-card__illustration">Иллюстрация</span>
                  )}
                  <span className="route-card__tag">{trip.note}</span>
                </div>
                <div className="route-card__content">
                  <h3>{trip.title}</h3>
                  <p>{trip.text}</p>
                  <div className="route-card__bottom">
                    <span className="route-card__format">{trip.format}</span>
                    <a
                      className="route-card__cta"
                      href={whatsappLink(
                        `Эльбрус, здравствуйте! Интересует поездка: ${trip.title}. Подскажите, пожалуйста, маршрут, время выезда и стоимость.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackGoal("click_whatsapp")}
                    >
                      Обсудить маршрут{" "}
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="route-custom">
            <p>
              <strong>Уже знаете, куда хотите?</strong> Можно обсудить свой
              маршрут, трансфер или поездку на несколько дней.
            </p>
            <a
              className="text-link"
              href={whatsappLink(
                "Эльбрус, здравствуйте! Хочу обсудить свой маршрут по Осетии.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackGoal("click_whatsapp")}
            >
              Предложить маршрут <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section
          className="prices section"
          id="prices"
          aria-labelledby="prices-title"
        >
          <div className="wrap prices__layout">
            <div className="prices__intro">
              <p className="eyebrow">Бюджет поездки</p>
              <h2 id="prices-title">{prices.title}</h2>
              <p>{prices.text}</p>
              <a
                className="text-link"
                href={contacts.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackGoal("click_whatsapp")}
              >
                Узнать стоимость <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
            <div className="price-sheet">
              <dl>
                {prices.items.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd data-qa-atomic="amount">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="price-sheet__notes">
                <p>
                  <Check size={17} aria-hidden="true" />
                  {prices.included}
                </p>
                <p>{prices.extra}</p>
                <p>{prices.note}</p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="about section wrap"
          id="about"
          aria-labelledby="about-title"
        >
          <Photo
            className="about__portrait"
            image={about.portrait}
            alt="Эльбрус — местный водитель и проводник"
          />
          <div className="about__copy">
            <h2 id="about-title">{about.title}</h2>
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <details className="road-video">
              <summary>
                <Play size={15} aria-hidden="true" />
                Короткое видео горной дороги{" "}
                <Plus size={16} aria-hidden="true" />
              </summary>
              <video
                controls
                playsInline
                preload="none"
                poster="./images/ossetia-road-poster.webp"
                aria-label="Короткое видео горной дороги в Осетии"
              >
                <source src="./videos/ossetia-road.mp4" type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
            </details>
          </div>
        </section>

        <section
          className="reviews section wrap"
          id="reviews"
          aria-labelledby="reviews-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">После поездки</p>
              <h2 id="reviews-title">Отзывы гостей</h2>
            </div>
          </div>
          <div className="review-list">
            {reviews.map((review) => (
              <figure className="review" key={review.name}>
                <blockquote>
                  <p>{review.text}</p>
                </blockquote>
                <figcaption>
                  <span>{review.name}</span>
                  <span>{review.city}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section
          className="faq section wrap"
          id="faq"
          aria-labelledby="faq-title"
        >
          <div>
            <p className="eyebrow">Перед выездом</p>
            <h2 id="faq-title">{faqTitle}</h2>
          </div>
          <div className="faq__list">
            {faq.map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <Plus size={19} aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          className="contacts section"
          id="contacts"
          aria-labelledby="contacts-title"
        >
          <div className="wrap contacts__layout">
            <div className="contacts__copy">
              <p className="eyebrow">Эльбрус · водитель и проводник</p>
              <h2 id="contacts-title">{contacts.title}</h2>
              <a
                className="contacts__phone"
                href={contacts.phoneHref}
                onClick={() => trackGoal("click_phone")}
              >
                <Phone size={24} aria-hidden="true" />
                {contacts.phoneLabel}
              </a>
              <p className="contacts__intro">{contacts.text}</p>
              <div className="contact-buttons">
                <WhatsApp className="button--light">WhatsApp</WhatsApp>
                <a
                  className="button button--outline"
                  href={contacts.telegramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackGoal("click_telegram")}
                >
                  Telegram <ArrowUpRight size={19} aria-hidden="true" />
                </a>
              </div>
              <ol className="booking-steps">
                {bookingSteps.map((step) => (
                  <li key={step.title}>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="form-panel">
              <h3>Или оставьте заявку</h3>
              <p>
                {leadEndpoint
                  ? "Оставьте контакт — Эльбрус свяжется с вами."
                  : "Подготовим сообщение для WhatsApp. Отправить его нужно будет самостоятельно."}
              </p>
              <form
                className="request-form"
                method="post"
                onSubmit={handleSubmit}
              >
                <label>
                  Ваше имя
                  <input
                    name="name"
                    type="text"
                    placeholder="Как к вам обращаться"
                    autoComplete="name"
                    maxLength={120}
                    required
                  />
                </label>
                <label>
                  Телефон или мессенджер
                  <input
                    name="contact"
                    type="text"
                    placeholder="+7 … или @telegram"
                    maxLength={120}
                    required
                  />
                </label>
                <label>
                  Дата поездки
                  <input name="date" type="date" />
                </label>
                <label>
                  Сколько вас
                  <input
                    name="guests"
                    type="number"
                    min="1"
                    max="4"
                    placeholder="От 1 до 4"
                  />
                </label>
                <label className="request-form__wide">
                  Что хочется увидеть
                  <textarea
                    name="message"
                    rows={3}
                    maxLength={1500}
                    placeholder="Места или пожелания к поездке"
                  />
                </label>
                <button
                  className="button button--green request-form__wide"
                  type="submit"
                  disabled={!ready || requestStatus === "sending"}
                >
                  <span>
                    {requestStatus === "sending"
                      ? "Отправляем…"
                      : leadEndpoint
                        ? "Отправить заявку"
                        : "Продолжить в WhatsApp"}
                  </span>
                  <ArrowRight size={19} aria-hidden="true" />
                </button>
                <p
                  className={`form-message request-form__wide${requestStatus === "error" ? " form-message--error" : ""}`}
                  role="status"
                >
                  {requestMessage}
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>
      <noscript>
        <style>{`.menu-toggle,.form-panel{display:none!important}.nav{display:flex!important;position:static!important;flex-wrap:wrap;background:transparent!important}.header{height:auto!important;min-height:82px;flex-wrap:wrap;padding-block:16px;gap:16px}.nav a{padding:6px 0!important}@media(max-width:700px){.nav{width:100%;gap:12px 22px!important;flex-direction:row;order:3;border:0;box-shadow:none;padding:0}.nav a{font-size:15px}.mobile-contact{position:static!important;margin:0 16px 16px}.footer{padding-bottom:27px}}`}</style>
      </noscript>
      <footer className="footer wrap">
        <a className="brand__name" href="#main">
          alania<span>.fun</span>
        </a>
        <p>Индивидуальные поездки по Северной Осетии</p>
        <a
          href="https://github.com/ogelslamovuk/alania.fun/blob/master/image-credits.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          Фотографии и авторы <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </footer>
      <div
        className="mobile-contact"
        hidden={mobileContactsHidden}
        aria-label="Связаться напрямую"
      >
        <a
          href={contacts.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackGoal("click_whatsapp")}
        >
          <MessageCircle size={19} aria-hidden="true" />
          WhatsApp
        </a>
        <a href={contacts.phoneHref} onClick={() => trackGoal("click_phone")}>
          <Phone size={18} aria-hidden="true" />
          Позвонить
        </a>
      </div>
    </>
  );
}
export default App;
