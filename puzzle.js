/* ============ Puzzle English: уроки «Метода Тичера» и Нотатник ============
   «Создай урок» берёт следующий урок курса и даёт ссылку на него (видеообъяснения +
   задания). Когда урок пройден, появляется конспект: правила, слова, фразы и твои
   ошибки. Конспект пишет Claude (по просьбе «законспектируй урок N» — тогда он лежит
   в PUZZLE_NOTES ниже) или Gemini: открой в Puzzle урок → «Смотреть мои ответы» →
   нажми закладку «Мой английский». Слова конспекта попадают в Повторение как день изучения.

   Использует из app.js: WORDS_DATA, DUO_LOG, todayStr, loadJSON, saveJSON, escapeHtml, ico,
   plural, loadAiKey, callGeminiRaw, parseJsonLoose, startLearnForWords, startSessionForWords;
   из import.js: importKey. */

const PUZZLE_COURSE = {
  level: "class4",
  title: "Pre-Intermediate, Part 2",
  url: "https://puzzle-english.com/teacher/class4",
  themes: [
    { n: 1, title: "Открытия, изменившие мир", from: 1, to: 63 },
    { n: 2, title: "Кухни мира и вкусы", from: 64, to: 139 },
    { n: 3, title: "Обычаи и традиции", from: 140, to: 207 },
    { n: 4, title: "Выпускной", from: 208, to: 219 },
  ],
  // пройдено на Puzzle English к 26.10.2026 (дальше отмечается в приложении)
  passedBefore: "1-20,22-28",
  // id|номер|название|тема урока|0 урок, 1 промежуточный экзамен, 2 итоговый
  data: `1058|1|Изобретения и открытия|Время Past Simple, окончание ED + чтение дат|0
1505|2|Еще больше открытий|Время Past Simple - отрицание + предлоги с датами|0
1059|3|Незаменимые вещи|вопросы и ответы в Past Simple|0
1060|4|Движение - жизнь!|глаголы движения + предлог by|0
1506|5|Еще быстрее|правильные, неправильные глаголы, три формы|0
1061|6|Кто на чем|глаголы движения|0
1062|7|Роботы среди нас|отработка навыков чтения|0
1510|8|Будущее за роботами|отработка навыков чтения|0
1071|9|Глухой или звонкий?|произношение окончания ED|0
1512|10|С самого утра|неправильные глаголы do, take, cut, put|0
1065|11|До чего дошел прогресс|глаголы do и make в значении «делать»|0
1063|12|Современная еда|неправильные глаголы feel, eat, have, spend|0
1064|13|Здоровье дороже|глагол to be в Past Simple|0
1507|14|Полезные - неполезные|глагол to be в Past Simple|0
1066|15|Я вегетарианец|вопросы и отрицания в Past Simple|0
1526|16|Есть или не есть?|another, other, others, the other|0
1067|17|Эксперименты с едой|вопросы в Past Simple|0
1068|18|Ошибочка вышла|отработка навыков чтения|0
1529|19|По воле случая|отработка навыков чтения|0
1174|20|Вдох-выдох: p, b, t, d|правила чтения: P, B, T и D|0
1070|21|Экзамен «Современная еда»||1
1143|22|Общение без границ|first, then, later on, before, after|0
1508|23|Люблю поболтать|глаголы talk, speak, chat to/with/on|0
1144|24|У меня зазвонил телефон|there was, there were, there was/were no|0
1145|25|Онлайн|somewhere, anywhere, nowhere, everywhere|0
1533|26|Что-нибудь|every, some, any, no + thing|0
1146|27|Интернет|вводные слова certainly, no doubt, even, naturally|0
1147|28|Путешествие во времени|отработка навыков чтения|0
1001|29|Проще простого: l, m, n, v, f|правила чтения: l, m, n, v, f|0
1148|30|Экзамен «Общение без границ»||1
1152|31|Нобелевские лауреаты|соединительные слова WHO и WHOSE|0
1502|32|Еще раз о Нобелевских лауреатах|соединительные слова WHICH и THAT|0
1154|33|Путешествие в сказку|последовательность событий в Past Simple|0
1153|34|А кто убийца? (часть 1)|описание в Past Simple|0
1155|35|А кто убийца? (часть 2)|вопросы в Past Simple|0
1158|36|Снято!|Past Simple для последовательных событий в прошлом|0
1522|37|Сказка продолжается|Past Simple для последовательных событий в прошлом|0
1156|38|Это интересно|слова-подсказки в Past Simple|0
1157|39|Читать или смотреть?|отработка навыков чтения|0
1523|40|Читаем и смотрим|отработка навыков чтения|0
1175|41|Пешеходный переход: s, z|правила чтения: s, z|0
1149|42|Экзамен «Литература»||1
1159|43|Кино-легенды|who / which / that / whose|0
1464|44|Еще раз о легендах|случаи, когда who, which опускаются|0
1160|45|Как кино перестало быть немым|There was / there were - вопросы и ответы|0
1509|46|Черное, белое, цветное|вопросы в Past Simple + конструкция it was...that|0
1162|47|За кадром|отработка восприятия речи на слух|0
1161|48|Многое изменилось|as...as..., Present Simple + Past Simple|0
1163|49|Фабрика, где создают мечты|отработка навыков чтения|0
1511|50|Голливуд|отработка навыков чтения|0
1177|51|Ку-ку|правила чтения: буквы C и K|0
1150|52|Экзамен «Кинематограф»||1
1164|53|Куда уходит детство|used to, didn't use to|0
1165|54|Счастливая семья|значения глагола get|0
1167|55|Они изменили мир: Авраам Линкольн|although / even though|0
1463|56|Авраам Линкольн|in spite of / despite|0
1168|57|Они изменили мир: Альфред Нобель|отработка навыков чтения|0
1169|58|Альфред Нобель|частица to и окончание ing в зависимости от предшествующего глагола|0
1170|59|Цивилизация|суффиксы существительных -ity, -tion, -ence + приставка in-|0
1524|60|От племени к обществу|отработка навыков чтения|0
1176|61|WOW!|правила чтения: -ow, -ew, -aw|0
1151|62|Экзамен «Вечные ценности»||1
1171|63|Итоговый экзамен «Открытия, изменившие мир»||2
1205|64|Британский завтрак|countable, uncountable nouns, HAVE|0
1206|65|Вкусно по-американски|исчисляемые и неисчисляемые сущ., can I have|0
1218|66|Средиземноморская диета|much, many, a lot of|0
1219|67|Пицца|there is/are с исчисляемыми и неисчисляемыми сущ.|0
1220|68|Суши|выражение согласия: So do I / Neither do I|0
1221|69|Самые острые|выражение согласия: So am I / Neither am I|0
1222|70|Самые сладкие|прилагательное + существительное|0
1223|71|Люблю поесть|verbs of likes/dislikes|0
1224|72|Необычное путешествие|навыки чтения + It's time for/to|0
1525|73|И снова в путешествие|отработка навыков чтения|0
1248|74|Буквы G и J|правила чтения: G, J|0
1251|75|Экзамен «Кухни мира»||1
1225|76|От бистро до ресторана|предлоги in, at с кафе и ресторанами|0
1226|77|Starbucks: история успеха|прилагательные со схожими значениями|0
1227|78|Чаевые|конструкция с If + should/should not|0
1228|79|По-домашнему|местоимение self|0
1530|80|Атмосфера|прилагательное + существительное|0
1229|81|Неужели|Are you? Do you? Aren't you? Don't you?|0
1230|82|Дома или в ресторане?|аргументация мнения|0
1532|83|Куда пойти?|многозначные слова|0
1231|84|Добро пожаловать|отработка навыков чтения|0
1513|85|G+|правила чтения: сочетания с буквой G|0
1252|86|Экзамен «Едим дома?»||1
1232|87|Столик на двоих|бронирование столика + предлоги (time, day)|0
1233|88|Меню|фразы: menu|0
1234|89|Для начала|фразы: заказ в ресторане|0
1235|90|Что будете заказывать?|пополнение словарного запаса|0
1236|91|Мясо|be out of, how would you like?|0
1237|92|Птица|местоимения one / ones|0
1238|93|Морепродукты|фразы: в ресторане|0
1239|94|Советы профессионала|исчисляемые и неисчисляемые сущ., go with|0
1249|95|Буквы Q и X|правила чтения: X, Q|0
1253|96|Экзамен «Меню»||1
1240|97|Напитки|some и ёмкости a cup/glass/bottle/carton of|0
1241|98|Одна чашечка кофе|some в вопросительных предложениях|0
1242|99|На любой цвет|цвета|0
1243|100|Покрепче|a, the, some с неисчисляемыми существительными|0
1244|101|На сладенькое|some, a piece of|0
1245|102|Когда одного кусочка мало|выражения количества a bar/jar/packet of|0
1246|103|Счет, пожалуйста|фразы в ресторане: закрепление|0
1247|104|Ужин в ресторане|отработка навыков чтения|0
1487|105|Буквосочетания au, al, all|правила чтения: au, al, all|0
1254|106|Экзамен «В ресторане»||1
1465|107|Кто на рынок?|предлоги at/in со словами market, supermarket, shop|0
1466|108|В супермаркете: молочные продукты|фразы: в супермаркете|0
1467|109|Всмятку или вкрутую|повторение: same as, kind of|0
1468|110|Овощи|выражения количества: gram, kilo, half a kilo, lb|0
1469|111|Фрукты|How many ...?|0
1470|112|Приятное дополнение|фразы: на рынке|0
1471|113|Мучное|выражения количества: a box of, a package of, a loaf of|0
1472|114|За покупками|отработка навыков чтения|0
1216|115|Окончания sure, ssure, ture|правила чтения: -ture, -sure|0
1255|116|Экзамен «За покупками»||1
1473|117|Здоровая еда|конструкции be rich/high/low in|0
1474|118|Режим|must, should, have to, need|0
1475|119|Едим и не вредим|must, should, have to, need + not|0
1476|120|Еще полезнее|Passive Voice (страдательный залог)|0
1534|121|Что и с чем|should/must/need + пассивные конструкции|0
1535|122|Есть обязательно!|Active Voice vs. Passive Voice|0
1536|123|Один день из жизни|чтение + повторение грамматики|0
1551|124|Один день из жизни - 2|отработка навыков чтения|0
1630|125|Что за зверь такой?|дифтонги|0
1486|126|Экзамен «Здоровое питание»||1
1477|127|Готовимся готовить|прилагательное + существительное|0
1478|128|Щепотка соли|how much, how many + меры: a pinch of, a handful of|0
1480|129|Читаем рецепты|повелительное наклонение|0
1481|130|Тонкости приготовления|few/a few, little/a little|0
1482|131|Готовим вместе|дополнение после глаголов|0
1483|132|Пальчики оближешь|it + sounds/smells/looks/tastes|0
1484|133|Вкусно или не очень|too, enough, a little bit, so + прилагательное|0
1479|134|По рецепту|восприятие речи на слух|0
1485|135|Быстро и вкусно|наречия на -ly|0
1555|136|Пора готовить|отработка навыков чтения|0
1641|137|Три в одном|трифтонги|0
1256|138|Экзамен «Рецепты»||1
1257|139|Итоговый экзамен «Кухни мира и вкусы»||2
1178|140|Празднуем во всем мире|предлоги и артикли с праздниками и датами|0
1179|141|Кто больше отдыхает?|национальности: множественное число|0
1180|142|Рождество|all, every|0
1557|143|Рождественская мелодия|восприятие речи на слух|0
1556|144|Рождественские воспоминания|восприятие речи на слух|0
1558|145|С Новым Годом!|every/some/any/no + body/one|0
1559|146|Ура, подарки!|порядок прилагательных|0
1182|147|Кролики и верба|порядок слов: место и время|0
1181|148|От Рождества до Пасхи|отработка навыков чтения|0
1215|149|Ударный - безударный|ударение в двусложных словах|0
1207|150|Экзамен «Празднуем во всем мире»||1
1183|151|Бразильский карнавал|предлоги времени в сравнении|0
1560|152|Карнавальный костюм|фразовые глаголы put on, take off, dress up|0
1561|153|Открытка из...|суффиксы прилагательных -ful, -ing, -ous|0
1587|154|Привет из ...|суффиксы прилагательных -y, -less, -ive|0
1184|155|Октоберфест|приблизительное количество|0
1562|156|Парк развлечений|покупка билета|0
1563|157|Интересный случай|типы наречий и их место в предложении|0
1185|158|День Благодарения|глагол have|0
1564|159|Индейка и не только|разные значения like|0
1565|160|Необычный подарок|устойчивые сочетания с have и take|0
1573|161|Путешествие в подарок!|повторение пройденного|0
1214|162|Звук /ə/|звук [ə] в безударных слогах|0
1208|163|Экзамен «Каждая страна особенная»||1
1570|164|Масленая неделя|пополнение словарного запаса|0
1186|165|Прощай, Масленица!|глагол + предлог: angry, sorry, ask, forgive|0
1187|166|Международный Женский День|wait for, thank for, think of; be nice/full of, be good/bad at|0
1571|167|Глазами иностранца|форма глагола после предлогов|0
1572|168|По-русски|отработка навыков чтения|0
1566|169|Больше двух|ударение в многосложных словах|0
1209|170|Экзамен «Отмечаем по-русски»||1
1188|171|Хорошие манеры - Азия|it is considered + to|0
1189|172|Хорошие манеры - Европа|not перед глаголом в начальной форме|0
1190|173|Да или нет?|короткие ответы|0
1191|174|Язык жестов|одинаковые формы глаголов и существительных|0
1192|175|Кому как|приставки un, im, dis|0
1193|176|Не говорим, а показываем|наречия up, down|0
1194|177|Вы меня не так поняли|приставки in, mis, re|0
1601|178|Больше, чем слова|отработка навыков чтения|0
1567|179|Составные слова|ударение в составных словах|0
1210|180|Экзамен «Мы разные»||1
1195|181|Искусство аргументации|аргументация в речи|0
1196|182|Я за|согласие и одобрение|0
1197|183|Я против|несогласие|0
1198|184|Несмотря ни на что|though, although, even though, even if|0
1579|185|Сила убеждения|проверка пройденного|0
1652|186|Сильные|фразовое ударение: ударные части речи|0
1211|187|Экзамен «Искусство общения»||1
1199|188|На вечеринку|новая лексика + предлог for|0
1200|189|Приглашение|пригласительная открытка + on, at, to с датами и адресами|0
1201|190|На свадьбу|официальное приглашение|0
1202|191|Готовим пижаму|неформальное приглашение|0
1203|192|Принимаем приглашение|ответ на формальное приглашение|0
1204|193|Конечно, приду|ответ на неформальное приглашение|0
1574|194|Отклоняем приглашение|вежливый отказ: формально|0
1575|195|Извини, не могу|вежливый отказ: неформально|0
1576|196|Все приглашены|чтение и письмо|0
1568|197|Слабые|фразовое ударение: служебные части речи|0
1212|198|Экзамен «Приглашение»||1
1577|199|Здравствуйте|телефон: неформальные приветствия|0
1578|200|До свидания|телефон: неформальные прощания|0
1580|201|Плохо слышно|телефон: проблемные ситуации|0
1582|202|Как отдыхается?|краткие формы: to be, do/does/did, will/would, not|0
1626|203|Приглашение по телефону|краткие формы: to be, have/has, 's|0
1581|204|Дозвонились|отработка навыков чтения|0
1569|205|Важные, но скромные|фразовое ударение: модальные и вспомогательные глаголы|0
1583|206|Экзамен «По телефону»||1
1213|207|Итоговый экзамен «Обычаи и традиции»||2
1653|208|Повторение: грамматика|повторение|0
1655|209|Повторение: грамматика - 2|повторение|0
1654|210|Повторение: письмо|повторение|0
1656|211|Повторение: письмо - 2|повторение|0
1657|212|Повторение: коммуникация|повторение|0
1658|213|Повторение: коммуникация - 2|повторение|0
1659|214|Повторение: аудирование|повторение|0
1660|215|Повторение: аудирование - 2|повторение|0
1756|216|Итоговый экзамен: грамматика||1
1757|217|Итоговый экзамен: письмо||1
1758|218|Итоговый экзамен: аудирование||1
1759|219|Итоговый экзамен: коммуникация||2`,
};
const PUZZLE_LESSONS = PUZZLE_COURSE.data.split("\n").map((line) => {
  const [id, n, title, topic, test] = line.split("|");
  return { id, n: +n, title, topic, test: +test };
});
function puzzleLesson(id) { return PUZZLE_LESSONS.find((l) => l.id === String(id)) || null; }
function puzzleLessonUrl(l) { return `${PUZZLE_COURSE.url}?lesson=${l.id}`; }
function puzzleTheme(l) { return PUZZLE_COURSE.themes.find((t) => l.n >= t.from && l.n <= t.to); }

