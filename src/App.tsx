import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Menu,
  MessageCircle,
  Phone,
  Plus,
  X,
} from "lucide-react";
import {
  about,
  contacts,
  faq,
  formSuccess,
  hero,
  prices,
  reviews,
  trips,
  whatsappLink,
} from "./data/content";
import { trackGoal } from "./analytics";

const leadEndpoint = import.meta.env.VITE_LEAD_ENDPOINT?.trim();
const leadTimeoutMs = 12_000;
type RequestStatus = "idle" | "sending" | "success" | "error";
const formValue = (data: FormData, key: string) =>
  String(data.get(key) ?? "").trim();
const suggestedTrips = trips;

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
  children = "Написать Эльбрусу",
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
      <ArrowUpRight size={20} aria-hidden="true" />
    </a>
  );
}
function App() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(0);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");
  const [requestMessage, setRequestMessage] = useState("");
  const sending = useRef(false);
  useEffect(() => setReady(true), []);
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
        <a className="brand" href="#main" aria-label="Эльбрус — в начало">
          <span className="brand__name">
            Эльбрус<span className="brand__dot">.</span>
          </span>
          <span className="brand__caption">Ваш человек в Осетии</span>
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
          <a href="#about" onClick={closeMenu}>
            Об Эльбрусе
          </a>
          <a href="#trips" onClick={closeMenu}>
            Куда поедем
          </a>
          <a href="#prices" onClick={closeMenu}>
            Стоимость
          </a>
          <a href="#contacts" onClick={closeMenu}>
            Связаться <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="hero wrap" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="eyebrow">
              <span className="location-dot" /> Северная Осетия · Из
              Владикавказа
            </p>
            <h1 id="hero-title">
              {hero.titleLines.map((line, index) => (
                <span
                  className={index === 0 ? "hero__place" : "hero__line"}
                  key={line}
                >
                  {line}
                  {index < hero.titleLines.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>
            <p className="hero__intro">{hero.subtitle}</p>
            <WhatsApp className="button--green">
              Обсудить поездку в WhatsApp
            </WhatsApp>
            <p className="hero__note">
              Вы, ваши близкие и местный проводник.
              <br />
              До 4 гостей · Свой маршрут · Без обязательной предоплаты
            </p>
          </div>
          <figure className="hero__landscape">
            <picture>
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
                alt="Горная река Фиагдон и склоны Северной Осетии"
                fetchPriority="high"
              />
            </picture>
            <figcaption>
              <span>Места, к которым хочется вернуться.</span>
              <span>Куртатинское ущелье</span>
            </figcaption>
            <a
              className="hero__down"
              href="#about"
              aria-label="Познакомиться с Эльбрусом"
            >
              <ArrowDown size={22} />
            </a>
          </figure>
        </section>
        <section
          className="about section wrap"
          id="about"
          aria-labelledby="about-title"
        >
          <figure className="about__portrait">
            <Photo
              image={about.portraits[0]}
              alt="Эльбрус приветствует гостей в горах Осетии"
            />
            <figcaption>
              <span>Эльбрус</span>
              <span>Родился и вырос в Верхнем Фиагдоне</span>
            </figcaption>
          </figure>
          <div className="about__copy">
            <p className="eyebrow">Местный проводник. Хороший собеседник.</p>
            <h2 id="about-title">
              Знакомьтесь,
              <br />
              Эльбрус.
              <br />
              <span className="muted-heading">Здесь он дома.</span>
            </h2>
            {about.paragraphs.map((p) => (
              <p className="body-large" key={p}>
                {p}
              </p>
            ))}
            <a className="text-link" href="#contacts">
              Познакомиться и договориться{" "}
              <ArrowUpRight size={19} aria-hidden="true" />
            </a>
          </div>
        </section>
        <section
          className="trips section"
          id="trips"
          aria-labelledby="trips-title"
        >
          <div className="wrap">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Куда поедем</p>
                <h2 id="trips-title">
                  У каждого —<br />
                  своя Осетия.
                </h2>
              </div>
              <p>
                Первый раз в горах или уже знаете, куда хочется? Возьмём за
                основу один из маршрутов или придумаем ваш.
              </p>
            </div>
            <div className="route-layout">
              <div
                className="route-view"
                id="route-view"
                aria-live="polite"
                aria-atomic="true"
              >
                <Photo
                  image={suggestedTrips[selectedTrip].image}
                  alt={suggestedTrips[selectedTrip].imageAlt}
                />
                <div className="route-view__caption">
                  <h3>{suggestedTrips[selectedTrip].title}</h3>
                  <p>{suggestedTrips[selectedTrip].text}</p>
                  <WhatsApp
                    className="button--cream"
                    message={`Эльбрус, здравствуйте! Интересует поездка: ${suggestedTrips[selectedTrip].title}. Подскажите, пожалуйста, маршрут и стоимость.`}
                  >
                    Хочу сюда
                  </WhatsApp>
                </div>
              </div>
              <div className="route-list" aria-label="Выбрать направление">
                {suggestedTrips.map((trip, index) => (
                  <button
                    type="button"
                    key={trip.title}
                    className={`route-option${selectedTrip === index ? " route-option--active" : ""}`}
                    aria-pressed={selectedTrip === index}
                    aria-controls="route-view"
                    onClick={() => {
                      setSelectedTrip(index);
                      if (window.matchMedia("(max-width: 620px)").matches) {
                        document.getElementById("route-view")?.scrollIntoView({
                          behavior: window.matchMedia(
                            "(prefers-reduced-motion: reduce)",
                          ).matches
                            ? "instant"
                            : "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    <span>
                      <span className="route-option__meta">{trip.note}</span>
                      <span className="route-option__name">{trip.title}</span>
                      <span className="route-option__format">
                        {trip.format}
                      </span>
                    </span>
                    <ArrowUpRight size={25} aria-hidden="true" />
                  </button>
                ))}
                <div className="route-custom">
                  <h3>А можно по-своему?</h3>
                  <p>
                    Конечно. Рассвет, семейный день, красивые места для фото или
                    поездка на несколько дней — расскажите, чего хочется.
                  </p>
                  <a
                    href={whatsappLink(
                      "Эльбрус, здравствуйте! Хочу обсудить свой маршрут по Осетии.",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                    onClick={() => trackGoal("click_whatsapp")}
                  >
                    Собрать свой маршрут{" "}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
            <noscript>
              <div className="nojs-routes">
                {trips.map((trip) => (
                  <article key={trip.title}>
                    <h3>{trip.title}</h3>
                    <p>{trip.text}</p>
                    <WhatsApp
                      className="button--cream"
                      message={`Эльбрус, здравствуйте! Интересует поездка: ${trip.title}. Подскажите, пожалуйста, маршрут и стоимость.`}
                    >
                      Обсудить маршрут
                    </WhatsApp>
                  </article>
                ))}
              </div>
            </noscript>
          </div>
        </section>
        <section className="road section wrap" aria-labelledby="road-title">
          <div className="road__copy">
            <p className="eyebrow">А между остановками — дорога</p>
            <h2 id="road-title">
              Смотреть в окно.
              <br />
              Слушать истории.
              <br />
              <span className="muted-heading">В своём ритме.</span>
            </h2>
            <p className="body-large">
              В дороге особенно ценишь человека рядом: внимательного, вежливого,
              с чувством юмора и любовью к этим горам.
            </p>
            <div className="road__facts">
              <div>
                <h3>В своей компании</h3>
                <p>
                  До 4 гостей, чистая машина и Эльбрус за рулём. Остановки и
                  темп обсудите вместе.
                </p>
              </div>
              <div>
                <h3>От встречи до возвращения</h3>
                <p>
                  Можно начать у отеля, на вокзале или в аэропорту. Нужен только
                  трансфер? Об этом тоже можно договориться.
                </p>
              </div>
            </div>
          </div>
          <figure className="road__video">
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
            <figcaption>Немного дороги — из настоящей поездки.</figcaption>
          </figure>
        </section>
        <section
          className="prices section"
          id="prices"
          aria-labelledby="prices-title"
        >
          <div className="wrap prices__layout">
            <div>
              <p className="eyebrow">О стоимости — открыто</p>
              <h2 id="prices-title">{prices.title}</h2>
              <p className="body-large">{prices.text}</p>
              <a
                className="text-link"
                href={contacts.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackGoal("click_whatsapp")}
              >
                Узнать стоимость моей поездки{" "}
                <ArrowUpRight size={19} aria-hidden="true" />
              </a>
            </div>
            <div className="price-sheet">
              <p className="price-sheet__label">
                Примерный бюджет на компанию до 4 гостей
              </p>
              <dl>
                {prices.items.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd data-qa-atomic>{value}</dd>
                  </div>
                ))}
              </dl>
              <p>{prices.note}</p>
              <span className="price-sheet__foot">
                Точную сумму согласуете до поездки.
              </span>
            </div>
          </div>
        </section>
        <section
          className="reviews section wrap"
          aria-labelledby="reviews-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">Слово гостям</p>
              <h2 id="reviews-title">
                О дороге.
                <br />И о человеке.
              </h2>
            </div>
            <p>Впечатления тех, кто уже ездил с Эльбрусом.</p>
          </div>
          <div className="review-list">
            {reviews.map((review) => (
              <figure className="review" key={review.name}>
                <span className="review__mark" aria-hidden="true">
                  “
                </span>
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
            <p className="eyebrow">Пара практических вопросов</p>
            <h2 id="faq-title">Перед дорогой.</h2>
          </div>
          <div className="faq__list">
            {faq.map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <Plus size={20} aria-hidden="true" />
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
              <p className="eyebrow">Большая поездка начинается с разговора</p>
              <h2 id="contacts-title">
                Ну что,
                <br />в Осетию?
              </h2>
              <p className="body-large">
                Напишите Эльбрусу, когда приезжаете, сколько вас и что хочется
                увидеть. Всё остальное обсудите вместе.
              </p>
              <WhatsApp className="button--cream">Написать в WhatsApp</WhatsApp>
              <div className="contact-links">
                <a
                  href={contacts.telegramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackGoal("click_telegram")}
                >
                  Telegram <ArrowUpRight size={16} aria-hidden="true" />
                </a>
                <a
                  href={contacts.phoneHref}
                  onClick={() => trackGoal("click_phone")}
                >
                  <Phone size={15} aria-hidden="true" />
                  {contacts.phoneLabel}
                </a>
              </div>
              <p className="contacts__note">
                Можно написать без готового маршрута.
                <br />
                Достаточно желания приехать.
              </p>
            </div>
            <div className="form-panel">
              <h3>Или оставьте пару слов здесь</h3>
              <p>
                {leadEndpoint
                  ? "Эльбрус получит заявку и свяжется с вами."
                  : "Подготовим сообщение — вам останется отправить его в WhatsApp."}
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
                  Когда планируете поездку
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
                    placeholder="Можно пока не знать — это тоже нормально"
                  />
                </label>
                <button
                  className="button button--cream request-form__wide"
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
        <style>{`.menu-toggle,.route-view,.route-list,.request-form{display:none!important}.nojs-routes{display:grid;grid-template-columns:1fr 1fr;gap:40px}.nojs-routes h3{font-size:30px}.nojs-routes p{margin:15px 0 20px}.form-panel{display:none}@media(max-width:620px){.header{height:auto;min-height:82px;flex-wrap:wrap;padding-block:20px;gap:14px}.nav{display:flex;position:static;flex-direction:row;flex-wrap:wrap;width:100%;gap:10px 22px;border:0;box-shadow:none;padding:0}.nav a{font-size:15px;min-height:35px}.nojs-routes{grid-template-columns:1fr}}`}</style>
      </noscript>
      <footer className="footer wrap">
        <a className="brand__name" href="#main">
          Эльбрус<span className="brand__dot">.</span>
        </a>
        <p>
          Индивидуальные поездки по Северной Осетии.
          <br />
          Из Владикавказа — навстречу горам.
          <br />
          <a
            href="https://github.com/ogelslamovuk/alania.fun/blob/master/image-credits.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Фотографии и авторы
          </a>
        </p>
        <a href="#main" className="text-link">
          В начало <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </footer>
      <a
        className="mobile-contact"
        href={contacts.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackGoal("click_whatsapp")}
      >
        <MessageCircle size={19} aria-hidden="true" />
        <span>Написать Эльбрусу</span>
        <ArrowUpRight size={18} aria-hidden="true" />
      </a>
    </>
  );
}
export default App;
