// Конспекты реальных уроков Duolingo и Puzzle English (ИИ проходит урок сам и
// конспектирует самое важное): только новые слова (сразу доступны для повторения
// в карточках) и новые грамматические правила с объяснением "почему так, а не иначе".
// Пополняется после каждого разбора урока.
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
    id: "2026-10-13", date: "2026-10-13", source: "duo",
    lessons: [{ skill: "Новые слова из Duolingo", lessonNum: "выучены с 5 по 13 октября" }],
    newWords: ["percent", "cash register", "underwear", "afterward", "selfie", "checkout", "sleeve", "quality", "thrown", "cotton", "tiny", "successful", "barber", "marriage", "niece", "lesbian", "gay", "divorced", "spouse", "haircut", "a blind", "nephew", "firefighter", "retire"],
    rules: [
      {
        title: "Семья: niece / nephew, spouse, divorced",
        explanation: "niece [нис] — племянница (рифмуется с piece — «маленький кусочек семьи»), nephew [нэфью] — племянник.\nspouse — супруг или супруга (одно слово для обоих).\nmarriage — брак, married — женат/замужем, divorced — в разводе: I am divorced / She got divorced.",
      },
      {
        title: "thrown — третья форма от throw",
        explanation: "throw — threw — thrown (семья «-EW / -OWN», как know — knew — known).\nThe ball was thrown — мяч был брошен.",
      },
    ],
  },
];
