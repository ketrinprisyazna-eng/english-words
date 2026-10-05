// Правила английского — очень коротко и «на крючок памяти».
// Каждое правило: hook — запоминалка в одну строку, body — пара строк объяснения,
// groups — подгруппы слов. Слова в группах пишутся как в words.js; на странице
// показываются только те, что уже есть в твоём словаре, — так что новые слова
// (из следующих уроков) сами появятся в нужном правиле, если они есть в списке.
// pattern/exclude — для «открытых» правил (суффиксы, приставки, сокращения):
// любое новое слово, подходящее под шаблон, автоматически попадает в правило.
//
// Неправильные глаголы — отдельная таблица IRREGULAR_VERBS (база — 2-я — 3-я форма),
// сгруппированная по похожему звучанию: так их в разы легче запомнить.

const IRREGULAR_VERBS = [
  { group: "ОТ", hook: "Купил, принёс, подумал, подрался, поймал, научил — всё звучит «ОТ»: bought, brought, thought, fought, caught, taught.", verbs: [
    ["buy", "bought", "bought", "покупать"], ["bring", "brought", "brought", "приносить"], ["think", "thought", "thought", "думать"],
    ["fight", "fought", "fought", "драться"], ["catch", "caught", "caught", "ловить"], ["teach", "taught", "taught", "учить (кого-то)"],
    ["seek", "sought", "sought", "искать"],
  ] },
  { group: "И → А → У", hook: "Как гамма: sIng → sAng → sUng. Меняется только гласная: И, А, У.", verbs: [
    ["sing", "sang", "sung", "петь"], ["ring", "rang", "rung", "звонить"], ["drink", "drank", "drunk", "пить"],
    ["swim", "swam", "swum", "плавать"], ["begin", "began", "begun", "начинать"], ["run", "ran", "run", "бегать"],
    ["sink", "sank", "sunk", "тонуть"],
  ] },
  { group: "Ленивые: все формы одинаковые", hook: "Короткие слова на -T/-D ленятся меняться: cut — cut — cut. (read пишется одинаково, но в прошлом читается «ред»).", verbs: [
    ["cut", "cut", "cut", "резать"], ["put", "put", "put", "класть"], ["hit", "hit", "hit", "ударять"], ["let", "let", "let", "позволять"],
    ["quit", "quit", "quit", "бросать"], ["set", "set", "set", "устанавливать"], ["cost", "cost", "cost", "стоить"], ["shut", "shut", "shut", "закрывать"],
    ["hurt", "hurt", "hurt", "болеть, ранить"], ["read", "read", "read", "читать"], ["spread", "spread", "spread", "распространять"],
  ] },
  { group: "Долгое «И» → короткое «Е»", hook: "fEEl → fElt, slEEp → slEpt, mEEt → mEt: длинный звук сжимается в короткое «е» (+ часто T).", verbs: [
    ["feel", "felt", "felt", "чувствовать"], ["sleep", "slept", "slept", "спать"], ["keep", "kept", "kept", "хранить"], ["meet", "met", "met", "встречать"],
    ["feed", "fed", "fed", "кормить"], ["bleed", "bled", "bled", "кровоточить"], ["leave", "left", "left", "уходить, оставлять"], ["mean", "meant", "meant", "значить"],
    ["sweep", "swept", "swept", "подметать"], ["deal", "dealt", "dealt", "иметь дело"], ["lead", "led", "led", "вести"], ["hear", "heard", "heard", "слышать"],
  ] },
  { group: "-EW / -OWN", hook: "Летать и знать: flY — flEW — flOWN, knOW — knEW — knOWN. 2-я на -EW, 3-я на -N.", verbs: [
    ["know", "knew", "known", "знать"], ["grow", "grew", "grown", "расти"], ["throw", "threw", "thrown", "бросать"], ["fly", "flew", "flown", "летать"],
    ["draw", "drew", "drawn", "рисовать"], ["blow", "blew", "blown", "дуть"],
  ] },
  { group: "3-я форма на -EN", hook: "Если 3-я форма «длиннее» — она на -EN: take → taken, eat → eaten, steal → stolen.", verbs: [
    ["take", "took", "taken", "брать"], ["eat", "ate", "eaten", "есть"], ["give", "gave", "given", "давать"], ["write", "wrote", "written", "писать"],
    ["drive", "drove", "driven", "водить"], ["ride", "rode", "ridden", "ездить верхом"], ["speak", "spoke", "spoken", "говорить"], ["break", "broke", "broken", "ломать"],
    ["choose", "chose", "chosen", "выбирать"], ["steal", "stole", "stolen", "красть"], ["wake", "woke", "woken", "просыпаться"], ["forget", "forgot", "forgotten", "забывать"],
    ["get", "got", "gotten", "получать"], ["fall", "fell", "fallen", "падать"], ["hide", "hid", "hidden", "прятать"], ["see", "saw", "seen", "видеть"],
    ["rise", "rose", "risen", "подниматься"], ["shake", "shook", "shaken", "трясти"], ["swear", "swore", "sworn", "клясться"], ["wear", "wore", "worn", "носить (одежду)"],
  ] },
  { group: "D → T", hook: "Строить, отправлять, тратить, одалживать: D на конце превращается в T — build → built, send → sent.", verbs: [
    ["build", "built", "built", "строить"], ["send", "sent", "sent", "отправлять"], ["spend", "spent", "spent", "тратить"], ["lend", "lent", "lent", "одалживать"],
    ["bend", "bent", "bent", "сгибать"],
  ] },
  { group: "2-я = 3-я форма", hook: "У этих 2-я и 3-я формы одинаковые — учишь одну, получаешь две.", verbs: [
    ["say", "said", "said", "сказать"], ["pay", "paid", "paid", "платить"], ["make", "made", "made", "делать"], ["have", "had", "had", "иметь"],
    ["sell", "sold", "sold", "продавать"], ["tell", "told", "told", "рассказывать"], ["find", "found", "found", "находить"], ["stand", "stood", "stood", "стоять"],
    ["understand", "understood", "understood", "понимать"], ["hold", "held", "held", "держать"], ["win", "won", "won", "побеждать"], ["sit", "sat", "sat", "сидеть"],
    ["lose", "lost", "lost", "терять"], ["hang", "hung", "hung", "висеть"],
  ] },
  { group: "Особенные — просто выучить", hook: "Самые частые глаголы — самые «неправильные». Их 6, выучи как стишок: go-went, do-did, come-came, be-was, become-became, lie-lay.", verbs: [
    ["go", "went", "gone", "идти"], ["do", "did", "done", "делать"], ["come", "came", "come", "приходить"], ["become", "became", "become", "становиться"],
    ["be", "was / were", "been", "быть"], ["lie", "lay", "lain", "лежать"],
  ] },
];

