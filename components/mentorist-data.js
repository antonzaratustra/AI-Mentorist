export const MODULES = [
  {
    id: "profile",
    label: "Профиль",
    eyebrow: "Баланс и состояние",
    title: "Кабинет с балансом сфер, энергиями и быстрыми действиями",
    description:
      "Здесь видно общий ритм недели: куда уходит энергия, какие цели тянут вперед и что требует внимания прямо сейчас.",
  },
  {
    id: "former",
    label: "Формер",
    eyebrow: "Внутренняя стратегия",
    title: "Личное пространство для видения, ценностей и опорных смыслов",
    description:
      "Формер помогает связать цели с ценностями, мотиваторами, ролями и жизненной историей, чтобы стратегия не распадалась на случайные задачи.",
  },
  {
    id: "goals",
    label: "Цели",
    eyebrow: "План и прогресс",
    title: "Цели, недельный планнер и завершение этапов",
    description:
      "Каждая цель состоит из этапов, живет в конкретной сфере и попадает в планнер, чтобы прогресс был виден не только в теории, но и по дням.",
  },
  {
    id: "constructor",
    label: "Конструктор",
    eyebrow: "Создание цели",
    title: "Постановка цели через смысл, этапы, ресурсы и пары",
    description:
      "Конструктор проверяет цель на конкретность, сроки, реалистичность и привязывает ее к ментору, мэйдею, ресурсам и группе поддержки.",
  },
  {
    id: "contacts",
    label: "Контакты",
    eyebrow: "Менторы и мэйдеи",
    title: "Контактная сеть с сообщениями и обменом поддержкой",
    description:
      "Связи строятся вокруг общих целей: здесь можно выбрать наставника, написать ему, передать менто и быстро открыть общий контекст работы.",
  },
  {
    id: "feed",
    label: "Лента",
    eyebrow: "Напоминания и посты",
    title: "Лента групп, напоминания по этапам и действия с контентом",
    description:
      "Лента объединяет события недели, полезные материалы из групп, напоминания по этапам и быстрый доступ к созданию собственных постов.",
  },
  {
    id: "groups",
    label: "Группы",
    eyebrow: "Коллективный слой",
    title: "Группы по сферам жизни, в которые встроены цели и обмен опытом",
    description:
      "Группы связывают людей с похожими целями. Подписка на группу влияет на ленту, а публикации и лайфхаки можно перетаскивать в личную стратегию.",
  },
];

export const SPHERE_ORDER = ["health", "relationships", "growth", "work"];

export const SPHERE_META = {
  health: { label: "Здоровье", short: "Здоровье", color: "#9ce24d" },
  relationships: { label: "Отношения", short: "Отношения", color: "#ff7f5c" },
  growth: { label: "Развитие", short: "Развитие", color: "#52d6ff" },
  work: { label: "Дело", short: "Дело", color: "#ffc247" },
};

export const ENERGY_META = {
  intellect: {
    label: "Интеллект",
    short: "IN",
    detail: "Нужен для анализа, обратной связи и качественного контента.",
    color: "#52d6ff",
  },
  activity: {
    label: "Активность",
    short: "AK",
    detail: "Тратится на этапы, дедлайны и движение по целям.",
    color: "#9ce24d",
  },
  informative: {
    label: "Информативность",
    short: "IF",
    detail: "Растет, когда материалы и комментарии действительно полезны.",
    color: "#ffb443",
  },
  mento: {
    label: "Менто",
    short: "ME",
    detail: "Главная валюта внимания, доверия и обязательств внутри сервиса.",
    color: "#ff6b7a",
  },
};

export const FORMER_SECTION_DEFS = [
  {
    id: "futureLetter",
    label: "Письмо из будущего",
    hint: "Опиши желаемое состояние так, будто оно уже стало реальностью.",
  },
  {
    id: "values",
    label: "Ценности",
    hint: "То, ради чего цель вообще стоит усилий.",
  },
  {
    id: "swot",
    label: "SWOT",
    hint: "Сильные и слабые стороны, возможности и угрозы.",
  },
  {
    id: "antimotivator",
    label: "Антимотиватор",
    hint: "Что уже настолько надоело, что менять это дальше невозможно.",
  },
  {
    id: "motivator",
    label: "Мотиватор",
    hint: "Опорные победы и доказательства того, что движение уже идет.",
  },
  {
    id: "aggregator",
    label: "Агрегатор",
    hint: "Цитаты, заметки и материалы, к которым хочется возвращаться.",
  },
  {
    id: "mission",
    label: "Миссия",
    hint: "Какой вклад ты хочешь оставлять через свою работу и жизнь.",
  },
  {
    id: "roles",
    label: "Роли",
    hint: "Роли помогают не провалиться в одну сферу и не забыть остальные.",
  },
  {
    id: "lifehacks",
    label: "Лайфхаки",
    hint: "Практические приемы, к которым удобно привязывать этапы цели.",
  },
];

