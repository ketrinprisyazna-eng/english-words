/* ============ Puzzle English: уроки из заданий, слов, диалогов, книг и подкастов ============
   «Создай урок» собирает урок ≈25 минут под твой уровень (Pre-Intermediate, A2–B1):
   урок грамматики + видеопазл + диалог + подкаст или глава книги + тренировка слов.
   Ссылки ведут прямо в Puzzle English. Пройденное отмечается галочкой или закладкой
   «Мой английский» (она читает «Историю» Puzzle). Закладка же собирает материалы урока —
   описание грамматики, субтитры видео, реплики диалога, текст подкаста — и Gemini пишет
   конспект в Нотатник. Конспект может написать и Claude («законспектируй урок N»):
   тогда он лежит в PUZZLE_NOTES. Слова конспекта попадают в Повторение как день изучения.

   Использует из app.js: WORDS_DATA, DUO_LOG, todayStr, loadJSON, saveJSON, escapeHtml, ico,
   plural, formatDateRu, loadAiKey, callGeminiRaw, startLearnForWords, startSessionForWords;
   из dialog.js: parseJsonLoose; из import.js: importKey, dateOfTs. */

// каталоги Puzzle English (собраны 26.10.2026)
const PZ_DATA = {
  // уроки грамматики уровня Elementary — по порядку Puzzle: slug|название
  grammar: `sentence|Предложение в английском языке
subject-verb1|Подлежащее и сказуемое: виды
place_prepositions|Предлоги места
subject-verb2|Подлежащее и сказуемое: согласование
object|Дополнение в английском языке
imperative-mood|Повелительное наклонение для начинающих
let|Конструкции с глаголом LET
there-is-are-pro|Is there что-нибудь в парке?
there-it|There или It? Что выбрать?
be-do|BE или DO? Что выбрать?
family-vocabulary|Рассказываем о своей семье
adverbs-of-frequency|Наречия частоты в Present Simple
present_simple_present_continuous|Популярные ошибки: Present Simple и Present Continuous
noun_cases|Падежи существительных
possessive-case|Притяжательный падеж существительных
adjectives-beginner|Прилагательные для начинающих
adjectives_without_nouns|Прилагательные без существительных
articles-101|Артикли
articles2|Артикли. Упражнение №2
articles3|Артикли. Упражнение №3
no-article|Отсутствие артикля у существительных
articles_geography|Артикли с географическими названиями
determiners|Определители. Как использовать?
work-job|Work или job?
do_make|Что выбрать: Do или Make?
do_make2|Do и Make в устойчивых сочетаниях
simple_past|Past Simple с правильными глаголами
past-simple-irregular-verbs|Past Simple с неправильными глаголами
pronunciation-mc12|Мастер-класс по произношению: -ED
do-play-go|Устойчивые сочетания с DO, PLAY и GO
continuous_past|Past Continuous: форма и употребление
past_simple_past_continuous|Популярные ошибки: Past Simple и Past Continuous
look-see-watch|Look, see, watch
perfect_present|Present Perfect: форма и употребление
present-perfect-101|Present Perfect для начинающих
been-gone|Been или Gone. Что выбрать?
just-already-yet|Что выбрать: JUST, ALREADY или YET?
just-meanings|Пять значений JUST
for_during_since|For, during или since
past_simple_present_perfect|Популярные ошибки: Past Simple и Present Perfect
future-tenses-1|Будущее время в английском. Часть 1
future-tenses-2|Будущее время в английском. Часть 2
going-to-will|WILL или BE GOING TO?
going_to_present_continuous|Планы на будущее: to be going to или Present Continuous?
plans|Полезные слова и выражения. Планы
auxiliary-verbs|Вспомогательные глаголы BE, DO, HAVE
so-neither-construction|Я тоже: so/neither do I
question_types|Типы вопросов
subject-questions|Вопросы к подлежащему
indirect-questions|Спрашиваем вежливо: косвенные вопросы
tags|Tag questions
passive-voice-101|Пассивный залог для начинающих
by-with-passive|Предлоги by и with в пассивном залоге
nouns|Образование существительных с помощью суффиксов
noun-modifier|Существительное в роли определения
silent-letters|ТОП-10 слов с непроизносимыми согласными
top-5-ough|Топ-5 слов на -OUGH
money_matters|Кое-что о деньгах
london|Английский в Лондоне
be-ame-food|Британский или американский? Еда
be-ame-clothes|Британский или американский? Одежда
be-ame-transport|Британский или американский? Транспорт
be-ame-housing|Британский или американский? Жильё
be-ame-food-2|Британский или американский? Снова о еде
be-ame-household|Британский или американский? Бытовые приборы
modals-review|Модальные глаголы - обзор
modal-verb-may|Модальный глагол MAY
modal-verb-might|Модальный глагол MIGHT
modal-verb-must|Модальный глагол MUST
modal-verb-need|Модальный глагол NEED
modal-verb-should-must-have-to|Should, have to или must?
must-or-have-to|Ты must посмотреть это
infinitive-2|Инфинитив
negative_sentences1|Отрицательные предложения - часть 1
negative_sentences2|Отрицательные предложения - часть 2
more-less|Конструкция THE…, THE… (чем…, тем…)
no-not|No или Not?
order-adjectives|Порядок прилагательных
gold-golden|Gold или golden?
big-large|Big или large?
sick-ill|Sick или ill?
comparison|Всё познаётся в Comparison
fun-funny|Fun или funny?
comparison-as-as|Сравнения с as ... as
as-as-construction|Конструкция AS ... AS
replace-good|Чем заменить слово good?
replace-bad|Чем заменить слово bad?
replace-interesting|Чем заменить слово interesting?
demonstrative_pronouns-2|This is указатель
demonstrative_pronouns|Указательные местоимения
relative_pronouns|Относительные местоимения
indefinite_pronouns|Неопределенные местоимения
reciprocal_pronouns|Взаимные местоимения
reflexive-pronouns|Возвратные местоимения (Прогульщики)
reflexive_pronouns|Возвратные местоимения
possessive_pronouns|Это всё моё! Possessive pronouns
possessive-pronouns|Какое притяжательное местоимение выбрать?
one-pronoun|Местоимение one
many-much-lot|Many, much, a lot of и lots of
few_little|A Few Words About A Little
much-many-few-little|Much - many, few - little
little-bit|A little, a bit или a little bit?
each-or-every|Each or Every
interrogative_pronouns|Вопросительные местоимения
so-such|So или such?
too-enough|Конструкции с TOO и ENOUGH
i_me|Употребление I и Me
conjunctions_usage_secrets|Союзы - использование и секреты
conjunctions_coordinating|Сочинительные союзы
conjunctions_subordinating|Подчинительные союзы
conjunctions_correlative|Соотносительные союзы
because-because-of|Because или Because of
seem|Конструкции с глаголом Seem
prepositions_other_meanings|Предлоги - различные значения
prep_of_time|On нужный день, at нужный час
prepositions_time|Предлоги времени
no-prepositions|Предлоги времени: нужны или нет?
from_a_to_b|From пункт A to пункт B
at-on-in|Место и время: AT, ON и IN
prepositions-place-direction|Предлоги направления и места
prepositions_place|Предлоги места (Prepositions of place)
in-into-inside-within|In, into, inside или within?
come-go|Come или Go?
good-bad-at|I'm good at... / I'm bad at...
near-next-to|Near или Next to?
among_between|Among или Between?
particles|Частицы
adj-adv-position|Прилагательное или наречие?
good_well|Good или Well?
also-too-as-well|Also, too или as well?
listen_hear|Listen или Hear?
like|Полцарства за Like
typical_mistakes|Топ-10 ошибок русских в английском
for-on-sale|For sale или On sale?
borrow_lend|Borrow или Lend?
meet_people|Знакомство. Часть 1
hobbies|Знакомство. Часть 2. Рассказываем о себе
airport-english-1|Английский в аэропорту. Часть 1
airport-english-2|Английский в аэропорту. Часть 2
top-10-travel|ТОП-10 фразовых глаголов для путешествий`,

  // видеопазлы для уровня A2–B1: slug|название|рубрика|фраз
  video: `growup_simple|Как использовать grow и grow up? (часть 1)|Простой английский|55
growup_simple2|Как использовать grow и grow up? (часть 2)|Простой английский|59
startingout_whatdoyoulike|Что тебе нравится?|Starting Out|40
new-headway-1|Три плюс один|New Headway|66
new-headway-2|Домашнее видео|New Headway|72
startingout_whereareyou|Где ты?|Starting Out|29
new-headway-3|Сделай сам|New Headway|75
startingout_eating|В ресторане|Starting Out|38
startingout_pay|Я заплачу|Starting Out|30
new-headway-4|Сюрприз|New Headway|88
causativeverbs_simple1|Make, let, have – что, как и когда (часть 1)|Простой английский|39
stark4-1|Дело Скаймастера (часть 1)|Джек Старк|56
causativeverbs_simple2|Make, let, have – что, как и когда (часть 2)|Простой английский|34
startingout_race|Состязание|Starting Out|36
new-headway-5|Незабываемый вечер|New Headway|86
causativeverbs_simple3|Make, let, have – что, как и когда (часть 3)|Простой английский|39
causativeverbs_simple4|Make, let, have – что, как и когда (часть 4)|Простой английский|30
startingout_brownbread|Коричневый хлеб|Starting Out|28
new-headway-6|Близкое знакомство|New Headway|81
startingout_familyphotos|Семейные фотографии|Starting Out|19
stark4-2|Дело Скаймастера (часть 2)|Джек Старк|75
new-headway-16|Никаких тренировок|New Headway|64
startingout_sportsman|Спортсмен|Starting Out|38
new-headway-8|На помощь|New Headway|83
startingout_time|Который час?|Starting Out|17
oldfriend_startout|Старый друг|Starting Out|32
stark4-3|Дело Скаймастера (часть 3)|Джек Старк|62
new-headway-10|Ужин на двоих|New Headway|83
startingout_horoscopes|Гороскоп|Starting Out|28
jack-stark-1-2|Дело о пропавшем муже (часть 2)|Джек Старк|67
startingout_holiday|Планы на выходные|Starting Out|26
stark4-4|Дело Скаймастера (часть 4)|Джек Старк|57
jack-stark-1-3|Дело о пропавшем муже (часть 3)|Джек Старк|57
jack-stark-1-4|Дело о пропавшем муже (часть 4)|Джек Старк|56
stark4-5|Дело Скаймастера (часть 5)|Джек Старк|40
jack-stark-1-5|Дело о пропавшем муже (часть 5)|Джек Старк|50
stark-2-1|Приключение на острове (часть 1)|Джек Старк|88
new-headway-17|История о собаке|New Headway|57
london-central-1|Прибытие|London Central|53
stark-2-2|Приключение на острове (часть 2)|Джек Старк|67
elevator_talk|Разговор в лифте|Простой английский|10
new-headway-13|Генеральная уборка|New Headway|81
new-headway-18|Мимолётное знакомство|New Headway|75
london-central-2|Поиск работы|London Central|41
stark-2-3|Приключение на острове (часть 3)|Джек Старк|48
suggestions_talk|Разговор о предложениях|Простой английский|11
new-headway-19|Переезд|New Headway|69
vocabulary-1|Как не нужно изучать лексику (часть 1)|Английский с Силом|57
simpeng_thinkenglish1|Как научиться думать по-английски (часть 1)|Простой английский|40
see-2|Как не нужно изучать лексику (часть 2)|Английский с Силом|62
stark-2-4|Приключение на острове (часть 4)|Джек Старк|79
simpeng_thinkenglish2|Как научиться думать по-английски (часть 2)|Простой английский|43
new-headway-20|Американский пациент|New Headway|67
london-central-3|Семья|London Central|38
see-3|Как не нужно изучать лексику (часть 3)|Английский с Силом|77
stark-2-5|Приключение на острове (часть 5)|Джек Старк|47
london-central-4|Лео влюбился|London Central|42
simple_travelphrasal1|Фразовые глаголы на тему путешествий (часть 1)|Простой английский|32
simple_travelphrasal2|Фразовые глаголы на тему путешествий (часть 2)|Простой английский|63
new-headway-14|Чудесный день|New Headway|83
new-headway-21|Договорённости|New Headway|71
stark3-1|Загадка мумии (часть 1)|Джек Старк|53
see-right-1|Как правильно изучать лексику (часть 1)|Английский с Силом|62
london-central-5|Один из тех дней|London Central|32
weardress_simpleeng|Как использовать put on, wear, dress|Простой английский|59
rock_n_roll_star|Звезда рок-н-ролла|New Headway|69
see-right-2|Как правильно изучать лексику (часть 2)|Английский с Силом|56
band_on_the_run|Группа в бегах|New Headway|70
london-central-6|Гонка на время|London Central|43
see-right-3|Как правильно изучать лексику (часть 3)|Английский с Силом|44
show_must_go_on|Шоу должно продолжаться|New Headway|83
simpleeng_someany1|Some и any – что нужно знать (часть 1)|Простой английский|46
stark3-2|Загадка мумии (часть 2)|Джек Старк|76
gramm-1|Изучение грамматики без правил (часть 1)|Английский с Силом|48
simpleeng_someany2|Some и any – что нужно знать (часть 2)|Простой английский|55
london-central-7|Идеальный рецепт|London Central|30
gramm-2|Изучение грамматики без правил (часть 2)|Английский с Силом|54
simple_beencomegone|Как использовать been, come и gone?|Простой английский|22
stark3-3|Загадка мумии (часть 3)|Джек Старк|100
simpleeng_like1|Слово «like» в разговорной речи (часть 1)|Простой английский|39
gramm-3|Изучение грамматики без правил (часть 3)|Английский с Силом|35
london-central-8|Пикник|London Central|47
simpleeng_like2|Слово «like» в разговорной речи (часть 2)|Простой английский|57
dialog-apple-store|Диалог в Apple Store|Диалоги|11
gramm-4|Изучение грамматики без правил (часть 4)|Английский с Силом|39
stark3-4|Загадка мумии (часть 4)|Джек Старк|61
place-names|Образование топонимов в Британии|История английского|36
london-central-9|Нервы|London Central|67
simple_cancouldmay1|Can I, Could I и May I? (часть 1)|Простой английский|38
simple_cancouldmay2|Can I, Could I и May I? (часть 2)|Простой английский|45
stark3-5|Загадка мумии (часть 5)|Джек Старк|51
london-central-10|Важный день|London Central|47
simpleeng_modalpossibility|May, might и could: вероятность (часть 1)|Простой английский|39
order-rest|Как сделать заказ в ресторане?|Английский с Гэбби|17
simpleeng_modalpossibility2|May, might и could: вероятность (часть 2)|Простой английский|56
startingout_theymeet|Встреча|Starting Out|26
startingout_tomsparty|Вечеринка Тома|Starting Out|27
simpleenglish_will_or_going_to|Говорим о будущем: will или be going to?|Простой английский|53
simpleenglish_going_to_present_continuous|Планы: be going to или Present Continuous?|Простой английский|33
hotel_problems|Проблемы в гостинице|Диалоги|36
would-you-like-to-come-with-me|Хочешь пойти со мной на матч?|Диалоги|21
8-ways-british-and-american-education-systems-are-very-different-part-1|Британское и американское образование (часть 1)|Образование|79
8-ways-british-and-american-education-systems-are-very-different-part-2|Британское и американское образование (часть 2)|Образование|77
look-like-be-like|Look like или be like|Простой английский|61
the-5-worst-pieces-of-health-advice-for-ages-50|Пять худших советов по здоровью|Здоровье|74
how-do-you-use-social-media|Как вы используете соцсети?|Интервью|35
what-are-your-favorite-weather-months-of-the-year-and-why|Любимые месяцы и погода|Люди говорят|61
future-food-the-menu-of-2030|Еда будущего: меню 2030|Интересные факты|53
8-ways-to-complain-in-english|Жалуемся по-английски|Обучение|62`,

  // диалоги-тренажёры: slug|English|по-русски
  dialogs: `do-you-know-trevor|Do you know Trevor?|Знаешь Тревора?
what-are-you-reading|What are you reading?|Что читаешь?
have-you-been-there|Have you been there?|Ты была там?
good-date|Good date|Удачное свидание
my-pets|My pets|Мои питомцы
concert-invitation|Concert invitation|Приглашение на концерт
family-picture|Family picture|Семейное фото
atm|ATM|Банкомат
childhood|Childhood memories|Воспоминания из детства
online-shopping|Online shopping|Покупки в интернете
a-gift-for-my-dad|A gift for my Dad|Подарок папе
terrible-date|Terrible date|Ужасное свидание
sightseeing|Sightseeing|Осмотр достопримечательностей
favorite-detectives|Favorite detectives|Любимые детективы
is-this-taxi-free|Is this taxi free?|Это такси свободно?
my-boss|My boss|Мой начальник
at-the-hostel|At the hostel|В хостеле
gym-membership|Gym membership|Абонемент в спортзал
can-you-repeat-that|Can you repeat that?|Не могли бы вы повторить?
technologies|Modern technologies|Диалог о технологиях
buying-a-subway-ticket|Buying a subway ticket|Покупка билета в метро
new-neighbor|New neighbor|Новый сосед
presentation|Presentation|Презентация
salary-negotiations|Salary negotiations|Переговоры о зарплате
business-negotiation|Business negotiation|Деловые переговоры
movie-invitation|Movie invitation|Пойдёшь со мной в кино?
getting-acquainted|Getting acquainted|Знакомство
checking-into-a-hotel|Checking into a hotel|Заселение в отель
buying-a-present|Buying a present|Покупка подарка
arranging-a-meeting|Arranging a meeting|Назначение встречи
in-a-restaurant|In a restaurant|В ресторане
taking-a-vacation|Taking a vacation|Отпуск
long-time-no-see|Long time no see|Давно не виделись!
at-the-foreign-exchange-office|At the foreign exchange office|В пункте обмена валюты
love-confession|Love confession|Признание в любви
job-interview|Job Interview|Собеседование
april-fools|April Fools|День дурака
at-the-train-station|At the train station|На вокзале
the-matrix-has-you|The Matrix has you|Ты принадлежишь Матрице
at-the-pet-store|At the pet store|В зоомагазине
favourite-sport|Favourite Sport|Любимый вид спорта
talking-about-the-weather|Talking about the weather|Разговор о погоде
congratulations-and-wishes|Congratulations and wishes|Поздравления и пожелания
youll-never-guess-what-happened|Guess what happened|Угадай, что произошло
how-do-i-get-there|How do I get there?|Как мне туда добраться?`,

  // подкасты BBC «Английский за шесть минут» (≈6 мин), от старых к новым: slug|тема
  podcasts: `sme090319|Быть на связи
sme090326|Хороший ночной отдых
sme090402|1 апреля
sme090409|Счастье
sme090416|Отпуск дома
sme090423|День Святого Георгия
sme090430|Запахи и воспоминания
sme090507|Гороскопы и астрология
sme090514|Весенняя уборка
sme090521|Борьба с плохими санитарными условиями
sme090528|Трудоголизм
sme090604|Обмен домами
sme090611|Танцы в преклонном возрасте
sme090618|Полет на планере
sme090625|Одинокий жучок
sme090702|Автомат для продажи золота
sme090709|Город вводит собственную валюту
sme090716|Загар
sme090723|Диванный серфинг
sme090730|Высадка на Луну
sme090806|Протест против индийской шахты
sme090820|Пчеловодство
sme090827|Рыжие нытики
sme090903|Борьба с укусами змей
sme090910|Чинглиш в Шанхае
sme090917|Мечты и реальность
sme090924|Цифровое неравенство
sme091001|Голубиная почта против интернета
sme091008|Вторжение пауков
sme091022|Тихий Лондон
sme091029|Йога смеха
sme091105|Электронные книги
sme091112|Спиральный музей
sme091119|Электронные войны
sme091126|Синестезия
sme091203|Дорогой дневник...
sme091217|Почти знаменитые
sme091223|Санта Клаус
sme091230|Изменения за десятилетие
sme100107|Новогодние обещания
sme100114|Жаворонки и совы
sme100121|Ночь Бернса
sme100128|История мира в 100 объектах
sme100204|Пенсия
sme100211|Кредитные карты
sme100218|Загрязнение пластиком`,

  // книга, которую ты читаешь сейчас
  book: { slug: "frances_hodgson_burnett_a_little_princess", title: "Маленькая принцесса", author: "Фрэнсис Бёрнетт" },

  // пройдено в Puzzle до 26.10.2026 (из «Истории»)
  doneBefore: `/video/the-weather-for-kids /video/easy-eng-4 /video/whats-your-favourite-gadget /exercise/replace-good /exercise/replace-bad /exercise/demonstrative_pronouns-2 /exercise/demonstrative_pronouns /exercise/relative_pronouns /exercise/indefinite_pronouns /exercise/place_prepositions /exercise/reciprocal_pronouns /exercise/reflexive-pronouns /exercise/reflexive_pronouns /exercise/possessive_pronouns /exercise/no-not /exercise/possessive-pronouns /exercise/one-pronoun /exercise/many-much-lot /exercise/much-many-few-little /exercise/each-or-every /exercise/interrogative_pronouns /exercise/so-such /exercise/too-enough /exercise/i_me /exercise/conjunctions_usage_secrets /exercise/conjunctions_coordinating /exercise/conjunctions_subordinating /exercise/conjunctions_correlative /exercise/because-because-of /exercise/seem /exercise/prepositions_other_meanings /exercise/prep_of_time /exercise/prepositions_time /exercise/no-prepositions /exercise/prepositions_place /exercise/at-on-in /exercise/prepositions-place-direction /exercise/in-into-inside-within /exercise/among_between /exercise/particles /exercise/adj-adv-position /exercise/good_well /exercise/also-too-as-well /exercise/listen_hear /exercise/like /exercise/typical_mistakes /exercise/for-on-sale /exercise/borrow_lend /exercise/airport-english-2 /exercise/airport-english-1 /exercise/hobbies /exercise/meet_people /exercise/top-10-travel /exercise/near-next-to /exercise/from_a_to_b /exercise/order-adjectives /exercise/imperative-mood /exercise/adverbs-of-frequency /exercise/just-meanings /exercise/gold-golden /exercise/determiners /exercise/come-go /exercise/comparison-as-as /exercise/good-bad-at /exercise/been-gone /exercise/be-do /exercise/tags /exercise/little-bit /exercise/comparison /exercise/few_little /exercise/fun-funny /exercise/let /exercise/there-it /exercise/money_matters /exercise/look-see-watch /exercise/for_during_since /exercise/pronunciation-mc12 /exercise/so-neither-construction /exercise/do-play-go /exercise/indirect-questions /exercise/subject-questions /video/startingout_campsite /video/see-right-4 /video/at-the-hospital /video/would-like /dialogs/see-that-girl-over-there /dialogs/meeting-at-the-airport /dialogs/a-new-movie /dialogs/do-you-have-a-car /dialogs/asking-for-the-time`,
};