// что ещё осталось в прошлых курсах (на 26.10.2026)
const PUZZLE_ACHIEVEMENTS = [
  { title: "Beginner", state: "пройден, сертификат" },
  { title: "Elementary", state: "пройден, сертификат" },
  { title: "Pre-Intermediate, Part 1", state: "97%: уроки 1–201 пройдены, не сданы промежуточные экзамены и уроки 202, 203, 206" },
];

/* ---------- конспекты, которые написал Claude ---------- */
const PUZZLE_NOTES = [
  {
    id: "1147", date: "2026-10-26", by: "Claude", score: "85 заданий из 85 — без ошибок",
    summary: "Урок-чтение: блог «Say thank you!» о 7 изобретениях, которые изменили общение, — от почтовой марки и телеграфа до Skype и Facebook. Главное здесь — устойчивые сочетания: кому мы благодарны, как «связаться», «снять трубку», «болтать по телефону».",
    rules: [
      {
        title: "Благодарна КОМУ — TO, ЗА ЧТО — FOR",
        text: "be grateful TO + человек, FOR + причина. Как по-русски «кому» и «за что», только предлоги свои.",
        ex: [["We are grateful to Alexander Graham Bell for the invention of the phone.", "Мы благодарны Александру Грэхему Беллу за изобретение телефона."], ["I'm so grateful to you!", "Я так тебе благодарна!"]],
      },
      {
        title: "CONTACT — без предлога",
        text: "По-русски «связаться С кем-то», а по-английски contact someone — сразу, без with. Если хочется предлог — скажи get in touch WITH.",
        ex: [["We can contact our friends in no time.", "Мы можем связаться с друзьями мгновенно."], ["People got in touch very quickly.", "Люди быстро связывались друг с другом."]],
      },
      {
        title: "Телефон: ON the phone, PICK UP the phone",
        text: "Говорить по телефону — on the phone (не at). Снять трубку — pick up the phone. TAKE UP — это «начать заниматься»: take up a course.",
        ex: [["People enjoyed chatting to their friends on the phone.", "Люди любили болтать с друзьями по телефону."], ["Bell used «ahoy» when he picked up the phone.", "Белл говорил «ahoy», когда снимал трубку."]],
      },
      {
        title: "MAKE или DO",
        text: "MAKE — создаём результат: make payments (платить), make a video call, make friends. DO — занимаемся делом вообще: do something interesting, do everything online.",
        ex: [["People made payments online.", "Люди платили онлайн."], ["You can do everything online.", "Онлайн можно делать всё."]],
      },
      {
        title: "MEANS — и «средство», и «средства»",
        text: "S в means — часть слова, а не множественное число. Поэтому a means / the first means of communication WAS…",
        ex: [["The first means of communication was unreliable.", "Первое средство связи было ненадёжным."]],
      },
      {
        title: "LESS AND LESS — «всё менее»",
        text: "Повторяем слово — получаем «всё больше / всё меньше»: less and less popular, more and more popular. С get — «становиться».",
        ex: [["Even mobile phones are getting less and less popular.", "Даже мобильные телефоны становятся всё менее популярными."]],
      },
    ],
    words: [
      ["grateful", "благодарный"], ["forget — forgot — forgotten", "забывать"], ["send — sent — sent", "отправлять"],
      ["communication", "общение, связь"], ["means of communication", "средство связи"], ["invention", "изобретение"],
      ["screen", "экран"], ["touchscreen smartphone", "сенсорный смартфон"], ["landline phone", "стационарный телефон"],
      ["postal services", "почтовые услуги"], ["long-distance communication", "связь на большие расстояния"], ["stamp", "почтовая марка"],
      ["unreliable", "ненадёжный"], ["opportunity", "возможность"], ["in no time", "мгновенно, в два счёта"],
      ["across the globe", "по всему миру"], ["break down the boundaries", "стирать границы"], ["get in touch", "связаться"],
      ["keep up", "продолжать, поддерживать"], ["make friends online", "заводить друзей онлайн"], ["have a profile", "иметь профиль (в соцсети)"],
      ["take online courses", "проходить онлайн-курсы"],
    ],
    phrases: [
      ["Sorry, I forgot to give you a call.", "Прости, я забыла тебе позвонить."],
      ["We have a great time.", "Мы отлично проводим время."],
      ["It's a great idea!", "Это замечательная идея!"],
      ["Certainly, we should thank him.", "Конечно, нам стоит его поблагодарить."],
      ["No doubt this revolution breaks down all the boundaries.", "Несомненно, эта революция стирает все границы."],
      ["Actually, it was a telegraph message.", "На самом деле это было сообщение по телеграфу."],
    ],
    mistakes: [],
    remember: "grateful TO you FOR the call · contact (без with) your friends · ON the phone · PICK UP the phone.",
  },
];