export const WEEK_DAYS = [
  { id: "mon", short: "Пн", label: "Понедельник", dateLabel: "9" },
  { id: "tue", short: "Вт", label: "Вторник", dateLabel: "10" },
  { id: "wed", short: "Ср", label: "Среда", dateLabel: "11" },
  { id: "thu", short: "Чт", label: "Четверг", dateLabel: "12" },
  { id: "fri", short: "Пт", label: "Пятница", dateLabel: "13" },
  { id: "sat", short: "Сб", label: "Суббота", dateLabel: "14" },
  { id: "sun", short: "Вс", label: "Воскресенье", dateLabel: "16" },
];

export const POST_TYPES = [
  { id: "guide", label: "Гайд" },
  { id: "reflection", label: "Разбор" },
  { id: "vote", label: "Голосование" },
  { id: "secret", label: "Секрет" },
];

export const CONTACT_REPLY_LIBRARY = {
  c1: "Сделай сегодня самый маленький следующий шаг и пришли факт, а не обещание.",
  c2: "Если цель еще кажется тяжелой, уменьши размер этапа, а не откладывай движение.",
  c3: "Я посмотрела твой планнер: сейчас лучше держать ритм, чем добавлять новые идеи.",
  c4: "Хороший прогресс. Не забудь записать вывод в формер, чтобы он не растворился.",
};

export function createEmptyGoalDraft() {
  return {
    id: null,
    title: "",
    sphere: "health",
    why: "",
    metric: "",
    status: "active",
    dueDate: "2026-03-31",
    groupId: "g-health-run",
    mentorId: "c1",
    menteeId: "c2",
    tagText: "ритм, устойчивость",
    notes: "",
    mentoCost: 12,
    intellectCost: 3,
    activityCost: 8,
    informativeCost: 2,
    stages: [
      { id: "draft-stage-1", title: "Подготовить среду", weekday: "mon" },
      { id: "draft-stage-2", title: "Запустить ритм", weekday: "wed" },
      { id: "draft-stage-3", title: "Закрепить результат", weekday: "fri" },
    ],
  };
}

