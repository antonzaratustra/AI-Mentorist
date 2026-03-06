"use client";

import { useState } from "react";

const modules = [
  {
    id: "profile",
    label: "Профиль",
    eyebrow: "Колесо баланса",
    title: "Центральный профиль с ресурсами, связями и смыслами",
    description:
      "Базовый экран Mentorist: четыре сферы жизни, фон из семантического ядра, энергии и переходы в остальные модули.",
  },
  {
    id: "former",
    label: "Формер",
    eyebrow: "Внутренний контур",
    title: "Формирование видения, миссии, ценностей и личной истории",
    description:
      "Приватный конструктор внутренней стратегии с письмом из будущего, SWOT, мотиватором и лентой значимых событий.",
  },
  {
    id: "goals",
    label: "Цели",
    eyebrow: "Локус контроля",
    title: "Майндкарта целей и недельный планнер",
    description:
      "Связи между целями, радиус планирования и ежедневные слоты из разных сфер жизни для сохранения баланса.",
  },
  {
    id: "constructor",
    label: "Конструктор",
    eyebrow: "SMARTER",
    title: "Постановка цели через этапы, ресурсы и пары",
    description:
      "Прототип конструктора цели с экологичностью, критериями выполнения, вложением менто и выбором ментора/мэйдея.",
  },
  {
    id: "contacts",
    label: "Контакты",
    eyebrow: "Сеть наставничества",
    title: "Менторы, мэйдеи и социальная карта прогресса",
    description:
      "Граф связей по общим целям, контекстные сравнения колеса баланса и быстрый доступ к сообщениям.",
  },
  {
    id: "feed",
    label: "Лента",
    eyebrow: "События и посты",
    title: "Напоминания, события и шестигранная сетка контента",
    description:
      "Лента делится на несколько режимов внимания: напоминания, чат, события и посты групп по сферам жизни.",
  },
  {
    id: "groups",
    label: "Группы",
    eyebrow: "Коллективный слой",
    title: "Группы по сферам жизни с автомодерацией и статистикой",
    description:
      "Четыре потока групп, семантическое ядро каждого сообщества и отбор постов через полезность и голосование.",
  },
];

const spheres = [
  { label: "Здоровье", score: 72, color: "#9ce24d" },
  { label: "Отношения", score: 64, color: "#ff7f5c" },
  { label: "Развитие", score: 81, color: "#52d6ff" },
  { label: "Дело", score: 69, color: "#ffc247" },
];

const energies = [
  {
    label: "Интеллект",
    short: "IN",
    value: 78,
    detail: "Контент, анализ, полезные выводы",
    color: "#52d6ff",
  },
  {
    label: "Активность",
    short: "AK",
    value: 65,
    detail: "Действия, этапы, выполнение плана",
    color: "#9ce24d",
  },
  {
    label: "Информативность",
    short: "IF",
    value: 59,
    detail: "Реакция сообщества и качество постов",
    color: "#ffb443",
  },
  {
    label: "Менто",
    short: "ME",
    value: 84,
    detail: "Главная валюта сервиса и доверия",
    color: "#ff6b7a",
  },
];

const abilities = [
  "Лингвобомба",
  "Фокус недели",
  "Разгон энергии",
  "Смена оптики",
];

const semanticWords = [
  "миссия",
  "цели",
  "баланс",
  "наставничество",
  "энергия",
  "смысл",
  "ритм",
  "действие",
  "роль",
  "опыт",
  "связи",
  "навыки",
];

const formerTabs = [
  { label: "Письмо из будущего", fill: 94 },
  { label: "Ценности", fill: 88 },
  { label: "SWOT", fill: 76 },
  { label: "Антимотиватор", fill: 69 },
  { label: "Мотиватор", fill: 82 },
  { label: "Агрегатор", fill: 57 },
  { label: "Миссия", fill: 91 },
  { label: "Роли", fill: 74 },
  { label: "Лайфхаки", fill: 62 },
];

const formerTimeline = [
  {
    date: "12 апреля",
    title: "Письмо из будущего обновлено",
    text: "Видение на 3 года переформулировано вокруг темы образования и полезного контента.",
    accent: "#52d6ff",
  },
  {
    date: "16 апреля",
    title: "Новая цель в сфере здоровья",
    text: "Цель привязана к роли наставника и к утреннему ритуалу недели.",
    accent: "#9ce24d",
  },
  {
    date: "18 апреля",
    title: "Сохранен лайфхак из группы",
    text: "Материал прикреплен к этапу в конструкторе и добавлен в агрегатор.",
    accent: "#ffc247",
  },
  {
    date: "20 апреля",
    title: "Мэйдей завершил этап",
    text: "История автоматически обновила очки менто и подсветила успешный цикл.",
    accent: "#ff6b7a",
  },
];