const RULES = [
  {
    id: "irregular", icon: "🔀", title: "Неправильные глаголы",
    hook: "Не учи списком — учи «семьями» по звучанию: bought-brought-thought звучат одинаково.",
    body: "У правильных глаголов прошлое = +ED (work → worked). У неправильных — своя форма.\n2-я форма — простое прошлое (I went — я пошёл).\n3-я форма — после have/has (I have gone — я ушёл) и в пассиве (stolen — украденный).",
    irregular: true,
  },
  {
    id: "regular-ed", icon: "➕", title: "Правильные глаголы: прошлое = +ED",
    hook: "Прошлое = глагол + ED. После T и D слышно «-ИД»: visitED [визитид].",
    body: "kick → kicked [кикт] — после глухих звуков читается «т».\nname → named [неймд] — после звонких «д».\nvisit → visited [визитид] — после t/d «ид».\nПравописание: y → ied (fry → fried, worry → worried); короткое слово удваивает букву (can → canned).",
    groups: [
      { label: "Из твоего словаря", words: ["kicked", "named", "located", "visited", "expired", "fried", "organized", "allowed", "closed", "involved", "guided", "canned", "dedicated", "employed", "married", "get married", "married to", "grilled", "prepared", "engaged", "advanced", "complicated", "crowded", "whipped cream", "fried", "expired", "be involved in", "an unemployed"] },
    ],
  },
  {
    id: "ed-ing", icon: "😴", title: "-ED или -ING: «мне скучно» или «оно скучное»",
    hook: "-ED — что чувствую Я, -ING — какое ОНО (фильм, урок). I am bored, because the film is boring.",
    body: "I'm bored — мне скучно.  The lesson is boring — урок скучный.\nI'm interested — мне интересно.  The book is interesting — книга интересная.\nСкажешь «I am boring» — получится «я зануда» 😄",
    groups: [
      { label: "Пары -ED / -ING", words: ["bored", "boring", "excited", "exciting", "get excited", "interested", "interesting", "interested in", "surprised", "surprising", "confused", "confusing", "annoyed", "annoying", "shocked", "shocking", "relaxing", "relaxation", "tired", "embarrassed", "worried", "scared", "pleased", "exhausted", "stressed", "stressed out", "entertaining", "amazing", "challenging"] },
    ],
  },
  {
    id: "plural", icon: "👨‍👩‍👧", title: "Неправильное множественное число",
    hook: "«Мужчины и женщины с детьми ходят ногами (feet) и чистят зубы (teeth) от мышей (mice)» — все исключения в одной фразе.",
    body: "Обычно: +S (cat → cats), после s/sh/ch/x: +ES (box → boxes).\nИсключения меняют гласную: man → men, foot → feet, tooth → teeth, mouse → mice.\n-F/-FE → -VES: knife → knives, shelf → shelves, leaf → leaves.\nПарные вещи (брюки, ножницы, очки) всегда во множественном.",
    groups: [
      { label: "Меняют гласную / форму", words: ["man", "men", "woman", "women", "child", "children", "grandchildren", "foot", "feet", "tooth", "teeth", "mouse", "mice", "person", "people", "salesperson", "salespeople"] },
      { label: "-F → -VES", words: ["knife", "knives", "shelf", "shelves", "leaves", "life", "wife"] },
      { label: "Всегда во множественном (две половинки)", words: ["pants", "jeans", "shorts", "scissors", "glasses", "sunglasses", "pajamas", "headphones", "tights", "clothes", "stairs", "groceries"] },
    ],
  },
  {
    id: "ly", icon: "🏃", title: "-LY = «как?» (наречие)",
    hook: "quick — быстрый, quick+LY — быстрО. -LY превращает «какой?» в «как?».",
    body: "slow → slowly (медленно), careful → carefully (осторожно), easy → easily (y → i).\nИсключение: good → WELL (хорошо).\nЛовушка: -LY после существительного даёт прилагательное: friend → friendly (дружелюбный), day → daily (ежедневный).",
    pattern: /ly$/i,
    exclude: ["apply", "jelly", "july", "reply", "fly", "family", "only", "ugly", "curly", "early", "lonely", "friendly", "cowardly", "daily", "weekly", "monthly", "yearly", "really", "yours truly", "heal readily", "overly polite", "italy", "lily", "rely", "supply", "belly", "bully", "holy", "silly", "lovely"],
    groups: [
      { label: "Как? — наречия на -LY", words: ["slowly", "quickly", "carefully", "badly", "easily", "clearly", "exactly", "not exactly", "completely", "fortunately", "unfortunately", "hopefully", "possibly", "nearly", "suddenly", "probably", "especially", "honestly", "immediately", "certainly", "currently", "definitely", "regularly", "actually", "normally", "finally", "usually", "really", "hugely", "accurately", "heal readily", "overly polite", "well"] },
      { label: "Как часто? — каждый день / неделю…", words: ["daily", "weekly", "monthly", "yearly"] },
      { label: "Ловушки: это прилагательные", words: ["friendly", "lonely", "ugly", "curly", "early", "cowardly", "lovely"] },
    ],
  },
  {
    id: "compare", icon: "📏", title: "Сравнение: -ER / -EST и MORE / MOST",
    hook: "Короткое слово — хвостик (-ER, -EST), длинное — «подпорка» (MORE, THE MOST).",
    body: "big → bigger → the biggest;  near → nearer → the nearest.\nexpensive → more expensive → the most expensive.\n«Чем» = THAN: bigger than me.\nИсключения (как стишок): good-better-best, bad-worse-worst, far-farther-farthest, little-less-least, much/many-more-most.",
    groups: [
      { label: "Исключения", words: ["better", "best", "like best", "best of all", "worse", "worst", "farther", "farthest", "less", "least", "at least", "more", "most", "the most", "more often"] },
      { label: "С хвостиком -ER / -EST", words: ["nearest", "latest", "than"] },
    ],
  },
  {
    id: "contractions", icon: "✂️", title: "Сокращения: апостроф = съеденная буква",
    hook: "Апостроф (') стоит там, где «съели» букву: do nOt → don't (съели O), I Am → I'm (съели A).",
    body: "NOT → N'T: isn't, don't, can't. Исключение: will not → WON'T.\nam/is/are → 'M/'S/'RE: I'm, it's, you're.\nwill → 'LL: I'll, it'll.  would → 'D: I'd like.\n'S после имени — «чей»: driver's license (права водителя).",
    pattern: /['’]/,
    groups: [
      { label: "NOT → N'T", words: ["isn't", "aren't", "wasn't", "weren't", "don't", "doesn't", "didn't", "haven't", "hasn't", "can't", "couldn't", "shouldn't", "won't", "isn't it", "why don't", "don't care", "don't worry", "don't forget to", "can't wait", "I don't think so"] },
      { label: "AM / IS / ARE → 'M / 'S / 'RE", words: ["I'm good", "it's", "it's time", "it's hot", "it's sunny", "it's cold", "it's rainy", "he's", "she's", "that's", "that's right", "that's fine", "that's too bad", "what's", "what's up", "what's wrong", "what's your name", "where's", "who's", "how's", "how's it going", "how's the weather", "there's", "here's", "they're", "we're", "you're", "you're welcome"] },
      { label: "WILL → 'LL,  WOULD → 'D,  US → 'S", words: ["it'll", "they'll", "we'll", "she'll", "he'll", "you'll", "I'd like", "let's", "let's go"] },
      { label: "'S = «чей»", words: ["driver's license", "doctor's office", "New Year's Eve"] },
      { label: "Другие сокращения", words: ["o'clock", "ma'am"] },
    ],
  },
  {
    id: "pronouns", icon: "👉", title: "Местоимения: my → mine, I → me",
    hook: "MY + слово, MINE — без слова: This is MY bag → The bag is MINE. Без существительного добавь -S: your → yours.",
    body: "Чей? перед словом: my, your, his, her, its, our, their.\nЧей? без слова: mine, yours, his, hers, ours, theirs.\nКого/кому?: I → me, he → him, she → her, we → us, they → them.\nWHOSE — чей? (Whose bag is it?)",
    groups: [
      { label: "Чей? (перед словом)", words: ["my", "your", "his", "her", "its", "our", "their", "whose"] },
      { label: "Чей? (без слова, +S)", words: ["mine", "yours", "hers", "ours", "theirs", "of mine", "yours truly"] },
      { label: "Кого? Кому?", words: ["me", "him", "us", "them", "me too", "me neither"] },
    ],
  },
  {
    id: "self", icon: "🪞", title: "-SELF / -SELVES = «сам, себя»",
    hook: "Один — SELF, много — SELVES (как shelf → shelves).",
    body: "I did it myself — я сделал это сам.  Introduce yourself — представься.\nmy+self, your+self, him+self, her+self, it+self; our+selves, your+selves, them+selves.",
    pattern: /sel(f|ves)$/i,
    exclude: ["shelf", "shelves"],
    groups: [
      { label: "Один", words: ["myself", "yourself", "himself", "herself", "itself"] },
      { label: "Много", words: ["ourselves", "yourselves", "themselves"] },
    ],
  },
  {
    id: "numbers", icon: "🔢", title: "Числа: -TEEN, -TY и порядковые",
    hook: "-TEEN (13–19) — ударение в КОНЦЕ: fifTEEN. -TY (20–90) — в НАЧАЛЕ: FIFty. Порядковые = +TH (кроме first, second, third).",
    body: "Пишется странно: forty (без U!), fifty (five → fif), twelve → twelfth, five → fifth.\nГоды читают парами: 1870 = eighteen seventy, 1990 = nineteen ninety; но 2007 = two thousand seven, 2015 = twenty fifteen.\nПосле числа hundred/thousand без -S: two hundred. С -S — только «сотни/тысячи чего-то»: hundreds of people.",
    groups: [
      { label: "-TEEN (13–19)", words: ["thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"] },
      { label: "-TY (20–90)", words: ["twenty", "twenty-one", "thirty", "thirty-seven", "forty", "forty-five", "fifty", "sixty", "seventy", "eighty", "ninety"] },
      { label: "Порядковые: +TH", words: ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "tenth", "twentieth", "thirty-first", "for the first time", "first of all", "first class"] },
      { label: "Годы — парами", words: ["eighteen seventy", "eighteen ninety", "nineteen sixty", "nineteen ninety", "two thousand three", "two thousand seven", "twenty ten", "twenty fifteen"] },
      { label: "Сотни, тысячи, миллионы", words: ["hundred", "hundreds", "thousand", "thousands", "million"] },
    ],
  },
  {
    id: "capitals", icon: "🔠", title: "С большой буквы",
    hook: "Всё, что есть в КАЛЕНДАРЕ и на КАРТЕ МИРА, + слово «I» (я) — всегда с большой буквы.",
    body: "Дни недели и месяцы: Monday, June.\nЯзыки и национальности: English, Spanish, American.\nI — «я» — всегда большая, даже в середине предложения: Yesterday I went…",
    groups: [
      { label: "Дни недели", words: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
      { label: "Месяцы", words: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] },
      { label: "Языки и национальности", words: ["English", "British", "American", "Canadian", "Australian", "Spanish", "Italian", "German", "French", "Portuguese", "Arabic", "Japanese", "Chinese", "Hindi"] },
      { label: "Я = I", words: ["I", "I'm good", "I think so", "I don't think so", "I love", "I need", "I'd like"] },
    ],
  },
  {
    id: "phrasal", icon: "🧩", title: "Фразовые глаголы: смысл даёт маленькое слово",
    hook: "UP — до конца, OUT — наружу, OFF — прочь/выкл, ON — на/вкл, DOWN — вниз, BACK — назад, AWAY — прочь.",
    body: "Глагол + маленькое слово = новый смысл. Догадаться помогает частица:\nclean UP — убрать ДО КОНЦА,  find OUT — выяснить (вытащить НАРУЖУ),\nturn OFF — выключить,  turn ON — включить,  sit DOWN — сесть ВНИЗ,  throw AWAY — выбросить ПРОЧЬ.",
    groups: [
      { label: "UP — вверх / до конца", words: ["hurry up", "clean up", "grow up", "stand up", "wake up", "woke up", "give up", "given up", "pick up", "look up", "set up", "sign up", "make up", "follow up", "end up", "hang up", "ramp up", "break up"] },
      { label: "OUT — наружу / полностью", words: ["look out", "find out", "fill out", "work out", "take out", "check out", "hang out", "hung out", "go out", "stressed out", "bring out"] },
      { label: "OFF — прочь / выключить", words: ["take off", "turn off", "get off", "fall off", "hop off", "see off", "set off"] },
      { label: "ON — на / включить", words: ["turn on", "put on", "try on", "get on", "hop on", "click on", "depend on", "settle on", "copy somebody on"] },
      { label: "DOWN — вниз", words: ["sit down", "sat down", "fall down", "fell down", "lie down", "lying down", "write down", "put down", "cut down on"] },
      { label: "BACK — назад,  AWAY — прочь", words: ["come back", "get back", "give back", "throw away", "put away", "get away", "stay away from"] },
      { label: "Другие частицы", words: ["come over", "go over", "carry over", "stop over", "turn in", "check in", "come in", "muscle in", "turn into", "get into", "get along", "get around", "look after", "look for", "look at", "deal with", "put together", "get together", "gotten together", "come from", "leave for"] },
    ],
  },
  {
    id: "get", icon: "🔄", title: "GET + состояние = СТАТЬ",
    hook: "GET — волшебное «стать / получить / добраться»: get dark — стемнеть, get lost — потеряться, get home — добраться домой.",
    body: "get + прилагательное или 3-я форма = стать таким: get married — пожениться (стать женатыми), get hurt — пораниться.\nget + место = добраться: get home.\nget + предмет = получить: get a virus — подхватить вирус.",
    groups: [
      { label: "Стать (каким?)", words: ["get lost", "get hurt", "get excited", "get married", "get dressed", "get dark", "get stolen", "get well soon"] },
      { label: "Добраться / получить", words: ["get home", "get", "got", "gotten", "get a virus", "you got it", "has got", "have got"] },
    ],
  },
  {
    id: "make-do", icon: "🛠️", title: "MAKE или DO",
    hook: "MAKE — Мастерю (результат можно потрогать: торт, план, бронь). DO — Делаю Дело (работу, уборку, бизнес).",
    body: "make a cake, make a reservation, make sure (убедиться), make sense (иметь смысл), make fun of (смеяться над).\ndo homework, do laundry, do the dishes, do business, do a great job.",
    groups: [
      { label: "MAKE — создаю", words: ["make", "made", "made of", "make sure", "make sense", "make up", "make fun of", "make a reservation", "can make it"] },
      { label: "DO — выполняю", words: ["do", "did", "done", "done with", "do laundry", "do the dishes", "do business", "do a great job", "what do you do", "how are you doing"] },
    ],
  },
  {
    id: "take-have-go", icon: "🚶", title: "TAKE / HAVE / GO + действие",
    hook: "TAKE — «совершить» (take a walk), HAVE — «провести» (have fun), GO + -ING — «пойти заниматься» (go shopping). HOME — без TO!",
    body: "take a walk — прогуляться, take a nap — вздремнуть, take a bath — принять ванну.\nhave fun — веселиться, have a seat — присесть.\ngo shopping, go swimming, go fishing — активные занятия: go + -ING.\ngo home, get home — без to (home уже значит «домой»).",
    groups: [
      { label: "TAKE", words: ["take a walk", "take a nap", "take a bath", "take a tour", "take a flight", "take notes", "take care", "take care of"] },
      { label: "HAVE", words: ["have fun", "have a seat", "have a good day", "have a headache"] },
      { label: "GO + -ING", words: ["go shopping", "go swimming", "go fishing"] },
      { label: "HOME без TO", words: ["go home", "get home", "stay home", "at home", "from home"] },
      { label: "GO + TO", words: ["go to", "go to bed", "go to sleep", "go to the bathroom"] },
    ],
  },
  {
    id: "modals", icon: "🎛️", title: "Модальные глаголы: после них — без TO",
    hook: "CAN, MUST, SHOULD, MAY, MIGHT, WILL, COULD — «короли»: после них глагол голый, без TO. I can swim (не can to swim).",
    body: "can — могу,  could — мог / мог бы,  must — должен (сам считаю),  should — стоит, следует,  may / might — может быть.\nС TO только «не-короли»: have to (приходится), need to (нужно), be able to (быть в состоянии), used to (раньше).\nused to = раньше было, теперь нет: I used to smoke — раньше курил(а).",
    groups: [
      { label: "Без TO", words: ["can", "could", "can't", "couldn't", "cannot", "must", "must not", "should", "shouldn't", "may", "might", "will", "won't", "had better", "would like", "would you like"] },
      { label: "С TO", words: ["have to", "need to", "able to", "be able to", "would like to", "would you like to", "want to", "try to", "plan to"] },
      { label: "Будущее и «раньше»", words: ["going to", "to be going to", "used to", "never used to", "be about to", "about to"] },
    ],
  },
  {
    id: "there-is", icon: "📍", title: "THERE IS / THERE ARE = «есть, имеется»",
    hook: "Русское «В парке ЕСТЬ кафе» → по-английски начинаем с конца: THERE IS a café in the park. Один — IS, много — ARE.",
    body: "There is a cat — есть (одна) кошка.  There are two cats — есть две кошки.\nВопрос — поменяй местами: Is there…? Are there…?\nПрошлое: there was / there were.",
    groups: [
      { label: "Из словаря", words: ["there is", "there are", "is there", "are there", "there was", "there were", "there's", "here is", "here are", "here's", "here is your"] },
    ],
  },
  {
    id: "much-many", icon: "⚖️", title: "MUCH или MANY, A FEW или A LITTLE",
    hook: "Можно посчитать (яблоки, люди) — MANY / FEW. Нельзя посчитать (вода, время, деньги) — MUCH / LITTLE. A LOT OF — подходит всегда.",
    body: "How many apples? — сколько яблок?  How much water? — сколько воды?\na few friends — несколько друзей;  a little time — немного времени.\nSOME — в утверждениях,  ANY — в вопросах и с NOT: I have some, do you have any?",
    groups: [
      { label: "Считаемое", words: ["many", "how many", "too many", "so many", "few", "a few"] },
      { label: "Несчитаемое", words: ["much", "how much", "how much is", "too much", "so much", "very much", "a little", "less"] },
      { label: "Подходит всегда", words: ["a lot of", "a lot", "lots of", "tons of", "some", "any", "some of", "any of", "all of", "none", "none of", "a bit"] },
    ],
  },
  {
    id: "at-on-in", icon: "🎯", title: "AT / ON / IN — точка, поверхность, внутри",
    hook: "AT — точка 📍 (at 5, at home), ON — поверхность и дни 📅 (on Monday, on TV), IN — внутри и большие отрезки 📦 (in June, in the evening).",
    body: "Время: at 7 o'clock, at night;  on Monday, on my birthday;  in the morning, in June, in 2020.\nМесто: at home / at work / at school (точка на карте);  on the ground (на поверхности);  in bed, in the mountains (внутри).\nСостояния — тоже IN: in love, in pain, in trouble, in a hurry.",
    groups: [
      { label: "AT — точка", words: ["at home", "at work", "at school", "at night", "at the moment", "at least", "at all"] },
      { label: "ON — поверхность, день, «на чём-то»", words: ["on foot", "on TV", "on stage", "on time", "on the ground", "on vacation", "on sale", "on mute", "on your own"] },
      { label: "IN — внутри, отрезок времени", words: ["in the evening", "in the afternoon", "in the future", "in the past", "in the mountains", "in the rain", "in bed", "in here", "in front of", "in person", "in pairs"] },
      { label: "IN — состояние", words: ["in love", "in pain", "in trouble", "in a hurry", "in contact", "in the loop", "in general"] },
    ],
  },
  {
    id: "preps", icon: "🔗", title: "Слово + предлог — учим парой",
    hook: "Предлог «прилип» к слову — учи их вместе, как одно слово: afraid-OF, interested-IN, good-AT.",
    body: "Русский предлог часто не совпадает: «женат НА» = married TO, «злится НА» = mad AT, «зависит ОТ» = depends ON.\nПоэтому учим не слово, а целую пару.",
    groups: [
      { label: "OF", words: ["afraid of", "full of", "made of", "think of", "take care of", "because of", "instead of", "all kinds of", "make fun of"] },
      { label: "IN / AT", words: ["interested in", "rich in", "be involved in", "good at", "bad at", "mad at"] },
      { label: "TO", words: ["married to", "allergic to", "belong to", "listen to", "talk to", "speak to", "pay attention to", "happy to"] },
      { label: "FOR", words: ["responsible for", "famous for", "ready for", "late for", "thanks for", "thank you for", "vote for", "ask for", "look for", "shop for", "good for"] },
      { label: "WITH / ON / ABOUT / FROM / AGAINST", words: ["agree with", "deal with", "done with", "depend on", "talk about", "all about", "feel about", "graduate from", "come from", "play against"] },
    ],
  },
  {
    id: "negative-prefix", icon: "🚫", title: "UN- / DIS- / IN- = «НЕ»",
    hook: "Приставка-«нет»: happy → UNhappy, agree → DISagree, correct → INcorrect.",
    body: "UN- — самая частая: unhappy (несчастный), unpack (распаковать — «раз-»).\nDIS- — чаще с глаголами: dislike (не любить), disagree (не соглашаться).\nIN- — с «учёными» словами: incorrect, inedible (несъедобный).",
    groups: [
      { label: "UN-", words: ["unhappy", "unhealthy", "unusual", "uncomfortable", "unfortunately", "unpleasant", "unmute", "unpack", "unemployed", "an unemployed", "undeniable"] },
      { label: "DIS-", words: ["dislike", "disagree"] },
      { label: "IN-", words: ["incorrect", "inedible", "incredible"] },
    ],
  },
  {
    id: "er-person", icon: "🧑‍🔧", title: "-ER / -OR / -IST / -IAN = человек или прибор",
    hook: "Глагол + ER = «тот, кто это делает»: drive → driver, swim → swimmer, teach → teacher. Иногда это прибор: charge → charger.",
    body: "-ER / -OR: driver, actor.  -IST — профессия «по науке»: dentist, artist, tourist.  -IAN: musician, politician, comedian.\nКороткое слово удваивает букву: run → runner, swim → swimmer, win → winner.",
    groups: [
      { label: "Человек: глагол + ER/OR", words: ["driver", "runner", "painter", "swimmer", "worker", "coworker", "writer", "singer", "player", "teacher", "traveler", "visitor", "beginner", "owner", "waiter", "photographer", "winner", "instructor", "trainer", "robber", "director", "actor", "manager", "speaker", "volunteer", "customer", "server", "passenger", "tutor", "lawyer"] },
      { label: "Прибор: глагол + ER", words: ["charger", "printer", "heater", "mixer", "blender", "freezer", "dishwasher", "computer", "stapler", "eraser", "folder", "binder", "planner", "container", "scooter", "speaker"] },
      { label: "-IST / -IAN", words: ["artist", "dentist", "therapist", "tourist", "receptionist", "musician", "politician", "comedian"] },
    ],
  },
  {
    id: "tion", icon: "🏷️", title: "-TION / -SION = «-ция», «-ние»",
    hook: "-TION читается «шн» и почти всегда = русское «-ция»: information → информация, station → станция.",
    body: "Это всегда существительное. Читай «-шн»: education [эджукейшн].\nЧасто угадывается: action — акция/действие, operation — операция, position — позиция.",
    pattern: /(tion|sion)$/i,
    groups: [
      { label: "Из твоего словаря", words: [], auto: true },
    ],
  },
  {
    id: "ment-ness", icon: "📦", title: "-MENT / -NESS = существительное",
    hook: "-MENT и -NESS превращают действие или качество в «вещь»: agree → agreement, fit → fitness.",
    body: "argue (спорить) → argument (спор), equip → equipment (оборудование), appoint → appointment (встреча, приём).\nfit (в форме) → fitness, well → wellness, busy → business (y → i).",
    pattern: /(ment|ness)$/i,
    exclude: ["moment", "at the moment", "one moment", "document", "do business"],
    groups: [
      { label: "Из твоего словаря", words: [], auto: true },
    ],
  },
  {
    id: "ful-able", icon: "✨", title: "-FUL = «полный», -ABLE = «можно»",
    hook: "-FUL — полный чего-то: color+FUL = красочный. -ABLE — то, что МОЖНО сделать: afford+ABLE = доступный (можно позволить).",
    body: "use → useful (полезный), help → helpful, care → careful, wonder → wonderful.\ncomfort → comfortable, rely → reliable (на кого можно положиться), value → valuable.\n-IBLE — то же самое, что -ABLE: visible (видимый), flexible (гибкий).",
    pattern: /(ful|able|ible)$/i,
    exclude: ["table", "vegetable", "awful"],
    groups: [
      { label: "-FUL", words: ["useful", "helpful", "careful", "wonderful", "colorful", "stressful", "beautiful", "forgetful"] },
      { label: "-ABLE / -IBLE", words: ["comfortable", "uncomfortable", "reliable", "affordable", "valuable", "available", "adorable", "flexible", "responsible", "possible", "incredible", "horrible", "terrible", "remarkable", "visible", "inedible", "undeniable"] },
    ],
  },
  {
    id: "silent", icon: "🤫", title: "Немые буквы",
    hook: "K перед N молчит (knee), W перед R молчит (write), B после M молчит (comb), GH обычно молчит (night).",
    body: "know [ноу], knife [найф], write [райт], wrong [рон], comb [коум], climb [клайм].\nGH: night [найт], daughter [дотэ]. Но иногда GH = Ф: laugh, enough, cough.\nL молчит в walk, talk, half, calm, could, should, would.  H молчит в hour, honest.",
    groups: [
      { label: "KN- (K молчит)", words: ["knee", "knife", "knives", "know", "knew", "known", "know how"] },
      { label: "WR- (W молчит)", words: ["write", "wrote", "written", "write down", "writer", "writing", "wrong", "what's wrong", "wrist"] },
      { label: "-MB (B молчит)", words: ["comb", "climb", "thumb"] },
      { label: "GH молчит", words: ["night", "at night", "last night", "good night", "tonight", "midnight", "tomorrow night", "light", "a light bulb", "right", "right now", "right here", "right away", "bright", "eight", "eighteen", "eighty", "daughter", "granddaughter", "high", "high school", "weight", "neighbor", "sightseeing", "through", "thought", "bought", "brought", "caught", "taught", "fought"] },
      { label: "GH = Ф", words: ["laugh", "enough", "cough", "tough"] },
      { label: "L, H, T молчат", words: ["walk", "take a walk", "talk", "half", "half price", "half an hour", "calm", "could", "should", "would like", "couldn't", "shouldn't", "hour", "honest", "honestly", "listen", "listen to", "castle", "often"] },
    ],
  },
  {
    id: "articles", icon: "🅰️", title: "A / AN / THE",
    hook: "A — «какой-то один», THE — «тот самый» (оба знаем какой). AN — перед гласным ЗВУКОМ: an apple, an hour.",
    body: "a cat — какая-то кошка.  the cat — та самая (наша) кошка.\nAN смотрит на звук, а не на букву: an hour (h молчит), но a university [ю].\nTHE — у единственных в мире: the sun, the moon, the sky, the internet.",
    groups: [
      { label: "Сами артикли", words: ["a", "an", "the"] },
      { label: "THE — единственный / тот самый", words: ["the sun", "the moon", "the sky", "the internet", "the news", "the truth", "the flu", "the mail", "the rest", "the bar", "the whole time", "the day after tomorrow", "the day before yesterday"] },
    ],
  },
  {
    id: "perfect", icon: "✅", title: "Present Perfect: HAVE + 3-я форма",
    hook: "I HAVE SEEN — «я видел» (важно, ЧТО сделано, а не когда). Маркеры: ever, never, already, yet, just, since.",
    body: "Have you ever been to London? — Ты когда-нибудь был в Лондоне?\nI have never seen it — я никогда этого не видел.\nhave got = have — «у меня есть» (британский вариант): I've got a car.",
    groups: [
      { label: "Маркеры", words: ["ever", "never", "already", "yet", "just", "just now", "since", "hardly ever"] },
      { label: "HAVE / HAS", words: ["have", "has", "haven't", "hasn't", "have got", "has got", "been", "been to", "gone", "seen", "done"] },
    ],
  },
  {
    id: "wh", icon: "❓", title: "Вопросительные слова: всё на WH (кроме HOW)",
    hook: "Что-где-когда-кто-почему начинаются на WH: what, where, when, who, why. HOW — «как» — единственный без W впереди.",
    body: "HOW + слово = «насколько»: how much/many (сколько), how old (сколько лет), how long (как долго), how often (как часто).\nWHAT + слово = «какой»: what time, what color, what kind of.",
    groups: [
      { label: "WH-", words: ["what", "where", "when", "who", "why", "which", "whose", "who is", "where is"] },
      { label: "HOW + …", words: ["how", "how much", "how many", "how old", "how long", "how often", "how big", "how about", "how about you", "how are you"] },
      { label: "WHAT + …", words: ["what time", "what time is it", "what color", "what kind of", "what about", "what do you do", "what do you think of"] },
    ],
  },
  {
    id: "homophones", icon: "👂", title: "Звучат одинаково — пишутся по-разному",
    hook: "На слух не отличить: one = won, eight = ate, right = write. Различаем по смыслу фразы.",
    body: "Это главная ловушка в диктантах и при ответе голосом.\nЗапоминай парой: «I WON ONE prize» (я выиграл один приз), «I ATE EIGHT cookies» (я съел восемь печений).\nKN- и WR- молчат, поэтому know = no, knew = new, write = right.",
    groups: [
      { label: "one = won [уан]", words: ["one", "won"] },
      { label: "eight = ate [эйт]", words: ["eight", "ate"] },
      { label: "right = write [райт]", words: ["right", "write"] },
      { label: "know = no [ноу],  knew = new [нью]", words: ["know", "no", "knew", "new"] },
      { label: "see = sea [си]", words: ["see", "sea"] },
      { label: "hear = here [хиэ]", words: ["hear", "here"] },
      { label: "there = their = they're [зэа]", words: ["there", "their", "they're"] },
      { label: "buy = by = bye [бай]", words: ["buy", "by", "bye"] },
      { label: "to = too = two [ту],  for = four [фо]", words: ["to", "too", "two", "for", "four"] },
      { label: "hour = our [ауэ]", words: ["hour", "our"] },
      { label: "son = sun [сан]", words: ["son", "sun", "the sun"] },
      { label: "where = wear [уэа]", words: ["where", "wear"] },
      { label: "week = weak [уик]", words: ["week", "weak"] },
      { label: "meet = meat [мит]", words: ["meet", "meat"] },
      { label: "pair = pear [пэа]", words: ["pair", "pear"] },
      { label: "flower = flour [флауэ]", words: ["flower", "flour"] },
      { label: "whole = hole [хоул]", words: ["whole", "hole"] },
      { label: "red = read (в прошлом) [ред]", words: ["red", "read"] },
      { label: "its = it's,  whose = who's,  your = you're", words: ["its", "it's", "whose", "who's", "your", "you're"] },
      { label: "cent = sent [сент]", words: ["cent", "sent"] },
      { label: "would = wood [вуд]", words: ["would like", "wood"] },
      { label: "threw = through [сру],  flew = flu [флу]", words: ["through", "the flu"] },
      { label: "wait = weight [уэйт]", words: ["wait", "weight"] },
      { label: "steal = steel [стил],  sell = cell [сел]", words: ["steal", "sell", "cell phone"] },
      { label: "piece = peace [пис],  sale = sail [сейл]", words: ["piece", "sale", "on sale", "for sale"] },
      { label: "soul = sole,  cereal = serial,  I = eye", words: ["soul", "cereal", "I", "eye"] },
      { label: "break = brake,  bear (медведь) = bare (голый)", words: ["break", "bear"] },
      { label: "fare (плата за проезд) = fair (честный)", words: ["fare"] },
    ],
  },
  {
    id: "some-any-no-every", icon: "🧱", title: "Конструктор: SOME / ANY / NO / EVERY + THING / ONE / WHERE",
    hook: "Собери как Лего: SOME (что-то) / ANY (любой, в вопросах) / NO (ни-) / EVERY (все) + THING (вещь) / ONE, BODY (человек) / WHERE (место).",
    body: "some+thing = что-то,  some+one = кто-то,  some+where = где-то.\nany+thing = что-нибудь (в вопросе) / что угодно,  every+one = все,  no+thing = ничего.\nВ английском одно отрицание: I know NOTHING = I don't know ANYTHING (не «don't know nothing»).",
    groups: [
      { label: "THING — вещь", words: ["something", "anything", "nothing", "everything", "or something"] },
      { label: "ONE / BODY — человек", words: ["someone", "anyone", "no one", "everyone", "somebody", "anybody", "nobody", "everybody"] },
      { label: "WHERE / WAY / MORE — место и прочее", words: ["somewhere", "anywhere", "nowhere", "everywhere", "anyway", "anymore", "whatever"] },
    ],
  },
  {
    id: "compounds", icon: "🔗", title: "Составные слова: переводи по частям",
    hook: "Длинное слово — часто два коротких: tooth+brush = зубная щётка, rain+coat = дождевик. Разбей — и перевод готов.",
    body: "Главное слово — второе: a BOOKstore — это store (магазин), какой? — книжный.\nbreak+fast = «прервать пост» → завтрак.  week+end = конец недели → выходные.\n-ACHE = боль: head+ache — головная боль.  GRAND- = через поколение: grand+mother — бабушка, GREAT-GRAND- — прабабушка.",
    groups: [
      { label: "Дом и вещи", words: ["bedroom", "bathroom", "classroom", "restroom", "living room", "dining room", "backyard", "bookshelf", "toothbrush", "toothpaste", "paintbrush", "keyboard", "whiteboard", "notebook", "textbook", "workbook", "cookbook", "suitcase", "backpack", "sunglasses", "headphones", "raincoat", "swimsuit", "wheelchair", "earring", "firework", "campfire", "snowboard", "skateboard", "football", "basketball", "baseball", "volleyball", "playground", "newspaper", "postcard", "password", "website", "webcam", "inbox", "online", "dishwasher", "teaspoon", "cupcake", "cheeseburger", "seafood", "homework", "housework"] },
      { label: "Время и места", words: ["weekend", "weekday", "birthday", "afternoon", "midnight", "tonight", "lunchtime", "sunset", "sunscreen", "thunderstorm", "highway", "crosswalk", "downtown", "downstairs", "upstairs", "hometown", "bookstore", "airport", "airplane", "airline", "deadline", "breakfast", "goodbye"] },
      { label: "-ACHE = боль", words: ["headache", "toothache", "stomachache", "have a headache"] },
      { label: "GRAND- / GREAT-GRAND- — поколения", words: ["grandmother", "grandfather", "grandparents", "grandson", "granddaughter", "grandchildren", "grandma", "grandpa", "great-grandmother", "great-grandparent"] },
      { label: "Люди и чувства", words: ["boyfriend", "girlfriend", "businessman", "businesswoman", "coworker", "classmate", "roommate", "homesick", "feedback", "highlight", "underline"] },
    ],
  },
  {
    id: "y-adjectives", icon: "🌦️", title: "Существительное + Y = прилагательное",
    hook: "rain (дождь) + Y = rainy (дождливый). Вся погода — на -Y: sunny, cloudy, windy, foggy, icy.",
    body: "salt → salty (солёный), spice → spicy (острый), dirt → dirty (грязный), health → healthy (здоровый), luck → lucky (везучий).\nКороткое слово удваивает букву: sun → suNNy, fun → fuNNy, fog → foGGy.\nНемая E исчезает: ice → icy, scare → scary.",
    groups: [
      { label: "Погода", words: ["rainy", "it's rainy", "it's sunny", "cloudy", "windy", "foggy", "icy"] },
      { label: "Еда и вкус", words: ["salty", "spicy", "tasty", "yummy"] },
      { label: "Остальные", words: ["dirty", "healthy", "unhealthy", "lucky", "messy", "noisy", "sleepy", "funny", "picky", "curly", "shiny", "scary", "cozy", "thirsty", "hungry"] },
    ],
  },
  {
    id: "adj-suffix", icon: "🎓", title: "-OUS / -AL / -IC / -ENT = прилагательное «как в русском»",
    hook: "Эти хвостики почти всегда дают знакомое слово: -OUS ≈ «-озный» (nervous), -AL ≈ «-альный» (national), -IC ≈ «-ичный» (romantic), -ENT/-ANT ≈ «-ентный» (intelligent).",
    body: "Прочитай слово «по-русски» — и в половине случаев угадаешь перевод:\nnational — национальный, traditional — традиционный, professional — профессиональный, romantic — романтичный, fantastic — фантастический.\nНо осторожно: intelligent — умный (не «интеллигентный»), patient — терпеливый / пациент.",
    groups: [
      { label: "-OUS", words: ["famous", "dangerous", "nervous", "delicious", "jealous", "adventurous", "envious", "serious", "various", "previous"] },
      { label: "-AL", words: ["national", "international", "traditional", "professional", "medical", "normal", "annual", "classical", "casual", "special", "final", "crucial", "total", "bilingual", "delusional", "unusual"] },
      { label: "-IC / -IVE", words: ["romantic", "electric", "fantastic", "allergic", "expensive"] },
      { label: "-ENT / -ANT", words: ["important", "intelligent", "excellent", "different", "convenient", "ancient", "patient", "pleasant", "unpleasant", "distant", "significant"] },
    ],
  },
  {
    id: "ing-noun", icon: "🎨", title: "Глагол + ING = занятие или его результат",
    hook: "draw (рисовать) + ING = drawing (рисунок, рисование). -ING делает из действия «вещь».",
    body: "paint → painting (картина), build → building (здание), meet → meeting (встреча), end → ending (концовка), feel → feeling (чувство).\nНемая E исчезает: shave → shaving.  Короткое слово удваивает букву: begin → beginNing.",
    groups: [
      { label: "Из твоего словаря", words: ["drawing", "painting", "building", "apartment building", "meeting", "ending", "beginning", "feeling", "writing", "meaning", "cycling", "sightseeing", "clothing", "shaving", "engineering", "a storing", "including"] },
    ],
  },
  {
    id: "false-friends", icon: "🎭", title: "Ложные друзья переводчика",
    hook: "Похоже на русское — значит другое! magazine — ЖУРНАЛ (не магазин), receipt — ЧЕК (не рецепт).",
    body: "magazine — журнал (магазин = store/shop).\nreceipt — чек; recipe — рецепт (блюда); prescription — рецепт врача.\nactually — на самом деле (не «актуально»).\ncabinet — шкафчик;  artist — художник;  mayor — мэр (не майор);  list — список (не лист).",
    groups: [
      { label: "Из твоего словаря", words: ["magazine", "receipt", "recipe", "prescription", "actually", "cabinet", "artist", "mayor", "list", "chef", "pretty", "subject", "trailer"] },
    ],
  },
];
