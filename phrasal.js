// Тренажёр фразовых глаголов (сочетания из двух-трёх слов: give up, look after, hang out...).
// en — как в словаре, ru — перевод, p — частица (то, что меняет смысл),
// ex — примеры [английский, русский]; часть в {фигурных скобках} — то, что нужно вписать в упражнении.
// extra: true — сочетания, которых пока нет в твоём Duolingo, но они очень частые (добавлены по просьбе).
const PARTICLE_MEANING = {
  up: "вверх / до конца",
  out: "наружу / полностью",
  off: "прочь / выключить",
  on: "на / включить / продолжать",
  down: "вниз / записать",
  back: "назад / обратно",
  away: "прочь, подальше",
  over: "через / к кому-то / заново",
  in: "внутрь",
  into: "внутрь / превратиться",
  along: "вместе, рядом",
  around: "вокруг, туда-сюда",
  after: "вслед, после",
  for: "для / в поисках",
  at: "на (точку)",
  with: "с",
  together: "вместе",
  from: "из, от",
  of: "о, про",
  to: "к, на",
};

const PHRASALS = [
  // ---------- UP ----------
  { en: "give up", ru: "сдаваться, бросать (привычку)", p: "up", ex: [["Don't {give up}! You can do it.", "Не сдавайся! У тебя получится."], ["I {gave up} sugar last year.", "Я бросила сахар в прошлом году."]] },
  { en: "wake up", ru: "просыпаться", p: "up", ex: [["I {wake up} at seven every day.", "Я просыпаюсь в семь каждый день."], ["She {woke up} late this morning.", "Сегодня утром она проснулась поздно."]] },
  { en: "grow up", ru: "вырастать, взрослеть", p: "up", ex: [["I {grew up} in a small village.", "Я выросла в маленькой деревне."], ["What do you want to be when you {grow up}?", "Кем ты хочешь быть, когда вырастешь?"]] },
  { en: "stand up", ru: "вставать", p: "up", ex: [["Please {stand up} when the teacher comes in.", "Пожалуйста, вставайте, когда входит учитель."], ["He {stood up} and left the room.", "Он встал и вышел из комнаты."]] },
  { en: "hurry up", ru: "торопиться, поторопись", p: "up", ex: [["{Hurry up}! The bus is here.", "Поторопись! Автобус уже здесь."], ["We need to {hurry up} or we'll be late.", "Нам нужно поторопиться, иначе опоздаем."]] },
  { en: "clean up", ru: "убирать (всё до конца)", p: "up", ex: [["Let's {clean up} the kitchen after dinner.", "Давай уберём кухню после ужина."], ["The kids {cleaned up} their room.", "Дети убрали свою комнату."]] },
  { en: "pick up", ru: "забирать, поднимать", p: "up", ex: [["I'll {pick up} the kids from school.", "Я заберу детей из школы."], ["Can you {pick up} my prescription?", "Можешь забрать мой рецепт?"]] },
  { en: "look up", ru: "искать (в словаре, в интернете)", p: "up", ex: [["{Look up} this word in the dictionary.", "Посмотри это слово в словаре."], ["I {looked up} the address online.", "Я нашла адрес в интернете."]] },
  { en: "set up", ru: "устанавливать, настраивать, организовывать", p: "up", ex: [["Can you help me {set up} my new laptop?", "Поможешь мне настроить новый ноутбук?"], ["They {set up} a meeting for Monday.", "Они назначили встречу на понедельник."]] },
  { en: "sign up", ru: "записываться, регистрироваться", p: "up", ex: [["I want to {sign up} for a yoga class.", "Я хочу записаться на йогу."], ["She {signed up} for the marathon.", "Она записалась на марафон."]] },
  { en: "make up", ru: "придумывать; мириться", p: "up", ex: [["He always {makes up} funny stories.", "Он всегда придумывает смешные истории."], ["They argued, but then they {made up}.", "Они поссорились, но потом помирились."]] },
  { en: "follow up", ru: "связаться повторно, проследить", p: "up", ex: [["I'll {follow up} with an email tomorrow.", "Я напишу повторно завтра."], ["Did the doctor {follow up} with you?", "Врач связался с тобой ещё раз?"]] },
  { en: "end up", ru: "в итоге оказаться", p: "up", ex: [["We {ended up} at a small café.", "В итоге мы оказались в маленьком кафе."], ["If you don't study, you'll {end up} failing the exam.", "Если не будешь учиться, в итоге провалишь экзамен."]] },
  { en: "hang up", ru: "вешать трубку", p: "up", ex: [["Don't {hang up}, I'm still here!", "Не вешай трубку, я ещё здесь!"], ["She was angry and {hung up}.", "Она разозлилась и бросила трубку."]] },
  { en: "break up", ru: "расставаться", p: "up", ex: [["They {broke up} after two years.", "Они расстались через два года."], ["Why did you {break up} with him?", "Почему ты с ним рассталась?"]] },
  { en: "ramp up", ru: "наращивать, ускорять", p: "up", ex: [["We need to {ramp up} our work before the deadline.", "Нам надо ускориться перед дедлайном."], ["The company {ramped up} production.", "Компания нарастила производство."]] },
  { en: "hold up", ru: "задерживать; подожди!", p: "up", extra: true, ex: [["Sorry I'm late, I was {held up} in traffic.", "Прости за опоздание, я застряла в пробке."], ["{Hold up}! Wait for me!", "Погоди! Подожди меня!"]] },

  // ---------- OUT ----------
  { en: "find out", ru: "выяснять, узнавать", p: "out", ex: [["I need to {find out} what time the train leaves.", "Мне нужно узнать, во сколько уходит поезд."], ["She {found out} the truth.", "Она узнала правду."]] },
  { en: "fill out", ru: "заполнять (анкету)", p: "out", ex: [["Please {fill out} this form.", "Пожалуйста, заполните эту форму."], ["I {filled out} the application yesterday.", "Я заполнила заявку вчера."]] },
  { en: "work out", ru: "тренироваться; получаться", p: "out", ex: [["I {work out} at the gym three times a week.", "Я тренируюсь в зале три раза в неделю."], ["Don't worry, everything will {work out}.", "Не волнуйся, всё получится."]] },
  { en: "hang out", ru: "тусоваться, проводить время", p: "out", ex: [["Let's {hang out} this weekend!", "Давай потусуемся на выходных!"], ["We {hung out} at the beach all day.", "Мы весь день провели на пляже."]] },
  { en: "go out", ru: "выходить (из дома), ходить развлекаться", p: "out", ex: [["Do you want to {go out} tonight?", "Хочешь куда-нибудь сходить сегодня вечером?"], ["We {went out} for dinner on Friday.", "В пятницу мы ходили ужинать."]] },
  { en: "check out", ru: "выезжать из отеля; посмотреть", p: "out", ex: [["We need to {check out} before noon.", "Нам нужно выехать из отеля до полудня."], ["{Check out} this new song!", "Зацени эту новую песню!"]] },
  { en: "take out", ru: "выносить, вынимать", p: "out", ex: [["Can you {take out} the trash?", "Можешь вынести мусор?"], ["She {took out} her phone.", "Она достала телефон."]] },
  { en: "look out", ru: "осторожно!, берегись", p: "out", ex: [["{Look out}! A car!", "Осторожно! Машина!"], ["{Look out} for the dog.", "Остерегайся собаки."]] },
  { en: "bring out", ru: "выявлять, выпускать", p: "out", ex: [["This dress {brings out} the color of your eyes.", "Это платье подчёркивает цвет твоих глаз."], ["The company will {bring out} a new phone.", "Компания выпустит новый телефон."]] },
  { en: "stressed out", ru: "в сильном стрессе", p: "out", ex: [["I'm so {stressed out} about the exam.", "Я в жутком стрессе из-за экзамена."], ["She looks {stressed out}.", "Она выглядит измотанной."]] },

  // ---------- OFF ----------
  { en: "turn off", ru: "выключать", p: "off", ex: [["{Turn off} the lights, please.", "Выключи свет, пожалуйста."], ["I {turned off} my phone during the movie.", "Я выключила телефон во время фильма."]] },
  { en: "take off", ru: "снимать (одежду); взлетать", p: "off", ex: [["{Take off} your shoes, please.", "Сними обувь, пожалуйста."], ["The plane {took off} at six.", "Самолёт взлетел в шесть."]] },
  { en: "get off", ru: "выходить (из транспорта)", p: "off", ex: [["We {get off} at the next stop.", "Мы выходим на следующей остановке."], ["She {got off} the bus near the park.", "Она вышла из автобуса возле парка."]] },
  { en: "fall off", ru: "падать (с чего-то)", p: "off", ex: [["He {fell off} his bike.", "Он упал с велосипеда."], ["Be careful, don't {fall off} the chair!", "Осторожно, не упади со стула!"]] },
  { en: "set off", ru: "отправляться в путь", p: "off", ex: [["We {set off} early in the morning.", "Мы отправились в путь рано утром."], ["When do you {set off}?", "Когда вы выезжаете?"]] },
  { en: "see off", ru: "провожать", p: "off", ex: [["I went to the airport to {see off} my sister.", "Я поехала в аэропорт проводить сестру."], ["They {saw} us {off} at the station.", "Они проводили нас на вокзале."]] },
  { en: "hop off", ru: "выскочить, выйти (быстро)", p: "off", ex: [["{Hop off} at the next station.", "Выскакивай на следующей станции."], ["We {hopped off} the bus.", "Мы выскочили из автобуса."]] },

  // ---------- ON ----------
  { en: "turn on", ru: "включать", p: "on", ex: [["Can you {turn on} the TV?", "Можешь включить телевизор?"], ["I {turned on} the heater because it was cold.", "Я включила обогреватель, потому что было холодно."]] },
  { en: "put on", ru: "надевать", p: "on", ex: [["{Put on} your jacket, it's cold.", "Надень куртку, холодно."], ["She {put on} her new dress.", "Она надела новое платье."]] },
  { en: "try on", ru: "примерять", p: "on", ex: [["Can I {try on} these jeans?", "Можно примерить эти джинсы?"], ["She {tried on} five dresses.", "Она примерила пять платьев."]] },
  { en: "get on", ru: "садиться (в транспорт)", p: "on", ex: [["We {get on} the train at nine.", "Мы садимся на поезд в девять."], ["He {got on} the wrong bus.", "Он сел не на тот автобус."]] },
  { en: "hop on", ru: "запрыгнуть (в транспорт)", p: "on", ex: [["{Hop on}! I'll give you a ride.", "Запрыгивай! Подвезу."], ["We {hopped on} the last bus.", "Мы запрыгнули в последний автобус."]] },
  { en: "click on", ru: "нажать (на ссылку)", p: "on", ex: [["{Click on} the link.", "Нажми на ссылку."], ["I {clicked on} the wrong button.", "Я нажала не на ту кнопку."]] },
  { en: "depend on", ru: "зависеть от", p: "on", ex: [["It {depends on} the weather.", "Это зависит от погоды."], ["You can {depend on} me.", "Ты можешь на меня положиться."]] },
  { en: "settle on", ru: "остановиться на (выборе)", p: "on", ex: [["We finally {settled on} a name for the dog.", "Мы наконец выбрали имя для собаки."], ["Let's {settle on} a date.", "Давай определимся с датой."]] },
  { en: "hang on", ru: "подожди!, держись", p: "on", extra: true, ex: [["{Hang on}, I'll be right back.", "Подожди, я сейчас вернусь."], ["{Hang on}! We're almost there.", "Держись! Мы почти на месте."]] },

  // ---------- DOWN ----------
  { en: "sit down", ru: "садиться", p: "down", ex: [["Please {sit down}.", "Садитесь, пожалуйста."], ["She {sat down} next to me.", "Она села рядом со мной."]] },
  { en: "lie down", ru: "прилечь", p: "down", ex: [["I need to {lie down}, I have a headache.", "Мне нужно прилечь, у меня болит голова."], ["The doctor told me to {lie down}.", "Врач сказал мне лечь."]] },
  { en: "fall down", ru: "падать", p: "down", ex: [["The baby {fell down}, but she's OK.", "Малышка упала, но с ней всё хорошо."], ["Be careful not to {fall down} the stairs.", "Осторожно, не упади с лестницы."]] },
  { en: "write down", ru: "записывать", p: "down", ex: [["{Write down} my phone number.", "Запиши мой номер телефона."], ["I {wrote down} all the new words.", "Я записала все новые слова."]] },
  { en: "put down", ru: "класть, опускать", p: "down", ex: [["{Put down} your bag and relax.", "Поставь сумку и расслабься."], ["She {put down} the phone.", "Она положила телефон."]] },
  { en: "cut down on", ru: "сокращать (потребление)", p: "down", ex: [["I'm trying to {cut down on} sugar.", "Я стараюсь есть меньше сахара."], ["You should {cut down on} coffee.", "Тебе стоит пить меньше кофе."]] },

  // ---------- BACK ----------
  { en: "come back", ru: "возвращаться", p: "back", ex: [["{Come back} soon!", "Возвращайся скорее!"], ["He {came back} from his trip yesterday.", "Он вернулся из поездки вчера."]] },
  { en: "get back", ru: "вернуться; получить обратно", p: "back", ex: [["What time did you {get back} home?", "Во сколько ты вернулась домой?"], ["I want to {get back} my money.", "Я хочу вернуть свои деньги."]] },
  { en: "give back", ru: "отдавать обратно", p: "back", ex: [["Please {give back} my pen.", "Пожалуйста, верни мою ручку."], ["She {gave back} the book.", "Она вернула книгу."]] },

  // ---------- AWAY ----------
  { en: "throw away", ru: "выбрасывать", p: "away", ex: [["Don't {throw away} that box!", "Не выбрасывай эту коробку!"], ["I {threw away} the old shoes.", "Я выбросила старые туфли."]] },
  { en: "put away", ru: "убирать на место", p: "away", ex: [["{Put away} your toys, please.", "Убери игрушки, пожалуйста."], ["She {put away} the dishes.", "Она убрала посуду."]] },
  { en: "get away", ru: "сбежать, уехать (отдохнуть)", p: "away", ex: [["I need to {get away} for a weekend.", "Мне нужно уехать куда-нибудь на выходные."], ["The robber {got away}.", "Грабитель сбежал."]] },
  { en: "stay away from", ru: "держаться подальше от", p: "away", ex: [["{Stay away from} that dog!", "Держись подальше от той собаки!"], ["Doctors say to {stay away from} fast food.", "Врачи советуют держаться подальше от фастфуда."]] },

  // ---------- OVER / IN / INTO ----------
  { en: "come over", ru: "прийти в гости, заглянуть", p: "over", ex: [["Why don't you {come over} for dinner?", "Почему бы тебе не прийти к нам на ужин?"], ["Grandma {came over} on Sundays.", "Бабушка приходила в гости по воскресеньям."]] },
  { en: "go over", ru: "просмотреть, повторить", p: "over", ex: [["Let's {go over} the plan again.", "Давай ещё раз пройдёмся по плану."], ["I {went over} my notes before the exam.", "Я повторила конспект перед экзаменом."]] },
  { en: "carry over", ru: "переносить (на потом)", p: "over", ex: [["We'll {carry over} this task to next week.", "Мы перенесём эту задачу на следующую неделю."], ["Can I {carry over} my vacation days?", "Можно перенести дни отпуска?"]] },
  { en: "stop over", ru: "делать остановку (в пути)", p: "over", ex: [["We {stopped over} in Paris for a night.", "Мы остановились в Париже на ночь."], ["Our flight {stops over} in London.", "Наш рейс с пересадкой в Лондоне."]] },
  { en: "check in", ru: "заселяться, регистрироваться", p: "in", ex: [["We can {check in} at two p.m.", "Мы можем заселиться в два часа дня."], ["Did you {check in} for your flight?", "Ты зарегистрировалась на рейс?"]] },
  { en: "come in", ru: "входить", p: "in", ex: [["{Come in}, please!", "Входите, пожалуйста!"], ["She {came in} and sat down.", "Она вошла и села."]] },
  { en: "turn in", ru: "сдавать (работу)", p: "in", ex: [["{Turn in} your homework on Monday.", "Сдайте домашнюю работу в понедельник."], ["I {turned in} my essay late.", "Я сдала эссе с опозданием."]] },
  { en: "muscle in", ru: "влезать, вторгаться", p: "in", ex: [["Don't {muscle in} on our conversation.", "Не влезай в наш разговор."], ["Big companies {muscle in} on small markets.", "Крупные компании влезают на маленькие рынки."]] },
  { en: "turn into", ru: "превращаться в", p: "into", ex: [["The caterpillar {turned into} a butterfly.", "Гусеница превратилась в бабочку."], ["Our small trip {turned into} a big adventure.", "Наша маленькая поездка превратилась в большое приключение."]] },
  { en: "get into", ru: "попасть, увлечься", p: "into", ex: [["She {got into} a good university.", "Она поступила в хороший университет."], ["I {got into} yoga last year.", "В прошлом году я увлеклась йогой."]] },

  { en: "come out of", ru: "выходить из (комнаты)", p: "out", ex: [["Eddy {comes out of} the bathroom.", "Эдди выходит из ванной."], ["Oscar {came out of} his classroom.", "Оскар вышел из своего класса."]] },
  { en: "get out of", ru: "выходить из (машины, такси); выбираться", p: "out", ex: [["Lin {gets out of} the taxi.", "Лин выходит из такси."], ["How do we {get} him {out of} the toilet?", "Как нам достать его из унитаза?"]] },
  { en: "knock on", ru: "стучать в (дверь)", p: "on", ex: [["She {knocks on} the door.", "Она стучит в дверь."], ["Somebody {knocked on} my window last night.", "Кто-то постучал мне в окно прошлой ночью."]] },

  // ---------- ALONG / AROUND / AFTER / FOR / AT / WITH / TOGETHER / FROM ----------
  { en: "get along", ru: "ладить", p: "along", ex: [["I {get along} well with my sister.", "Я хорошо лажу с сестрой."], ["Do you {get along} with your boss?", "Ты ладишь с начальником?"]] },
  { en: "get around", ru: "передвигаться", p: "around", ex: [["It's easy to {get around} the city by bike.", "По городу легко передвигаться на велосипеде."], ["How do you {get around} without a car?", "Как ты передвигаешься без машины?"]] },
  { en: "look after", ru: "присматривать за", p: "after", ex: [["Can you {look after} my cat this weekend?", "Можешь присмотреть за моей кошкой на выходных?"], ["She {looks after} her grandmother.", "Она ухаживает за бабушкой."]] },
  { en: "look for", ru: "искать", p: "for", ex: [["I'm {looking for} my keys.", "Я ищу свои ключи."], ["He is {looking for} a new job.", "Он ищет новую работу."]] },
  { en: "look at", ru: "смотреть на", p: "at", ex: [["{Look at} these tiny baby clothes!", "Посмотри на эту крошечную детскую одежду!"], ["Don't {look at} me like that.", "Не смотри на меня так."]] },
  { en: "deal with", ru: "справляться с, иметь дело с", p: "with", ex: [["I like the way you {deal with} problems.", "Мне нравится, как ты справляешься с проблемами."], ["I'll {deal with} it tomorrow.", "Я разберусь с этим завтра."]] },
  { en: "put together", ru: "собирать (из частей)", p: "together", ex: [["Can you help me {put together} this shelf?", "Поможешь мне собрать эту полку?"], ["We {put together} a presentation.", "Мы подготовили презентацию."]] },
  { en: "get together", ru: "собираться (вместе)", p: "together", ex: [["Let's {get together} on Friday.", "Давай соберёмся в пятницу."], ["Our family {gets together} every summer.", "Наша семья собирается каждое лето."]] },
  { en: "come from", ru: "быть родом из, происходить", p: "from", ex: [["Where do you {come from}?", "Откуда ты родом?"], ["This word {comes from} Latin.", "Это слово пришло из латыни."]] },
  { en: "leave for", ru: "уезжать (куда-то)", p: "for", ex: [["We {leave for} London tomorrow.", "Завтра мы уезжаем в Лондон."], ["She {left for} work at eight.", "Она ушла на работу в восемь."]] },
  { en: "take care of", ru: "заботиться о", p: "of", ex: [["I {take care of} my plants every day.", "Я каждый день ухаживаю за растениями."], ["Don't worry, I'll {take care of} it.", "Не волнуйся, я об этом позабочусь."]] },
  { en: "pay attention to", ru: "обращать внимание на", p: "to", ex: [["{Pay attention to} the teacher.", "Слушай учителя внимательно."], ["She didn't {pay attention to} the signs.", "Она не обратила внимания на знаки."]] },
];