/* ---------- состояние ---------- */
const LS_PUZZLE = "enapp_puzzle_v1";
const LS_PUZZLE_RAW = "enapp_puzzle_raw_v1"; // ответы уроков без конспекта — только в этом браузере
let PUZZLE = loadJSON(LS_PUZZLE, null) || { passed: {}, current: null, notes: {} };
let puzzleTab = "lessons";
let puzzleOpenNote = null;

function savePuzzle() {
  saveJSON(LS_PUZZLE, PUZZLE);
  if (window.CloudSync) window.CloudSync.schedulePush();
}
function puzzleBaselinePassed(n) {
  return PUZZLE_COURSE.passedBefore.split(",").some((r) => { const [a, b] = r.split("-").map(Number); return n >= a && n <= (b || a); });
}
function isPuzzlePassed(l) { return !!PUZZLE.passed[l.id] || puzzleBaselinePassed(l.n); }
function puzzleNote(id) { return PUZZLE.notes[id] || PUZZLE_NOTES.find((x) => x.id === String(id)) || null; }
function allPuzzleNotes() {
  const ids = new Set([...PUZZLE_NOTES.map((x) => x.id), ...Object.keys(PUZZLE.notes)]);
  return [...ids].map((id) => ({ ...puzzleNote(id), id })).filter((x) => puzzleLesson(x.id))
    .sort((a, b) => puzzleLesson(b.id).n - puzzleLesson(a.id).n);
}
// следующий урок — первый непройденный после последнего пройденного (пропущенные экзамены — отдельно)
function puzzleNextLesson() {
  let last = -1;
  PUZZLE_LESSONS.forEach((l, i) => { if (isPuzzlePassed(l)) last = i; });
  return PUZZLE_LESSONS.slice(last + 1).find((l) => !isPuzzlePassed(l)) || null;
}
function puzzleSkippedExams() {
  const next = puzzleNextLesson();
  return PUZZLE_LESSONS.filter((l) => l.test && !isPuzzlePassed(l) && next && l.n < next.n);
}
// уроки, которые проверяет экзамен: от прошлого экзамена до этого
function puzzleExamBlock(exam) {
  const i = PUZZLE_LESSONS.indexOf(exam);
  const out = [];
  for (let k = i - 1; k >= 0 && !PUZZLE_LESSONS[k].test; k--) out.unshift(PUZZLE_LESSONS[k]);
  return out;
}