const goalWeek = [
  { day: "Пн", date: 9, tasks: ["Пробежка", "Разбор курса", "Созвон с мэйдеем"] },
  { day: "Вт", date: 10, tasks: ["Статья в группу", "Тренировка", "Недельный обзор"] },
  { day: "Ср", date: 11, tasks: ["Свободный слот", "Семейный вечер", "Рефлексия"] },
  { day: "Чт", date: 12, tasks: ["Интервальный бег", "Письмо из будущего", "Контроль бюджета"] },
  { day: "Пт", date: 13, tasks: ["Пост о прогрессе", "Менторский чат", "Растяжка"] },
  { day: "Сб", date: 14, tasks: ["Глубокая работа", "Подготовка этапов", "Прогулка"] },
  { day: "Вс", date: 16, tasks: ["Обзор недели", "Планнер", "Отдых без шума"] },
];

const orbitGoals = [
  { label: "Утренний бег", state: "active", x: 50, y: 19, color: "#9ce24d" },
  { label: "Курс по редактуре", state: "queued", x: 77, y: 42, color: "#52d6ff" },
  { label: "Семейный ритуал", state: "active", x: 62, y: 76, color: "#ff7f5c" },
  { label: "Система заметок", state: "queued", x: 25, y: 52, color: "#ffc247" },
];

const constructorSteps = [
  { id: "1", label: "Выбор", status: "done" },
  { id: "2", label: "Постановка", status: "done" },
  { id: "3", label: "Ресурсы", status: "current" },
  { id: "4", label: "Пары", status: "upcoming" },
];

const constructorChecks = [
  { key: "S", label: "Specific", note: "Сформулирована конкретно через измеримое действие." },
  { key: "M", label: "Measurable", note: "Есть критерий завершения и числовой маркер." },
  { key: "A", label: "Accountability", note: "Назначены ментор и мэйдей для обратной связи." },
  { key: "R", label: "Realistic", note: "Ресурсы соотносятся с текущим состоянием энергий." },
  { key: "T", label: "Time based", note: "Срок и ритм этапов привязаны к планнеру." },
  { key: "E", label: "Exciting", note: "Цель подкреплена мотиватором и антимотиватором." },
  { key: "R2", label: "Recorded", note: "Все этапы сохранены и доступны для шаблонизации." },
];

const contacts = [
  { id: "u1", name: "Рой Фрэнк", role: "ментор", x: 24, y: 26, accent: "#52d6ff" },
  { id: "u2", name: "Уолтер Уайт", role: "мэйдей", x: 68, y: 20, accent: "#9ce24d" },
  { id: "u3", name: "Скайлер", role: "ментор", x: 78, y: 58, accent: "#ff7f5c" },
  { id: "u4", name: "Луизана", role: "мэйдей", x: 42, y: 76, accent: "#ffc247" },
  { id: "u5", name: "Майя", role: "связь группы", x: 14, y: 60, accent: "#8a8fff" },
];

const contactLinks = [
  ["u1", "u2"],
  ["u1", "u4"],
  ["u2", "u3"],
  ["u4", "u3"],
  ["u5", "u1"],
];

const posts = [
  {
    title: "Как сделать утренний ритуал устойчивым",
    type: "гайд",
    sphere: "Здоровье",
    stats: "723",
    color: "#9ce24d",
  },
  {
    title: "Шаблон недельного обзора для мэйдея",
    type: "инсайт",
    sphere: "Развитие",
    stats: "347",
    color: "#52d6ff",
  },
  {
    title: "Секретный пост: перезапуск фокуса",
    type: "secret",
    sphere: "Дело",
    stats: "15K",
    color: "#ffc247",
  },
  {
    title: "Голосование: какой этап буксует",
    type: "vote",
    sphere: "Отношения",
    stats: "54",
    color: "#ff7f5c",
  },
  {
    title: "Как прикреплять лайфхаки к целям",
    type: "гайд",
    sphere: "Развитие",
    stats: "865",
    color: "#8a8fff",
  },
  {
    title: "Ментор недели и его разбор ошибок",
    type: "story",
    sphere: "Дело",
    stats: "97",
    color: "#52d6ff",
  },
];

const reminders = [
  { time: "08:00", title: "Пробежка", detail: "Цель: бегать по утрам", color: "#9ce24d" },
  { time: "10:00", title: "100 складок", detail: "Этап здоровья и формы", color: "#52d6ff" },
  { time: "12:30", title: "Позвонить домой", detail: "Цель: хорошие отношения с семьей", color: "#ff7f5c" },
];

