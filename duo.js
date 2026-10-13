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
    id: "duo-unit-74", date: "2026-10-13", source: "duo",
    lessons: [
      { skill: "Раздел 74 · Одежда и покупки", lessonNum: "Обосновать выбор одежды ✓" },
      { skill: "Раздел 74 · Одежда и покупки", lessonNum: "Оценить качество одежды ✓" },
      { skill: "Раздел 74 · Одежда и покупки", lessonNum: "Купить одежду в магазине ✓" },
      { skill: "Раздел 74 · Одежда и покупки", lessonNum: "Купим одежду и пообедаем ✓" },
      { skill: "Раздел 74 · Одежда и покупки", lessonNum: "Купить одежду со скидкой — в процессе" },
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
    id: "duo-unit-73", date: "2026-10-09", source: "duo",
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