/* ---------- конспекты → слова и день изучения в Повторении ---------- */
function puzzleNoteWordEn(s) { return String(s).split(" — ")[0].trim(); }
function puzzleLogEntry(note) {
  const l = puzzleLesson(note.id);
  return {
    id: "pe-lesson-" + note.id, date: note.date, source: "puzzle",
    lessons: [{ skill: `Puzzle · Урок ${l.n} · ${l.title}`, lessonNum: "конспект" }],
    newWords: (note.words || []).map((w) => puzzleNoteWordEn(w[0])),
    rules: (note.rules || []).map((r) => ({ title: r.title, explanation: r.text + (r.ex && r.ex.length ? "\n" + r.ex.map((e) => `${e[0]} — ${e[1]}`).join("\n") : "") })),
  };
}
function mergePuzzleNotes() {
  const have = new Set(WORDS_DATA.map((w) => importKey(w.en)));
  let maxId = WORDS_DATA.reduce((m, w) => Math.max(m, w.id), 0);
  for (const note of allPuzzleNotes()) {
    for (const [en, ru] of note.words || []) {
      const e = puzzleNoteWordEn(en);
      const k = importKey(e);
      if (!k || have.has(k)) continue;
      have.add(k);
      WORDS_DATA.unshift({ en: e, ru, src: "puzzle", id: ++maxId });
    }
    const entry = puzzleLogEntry(note);
    const i = DUO_LOG.findIndex((x) => x.id === entry.id);
    if (i >= 0) DUO_LOG.splice(i, 1);
    DUO_LOG.unshift(entry);
  }
  if (typeof resetDataCaches === "function") resetDataCaches();
}
mergePuzzleNotes();