/* ---------- каталоги ---------- */
const PZ_LEVEL = "Pre-Intermediate (A2–B1)";
const PZ_URL = "https://puzzle-english.com";
const pzLines = (s) => s.split("\n").map((l) => l.split("|"));
// азы для начинающих из трека Elementary — пропускаем, это ниже твоего уровня
const PZ_GRAMMAR_BASICS = new Set(["sentence", "subject-verb1", "subject-verb2", "object", "family-vocabulary", "adjectives-beginner", "articles-101", "noun_cases"]);
const PZ_GRAMMAR = pzLines(PZ_DATA.grammar).filter(([slug]) => !PZ_GRAMMAR_BASICS.has(slug))
  .map(([slug, title]) => ({ type: "grammar", path: "/exercise/" + slug, title, min: 8, level: "A2–B1" }));
// уровень рубрики видеопазлов
const PZ_VIDEO_LEVEL = { "Starting Out": "A2", "Диалоги": "A2", "Английский с Гэбби": "A2", "Простой английский": "A2–B1", "New Headway": "A2–B1" };
const PZ_VIDEOS = pzLines(PZ_DATA.video).map(([slug, title, cat, ph]) => ({
  type: "video", path: "/video/" + slug, title, cat, min: +ph > 60 ? 7 : +ph > 30 ? 5 : 3, level: PZ_VIDEO_LEVEL[cat] || "B1",
}));
const PZ_DIALOGS = pzLines(PZ_DATA.dialogs).map(([slug, en, ru]) => ({ type: "dialog", path: "/dialogs/" + slug, title: `${en} — ${ru}`, min: 4, level: "A2" }));
const PZ_PODCASTS = pzLines(PZ_DATA.podcasts).map(([slug, title]) => ({ type: "podcast", path: "/podcast/" + slug, title: "Английский за шесть минут: " + title, min: 8, level: "B1" }));
const PZ_BOOK_ITEM = { type: "book", path: "/books/" + PZ_DATA.book.slug, title: `${PZ_DATA.book.title} — следующая глава`, min: 12, level: "A2–B1" };
const PZ_WORDS_ITEM = { type: "words", path: "/words", title: "Тренировка слов из «Моего словаря»", min: 4, level: "" };
const PZ_TYPE = {
  grammar: { label: "Грамматика", icon: "school" },
  video: { label: "Видеопазл", icon: "target" },
  dialog: { label: "Диалог", icon: "messages" },
  podcast: { label: "Подкаст", icon: "volume" },
  book: { label: "Книга", icon: "book" },
  words: { label: "Слова", icon: "books" },
};
const PZ_ALL = [...PZ_GRAMMAR, ...PZ_VIDEOS, ...PZ_DIALOGS, ...PZ_PODCASTS];
function pzItem(path) { return PZ_ALL.find((x) => x.path === path) || (path === PZ_BOOK_ITEM.path ? PZ_BOOK_ITEM : path === PZ_WORDS_ITEM.path ? PZ_WORDS_ITEM : null); }
function pzHref(path) { return PZ_URL + path + (/^\/books\//.test(path) ? "/work" : ""); }
// адрес из «Истории» Puzzle → путь как в каталоге
function pzNormPath(p) {
  p = String(p || "").replace(/^https?:\/\/puzzle-english\.com/, "").replace(/\/work$/, "").replace(/\/$/, "");
  const pod = p.match(/\/video\/podcasts-category\/([^/]+)/);
  return pod ? "/podcast/" + pod[1] : p;
}

/* ---------- конспекты, которые написал Claude ---------- */
const PUZZLE_NOTES = [
  {
    id: "teacher-28", kicker: "Метод Тичера", title: "Урок 28 · Путешествие во времени", date: "2026-10-26", by: "Claude", score: "85 заданий из 85 — без ошибок",
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
const LS_PUZZLE = "enapp_puzzle_v2";
// lessons: [{ id, n, at, items: [path], finished }], done: { path: дата }, notes: { lessonId: конспект }
let PUZZLE = loadJSON(LS_PUZZLE, null) || { lessons: [], done: {}, notes: {} };
const PZ_DONE_BEFORE = new Set(PZ_DATA.doneBefore.split(/\s+/).filter(Boolean));
let puzzleTab = "lessons";
let puzzleOpenNote = null;

function savePuzzle() {
  saveJSON(LS_PUZZLE, PUZZLE);
  if (window.CloudSync) window.CloudSync.schedulePush();
}
function pzIsDone(path) { return !!PUZZLE.done[path] || PZ_DONE_BEFORE.has(path); }
// уже стоит в каком-то уроке приложения — второй раз не предлагаем
function pzIsPlanned(path) { return PUZZLE.lessons.some((l) => l.items.includes(path)); }
function pzCurrentLesson() { const l = PUZZLE.lessons[PUZZLE.lessons.length - 1]; return l && !l.finished ? l : null; }
function pzLessonById(id) { return PUZZLE.lessons.find((l) => l.id === id) || null; }
function pzLessonTitle(l) { const g = l.items.map(pzItem).find((x) => x && x.type === "grammar"); return `Урок ${l.n}${g ? " · " + g.title : ""}`; }
function puzzleNote(id) { return PUZZLE.notes[id] || PUZZLE_NOTES.find((x) => x.id === String(id)) || null; }
function allPuzzleNotes() {
  const ids = new Set([...PUZZLE_NOTES.map((x) => x.id), ...Object.keys(PUZZLE.notes)]);
  return [...ids].map((id) => ({ ...puzzleNote(id), id })).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/* ---------- «Создай урок»: ~25 минут под твой уровень ---------- */
function pzFree(list) { return list.filter((x) => !pzIsDone(x.path) && !pzIsPlanned(x.path) && !(PUZZLE.skipped || {})[x.path]); }
function pzWordsOf(s) { return new Set(String(s).toLowerCase().match(/[a-z]{3,}/g) || []); }
function puzzleBuildLesson() {
  const n = PUZZLE.lessons.length + 1;
  const items = [];
  const grammar = pzFree(PZ_GRAMMAR)[0];
  if (grammar) items.push(grammar);
  // видео: сначала то, что перекликается с грамматикой урока, иначе чередуем A2 и B1
  const videos = pzFree(PZ_VIDEOS);
  const gw = grammar ? pzWordsOf(grammar.title) : new Set();
  const match = videos.find((v) => [...pzWordsOf(v.title)].some((w) => gw.has(w)));
  const wantLevel = n % 2 ? "A2" : "B1";
  const video = match || videos.find((v) => v.level.startsWith(wantLevel)) || videos[0];
  if (video) items.push(video);
  const dialog = pzFree(PZ_DIALOGS)[0];
  if (dialog) items.push(dialog);
  // чтение и аудирование по очереди: книга / подкаст
  const podcast = pzFree(PZ_PODCASTS)[0];
  items.push(n % 2 && podcast ? podcast : PZ_BOOK_ITEM);
  items.push(PZ_WORDS_ITEM);
  return { id: "pl-" + n, n, at: todayStr(), items: items.map((x) => x.path), finished: null };
}
function puzzleCreateLesson() {
  if (pzCurrentLesson()) return;
  PUZZLE.lessons.push(puzzleBuildLesson());
  savePuzzle();
  renderPuzzle();
}
function puzzleToggleItem(path) {
  if (PUZZLE.done[path]) delete PUZZLE.done[path];
  else PUZZLE.done[path] = todayStr();
  savePuzzle();
  renderPuzzle();
}
// заменить пункт урока на следующий того же вида
function puzzleSwapItem(path) {
  const l = pzCurrentLesson();
  const it = pzItem(path);
  if (!l || !it) return;
  const pool = { grammar: PZ_GRAMMAR, video: PZ_VIDEOS, dialog: PZ_DIALOGS, podcast: PZ_PODCASTS }[it.type];
  if (!pool) return;
  PUZZLE.skipped = PUZZLE.skipped || {};
  PUZZLE.skipped[path] = todayStr();
  const next = pzFree(pool)[0];
  if (!next) { delete PUZZLE.skipped[path]; return; }
  l.items = l.items.map((p) => (p === path ? next.path : p));
  savePuzzle();
  renderPuzzle();
}
function puzzleFinishLesson() {
  const l = pzCurrentLesson();
  if (!l) return;
  l.finished = todayStr();
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
  if (!document.getElementById("view-puzzle").classList.contains("active")) showView("puzzle");
  else renderPuzzle();
  window.scrollTo(0, 0);
}

/* ---------- конспекты → слова и день изучения в Повторении ---------- */
function puzzleNoteWordEn(s) { return String(s).split(" — ")[0].trim(); }
function puzzleLogEntry(note) {
  return {
    id: "pe-" + note.id, date: note.date, source: "puzzle",
    lessons: [{ skill: `Puzzle · ${note.title}`, lessonNum: "конспект" }],
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
function puzzleNoteWords(id) { return (puzzleNote(id).words || []).map((w) => puzzleNoteWordEn(w[0])); }
function puzzleLearnNote(id) { startLearnForWords(puzzleNoteWords(id)); }
function puzzleCheckNote(id) { startSessionForWords(puzzleNoteWords(id)); }

/* ---------- приём из закладки: что пройдено в Puzzle + материалы для конспекта ---------- */
async function aiPuzzleLessonNote(lesson, mats) {
  const body = mats.map((m) => {
    const it = pzItem(m.path) || { type: m.ty, title: m.t };
    const label = (PZ_TYPE[it.type] || { label: "Материал" }).label;
    const lines = (m.c || []).map((p) => `${p[0]}${p[1] ? " — " + p[1] : ""}`).join("\n");
    return `### ${label}: ${m.t || it.title}\n${m.x ? m.x + "\n" : ""}${lines}`;
  }).join("\n\n").slice(0, 30000);
  const prompt = `Ты — мудрый и добрый учитель английского для русскоговорящей ученицы уровня ${PZ_LEVEL}.
Она прошла урок в Puzzle English. Ниже — материалы урока: описание урока грамматики, субтитры видео, реплики диалога, текст подкаста (английский — русский).
Составь конспект урока для её тетради. Бери только то, что есть в материалах, ничего не выдумывай:
- summary: 1–2 предложения, о чём урок;
- rules: 2–6 правил (прежде всего из урока грамматики) — title (коротко, как правило-запоминалка), text (1–3 простых предложения по-русски: как и ПОЧЕМУ так), ex — 1–2 примера из материалов [английский, русский];
- words: 12–25 слов и выражений уровня A2–B1, которые стоит выучить [английский, русский]; у неправильных глаголов — три формы через « — »;
- phrases: 5–8 полезных готовых фраз из видео, диалога или подкаста [английский, русский];
- remember: одна строка — самое главное из урока.
Материалы:
${body}
Ответь СТРОГО JSON без markdown: {"summary":"","rules":[{"title":"","text":"","ex":[["",""]]}],"words":[["",""]],"phrases":[["",""]],"remember":""}`;
  const r = parseJsonLoose(await callGeminiRaw(prompt, true));
  const pairs = (a) => (Array.isArray(a) ? a : []).filter((x) => Array.isArray(x) && x[0]).map((x) => [String(x[0]), String(x[1] || "")]);
  return {
    summary: String(r.summary || ""),
    rules: (Array.isArray(r.rules) ? r.rules : []).filter((x) => x && x.title).map((x) => ({ title: String(x.title), text: String(x.text || ""), ex: pairs(x.ex) })),
    words: pairs(r.words),
    phrases: pairs(r.phrases),
    mistakes: [],
    remember: String(r.remember || ""),
  };
}
// вызывается из import.js, когда закладку нажали на puzzle-english.com
async function processPuzzleHistory(data, step) {
  const items = (data.items || []).map((m) => ({ ...m, path: pzNormPath(m.p) }));
  let marked = 0;
  for (const m of items) {
    if (m.v >= 100 && !PUZZLE.done[m.path]) { PUZZLE.done[m.path] = dateOfTs(m.ts * 1000); marked++; }
  }
  if (items.length) step(`Пройдено в Puzzle за последние дни: ${items.filter((m) => m.v >= 100).length}`);
  // урок для конспекта: текущий или последний законченный без конспекта
  const lesson = pzCurrentLesson() || [...PUZZLE.lessons].reverse().find((l) => l.finished && !PUZZLE.notes[l.id]);
  let note = null;
  if (lesson) {
    const mats = items.filter((m) => lesson.items.includes(m.path) && ((m.c && m.c.length) || m.x));
    const left = lesson.items.filter((p) => !pzIsDone(p) && p !== PZ_WORDS_ITEM.path && p !== PZ_BOOK_ITEM.path);
    if (!left.length && !lesson.finished) lesson.finished = todayStr();
    if (mats.length && !PUZZLE.notes[lesson.id]) {
      if (!loadAiKey()) step(`Конспект урока ${lesson.n} напишет Claude (ключа Gemini нет) — скажи «законспектируй урок ${lesson.n}».`);
      else {
        step(`Пишу конспект урока ${lesson.n}: правила, слова, фразы…`);
        try {
          const n = await aiPuzzleLessonNote(lesson, mats);
          note = { id: lesson.id, date: todayStr(), by: "Gemini", kicker: "Puzzle English", title: pzLessonTitle(lesson), items: lesson.items, ...n };
          PUZZLE.notes[lesson.id] = note;
          mergePuzzleNotes();
          puzzleOpenNote = lesson.id;
          puzzleTab = "notes";
        } catch (e) { step("Конспект не получился: " + e.message); }
      }
    }
  }
  savePuzzle();
  return { marked, note };
}

/* ---------- экран ---------- */
function pzItemRow(path, lesson) {
  const it = pzItem(path);
  if (!it) return "";
  const t = PZ_TYPE[it.type];
  const done = pzIsDone(path);
  const canSwap = lesson && !lesson.finished && !done && ["grammar", "video", "dialog", "podcast"].includes(it.type);
  return `<div class="pz-item${done ? " done" : ""}">
    <button class="pz-check" onclick="puzzleToggleItem('${path}')" aria-label="${done ? "Отметить как непройденное" : "Отметить пройденным"}">${done ? ico("check") : ""}</button>
    <div class="pz-item-main">
      <div class="pz-item-kicker">${ico(t.icon)} ${t.label}${it.cat ? " · " + escapeHtml(it.cat) : ""} · ${it.min} мин${it.level ? ` · <span class="pz-lvl">${it.level}</span>` : ""}</div>
      <a class="pz-item-title" href="${pzHref(path)}" target="_blank" rel="noopener">${escapeHtml(it.title)}</a>
    </div>
    ${canSwap ? `<button class="pz-swap" onclick="puzzleSwapItem('${path}')" aria-label="Заменить">${ico("refresh")}</button>` : ""}
  </div>`;
}
function pzStats() {
  const cnt = (list) => list.filter((x) => pzIsDone(x.path)).length;
  return [
    ["Грамматика", `${cnt(PZ_GRAMMAR)} из ${PZ_GRAMMAR.length}`],
    ["Видеопазлы", `${cnt(PZ_VIDEOS)} из ${PZ_VIDEOS.length}`],
    ["Диалоги", `${cnt(PZ_DIALOGS)} из ${PZ_DIALOGS.length}`],
    ["Подкасты", `${cnt(PZ_PODCASTS)} из ${PZ_PODCASTS.length}`],
  ];
}
function renderPuzzleLessons() {
  const cur = pzCurrentLesson();
  let html = `<p class="pz-level">${ico("target")} Подобрано под твой уровень: <b>${PZ_LEVEL}</b></p>`;
  if (cur) {
    const total = cur.items.reduce((s, p) => s + ((pzItem(p) || {}).min || 0), 0);
    const left = cur.items.filter((p) => !pzIsDone(p)).length;
    html += `<div class="card pz-current">
      <div class="pz-kicker">Урок ${cur.n} · ≈${total} мин</div>
      <h2 class="pz-h">${escapeHtml(pzLessonTitle(cur).replace(/^Урок \d+ · /, ""))}</h2>
      <div class="pz-items">${cur.items.map((p) => pzItemRow(p, cur)).join("")}</div>
      <p class="block-note pz-howto">${ico("bookmark")} Прошла всё? Открой любую страницу puzzle-english.com и нажми закладку «Мой английский» — она отметит пройденное и сделает конспект в Нотатник.</p>
      <div class="cta-alt"><button class="link-btn" onclick="puzzleFinishLesson()">${ico("check")} ${left ? "Закончить урок" : "Урок пройден"}</button></div>
    </div>`;
  } else {
    const preview = puzzleBuildLesson();
    const total = preview.items.reduce((s, p) => s + ((pzItem(p) || {}).min || 0), 0);
    html += `<div class="card pz-current pz-empty">
      <div class="pz-kicker">Следующий · урок ${preview.n}</div>
      <p class="pz-topic">Внутри: ${preview.items.map((p) => PZ_TYPE[pzItem(p).type].label.toLowerCase()).join(", ")} — ≈${total} мин</p>
      <button class="cta" onclick="puzzleCreateLesson()">Создай урок ${ico("sparkles")}</button>
    </div>`;
  }
  const waiting = PUZZLE.lessons.filter((l) => l.finished && !puzzleNote(l.id)).slice(-1)[0];
  if (waiting) html += `<p class="block-note pz-howto">${ico("pencil")} Урок ${waiting.n} пройден, конспекта ещё нет: нажми закладку на puzzle-english.com или скажи Claude «законспектируй урок ${waiting.n}».</p>`;

  html += `<h2 class="section-title">Прогресс в Puzzle</h2><div class="sched">${pzStats().map(([a, b]) => `<div class="sched-row"><span class="sched-label">${a}</span><span class="sched-next">${b}</span></div>`).join("")}
    <div class="sched-row"><span class="sched-label">Книга</span><span class="sched-next">${escapeHtml(PZ_DATA.book.title)}</span></div></div>`;

  const past = PUZZLE.lessons.filter((l) => l.finished).reverse();
  if (past.length) html += `<h2 class="section-title">Мои уроки</h2><div class="nb-index">${past.map((l) => {
    const note = puzzleNote(l.id);
    return `<button class="nb-entry" onclick="${note ? `openPuzzleNote('${l.id}')` : ""}"${note ? "" : " disabled"}>
      <span class="nb-entry-num">${l.n}</span>
      <span class="nb-entry-text"><b>${escapeHtml(pzLessonTitle(l).replace(/^Урок \d+ · /, ""))}</b><small>${formatDateRu(l.finished)} · ${note ? "конспект готов" : "без конспекта"}</small></span>
      ${note ? ico("chevron-right") : ""}
    </button>`;
  }).join("")}</div>`;
  return html;
}
function renderNotebookList() {
  const notes = allPuzzleNotes();
  if (!notes.length) return `<div class="empty-state">Нотатник пока пуст. Пройди урок — и здесь появится его конспект.</div>`;
  return `<div class="nb-index">${notes.map((x) => `<button class="nb-entry" onclick="openPuzzleNote('${x.id}')">
      <span class="nb-entry-num">${ico("book-2")}</span>
      <span class="nb-entry-text"><b>${escapeHtml(x.title)}</b><small>${escapeHtml(x.kicker || "Puzzle English")} · ${(x.rules || []).length} ${plural((x.rules || []).length, "правило", "правила", "правил")} · ${(x.words || []).length} ${plural((x.words || []).length, "слово", "слова", "слов")}</small></span>
      ${ico("chevron-right")}
    </button>`).join("")}</div>`;
}
function renderNotePage(id) {
  const x = puzzleNote(id);
  const pair = (p) => `<div class="nb-pair"><span class="nb-en">${escapeHtml(p[0])}</span><span class="nb-ru">${escapeHtml(p[1])}</span></div>`;
  const ex = (e) => `<div class="nb-ex"><span class="nb-en">${escapeHtml(e[0])}</span><span class="nb-ru">${escapeHtml(e[1])}</span></div>`;
  const [num, ...rest] = String(x.title).split(" · ");
  return `<button class="archive-back" onclick="setPuzzleTab('notes')">${ico("arrow-left")} Нотатник</button>
  <article class="nb-page">
    <header class="nb-head">
      <div class="nb-kicker">${escapeHtml(x.kicker || "Puzzle English")} · ${formatDateRu(x.date)}</div>
      <h2 class="nb-title">${rest.length ? `<span class="nb-n">${escapeHtml(num)}.</span> ${escapeHtml(rest.join(" · "))}` : escapeHtml(x.title)}</h2>
      ${x.score ? `<div class="nb-meta">${escapeHtml(x.score)}</div>` : ""}
    </header>
    ${x.summary ? `<p class="nb-summary">${escapeHtml(x.summary)}</p>` : ""}
    ${(x.rules || []).length ? `<h3 class="nb-h">Правила</h3>${x.rules.map((r, i) => `<section class="nb-rule">
        <div class="nb-rule-title"><span class="nb-rule-n">${i + 1}</span>${escapeHtml(r.title)}</div>
        <p>${escapeHtml(r.text)}</p>
        ${(r.ex || []).map(ex).join("")}
      </section>`).join("")}` : ""}
    ${(x.words || []).length ? `<h3 class="nb-h">Слова</h3><div class="nb-words">${x.words.map(pair).join("")}</div>
      <div class="settings-row">
        <button class="small-btn learn-btn" onclick="puzzleLearnNote('${id}')">${ico("book-2")} Изучить</button>
        <button class="small-btn" onclick="puzzleCheckNote('${id}')">${ico("pencil")} Проверить себя</button>
      </div>` : ""}
    ${(x.phrases || []).length ? `<h3 class="nb-h">Фразы</h3><div class="nb-phrases">${x.phrases.map(ex).join("")}</div>` : ""}
    ${(x.mistakes || []).length ? `<h3 class="nb-h">Мои ошибки</h3>${x.mistakes.map((m) => `<section class="nb-mistake">
        ${m.task ? `<div class="nb-task">${escapeHtml(m.task)}</div>` : ""}
        ${m.yours ? `<div class="nb-yours">${escapeHtml(m.yours)}</div>` : ""}
        <div class="nb-correct">${escapeHtml(m.correct)}</div>
        ${m.why ? `<p class="nb-why">${escapeHtml(m.why)}</p>` : ""}
      </section>`).join("")}` : ""}
    ${x.remember ? `<aside class="nb-remember"><b>Запомни</b>${escapeHtml(x.remember)}</aside>` : ""}
    <footer class="nb-foot">Конспект: ${escapeHtml(x.by || "Claude")}${(x.items || []).length ? " · " + x.items.map((p) => pzItem(p)).filter(Boolean).map((it) => `<a href="${pzHref(it.path)}" target="_blank" rel="noopener">${PZ_TYPE[it.type].label.toLowerCase()}</a>`).join(", ") : ""}</footer>
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