const events = [
  "Мэйдей завершил этап и поднял рейтинг пары.",
  "В ленте группы появился новый шаблон недельного обзора.",
  "Стикер за полезный пост добавлен в коллекцию формера.",
  "Новая цель по навыкам требует 16 единиц менто.",
];

const groupLanes = [
  {
    title: "Здоровье и энергия",
    color: "#9ce24d",
    groups: ["Пробежки по утрам", "Сон без хаоса", "Осознанная еда"],
  },
  {
    title: "Отношения и семья",
    color: "#ff7f5c",
    groups: ["Семейные ритуалы", "Чистая коммуникация", "Теплые созвоны"],
  },
  {
    title: "Развитие и навыки",
    color: "#52d6ff",
    groups: ["Редакторская мастерская", "НЛП и ценности", "Антипрокрастинация"],
  },
  {
    title: "Дело и деньги",
    color: "#ffc247",
    groups: ["Личная стратегия", "Монетизация опыта", "Системный фокус"],
  },
];

function SectorMeter() {
  return (
    <div className="balance-ring">
      <div className="balance-ring__inner">
        <span className="balance-ring__eyebrow">Баланс</span>
        <strong>71</strong>
        <span className="balance-ring__caption">средний индекс</span>
      </div>
    </div>
  );
}

function AppNav({ active, onChange }) {
  return (
    <div className="module-stack">
      {modules.map((module) => (
        <button
          key={module.id}
          className={`module-button ${active === module.id ? "is-active" : ""}`}
          onClick={() => onChange(module.id)}
          type="button"
        >
          <span>{module.label}</span>
          <small>{module.eyebrow}</small>
        </button>
      ))}
    </div>
  );
}