/* ---------- действия ---------- */
function puzzleCreateLesson() {
  const next = puzzleNextLesson();
  if (!next) return;
  PUZZLE.current = { id: next.id, at: todayStr() };
  savePuzzle();
  renderPuzzle();
}
function puzzleFinishLesson() {
  if (!PUZZLE.current) return;
  PUZZLE.passed[PUZZLE.current.id] = todayStr();
  PUZZLE.current = null;
  savePuzzle();
  renderPuzzle();
}
function puzzleCancelLesson() {
  PUZZLE.current = null;
  savePuzzle();
  renderPuzzle();
}
function setPuzzleTab(tab) {
  puzzleTab = tab;
  puzzleOpenNote = null;
  renderPuzzle();
}
function openPuzzleNote(id) {
  puzzleTab = "notes";
  puzzleOpenNote = String(id);
  if (typeof showView === "function" && !document.getElementById("view-puzzle").classList.contains("active")) showView("puzzle");
  else renderPuzzle();
  window.scrollTo(0, 0);
}
function puzzleNoteWords(id) { return (puzzleNote(id).words || []).map((w) => puzzleNoteWordEn(w[0])); }
function puzzleLearnNote(id) { startLearnForWords(puzzleNoteWords(id)); }
function puzzleCheckNote(id) { startSessionForWords(puzzleNoteWords(id)); }
function puzzleCheckBlock(ids) {
  const words = [];
  for (const id of ids) if (puzzleNote(id)) words.push(...puzzleNoteWords(id));
  if (words.length) startSessionForWords([...new Set(words)]);
}

