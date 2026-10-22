// Конспекты реальных уроков Duolingo и Puzzle English: новые слова (сразу доступны
// для повторения в карточках) и грамматические правила с объяснением "почему так, а не иначе".
// Пополняется после каждого пройденного раздела.
//
// Формат записи:
// {
//   id: "2026-10-05", date: "2026-10-05", source: "duo" | "puzzle",
//   lessons: [{ skill: "Название раздела", module: "Раздел 3", lessonNum: "Урок 1 из 5", correct: 15, total: 15, perfect: true }],
//   newWords: ["word", "phrase"],            // ровно как в words.js
//   rules: [{ title: "...", explanation: "..." }],
// }
const DUO_LOG = [
  {
    id: "duo-unit-news", date: "2026-10-21", source: "duo", units: [210],
    lessons: [
      { skill: "Аэропорт и поездки", lessonNum: "Попроси помощи в аэропорту ✓" },
      { skill: "Аэропорт и поездки", lessonNum: "Расскажи о своём приезде ✓" },
      { skill: "Аэропорт и поездки", lessonNum: "Говорить о поездках ✓" },
      { skill: "Аэропорт и поездки", lessonNum: "Готовиться к перелёту ✓" },
      { skill: "Обсуди последние новости", lessonNum: "раздел пройден ✓" },
    ],
    newWords: ["headline", "front page", "government", "leader", "spy", "border", "enemy", "gun", "billion", "jail", "in jail", "court", "in court", "expect", "in exchange for", "though", "bomb", "false", "crash", "to rob"],
    rules: [
      {
        title: "IN COURT, IN JAIL — без артикля",
        explanation:
          "Когда речь о назначении места, артикль не нужен: in court (в суде), in jail (в тюрьме), at school, in bed, at work, in hospital.\n" +
          "The lawyer stood next to the man in court. — Адвокат стоял рядом с мужчиной в суде.\n" +
          "С артиклем — когда это просто здание: The court is near the park.",
      },
      {
        title: "IT'S + прилагательное + TO — «это … (делать)»",
        explanation:
          "It's common to read the news on social media. — Читать новости в соцсетях — обычное дело.\n" +
          "It's important to do your homework.  It's easy to forget.\n" +
          "По-русски начинаем с действия, по-английски — с IT'S, а действие ставим в конец с TO.",
      },
      {
        title: "IT TAKES + время + TO — «занимает (время)»",
        explanation:
          "It took me a day to read. — Чтение заняло у меня один день.\n" +
          "How long does it take to open an account? — Сколько времени занимает открыть счёт?\n" +
          "Схема: IT + TAKE (в нужном времени) + (кому) + сколько + TO + действие. Не «To read took me…».",
      },
      {
        title: "Новости: headline, front page, government",
        explanation:
          "Did you see today's headlines? — Ты видела сегодняшние заголовки?\n" +
          "The newspaper prints important articles ON the front page. — на первой полосе (ON page, как on TV).\n" +
          "BILLION — без -s после числа: two billion people (как hundred, thousand, million).",
      },
    ],
  },
  {
    id: "duo-stories", date: "2026-10-16", source: "duo",
    lessons: [
      { skill: "Истории Duolingo", lessonNum: "68 прочитанных историй (уровни Intro – A1)" },
      { skill: "Истории Duolingo", lessonNum: "«Дневник», «Чрезвычайная ситуация», «Похороны рыбки», «Неожиданная концовка», «Проблема с машиной» и др." },
    ],
    newWords: ["diary", "handwriting", "emergency", "lifeguard", "drown", "uh-oh", "vanilla", "promote", "accidentally", "blank", "come out of", "recycling", "planet", "pour", "ground", "handsome", "lie", "dinosaur", "trunk", "gas", "secret", "knock on", "babysit", "bench", "marry", "sunny", "genius", "janitor", "model", "auto repair shop", "space", "robot", "crash", "ghost", "funeral", "burial", "alive", "get out of", "respond", "sail", "dough", "elegant"],
    rules: [
      {
        title: "LIE — два разных глагола",
        explanation:
          "LIE — врать: lie — lied — lied.  I lied about the ending. — Я соврал(а) про концовку.  I always know when you're lying.\n" +
          "LIE — лежать: lie — lay — lain.  Lie down! — Ляг!\n" +
          "-ING от обоих: lying (ie → y): Why are you lying? / He is lying on the bench.",
      },
      {
        title: "OUT OF — «из (чего-то наружу)»",
        explanation:
          "Lin gets out of the taxi. — Лин выходит из такси.\n" +
          "Eddy comes out of the bathroom. — Эдди выходит из ванной.\n" +
          "How do we get him out of the toilet? — Как нам достать его из унитаза?\n" +
          "GET OUT OF — выбраться/выйти из (транспорта), COME OUT OF — выйти (показаться) из комнаты.",
      },
      {
        title: "IS GOING TO + глагол = «вот-вот случится»",
        explanation:
          "The plane is going to crash! — Самолёт вот-вот разобьётся!\n" +
          "Going to — не только план, но и то, что уже видно: Look at the clouds — it's going to rain.",
      },
      {
        title: "Истории учат «живому» английскому",
        explanation:
          "Uh… / Uhh — «э-э» (думаю).  Huh? — «А? Что?».  Uh-oh — «ой-ой» (что-то пошло не так).  Whoa — «ого!».\n" +
          "ask someone to marry you — сделать предложение.  babysit — сидеть с ребёнком.  knock on the door — постучать в дверь.\n" +
          "accidentally — случайно: Ted accidentally spills his wine.",
      },
    ],
  },
  {
    id: "duo-unit-flight", date: "2026-10-16", source: "duo", units: [205],
    lessons: [
      { skill: "Раздел 74 · Одежда и покупки", lessonNum: "Купить одежду со скидкой ✓" },
      { skill: "Уточни детали перелёта", lessonNum: "раздел пройден ✓" },
    ],
    newWords: ["security", "spare", "visa", "abroad", "baggage", "front door", "embassy", "reservations", "transportation", "get in", "citizen", "canceled"],
    rules: [
      {
        title: "«Разве не…?» с модальными: Shouldn't we…? Can't I…? Couldn't they…?",
        explanation:
          "Shouldn't we look for a cheaper ticket? — Не поискать ли нам билет подешевле?\n" +
          "Can't I order a vegetarian meal instead? — Нельзя ли мне вместо этого заказать вегетарианское блюдо?\n" +
          "Couldn't they change my flight for free? — Разве они не могли бы поменять мой рейс бесплатно?\n\n" +
          "Модальный глагол + N'T в начале вопроса = мягкое предложение или «разве нельзя…?». После него — голый глагол.",
      },
      {
        title: "Где / как / что + TO: where to meet, how to get",
        explanation:
          "I told her where to meet us. — Я сказал ей, где нам встретиться.\n" +
          "Do you know how to make bagels? — Ты знаешь, как печь бублики?\n" +
          "Вопросительное слово + TO + глагол = «где/как/что (нужно) сделать». Короче, чем целая фраза.",
      },
      {
        title: "ABROAD — без предлога, как HOME",
        explanation:
          "go abroad — поехать за границу, live abroad — жить за границей, study abroad — учиться за рубежом.\n" +
          "Не говорят «to abroad» и «in abroad» — abroad уже содержит «за границу/за границей», как home и downtown.",
      },
      {
        title: "Present Continuous для планов: I'm not flying today",
        explanation:
          "I canceled my ticket, so I'm not flying today. — Я отменил билет, так что сегодня не лечу.\n" +
          "AM/IS/ARE + -ING часто говорит о том, что уже решено на ближайшее время: I'm meeting Anna tonight.",
      },
    ],
  },
  {
    id: "duo-unit-74", date: "2026-10-13", source: "duo", units: [200],
    lessons: [
      { skill: "Раздел 74 · Одежда и покупки", lessonNum: "Обосновать выбор одежды ✓" },
      { skill: "Раздел 74 · Одежда и покупки", lessonNum: "Оценить качество одежды ✓" },
      { skill: "Раздел 74 · Одежда и покупки", lessonNum: "Купить одежду в магазине ✓" },
      { skill: "Раздел 74 · Одежда и покупки", lessonNum: "Купим одежду и пообедаем ✓" },
      { skill: "Раздел 74 · Одежда и покупки", lessonNum: "Купить одежду со скидкой ✓" },
    ],
    newWords: ["percent", "cash register", "checkout", "underwear", "sleeve", "quality", "cotton", "tiny", "selfie", "afterward", "successful", "thrown", "sweatshirt", "coat", "try on", "wallet", "change", "leather", "purse", "pants"],
    rules: [
      {
        title: "«Разве…?» — вопрос с отрицанием",
        explanation:
          "Doesn't this coat look too big on me? — Разве это пальто на мне не слишком большое?\n" +
          "Weren't those leather purses so pretty? — Разве те кожаные сумочки не были такими красивыми?\n" +
          "Don't these pants look great on me? — Разве эти брюки на мне не смотрятся отлично?\n\n" +
          "Строится как обычный вопрос, только помощник с N'T: Doesn't / Don't / Isn't / Weren't + кто + глагол.\n" +
          "Так спрашивают, когда ждут согласия: «Ну правда же…?». Переводи «Разве…?» или «…, правда?».\n" +
          "Отвечают по факту: Yes, it does (да, большое) / No, it doesn't (нет, не большое).",
      },
      {
        title: "Как сидит одежда: look + прилагательное + on me",
        explanation:
          "This coat looks too big on me — это пальто на мне слишком большое (выглядит).\n" +
          "These pants look great on you — эти брюки на тебе отлично смотрятся.\n" +
          "LOOK + прилагательное (не наречие!): look great, look good — не «look well».\n" +
          "FIT — подходит по размеру (It doesn't fit — не подходит), TRY ON — примерить: Anna tried on different hats.",
      },
      {
        title: "Материал — прилагательное перед вещью",
        explanation:
          "a cotton shirt — хлопковая рубашка, leather purses — кожаные сумочки, a plastic container — пластиковый контейнер.\n" +
          "Материал ставится прямо перед вещью и не меняется: cotton, leather, wool, silver, gold.\n" +
          "Исключение-«прилагательное»: wood → wooden (деревянный).\n" +
          "Или через MADE OF: It's made of cotton — это сделано из хлопка.",
      },
      {
        title: "Could you…? — вежливая просьба",
        explanation:
          "Could you put the change in my wallet? — Не могли бы вы положить сдачу в мой кошелёк?\n" +
          "COULD YOU + глагол (без to) — самая вежливая просьба. Can you…? — попроще, между друзьями.\n" +
          "CHANGE здесь — «сдача» (а ещё «менять» и «перемена»).",
      },
      {
        title: "Let's … and … afterward",
        explanation:
          "Let's buy these shoes and get some lunch afterward. — Давай купим эти туфли и потом пообедаем.\n" +
          "LET'S + глагол = «давай(те) сделаем вместе».\n" +
          "GET + еда = взять, поесть: get some lunch (пообедать), get a coffee (взять кофе).\n" +
          "AFTERWARD — «потом, после этого» — обычно в конце фразы.",
      },
      {
        title: "Скидки и проценты",
        explanation:
          "20 percent off — скидка 20%.  It's on sale — со скидкой, по распродаже.  half price — за полцены.\n" +
          "PERCENT не меняется во множественном: 50 percent (не percents).\n" +
          "Касса: checkout / cash register; чек — receipt (не «рецепт»!).",
      },
      {
        title: "thrown — третья форма от throw",
        explanation: "throw — threw — thrown (семья «-EW / -OWN», как know — knew — known).\nThe ball was thrown — мяч был брошен.",
      },
    ],
  },
  {
    id: "duo-unit-73", date: "2026-10-09", source: "duo", units: [195],
    lessons: [{ skill: "Люди и семья", lessonNum: "новые слова, выученные до раздела 74" }],
    newWords: ["barber", "haircut", "marriage", "niece", "nephew", "spouse", "divorced", "lesbian", "gay", "a blind", "firefighter", "retire"],
    rules: [
      {
        title: "Семья: niece / nephew, spouse, divorced",
        explanation: "niece [нис] — племянница (рифмуется с piece — «маленький кусочек семьи»), nephew [нэфью] — племянник.\nspouse — супруг или супруга (одно слово для обоих).\nmarriage — брак, married — женат/замужем, divorced — в разводе: I am divorced / She got divorced.",
      },
      {
        title: "Профессии на -ER: barber, firefighter",
        explanation: "barber — мужской парикмахер (barbershop — барбершоп).  firefighter = fire (огонь) + fight (бороться) + ER — пожарный.\nПрофессия — всегда с A: He is a firefighter.\nretire — уйти на пенсию: She retired last year.",
      },
    ],
  },
];