export function createInitialState() {
  return {
    profile: {
      name: "Марина Волкова",
      role: "Редактор и методист",
      avatar: "MV",
      mission:
        "Собрать личную стратегию так, чтобы работа, развитие, отношения и здоровье поддерживали друг друга, а не конкурировали за остатки внимания.",
      horizon:
        "Через три года я веду студию смыслового контента, бегаю без срывов и поддерживаю устойчивый ритм жизни без ощущения хаоса.",
      credo:
        "Не обещать себе идеальную жизнь, а строить рабочую систему, которую реально можно проживать каждый день.",
    },
    spheres: {
      health: 72,
      relationships: 64,
      growth: 81,
      work: 69,
    },
    energies: {
      intellect: 78,
      activity: 65,
      informative: 59,
      mento: 84,
    },
    former: {
      sections: {
        futureLetter:
          "Сегодня мой рабочий ритм не ломает здоровье. Утренние пробежки держат голову чистой, а каждая большая цель разбита на понятные этапы. Вокруг меня есть люди, с которыми можно честно обсуждать прогресс и не играть в продуктивность.",
        values:
          "Свобода принимать решения\nЗдоровье как ресурс, а не награда\nПольза для других людей\nЧестность в оценке своих сил\nСистемность без жестокости к себе",
        swot:
          "Сильные стороны: быстрое мышление, чувство структуры, способность собирать смысл из хаоса.\nСлабые стороны: склонность переоценивать объем на неделю.\nВозможности: сильная сеть контактов и интерес к обучению.\nУгрозы: распыление и эмоциональное выгорание.",
        antimotivator:
          "Не хочу снова жить в режиме, где все срочное, но ничего важного не завершено. Больше не хочу отнимать силы у семьи из-за того, что план существует только в голове.",
        motivator:
          "За последние месяцы я уже удержала регулярный обзор недели, написала серию сильных материалов и снова вернула бег в расписание. Значит, система может работать.",
        aggregator:
          "«Система нужна не для контроля любой ценой, а для сохранения свободы».\n«Лучше маленький устойчивый шаг, чем очередной великий старт».",
        mission:
          "Помогать людям собирать свои цели в связную жизненную стратегию, где есть и результат, и человеческий ритм, и уважение к собственным ограничениям.",
        roles:
          "Редактор\nПартнер\nДочь\nНаставник\nЧеловек, который отвечает за собственное здоровье",
        lifehacks:
          "Привязывать полезный материал не в закладки, а к конкретному этапу цели.\nПеред обзором недели смотреть не на список дел, а на изменения в четырех сферах жизни.",
      },
    },
    planner: {
      radius: 30,
      notesByDay: {
        mon: [
          { id: "qt-mon-1", title: "Разобрать рабочий стол и подготовить форму", done: false },
        ],
        tue: [],
        wed: [{ id: "qt-wed-1", title: "Семейный ужин без телефона", done: false }],
        thu: [],
        fri: [],
        sat: [],
        sun: [{ id: "qt-sun-1", title: "Подвести обзор недели", done: true }],
      },
    },
    contacts: [
      {
        id: "c1",
        name: "Рой Фрэнк",
        role: "ментор",
        sphere: "growth",
        accent: "#52d6ff",
        x: 24,
        y: 26,
        credo: "Сначала структура, потом масштаб.",
        focus: "Редакторская системность и недельные обзоры",
        support: 14,
        messages: [
          {
            id: "m-c1-1",
            author: "c1",
            text: "Сфокусируй неделю на одном доказуемом результате, а не на ощущении занятости.",
            time: "09:14",
            read: false,
          },
          {
            id: "m-c1-2",
            author: "user",
            text: "Перенесла лишние задачи, оставила пробежку и обзор.",
            time: "09:18",
            read: true,
          },
        ],
      },
      {
        id: "c2",
        name: "Уолтер Уайт",
        role: "мэйдей",
        sphere: "work",
        accent: "#9ce24d",
        x: 68,
        y: 20,
        credo: "Нужен не героизм, а ритм, который можно повторить.",
        focus: "Держит темп в целях по здоровью и делу",
        support: 9,
        messages: [
          {
            id: "m-c2-1",
            author: "c2",
            text: "Если сегодня закроешь первый этап, я обновлю свой отчет тоже.",
            time: "10:04",
            read: true,
          },
        ],
      },
      {
        id: "c3",
        name: "Скайлер Вайт",
        role: "ментор",
        sphere: "relationships",
        accent: "#ff7f5c",
        x: 76,
        y: 58,
        credo: "Хороший план не должен разрушать отношения с близкими.",
        focus: "Баланс семьи, работы и эмоциональной нагрузки",
        support: 11,
        messages: [
          {
            id: "m-c3-1",
            author: "c3",
            text: "Сохрани семейный вечер как несдвигаемый слот, иначе его снова съест работа.",
            time: "11:22",
            read: true,
          },
        ],
      },
      {
        id: "c4",
        name: "Луизана Рэй",
        role: "мэйдей",
        sphere: "health",
        accent: "#ffc247",
        x: 42,
        y: 76,
        credo: "Прогресс лучше всего чувствуется, когда его можно измерить по неделе.",
        focus: "Поддерживает в дисциплине и выполнении этапов",
        support: 7,
        messages: [
          {
            id: "m-c4-1",
            author: "c4",
            text: "Скинь потом, как обновишь конструктор цели. Хочу взять его за шаблон.",
            time: "12:03",
            read: true,
          },
        ],
      },
    ],
    groups: [
      {
        id: "g-health-run",
        name: "Пробежки по утрам",
        sphere: "health",
        joined: true,
        credo: "Ритм важнее геройства.",
        description:
          "Группа для людей, которые возвращают телу устойчивость через повторяемые утренние ритуалы и публичные отчеты.",
        members: 182,
        weeklyPosts: 14,
      },
      {
        id: "g-health-sleep",
        name: "Сон без хаоса",
        sphere: "health",
        joined: false,
        credo: "Восстановление — это часть стратегии, а не поблажка.",
        description:
          "Обсуждение режима, вечерних ритуалов и того, как не разрушить неделю усталостью.",
        members: 96,
        weeklyPosts: 8,
      },
      {
        id: "g-rel-family",
        name: "Семейные ритуалы",
        sphere: "relationships",
        joined: true,
        credo: "Близость держится на повторяемых жестах, а не на редких усилиях.",
        description:
          "Идеи для поддержания связи с семьей и создания устойчивых точек контакта в неделе.",
        members: 121,
        weeklyPosts: 11,
      },
      {
        id: "g-growth-editorial",
        name: "Редакторская мастерская",
        sphere: "growth",
        joined: true,
        credo: "Полезный текст начинается с ясной мысли.",
        description:
          "Среда для тех, кто учится структурировать идеи, давать качественную обратную связь и улучшать материалы через разборы.",
        members: 204,
        weeklyPosts: 19,
      },
      {
        id: "g-growth-focus",
        name: "Антипрокрастинация",
        sphere: "growth",
        joined: false,
        credo: "Сначала следующий шаг, потом сложные объяснения.",
        description:
          "Набор практик для уменьшения трения между намерением и действием.",
        members: 145,
        weeklyPosts: 10,
      },
      {
        id: "g-work-strategy",
        name: "Личная стратегия",
        sphere: "work",
        joined: true,
        credo: "Нельзя одновременно жить везде. Стратегия — это выбор.",
        description:
          "Разборы долгосрочных решений, циклов обзора и того, как не потерять главное в ежедневной занятости.",
        members: 167,
        weeklyPosts: 13,
      },
    ],
    goals: [
      {
        id: "goal-run",
        title: "Бегать по утрам",
        sphere: "health",
        status: "active",
        why: "Хочу вернуть телу устойчивость и ясную голову для работы без перегрузок.",
        metric: "12 пробежек и 100 км за март",
        startDate: "2026-03-02",
        dueDate: "2026-03-31",
        groupId: "g-health-run",
        mentorId: "c1",
        menteeId: "c2",
        tags: ["ритм", "восстановление", "утро"],
        notes:
          "Если пропускаю два дня подряд, обязуюсь сделать разбор причины в формере, а не просто продолжать как ни в чем не бывало.",
        resourceCost: {
          mento: 16,
          intellect: 3,
          activity: 10,
          informative: 2,
        },
        stages: [
          { id: "goal-run-s1", title: "Собрать форму и маршрут", weekday: "mon", done: true },
          { id: "goal-run-s2", title: "Держать три выхода в неделю", weekday: "wed", done: false },
          { id: "goal-run-s3", title: "Сделать публичный отчет", weekday: "fri", done: false },
        ],
      },
      {
        id: "goal-family",
        title: "Вернуть семейный вечер",
        sphere: "relationships",
        status: "active",
        why: "Хочу перестать отдавать все живое внимание работе и вернуть устойчивую близость дома.",
        metric: "4 вечера подряд без срывов и телефонов за столом",
        startDate: "2026-03-03",
        dueDate: "2026-03-30",
        groupId: "g-rel-family",
        mentorId: "c3",
        menteeId: "c4",
        tags: ["семья", "ритуал", "внимание"],
        notes:
          "Не переношу этот слот без веской причины. Если перенос все-таки есть, заранее выбираю новую дату в той же неделе.",
        resourceCost: {
          mento: 10,
          intellect: 2,
          activity: 5,
          informative: 1,
        },
        stages: [
          { id: "goal-family-s1", title: "Зафиксировать слот в календаре", weekday: "wed", done: true },
          { id: "goal-family-s2", title: "Подготовить маленький ритуал", weekday: "thu", done: false },
          { id: "goal-family-s3", title: "Собрать обратную связь дома", weekday: "sun", done: false },
        ],
      },
      {
        id: "goal-editorial",
        title: "Собрать редакторский шаблон недели",
        sphere: "growth",
        status: "planned",
        why: "Нужен повторяемый шаблон работы с заметками, чтобы идеи не тонули в хаосе.",
        metric: "1 шаблон, 3 тестовых запуска и 12 заметок без потерь",
        startDate: "2026-03-05",
        dueDate: "2026-04-05",
        groupId: "g-growth-editorial",
        mentorId: "c1",
        menteeId: "c4",
        tags: ["редактура", "система", "заметки"],
        notes:
          "Сначала собираю минимальный рабочий шаблон, а не идеальный набор для всех случаев.",
        resourceCost: {
          mento: 12,
          intellect: 8,
          activity: 4,
          informative: 3,
        },
        stages: [
          { id: "goal-editorial-s1", title: "Описать цикл недели", weekday: "tue", done: false },
          { id: "goal-editorial-s2", title: "Протестировать на трех заметках", weekday: "thu", done: false },
          { id: "goal-editorial-s3", title: "Собрать разбор в группу", weekday: "sat", done: false },
        ],
      },
      {
        id: "goal-review",
        title: "Делать недельный обзор без пропусков",
        sphere: "work",
        status: "active",
        why: "Нужен единый момент, когда стратегия недели проверяется на реальность и баланс.",
        metric: "4 обзора подряд с решениями по всем четырем сферам",
        startDate: "2026-03-01",
        dueDate: "2026-03-29",
        groupId: "g-work-strategy",
        mentorId: "c1",
        menteeId: "c2",
        tags: ["обзор", "стратегия", "фокус"],
        notes:
          "Обзор нельзя превращать в длинный журнал. Он нужен для решений: оставить, убрать, переназначить.",
        resourceCost: {
          mento: 14,
          intellect: 6,
          activity: 4,
          informative: 4,
        },
        stages: [
          { id: "goal-review-s1", title: "Собрать факты недели", weekday: "sun", done: true },
          { id: "goal-review-s2", title: "Принять три решения на следующую неделю", weekday: "sun", done: false },
        ],
      },
    ],
    posts: [
      {
        id: "post-1",
        groupId: "g-health-run",
        authorName: "Рой Фрэнк",
        type: "guide",
        sphere: "health",
        title: "Как не убить бег слишком большой первой целью",
        excerpt:
          "Разбор того, как удержать ритм в первые три недели и не сломать мотивацию стремлением к мгновенному результату.",
        likes: 18,
        views: 723,
        savedToFormer: false,
        likedByUser: false,
        stickerCollected: false,
        isSecret: false,
        unlocked: true,
      },
      {
        id: "post-2",
        groupId: "g-growth-editorial",
        authorName: "Скайлер Вайт",
        type: "reflection",
        sphere: "growth",
        title: "Шаблон недельного обзора для мэйдея",
        excerpt:
          "Как задавать себе вопросы, чтобы из обзора выходили решения, а не очередной поток самокритики.",
        likes: 11,
        views: 347,
        savedToFormer: true,
        likedByUser: true,
        stickerCollected: true,
        isSecret: false,
        unlocked: true,
      },
      {
        id: "post-3",
        groupId: "g-work-strategy",
        authorName: "Марина Волкова",
        type: "secret",
        sphere: "work",
        title: "Секретный разбор: что я убрала из недели, чтобы сохранить семью",
        excerpt:
          "Личный разбор о том, почему отказ от лишних обязательств оказался важнее новой красивой цели.",
        likes: 7,
        views: 154,
        savedToFormer: false,
        likedByUser: false,
        stickerCollected: false,
        isSecret: true,
        unlocked: false,
      },
      {
        id: "post-4",
        groupId: "g-rel-family",
        authorName: "Луизана Рэй",
        type: "vote",
        sphere: "relationships",
        title: "Какой семейный ритуал проще всего удерживать в рабочую неделю?",
        excerpt:
          "Голосование с короткими историями о том, как договоренности ломаются и что помогает им жить дольше недели.",
        likes: 5,
        views: 64,
        savedToFormer: false,
        likedByUser: false,
        stickerCollected: false,
        isSecret: false,
        unlocked: true,
      },
      {
        id: "post-5",
        groupId: "g-work-strategy",
        authorName: "Уолтер Уайт",
        type: "guide",
        sphere: "work",
        title: "Три решения, которые стоит принимать только на недельном обзоре",
        excerpt:
          "Короткий список вопросов, после которых становится ясно, что тащить дальше, а что пора закрыть без сожаления.",
        likes: 9,
        views: 296,
        savedToFormer: false,
        likedByUser: false,
        stickerCollected: false,
        isSecret: false,
        unlocked: true,
      },
    ],
    events: [
      {
        id: "event-1",
        title: "Этап по цели «Бегать по утрам» уже закрыт",
        detail: "Подготовительный этап завершен, активность выросла, а группа увидела отчет.",
        time: "09:20",
        accent: "#9ce24d",
      },
      {
        id: "event-2",
        title: "В формер сохранен полезный разбор из группы",
        detail: "Материал про недельные обзоры добавлен в лайфхаки и доступен из конструктора.",
        time: "10:10",
        accent: "#52d6ff",
      },
      {
        id: "event-3",
        title: "Семейный вечер поставлен в планнер",
        detail: "Слот закреплен на среду и защищен от переноса без причины.",
        time: "11:00",
        accent: "#ff7f5c",
      },
      {
        id: "event-4",
        title: "Пост по стратегии недели набирает оценки",
        detail: "Информативность растет, потому что разбор признали полезным для группы.",
        time: "11:50",
        accent: "#ffc247",
      },
    ],
  };
}