/* ---------- приём урока из закладки и конспект через Gemini ---------- */
async function aiPuzzleNote(lesson, tests) {
  const body = tests.map((t, i) => `${i + 1}. ${t.ok ? "" : "[ОШИБКА] "}${t.t}`).join("\n").slice(0, 28000);
  const prompt = `Ты — мудрый и добрый учитель английского для русскоговорящей ученицы (A2–B1).
Она прошла урок Puzzle English «Метод Тичера»: урок ${lesson.n} «${lesson.title}» (тема урока: ${lesson.topic || "экзамен"}).
Ниже — все задания урока с её ответами; [ОШИБКА] — задания, где она ошиблась.
Составь конспект урока для её тетради:
- summary: 1–2 предложения, о чём урок;
- rules: 2–6 правил из урока — title (коротко, как правило-запоминалка), text (1–3 простых предложения по-русски: как и ПОЧЕМУ так), ex — 1–2 примера из урока [английский, русский];
- words: 10–25 новых слов и выражений урока [английский, русский]; у неправильных глаголов — три формы через « — »;
- phrases: 4–8 полезных готовых фраз из урока [английский, русский];
- mistakes: её ошибки (только из заданий с [ОШИБКА]): task — задание, yours — её ответ, correct — как правильно, why — почему, 1–2 коротких предложения по-доброму;
- remember: одна строка — самое главное из урока.
Задания:
${body}
Ответь СТРОГО JSON без markdown: {"summary":"","rules":[{"title":"","text":"","ex":[["",""]]}],"words":[["",""]],"phrases":[["",""]],"mistakes":[{"task":"","yours":"","correct":"","why":""}],"remember":""}`;
  const r = parseJsonLoose(await callGeminiRaw(prompt, true));
  const pairs = (a) => (Array.isArray(a) ? a : []).filter((x) => Array.isArray(x) && x[0]).map((x) => [String(x[0]), String(x[1] || "")]);
  return {
    summary: String(r.summary || ""),
    rules: (Array.isArray(r.rules) ? r.rules : []).filter((x) => x && x.title).map((x) => ({ title: String(x.title), text: String(x.text || ""), ex: pairs(x.ex) })),
    words: pairs(r.words),
    phrases: pairs(r.phrases),
    mistakes: (Array.isArray(r.mistakes) ? r.mistakes : []).filter((x) => x && x.correct).map((x) => ({ task: String(x.task || ""), yours: String(x.yours || ""), correct: String(x.correct), why: String(x.why || "") })),
    remember: String(r.remember || ""),
  };
}
async function processPuzzleLesson(data, step) {
  const lesson = puzzleLesson(data.lesson);
  if (!lesson) throw new Error("этого урока нет в курсе Pre-Intermediate, Part 2");
  const tests = data.tests || [];
  const errors = tests.filter((t) => !t.ok).length;
  step(`Урок ${lesson.n} «${lesson.title}»: ${tests.length} ${plural(tests.length, "задание", "задания", "заданий")}, ошибок — ${errors}`);
  if (!PUZZLE.passed[lesson.id]) PUZZLE.passed[lesson.id] = todayStr();
  if (PUZZLE.current && PUZZLE.current.id === lesson.id) PUZZLE.current = null;
  const score = errors ? `${tests.length - errors} из ${tests.length} без ошибок` : `${tests.length} ${plural(tests.length, "задание", "задания", "заданий")} — без ошибок`;
  let html;
  if (!loadAiKey()) {
    const raw = loadJSON(LS_PUZZLE_RAW, {});
    raw[lesson.id] = { at: todayStr(), tests };
    saveJSON(LS_PUZZLE_RAW, raw);
    html = `<div class="import-done">${ico("check")} Урок ${lesson.n} отмечен пройденным</div>
      <p class="block-note">Конспект пишет ИИ, а ключа Gemini нет (его можно добавить в «Диалоге»). Или скажи Claude: «законспектируй урок ${lesson.n}».</p>`;
  } else {
    step("Пишу конспект: правила, слова, ошибки…");
    const note = await aiPuzzleNote(lesson, tests);
    PUZZLE.notes[lesson.id] = { id: lesson.id, date: todayStr(), by: "Gemini", score, ...note };
    mergePuzzleNotes();
    html = `<div class="import-done">${ico("check")} Конспект урока ${lesson.n} готов</div>
      <div class="grade-rows">
        <div class="grade-row"><span>Правила</span><b>${note.rules.length}</b></div>
        <div class="grade-row"><span>Слова</span><b>${note.words.length}</b></div>
        <div class="grade-row"><span>Ошибки с разбором</span><b>${note.mistakes.length}</b></div>
      </div>
      <p class="block-note">Конспект — в Нотатнике, слова урока попали в Повторение: первый повтор завтра.</p>`;
    puzzleOpenNote = lesson.id;
    puzzleTab = "notes";
  }
  savePuzzle();
  return { html, view: "puzzle" };
}