function ProfileView() {
  return (
    <div className="view-grid profile-view">
      <section className="panel word-cloud-panel">
        <div className="word-cloud">
          {semanticWords.map((word, index) => (
            <span
              key={word}
              className={`word-cloud__item word-cloud__item--${(index % 4) + 1}`}
              style={{
                left: `${8 + ((index * 13) % 70)}%`,
                top: `${12 + ((index * 17) % 70)}%`,
              }}
            >
              {word}
            </span>
          ))}
        </div>
        <div className="profile-focus">
          <div className="avatar-core">MV</div>
          <div>
            <p className="section-kicker">Семантическое ядро</p>
            <h3>Опыт, язык, цели и действие</h3>
            <p>
              Фон собирает смысловые акценты общения, чтобы профиль был не просто
              карточкой, а отражением того, как человек думает и работает.
            </p>
          </div>
        </div>
      </section>

      <section className="panel side-drawer-panel">
        <p className="section-kicker">Шторка настроек</p>
        <ul className="drawer-list">
          <li>Случайный тест формера: "Какой ритм у вашей недели?"</li>
          <li>Цитата дня прикрепляется к этапу цели одним кликом.</li>
          <li>Статус менто снижается только при длительной прокрастинации.</li>
        </ul>
      </section>

      <section className="panel abilities-panel">
        <p className="section-kicker">Способности месяца</p>
        <div className="ability-grid">
          {abilities.map((ability) => (
            <div key={ability} className="ability-chip">
              {ability}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FormerView() {
  return (
    <div className="view-grid former-view">
      <section className="panel former-tabs-panel">
        <p className="section-kicker">9 вкладок внутренней стратегии</p>
        <div className="former-tabs">
          {formerTabs.map((tab) => (
            <div key={tab.label} className="former-tab">
              <div className="former-tab__head">
                <span>{tab.label}</span>
                <strong>{tab.fill}%</strong>
              </div>
              <div className="meter">
                <span style={{ width: `${tab.fill}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel timeline-panel">
        <p className="section-kicker">История использования сервиса</p>
        <div className="timeline-list">
          {formerTimeline.map((item) => (
            <article key={item.title} className="timeline-card" style={{ "--accent": item.accent }}>
              <span>{item.date}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function GoalsView() {
  return (
    <div className="view-grid goals-view">
      <section className="panel planner-panel">
        <p className="section-kicker">Планнер недели</p>
        <div className="planner-list">
          {goalWeek.map((day) => (
            <div key={day.day} className="planner-day">
              <div className="planner-day__meta">
                <strong>{day.day}</strong>
                <span>{day.date}</span>
              </div>
              <div className="planner-day__tasks">
                {day.tasks.map((task) => (
                  <span key={task}>{task}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel orbit-panel">
        <p className="section-kicker">Майндкарта целей</p>
        <div className="orbit-map">
          <div className="orbit-map__core">Мои цели</div>
          {orbitGoals.map((goal) => (
            <div
              key={goal.label}
              className={`orbit-node orbit-node--${goal.state}`}
              style={{ left: `${goal.x}%`, top: `${goal.y}%`, "--node-color": goal.color }}
            >
              <span>{goal.label}</span>
            </div>
          ))}
        </div>
        <div className="radius-control">
          <label htmlFor="radius">Радиус планирования</label>
          <input defaultValue="30" id="radius" max="90" min="7" type="range" />
          <strong>30 дней</strong>
        </div>
      </section>

      <section className="panel goal-focus-panel">
        <p className="section-kicker">Фокус-цель</p>
        <h3>Бегать по утрам</h3>
        <ul className="focus-list">
          <li>Причина: быть в форме и держать голову ясной.</li>
          <li>Критерий: 100 км за 30 дней без пропусков недели.</li>
          <li>Поддержка: ментор следит за отчетами, мэйдей за ритмом.</li>
        </ul>
      </section>
    </div>
  );
}

function ConstructorView() {
  return (
    <div className="view-grid constructor-view">
      <section className="panel constructor-panel">
        <p className="section-kicker">Постановка цели</p>
        <div className="stepper">
          {constructorSteps.map((step) => (
            <div key={step.id} className={`stepper-item stepper-item--${step.status}`}>
              <span>{step.id}</span>
              <strong>{step.label}</strong>
            </div>
          ))}
        </div>

        <div className="constructor-form">
          <div className="form-block">
            <span>Причина цели</span>
            <strong>Быть в форме, чтобы стабильно держать темп работы и отдыха.</strong>
          </div>
          <div className="form-block">
            <span>Соответствие ценностям</span>
            <strong>#здоровье #дисциплина #свобода</strong>
          </div>
          <div className="form-block">
            <span>Критерий выполненности</span>
            <strong>12 утренних пробежек и 100 километров в сумме.</strong>
          </div>
          <div className="stage-pills">
            <span>Этап 1. Разогрев</span>
            <span>Этап 2. Ритм</span>
            <span>Этап 3. Контроль восстановления</span>
            <span>Этап 4. Публичный разбор</span>
          </div>
        </div>
      </section>

      <section className="panel smarter-panel">
        <p className="section-kicker">SMARTER-проверка</p>
        <div className="smarter-list">
          {constructorChecks.map((item) => (
            <div key={item.key} className="smarter-item">
              <span>{item.key}</span>
              <div>
                <strong>{item.label}</strong>
                <p>{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ContactsView() {
  const byId = Object.fromEntries(contacts.map((contact) => [contact.id, contact]));

  return (
    <div className="view-grid contacts-view">
      <section className="panel contacts-map-panel">
        <p className="section-kicker">Сеть контактов</p>
        <div className="contacts-map">
          <svg className="contacts-map__lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            {contactLinks.map(([from, to]) => (
              <line
                key={`${from}-${to}`}
                x1={byId[from].x}
                x2={byId[to].x}
                y1={byId[from].y}
                y2={byId[to].y}
              />
            ))}
          </svg>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="contact-node"
              style={{ left: `${contact.x}%`, top: `${contact.y}%`, "--accent": contact.accent }}
            >
              <div className="contact-node__avatar">{contact.name.slice(0, 1)}</div>
              <strong>{contact.name}</strong>
              <span>{contact.role}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel contact-detail-panel">
        <p className="section-kicker">Выбранный контакт</p>
        <h3>Рой Фрэнк</h3>
        <ul className="focus-list">
          <li>Активные цели: "Встать с костылей", "Стабилизировать режим".</li>
          <li>Менторы: Уолтер Уайт, Скайлер.</li>
          <li>Краткое кредо: "Не оправдываться, а фиксировать прогресс".</li>
        </ul>
      </section>
    </div>
  );
}

function FeedView() {
  return (
    <div className="view-grid feed-view">
      <section className="panel reminders-panel">
        <p className="section-kicker">Напоминания</p>
        <div className="reminder-list">
          {reminders.map((item) => (
            <article key={item.time} className="reminder-card" style={{ "--accent": item.color }}>
              <strong>{item.time}</strong>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel posts-panel">
        <p className="section-kicker">Посты групп</p>
        <div className="hex-grid">
          {posts.map((post) => (
            <article key={post.title} className="hex-card" style={{ "--accent": post.color }}>
              <span>{post.type}</span>
              <h3>{post.title}</h3>
              <p>{post.sphere}</p>
              <strong>{post.stats}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel events-panel">
        <p className="section-kicker">События</p>
        <div className="events-list">
          {events.map((event) => (
            <div key={event} className="event-item">
              {event}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function GroupsView() {
  return (
    <div className="view-grid groups-view">
      {groupLanes.map((lane) => (
        <section key={lane.title} className="panel group-lane" style={{ "--accent": lane.color }}>
          <p className="section-kicker">Сфера</p>
          <h3>{lane.title}</h3>
          <div className="group-lane__list">
            {lane.groups.map((group) => (
              <article key={group} className="group-card">
                <strong>{group}</strong>
                <span>Семантическое ядро, статистика и общий темп обсуждения</span>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ActiveView({ active }) {
  switch (active) {
    case "former":
      return <FormerView />;
    case "goals":
      return <GoalsView />;
    case "constructor":
      return <ConstructorView />;
    case "contacts":
      return <ContactsView />;
    case "feed":
      return <FeedView />;
    case "groups":
      return <GroupsView />;
    case "profile":
    default:
      return <ProfileView />;
  }
}

export default function MentoristPrototype() {
  const [active, setActive] = useState("profile");
  const activeModule = modules.find((item) => item.id === active) ?? modules[0];

  return (
    <main className="mentorist-page">
      <div className="mentorist-page__glow mentorist-page__glow--left" />
      <div className="mentorist-page__glow mentorist-page__glow--right" />

      <div className="mentorist-app">
        <aside className="command-rail">
          <div className="brand-panel">
            <span className="brand-panel__eyebrow">Mentorist / Next.js prototype</span>
            <h1>Сервис формирования жизненной стратегии через баланс, цели и наставничество</h1>
            <p>
              Основано на статье про девять экранов интерфейса, описании проекта на
              Spark и общем контексте блога о целях, ценностях и самоорганизации.
            </p>
          </div>

          <AppNav active={active} onChange={setActive} />

          <section className="rail-panel">
            <p className="section-kicker">Ресурсы-энергии</p>
            <div className="energy-stack">
              {energies.map((energy) => (
                <article key={energy.label} className="energy-card">
                  <div className="energy-card__head">
                    <span style={{ color: energy.color }}>{energy.short}</span>
                    <strong>{energy.value}</strong>
                  </div>
                  <h3>{energy.label}</h3>
                  <p>{energy.detail}</p>
                  <div className="meter">
                    <span style={{ width: `${energy.value}%`, background: energy.color }} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rail-panel rail-panel--quote">
            <p className="section-kicker">Опорная мысль</p>
            <blockquote>
              Хочешь изменить мир — начни с себя. Ты пульт управления, все зависит
              от твоих фильтров восприятия.
            </blockquote>
          </section>
        </aside>

        <section className="stage">
          <header className="hero-panel">
            <div className="hero-panel__copy">
              <span className="hero-chip">{activeModule.eyebrow}</span>
              <h2>{activeModule.title}</h2>
              <p>{activeModule.description}</p>

              <div className="sphere-grid">
                {spheres.map((sphere) => (
                  <article key={sphere.label} className="sphere-card">
                    <div className="sphere-card__head">
                      <strong>{sphere.label}</strong>
                      <span>{sphere.score}</span>
                    </div>
                    <div className="meter">
                      <span style={{ width: `${sphere.score}%`, background: sphere.color }} />
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="hero-panel__hub">
              <SectorMeter />
              <div className="ability-row">
                {abilities.map((ability) => (
                  <span key={ability}>{ability}</span>
                ))}
              </div>
            </div>

            <div className="hero-panel__aside">
              <p className="section-kicker">Текущее состояние</p>
              <div className="detail-card">
                <strong>Видение на 3 года</strong>
                <p>
                  Построить систему личной стратегии, в которой цели, роли и
                  наставничество работают как единый цикл роста.
                </p>
              </div>
              <div className="detail-card">
                <strong>Пара месяца</strong>
                <p>Ментор: Рой Фрэнк. Мэйдей: Скайлер. В работе 3 совместные цели.</p>
              </div>
              <div className="detail-card">
                <strong>Что сохранено из оригинальной идеи</strong>
                <p>Темный интерфейс, шестигранники, баланс-секции и боковые шторки.</p>
              </div>
            </div>
          </header>

          <section className="workspace">
            <div className="workspace__head">
              <div>
                <span className="section-kicker">Активный модуль</span>
                <h3>{activeModule.label}</h3>
              </div>
              <div className="workspace-pills">
                <span>Прототип UI</span>
                <span>7 экранов</span>
                <span>React 19 / Next 16</span>
              </div>
            </div>

            <ActiveView active={active} />
          </section>
        </section>
      </div>
    </main>
  );
}