/* ---------- экран ---------- */
function puzzleLessonLine(l) {
  const passed = isPuzzlePassed(l);
  const cur = PUZZLE.current && PUZZLE.current.id === l.id;
  const note = puzzleNote(l.id);
  const mark = passed ? ico("check", "pz-ok") : cur ? ico("arrow-right", "pz-cur") : `<span class="pz-dot"></span>`;
  return `<div class="pz-row${passed ? " passed" : ""}${cur ? " current" : ""}${l.test ? " exam" : ""}">
    <span class="pz-num">${l.n}</span>
    <span class="pz-text"><span class="pz-title">${escapeHtml(l.title)}</span>${l.topic ? `<small>${escapeHtml(l.topic)}</small>` : ""}</span>
    ${note ? `<button class="link-btn pz-note-link" onclick="openPuzzleNote('${l.id}')">${ico("book-2")} конспект</button>` : ""}
    <span class="pz-mark">${mark}</span>
  </div>`;
}
// давно пройденные уроки без конспекта сворачиваются в одну строку
function puzzleThemeRows(ls) {
  const lastPassed = ls.reduce((m, l, i) => (isPuzzlePassed(l) ? i : m), -1);
  const old = ls.filter((l, i) => i < lastPassed - 1 && isPuzzlePassed(l) && !puzzleNote(l.id));
  const rest = ls.filter((l) => !old.includes(l));
  if (old.length < 3) return ls.map(puzzleLessonLine).join("");
  return `<details class="pz-old"><summary>${ico("check", "pz-ok")} Пройдено ${old.length} ${plural(old.length, "урок", "урока", "уроков")} (${old[0].n}–${old[old.length - 1].n})</summary>${old.map(puzzleLessonLine).join("")}</details>`
    + rest.map(puzzleLessonLine).join("");
}
function puzzleCurrentHtml() {
  const l = puzzleLesson(PUZZLE.current.id);
  const theme = puzzleTheme(l);
  if (l.test) {
    const block = puzzleExamBlock(l);
    const withNotes = block.filter((x) => puzzleNote(x.id));
    return `<div class="card pz-current">
      <div class="pz-kicker">Экзамен · ${escapeHtml(theme.title)}</div>
      <h2 class="pz-h">${escapeHtml(l.title)}</h2>
      <p class="block-note">Проверяет уроки ${block[0].n}–${block[block.length - 1].n}. Сначала 10 минут на конспекты — потом экзамен.</p>
      ${withNotes.length ? `<div class="pz-prep">${withNotes.map((x) => `<button class="toc-item" onclick="openPuzzleNote('${x.id}')">${ico("book-2")}<span class="toc-line"><span class="toc-text">Урок ${x.n} · ${escapeHtml(x.title)}</span></span></button>`).join("")}</div>
        <button class="small-btn" onclick='puzzleCheckBlock(${JSON.stringify(withNotes.map((x) => x.id))})'>${ico("pencil")} Проверить слова блока</button>` : ""}
      <a class="cta pz-go" href="${puzzleLessonUrl(l)}" target="_blank" rel="noopener">Сдать экзамен в Puzzle English ${ico("arrow-right")}</a>
      <div class="cta-alt"><button class="link-btn" onclick="puzzleFinishLesson()">${ico("check")} Сдала</button><span aria-hidden="true">·</span><button class="link-btn" onclick="puzzleCancelLesson()">отложить</button></div>
    </div>`;
  }
  return `<div class="card pz-current">
    <div class="pz-kicker">Урок ${l.n} · ${escapeHtml(theme.title)}</div>
    <h2 class="pz-h">${escapeHtml(l.title)}</h2>
    <p class="pz-topic">${escapeHtml(l.topic)}</p>
    <ol class="pz-steps">
      <li><b>Смотри видео и делай задания</b> — урок откроется в Puzzle English. Минут 20–25.</li>
      <li><b>Конспект:</b> в конце урока нажми «Смотреть мои ответы», потом закладку «Мой английский» — конспект с правилами, словами и разбором ошибок появится в Нотатнике.</li>
    </ol>
    <a class="cta pz-go" href="${puzzleLessonUrl(l)}" target="_blank" rel="noopener">Открыть урок ${l.n} ${ico("arrow-right")}</a>
    <div class="cta-alt"><button class="link-btn" onclick="puzzleFinishLesson()">${ico("check")} Прошла, конспект попрошу у Claude</button><span aria-hidden="true">·</span><button class="link-btn" onclick="puzzleCancelLesson()">отложить</button></div>
  </div>`;
}
function renderPuzzleLessons() {
  const passedCount = PUZZLE_LESSONS.filter(isPuzzlePassed).length;
  const next = puzzleNextLesson();
  const skipped = puzzleSkippedExams();
  const curTheme = next ? puzzleTheme(next) : PUZZLE_COURSE.themes[PUZZLE_COURSE.themes.length - 1];
  let html = `<div class="pz-progress">
      <div class="pz-course">${escapeHtml(PUZZLE_COURSE.title)}</div>
      <div class="pz-bar"><span style="width:${Math.round((passedCount / PUZZLE_LESSONS.length) * 100)}%"></span></div>
      <div class="pz-stat">${passedCount} из ${PUZZLE_LESSONS.length} · ${allPuzzleNotes().length} ${plural(allPuzzleNotes().length, "конспект", "конспекта", "конспектов")}</div>
    </div>`;
  if (PUZZLE.current) html += puzzleCurrentHtml();
  else if (next) html += `<div class="card pz-current pz-empty">
      <div class="pz-kicker">Следующий · ${next.test ? "экзамен" : "урок " + next.n}</div>
      <h2 class="pz-h">${escapeHtml(next.title)}</h2>
      ${next.topic ? `<p class="pz-topic">${escapeHtml(next.topic)}</p>` : ""}
      <button class="cta" onclick="puzzleCreateLesson()">Создай урок ${ico("sparkles")}</button>
    </div>`;
  else html += `<div class="card pz-current"><h2 class="pz-h">Курс пройден 🎉</h2></div>`;

  if (skipped.length) html += `<p class="block-note pz-skipped">${ico("target")} Не сдан ${plural(skipped.length, "экзамен", "экзамены", "экзамены")}: ${skipped.map((l) => `<a href="${puzzleLessonUrl(l)}" target="_blank" rel="noopener">${escapeHtml(l.title)}</a>`).join(", ")} — можно сдать в любой день.</p>`;

  html += PUZZLE_COURSE.themes.map((t) => {
    const ls = PUZZLE_LESSONS.filter((l) => l.n >= t.from && l.n <= t.to);
    const done = ls.filter(isPuzzlePassed).length;
    const open = t === curTheme;
    return `<details class="pz-theme"${open ? " open" : ""}>
      <summary><span>Тема ${t.n}. ${escapeHtml(t.title)}</span><small>${done}/${ls.length}</small></summary>
      <div class="pz-list">${puzzleThemeRows(ls)}</div>
    </details>`;
  }).join("");
  html += `<h2 class="section-title">Прошлые курсы</h2><div class="sched">${PUZZLE_ACHIEVEMENTS.map((a) => `<div class="sched-row"><span class="sched-label">${escapeHtml(a.title)}</span><span class="sched-next">${escapeHtml(a.state)}</span></div>`).join("")}</div>`;
  return html;
}
function renderNotebookList() {
  const notes = allPuzzleNotes();
  if (!notes.length) return `<div class="empty-state">Нотатник пока пуст. Пройди урок — и здесь появится его конспект.</div>`;
  return `<div class="nb-index">${notes.map((x) => {
    const l = puzzleLesson(x.id);
    return `<button class="nb-entry" onclick="openPuzzleNote('${x.id}')">
      <span class="nb-entry-num">${l.n}</span>
      <span class="nb-entry-text"><b>${escapeHtml(l.title)}</b><small>${escapeHtml(l.topic || "экзамен")} · ${(x.rules || []).length} ${plural((x.rules || []).length, "правило", "правила", "правил")} · ${(x.words || []).length} ${plural((x.words || []).length, "слово", "слова", "слов")}</small></span>
      ${ico("chevron-right")}
    </button>`;
  }).join("")}</div>`;
}
function renderNotePage(id) {
  const x = puzzleNote(id);
  const l = puzzleLesson(id);
  const pair = (p) => `<div class="nb-pair"><span class="nb-en">${escapeHtml(p[0])}</span><span class="nb-ru">${escapeHtml(p[1])}</span></div>`;
  return `<button class="archive-back" onclick="setPuzzleTab('notes')">${ico("arrow-left")} Нотатник</button>
  <article class="nb-page">
    <header class="nb-head">
      <div class="nb-kicker">Puzzle English · ${escapeHtml(puzzleTheme(l).title)}</div>
      <h2 class="nb-title"><span class="nb-n">Урок ${l.n}.</span> ${escapeHtml(l.title)}</h2>
      <div class="nb-meta">${escapeHtml(l.topic || "экзамен")}${x.score ? " · " + escapeHtml(x.score) : ""}</div>
    </header>
    ${x.summary ? `<p class="nb-summary">${escapeHtml(x.summary)}</p>` : ""}
    ${(x.rules || []).length ? `<h3 class="nb-h">Правила</h3>${x.rules.map((r, i) => `<section class="nb-rule">
        <div class="nb-rule-title"><span class="nb-rule-n">${i + 1}</span>${escapeHtml(r.title)}</div>
        <p>${escapeHtml(r.text)}</p>
        ${(r.ex || []).map((e) => `<div class="nb-ex"><span class="nb-en">${escapeHtml(e[0])}</span><span class="nb-ru">${escapeHtml(e[1])}</span></div>`).join("")}
      </section>`).join("")}` : ""}
    ${(x.words || []).length ? `<h3 class="nb-h">Слова</h3><div class="nb-words">${x.words.map(pair).join("")}</div>
      <div class="settings-row">
        <button class="small-btn learn-btn" onclick="puzzleLearnNote('${id}')">${ico("book-2")} Изучить</button>
        <button class="small-btn" onclick="puzzleCheckNote('${id}')">${ico("pencil")} Проверить себя</button>
      </div>` : ""}
    ${(x.phrases || []).length ? `<h3 class="nb-h">Фразы</h3><div class="nb-phrases">${x.phrases.map((e) => `<div class="nb-ex"><span class="nb-en">${escapeHtml(e[0])}</span><span class="nb-ru">${escapeHtml(e[1])}</span></div>`).join("")}</div>` : ""}
    <h3 class="nb-h">Мои ошибки</h3>
    ${(x.mistakes || []).length ? x.mistakes.map((m) => `<section class="nb-mistake">
        ${m.task ? `<div class="nb-task">${escapeHtml(m.task)}</div>` : ""}
        ${m.yours ? `<div class="nb-yours">${escapeHtml(m.yours)}</div>` : ""}
        <div class="nb-correct">${escapeHtml(m.correct)}</div>
        ${m.why ? `<p class="nb-why">${escapeHtml(m.why)}</p>` : ""}
      </section>`).join("") : `<p class="nb-none">Ошибок нет — чисто.</p>`}
    ${x.remember ? `<aside class="nb-remember"><b>Запомни</b>${escapeHtml(x.remember)}</aside>` : ""}
    <footer class="nb-foot">Конспект: ${escapeHtml(x.by || "Claude")} · <a href="${puzzleLessonUrl(l)}" target="_blank" rel="noopener">урок в Puzzle English</a></footer>
  </article>`;
}
function renderPuzzle() {
  const el = document.getElementById("puzzle-body");
  if (!el) return;
  document.querySelectorAll("#puzzle-tabs .filter-chip").forEach((b) => b.classList.toggle("active", b.dataset.tab === puzzleTab));
  const nc = document.getElementById("puzzle-notes-count");
  if (nc) nc.textContent = `(${allPuzzleNotes().length})`;
  if (puzzleTab === "notes") el.innerHTML = puzzleOpenNote && puzzleNote(puzzleOpenNote) ? renderNotePage(puzzleOpenNote) : renderNotebookList();
  else el.innerHTML = renderPuzzleLessons();
}
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#puzzle-tabs .filter-chip").forEach((b) => b.addEventListener("click", () => setPuzzleTab(b.dataset.tab)));
});
