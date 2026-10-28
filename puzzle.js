/* ============ Puzzle English: уроки из заданий, слов, диалогов, книг и подкастов ============
   «Создай урок» собирает урок ≈80 минут под твой уровень (Pre-Intermediate, A2–B1): три блока
   по ~25 минут с перерывами — грамматика (урок трека + урок из каталога + видео), слушаем и говорим (2 диалога +
   подкаст), читаем и закрепляем (глава книги + видео B1 + тренировка слов).
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

  // каталог видео-уроков Puzzle (947): уровень сложности 1–2, без азов, без пройденного — slug|название|сложность|фраз
  catalog: `articles-georgaphical-names|Артикли с географическими названиями|1|19
scam|Говорим о мошенничестве на английском|1|11
15-phrases-shopping|15 фраз для шоппинга|1|15
store-names|Английские названия магазинов|1|15
surprise-expr|Удивляемся по-английски|2|12
pronunciation-mc6|Мастер-класс по произношению. Beg или Bag?|1|19
pronunciation-mc5|Мастер-класс по произношению. Love или Laugh?|1|16
present-tenses-practice|Present Tenses (настоящие времена)|2|24
tool-expr|Устойчивые сочетания с инструментами|2|11
pronunciation-mc4|Мастер-класс по произношению. Work или Walk?|1|19
very-important|«Очень важный» по-английски: essential, vital, crucial|2|10
pronunciation-mc3|Мастер-класс по произношению. Pot или Port?|1|17
still-yet|Still или yet? Что выбрать?|2|15
still|STILL: значения и позиция в предложении|2|17
best-expr|Устойчивые сочетания со словом BEST|2|16
pronunciation-mc2|Мастер-класс по произношению. Full или Fool?|1|17
prepositions-business|Предлоги в деловом английском|1|19
pronunciation-mc1|Мастер-класс по произношению. Live или Leave?|1|21
past-tenses-practice|Past Tenses (прошедшие времена)|2|24
answer-reply-response|Answer, reply или response?|1|12
start-synonyms|С чистого листа: синонимы START|2|11
how-to-interrupt|Как вежливо перебить по-английски?|2|21
tags-plus|Разделительные вопросы для продолжающих|2|22
student-vocabulary|Рассказываем об учёбе по-английски|2|15
imperative-inter|Повелительное наклонение для продолжающих|2|15
remember-remind-recall|Remember, remind или recall?|2|12
english-when-annoyed|Английский, когда всё бесит|2|15
open-and-co|«Открывать» и «раскрывать» по-английски|2|15
get-passive|Пассивный залог с GET|2|13
crash-crush|Crash или Crush?|2|14
ok|Как использовать и чем заменить OK?|1|21
phrasal-verbs-synonyms2|Ещё фразовые глаголы и их эквиваленты|2|19
double-negation|Что такое двойное отрицание?|2|15
than-then|THAN или THEN?|2|16
phrasal-verbs-synonyms|Фразовые глаголы и их эквиваленты|2|16
negative-questions2|Отрицательные вопросы: выражаем эмоции|2|10
negative-questions1|Отрицательные вопросы: порядок слов и ответы|2|14
live-life-alive-lively|Live, life, alive, lively. В чём разница?|1|10
for-to-infinitive2|Инфинитивная конструкция с предлогом FOR. Часть 2|2|13
small-talk|Small Talk. Как поддержать беседу?|1|10
for-to-infinitive1|Инфинитивная конструкция с предлогом FOR. Часть 1|2|17
can-be-able-to|Can или be able to?|2|14
once-use|Как использовать Once?|1|10
miss-lack|Miss или Lack. Что выбрать?|1|10
vague-and-polite-language|Как звучать вежливее и мягче в английском|2|15
once|Выражения со словом Once|2|12
doubt|Способы выразить неуверенность на английском|1|13
4-ways-to-use-should|Should: 4 варианта употребления|2|9
work|Выражения со словом Work|1|11
findout-figureout|Find out и Figure out. В чём разница?|1|10
taste-flavour|Flavour и Taste. В чём разница?|1|10
decision-solution|Decision и Solution. В чём разница?|1|10
normal|6 способов сказать «обычный» по-английски|2|14
styles|Стили: формальное и неформальное в английском|2|21
hope|Как использовать Hope?|2|9
all-whole|All или Whole?|1|12
omit-that|Когда that можно опустить?|2|16
power-strength-force|Power, Strength, Force. В чём разница?|1|11
quite-pretty-rather|Quite, pretty, rather, fairly. В чём разница?|2|11
singular-they|They в значении единственного числа|1|12
smart-clever|Разные способы сказать «умный» по-английски|2|10
other-another-different|«Другой» по-английски: other, another или different?|2|14
cost-price-worth|Cost, price, worth, value, charge, fare. В чём разница?|2|11
give-2|Ещё несколько выражений со словом Give|2|10
give-expressions|Выражения со словом Give|2|10
else|Как использовать ELSE|2|14
mind2|Ещё пять выражений со словом Mind|2|10
congratulations|Универсальные способы поздравить по-английски|1|14
mind|Пять выражений со словом Mind|2|9
stupid-dumb-silly-foolish|Stupid, dumb, silly и foolish. В чём разница?|1|10
specially-especially|Specially или Especially?|1|9
too-enough-expr|ТОП-10 выражений с TOO и ENOUGH|2|15
sep-insep-phrasal-verbs|Разделяемые и неразделяемые фразовые глаголы|2|11
word-choice|Слова «место», «удобный» и «тень» по-английски|2|16
go-more|Выражения с глаголом Go. Часть 2|2|10
compound-nouns|Составные существительные|2|12
all|Устойчивые выражения с All|2|10
noun-suffixes|Словообразование: суффиксы существительных|2|16
stand-stay|Stand или Stay?|1|12
adjective-suffixes2|Суффиксы прилагательных. Часть 2|2|15
go|Выражения с глаголом Go|2|10
adjective-suffixes1|Суффиксы прилагательных. Часть 1|2|13
take-2|Другие выражения с глаголом Take|2|9
often-confused|Слова, которые часто путают|2|18
expressions-take|Выражения с глаголом Take|2|10
prefixes|Словообразование: приставки|2|15
rob-steal|Rob или Steal?|1|10
use-them-right|Слова, которые часто используют неверно|2|18
win-beat|Win или Beat?|1|11
good-time|Хорошо проводим время по-английски|2|10
here-there-expressions|Выражения с here и there: there we go, here's to|2|13
before-by-until-till|Before, by, until или till?|2|11
had-better|Конструкция Had better|1|11
negative-prefixes|Отрицательные приставки|2|25
would_rather_prefer|Конструкции Would rather и Would prefer|2|14
linking-verbs|Глаголы-связки и их особенности|1|15
and|Чем заменить And?|2|10
participle-clauses2|Причастный оборот с причастием прошедшего времени|2|15
rise-raise-wakeup-getup|Get up и Wake up. Rise и Raise|1|12
participle-clauses1|Причастный оборот с причастиями настоящего времени|2|15
lay-lie-set-put|Класть и лежать по-английски|1|10
participles|Причастие в английском языке|2|14
imagination-dream-fantasy|Imagination, dream и fantasy. В чём разница?|1|9
start-begin|Start или Begin?|1|12
stuff-staff|Stuff и Staff. В чём разница?|1|10
when-where-how-ever|Whenever, wherever и however|2|12
wait-expect|Wait или Expect?|1|11
what-which-who-ever|Whatever, whichever и whoever|2|12
introductory-verbs4|Вводные глаголы + инфинитив или придаточные|2|15
alone-lonely-lonesome-single|Об одиночестве по-английски|1|13
introductory-verbs3|Вводные глаголы + форма –ING|2|12
clauses-of-result|Придаточные предложения результата|2|15
introductory-verbs2|Вводные глаголы + объект + инфинитив|2|11
but|Чем заменить But?|2|11
introductory-verbs1|Вводные глаголы + инфинитив|2|10
football-idioms|Футбольные идиомы: get the ball rolling и др.|2|10
overused-words|ТОП-5 слишком часто используемых слов|2|17
person-human-man|Person, human, man. Что выбрать?|2|10
suppose-supposed|Suppose или Be Supposed To?|2|11
back-expressions|Выражения со словом Back|2|10
get-expressions|Выражения со словом Get|2|11
way-expressions|Выражения со словом Way|2|10
replace-if|Что использовать вместо IF: as long as, provided|2|12
clauses-of-purpose2|Придаточные предложения цели. Часть 2|2|10
modals-past-and-deduction|Could, could have done или must have done|2|13
clauses-of-purpose|Придаточные предложения цели. Часть 1|2|13
what-or-that|«Что» и «который»: What, That, Which, Who, Whose, Whom|2|15
clauses_of_reason|Придаточные предложения причины|2|15
want-words|Чем заменить want?|1|15
3waysto_surprise|Три способа выразить удивление по-английски|1|9
expressions-so|Выражения с So|1|12
3waysto_approve|Три способа узнать мнение и получить одобрение|1|10
3waysto-hurry|Три способа поторопить по-английски|1|8
3waysto_refuse|Три способа отказаться по-английски|1|8
3waysto-agree|Три способа согласиться по-английски|1|8
long-short-vowels|Долгота звука|1|8
very-replace|Чем заменить слово very?|2|16
3waysto_congratulate|Три способа поздравить по-английски|1|10
adj-prep|Какой предлог нужен? Прилагательные|2|15
fast-quick|Fast или Quick?|2|12
verb-prep|Какой предлог нужен? Глаголы|2|20
expr-by|Английские выражения с предлогом by|2|10
3waysto_calmdown|Три способа успокоить по-английски|1|7
3waysto_saythankyou|Три способа поблагодарить по-английски|1|10
expr-the2|Выражения с артиклем the: in the distance, to the right|2|11
expr-the1|Выражения с артиклем the: on the house, by the way|2|12
expr-over-around|Английские выражения с over и around|2|12
expr-out-of|Английские выражения с out of|2|7
expr-up|Английские выражения с предлогом up|2|8
worth|Прилагательное worth. Worth или worthwhile?|2|8
used-to-vs-be-get-used-to|Used to или be/get used to?|1|11
adj-adv-difference|Прилагательное или наречие? Как отличить?|2|17
waking_up2|Фразы о пробуждении: early bird, night owl|2|8
waking_up1|Фразы о пробуждении: rise and shine, it's time|2|8
travel-2|Идиомы о путешествиях: hit the road, travel light|2|9
wish|Wish: желания и сожаления|2|10
travel_idioms1|Идиомы о путешествиях: pit stop, one for the road|2|8
smb_smth|Это something для somebody|1|12
expr-in|Английские выражения с предлогом in|2|6
linking|Вводные слова: you know, by the way, kind of|2|20
expr_for|Английские выражения с предлогом for|2|14
disease_illness_or_sickness|Disease, illness или sickness?|2|9
adverbial-clauses-time|Придаточные времени|2|9
a-expressions-2|Выражения с артиклем a: at a loss, for a while|2|6
a-expressions-1|Выражения с артиклем a: have a look, have a cold|2|6
like-as|Like или As?|2|10
do-does-did|Усилительные конструкции с do/does/did|2|10
expressions-on|Английские выражения с предлогом on|2|12
have-have-got|Have или have got?|1|11
expressions-at|Английские выражения с предлогом at|2|18
past-continuous|Past Continuous (Прошедшее продолженное время)|1|10
pain-hurt-ache|Боль по-английски: pain, hurt, ache|2|9
same-roots|Похожие слова: childish/childlike, hopeful/hopeless|2|11
food-idioms-1|Съедобные идиомы: big cheese, bring home the bacon|2|6
food-idioms-2|Съедобные идиомы: be full of beans, buy a lemon|2|7
weather-idioms-1|Погодные идиомы: take a rain check, under a cloud|2|4
weather-idioms-2|Погодные идиомы: storm in a teacup, under the weather|2|4
time-expressions|Выражения со словом time|2|12
complaints|Как пожаловаться по-английски|1|9
one-two-word|Одно слово или два?|2|10
present-perfect-cases|Present Perfect: когда, как и зачем?|1|10
future-forms|Способы выражения будущего времени|2|12
finally|Finally, at last, lastly или in the end?|2|8
rumour-gossip|Rumour или gossip?|2|8
switch-turn|Switch или turn?|2|9
body-idioms|ТОП-5 идиом с частями тела|2|5
travel-trip-journey|Travel, trip или journey?|2|9
house-home|House или home?|2|7
phrasal-verbs-home|Топ-10 фразовых глаголов, связанных с домом|2|10
high-tall-big-large|High & tall, big & large и другие пары|1|10
top-10-prepositions|ТОП-10 глаголов и выражений с предлогами|2|16
complex-object-special|Сложное дополнение — особые случаи|2|10
complex-object-inf-ing|Сложное дополнение: инфинитив без to и глагол + ing|2|10
complex-object-to|Сложное дополнение: инфинитив с частицей to|2|10
relative-pronouns|Относительные местоимения: Who, Which, That, Whose|1|10
pronouns-define-2|Определительные местоимения: Each, Every, Other, Another|2|10
pronouns-define-1|Определительные местоимения: all, both, either|2|10
film-phrases|ТОП-10 английских фраз из фильмов|2|10
english-fear|Страх по-английски|1|9
7-idioms|ТОП-7 интересных английских идиом|2|10
zero-first-conditional|Нулевой и первый тип условных предложений|2|10
second-third-conditional|Второй и третий тип условных предложений|2|10
confused-words|Слова, которые путают: advice - advise, farther - further|2|10
taxi-english|Как использовать английский в такси?|1|20
future-not-so-simple|Будущее простое время — или не такое уж простое?|1|10
speech-verbs|Глаголы говорения|1|10
its-cold|О холодах по-английски|1|6
car-bodies-1|О машинах по-английски. Часть 1|1|7
car-bodies-2|О машинах по-английски. Часть 2|2|8
homographes-1|Омографы: Tear, Bow, Wind, Lead, Row|1|9
mood-1|Настроение на английском. Часть 1|2|9
mood-2|Настроение на английском. Часть 2|2|10
homonyms|Омонимы в английском|1|15
jail-prison|Jail или prison?|1|6
issue-problem-trouble|Issue, problem или trouble?|2|6
dinner-english-1|Английский в заведениях. Часть 1|1|10
dinner-english-2|Английский в заведениях. Часть 2|1|9
dinner-english-3|Английский в заведениях. Часть 3|1|11
dinner-english-4|Английский в заведениях. Часть 4|1|12
dinner-english-5|Английский в заведениях. Часть 5|1|10
homophones-1|Омофоны в английском. Часть 1|1|14
homophones-2|Омофоны в английском. Часть 2|1|14
have-auxiliary|Have как вспомогательный глагол|2|8
look-phrasal|Фразовые глаголы с Look|2|8
dont-know-1|Я не знаю. Часть 1|1|5
dont-know-2|Я не знаю. Часть 2|1|4
from-memory-by-heart|From memory или by heart?|1|6
colour-idioms-1|Идиомы с цветами. Часть 1|2|5
colour-idioms-2|Идиомы с цветами. Часть 2|2|5
allow-let-permit|Allow, let, permit|2|10
goodbyes2|Прощания в английском. Часть 2|1|5
conditional-second|Условные предложения второго типа|1|10
zero-nil-naught|Ноль по-английски|2|10
bored-boring|Bored или boring?|2|12
polite-phrases-1|«Пожалуйста» по-английски|1|10
polite-phrases-2|«Спасибо» по-английски|1|5
active-and-passive-participles|Причастие в активном и пассивном залоге|2|9
bre-ame-grammar-1|Британская и американская грамматика. Часть 1|2|10
bre-ame-grammar-2|Британская и американская грамматика. Часть 2|1|8
composite-prepositions|Производные предлоги|2|10
word-formation|Словообразование|2|10
study-learn-teach|Study, learn и teach|2|10
another-other-others|Another, other и others|2|10
tell-say-speak-talk|Tell, say, speak и talk|2|10
funny-replies|Остроумные ответы на «How are you doing?»|2|10
negative-words|Отрицательные местоимения|1|10
complex-object|Сложное дополнение с глаголами восприятия|2|15
perfect-adverbs|Наречия во временах группы Perfect|1|12
verbs-and-prepositions|Глагол + предлог|2|10
gonna-wanna|Сокращения в разговорной речи: gonna, wanna|2|10
zero-article|Нулевой артикль|1|10
be-about-to-or-going-to|Be about to или be going to?|2|10
each-or-every-2|Each или every?|2|10
keep-idioms|Идиомы с глаголом keep|2|10
auxiliary-verbs-contractions|Сокращения вспомогательных глаголов|1|12
have-something-done|Have something done|2|10
infinitive-as-attribute|Инфинитив как определение|2|10
polite-requests|Вежливые просьбы|1|10
cant-help-doing|Can't help doing / can't help but do|2|10
tag-questions|Разделительные вопросы (Tag questions)|2|11
primary-interjections|Междометия|2|12
future-continuous-doston|Future Continuous|2|10
cool-synonyms|Синонимы слова «cool»|2|10
place-of-adverbs|Позиция наречия в предложении|2|15
loose-or-lose|Loose или lose?|2|10
affect-or-effect|Affect или effect?|2|10
all-tenses-doston|Как выучить все времена в английском?|2|11
gerund-doston|Gerund (герундий)|2|15
active-or-passive-voice|Как не перепутать Active и Passive Voice?|2|10
passive-voice-doston|Passive Voice|2|14
idioms-sports|Идиоматические выражения. Спорт|2|15
idioms-sounds|Идиоматические выражения. Звуки|2|10
the-dentist|The dentist|1|14
used-to-forms|Used to, be used to или get used to?|2|15
have-or-have-got|Have или have got?|1|17
technology-words|Полезные слова и выражения. Технологии|1|15
master-of-modals|Английский с Шерлоком. Master of modals|2|15
used-to-vs-past-simple|Конструкция USED TO и PAST SIMPLE|1|15
modal-verb-have-to|Модальная конструкция HAVE (GOT) TO|1|15
modal-verb-ought-to|Модальный глагол OUGHT TO|2|15
could-or-should|Could или Should — какой модальный глагол выбрать?|2|15
modal-verb-dare|Модальный глагол DARE|2|15
modal-verb-will-would|Модальный глагол WILL (WOULD)|2|15
modal-verb-could|Модальный глагол COULD|2|15
pronunciation-2-2|Произношение: Two/Too/To, Night/Knight, All/Owl|1|12
pronunciation-1|Произношение: Are/Our/Hour, I/Eye/Aye, Eyes/Ice|1|14
about-weather|Произношение. О погоде|1|20
present-perfect-continuous-or-present-perfect|Present Perfect Continuous или Present Perfect?|2|15
side-sight|Произношение: Site/Sight/Side, Son/Sun, Sleep/Slip|1|12
rainbow|Произношение: цвета радуги|1|9
bee|Произношение: BE/BEE, BEEN/BEAN/BIN|1|12
hathadhead|Произношение: Hat/Had/Head|1|12
weekweak|Произношение: Week/Weak, Word/World, Walk/Work|1|12
advice|Произношение: Advice/Advise, Allowed/Aloud, Ant/Aunt|1|12
adjectives_ending_en|Прилагательные-исключения на -en|2|13
adjectives-suffix|Образование прилагательных с помощью суффиксов|2|12
pronunciation-4|Произношение: Accept/Except, Excess/Access, Affect/Effect|2|13
pronunciation-2|Произношение: Plane/Plain, Sea/See, Paw/Pore/Poor|1|12
pronunciation-5|Произношение: This/These, Than/Then|1|15
many_much_a_lot_of_lots_of|Many или Much, A lot of или Lots of|2|15
look_watch_see|Look, Watch или See|2|15
little_few_a_little_a_few|Little или few, A little или A few|2|15
i_me-2|I или Me|2|13
either_or_neither_nor|Either...or или Neither...nor|2|15
either_as_well_too|Either или As well / too|2|15
do_not_have_to_must_not|Do not have to или Must not|2|15
by_until|By или Until|2|15
above_over_below_under|Above или Over, Below или Under|2|15
tell_say_speak_talk|Tell, Say, Speak или Talk?|2|15
some_any_no|Some, Any или No?|2|15
its_its|It's или Its?|2|15
in_time_on_time|In time или On time?|2|15
hard_hardly|Hard или Hardly?|2|15
besides_except|Besides или Except?|2|15
future_simple_future_continuous|Популярные ошибки: Future Simple и Future Continuous|2|20
so_such|So или Such?|2|29
articles_concrete_abstract_nouns|Артикль a/an с абстрактными и конкретными существительными|2|15
lesson-not-only|Not Only (отрицательная инверсия)|2|9
voices_active_passive|Залоги: активный и пассивный|2|15
perfect_continuous_present|Present Perfect Continuous|2|15
countable_uncountable|Исчисляемые и неисчисляемые существительные|1|18
perfect_future|Future Perfect|2|15
perfect_past|Past Perfect|2|15
continuous_future|Future Continuous|2|15
simple_future|Future Simple и be going to|2|15
phrasal_1|Фразовые глаголы. Часть 1|2|15
phrasal_2|Фразовые глаголы. Часть 2|2|15
phrasal_3|Фразовые глаголы. Часть 3|2|15
phrasal_4|Фразовые глаголы. Часть 4|2|15
phrasal_5|Фразовые глаголы. Часть 5|2|15
phrasal_6|Фразовые глаголы. Часть 6|2|15
phrasal_7|Фразовые глаголы. Часть 7|2|15
should|Модальный глагол Should|2|15
verbs_types|Типы глаголов|2|15
verbs_mixed|Смешанные глаголы|2|15
interjections|Междометия (Interjections)|1|15
adverbs_degrees_of_comparison|Степени сравнения наречий|2|15
adverbs_place_in_sentence|Наречия и их место в предложении|2|15
adverbs_types|Наречие в английском языке|2|15
adjectives_degrees_comparison|Степени сравнения прилагательных|1|15
adjectives_intro|Прилагательные: порядок перед существительными|1|15
numerals_usage_secrets|Числительные — использование и секреты|2|15
past-simple-continuous|Я спал, когда постучали… (Past Simple — Past Continuous)|1|16
tense|Ах, эти времена… (Tenses)|2|12
take-took-taken|Пристрастился к картам? (Take)|2|19
future-simple-tense|Мы останемся на курорте (Future Simple)|2|18
run|Он влез в долги (Run)|2|7
put|Уничтожить коррупцию! (Put)|2|8
mak|Чувствуйте себя как дома (Make)|2|8
loo|Разве ты не видишь? (Look)|2|10
keep|Он не курит и не пьёт (Keep)|2|11
get|Почему кошки не ладят с собаками? (Get)|2|12
prepositions|Употребление предлогов|2|15
preposition|Вор проник в дом через окно… Предлоги|2|10
may-might|Что здесь происходит? (May, Might)|2|10
need|Мне нужна помощь… (Need)|1|10
must|Должно быть… (Must)|1|15
infinitive|Вы будете выступать первым… Инфинитив|1|15
passive-voice|Ваше письмо отправлено… (Passive Voice)|2|15
future-perfect-1|Я уже уйду… (Future Perfect)|2|10
past|Такое разное прошлое (Past Simple и Past Continuous)|2|20
present-perfect|Past Simple или Present Perfect?|2|20
questions|Вопросительные предложения|2|12
adverbs-how-to-use|Как правильно употреблять наречия|2|15
twice_as_as|В два раза… (twice as… as)|2|10
as_as|Так же… как (as… as)|1|9
good|Сравнительная и превосходная степени (-er, -est)|2|10
myself|Не ходи сегодня в школу (возвратные местоимения -self)|2|10
much|Слишком много соли (much, many, little, a few)|1|15
few_littl|Много, мало, несколько (few, a few, little, a little)|1|15`,

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
  .map(([slug, title]) => ({ type: "grammar", path: "/exercise/" + slug, title, min: 10, level: "A2–B1" }));
// уровень рубрики видеопазлов
const PZ_VIDEO_LEVEL = { "Starting Out": "A2", "Диалоги": "A2", "Английский с Гэбби": "A2", "Простой английский": "A2–B1", "New Headway": "A2–B1" };
const PZ_VIDEOS = pzLines(PZ_DATA.video).map(([slug, title, cat, ph]) => ({
  type: "video", path: "/video/" + slug, title, cat, min: +ph > 60 ? 10 : +ph > 30 ? 7 : 4, level: PZ_VIDEO_LEVEL[cat] || "B1",
}));
const PZ_DIALOGS = pzLines(PZ_DATA.dialogs).map(([slug, en, ru]) => ({ type: "dialog", path: "/dialogs/" + slug, title: `${en} — ${ru}`, min: 5, level: "A2" }));
const PZ_PODCASTS = pzLines(PZ_DATA.podcasts).map(([slug, title]) => ({ type: "podcast", path: "/podcast/" + slug, title: "Английский за шесть минут: " + title, min: 10, level: "B1" }));
const PZ_BOOK_ITEM = { type: "book", path: "/books/" + PZ_DATA.book.slug, title: `${PZ_DATA.book.title} — следующая глава`, min: 15, level: "A2–B1" };
const PZ_WORDS_ITEM = { type: "words", path: "/words", title: "Тренировка слов из «Моего словаря»", min: 5, level: "" };
const PZ_TYPE = {
  grammar: { label: "Грамматика", icon: "school" },
  lesson: { label: "Урок из каталога", icon: "school" },
  video: { label: "Видеопазл", icon: "target" },
  dialog: { label: "Диалог", icon: "messages" },
  podcast: { label: "Подкаст", icon: "volume" },
  book: { label: "Книга", icon: "book" },
  words: { label: "Слова", icon: "books" },
};
// уроки из каталога: грамматика или слова и выражения; сначала сложность 1, потом 2
const PZ_GRAMMAR_RE = /present|past|future|perfect|continuous|passive|залог|услов|conditional|модальн|modal|should|must|might|could|need|dare|ought|инфинитив|infinitive|герунд|gerund|артикл|причаст|придаточн|местоимен|pronoun|наречи|adverb|прилагательн|adjective|сравнен|предлог|preposition|вопрос|question|used to|have|would|wish|сложное дополнение|tag|глагол|tense|времен|инверси|отрицан|числительн|существительн|either|neither|so или such|as\.\.\. as|as … as|some, any|many|much|few|little/i;
const PZ_GRAMMAR_PATHS = new Set(PZ_GRAMMAR.map((x) => x.path));
const PZ_CATALOG = pzLines(PZ_DATA.catalog)
  .map(([slug, title, lvl, ph], i) => ({
    type: "lesson", kind: PZ_GRAMMAR_RE.test(title) && !/^Произношение|идиом|выражени/i.test(title) ? "grammar" : "words",
    path: "/exercise/" + slug, title, min: +ph > 18 ? 12 : 10, level: lvl === "1" ? "A2–B1" : "B1", order: +lvl * 1000 + i,
  }))
  .filter((x) => !PZ_GRAMMAR_PATHS.has(x.path))
  .sort((a, b) => a.order - b.order);
const PZ_ALL = [...PZ_GRAMMAR, ...PZ_CATALOG, ...PZ_VIDEOS, ...PZ_DIALOGS, ...PZ_PODCASTS];
function pzItem(path) {
  const p = String(path).split("#")[0];
  return PZ_ALL.find((x) => x.path === p) || (p === PZ_BOOK_ITEM.path ? PZ_BOOK_ITEM : p === PZ_WORDS_ITEM.path ? PZ_WORDS_ITEM : null);
}
function pzHref(path) { const p = String(path).split("#")[0]; return PZ_URL + p + (/^\/books\//.test(p) ? "/work" : ""); }
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
  {
    id: "pl-1", kicker: "Puzzle English", title: "Урок 1 · Is there что-нибудь в парке?", date: "2026-10-27", by: "Claude", score: "7 заданий на 100%, книга — 16%",
    items: ["/exercise/there-is-are-pro", "/exercise/present_simple_present_continuous", "/video/simpleenglish_going_to_present_continuous", "/dialogs/do-you-know-trevor", "/dialogs/what-are-you-reading", "/podcast/sme090319", "/video/stark4-1"],
    summary: "Грамматика: there is / there are, Present Simple или Present Continuous и как говорить о планах (going to или Present Continuous). Слушали подкаст BBC о бумажных письмах и друзьях по переписке, два диалога (о книге «Сумерки» и о знакомом Треворе) и серию про Джека Старка и секретную миссию.",
    rules: [
      {
        title: "THERE IS — одно, THERE ARE — много",
        text: "Говорим, что что-то где-то есть или существует. Is — перед единственным числом, are — перед множественным. Переводим с места: «В комнате…».",
        ex: [["There are many students in the room.", "В комнате много студентов."], ["There'll be a lot of traffic on the highway tomorrow.", "Завтра на шоссе будет много машин."]],
      },
      {
        title: "Вопрос: IS THERE…? Ответ: Yes, there is",
        text: "В вопросе is/are встаёт вперёд. Краткий ответ — тоже с there: Yes, there is (are) / No, there isn't (aren't).",
        ex: [["What do you see? Is there a problem?", "Что ты видишь? Есть какая-то проблема?"]],
      },
      {
        title: "Present Simple — регулярно, факты, расписание",
        text: "Что делаем обычно, что верно всегда и что идёт по расписанию. He/she/it — с -s: he works, the train leaves.",
        ex: [["I drink coffee every day.", "Я пью кофе каждый день."], ["The train leaves at half past four.", "Поезд отходит в половине пятого."]],
      },
      {
        title: "Present Continuous — то, что идёт сейчас",
        text: "am / is / are + глагол с -ing: действие происходит прямо сейчас, в этот период.",
        ex: [["What are you reading?", "Что ты читаешь?"], ["Are you really reading that book?", "Ты правда читаешь эту книгу?"]],
      },
      {
        title: "Планы: GOING TO — намерение, -ING — договорились",
        text: "Going to — то, что я собираюсь сделать. Present Continuous — то, о чём уже договорились с людьми (встреча, вечеринка). Часто подходят оба.",
        ex: [["We're going to have dinner together.", "Мы собираемся поужинать вместе."], ["He's coming to my party on Friday.", "Он придёт на мою вечеринку в пятницу."]],
      },
      {
        title: "С GO — просто I'm going",
        text: "«I'm going to go» правильно, но звучит тяжело и повторяется. С глаголом go говорим через Present Continuous.",
        ex: [["I'm going on foot.", "Я пойду пешком."], ["I'm going by bus.", "Я поеду на автобусе."]],
      },
    ],
    words: [
      ["put pen to paper", "взяться за перо, написать"], ["come through", "прийти (о письме, посылке)"], ["take the time", "найти время, потрудиться"],
      ["exclusively", "исключительно, только для одного"], ["tactile", "приятный на ощупь"], ["long-standing", "давний, многолетний"],
      ["pen pal", "друг по переписке"], ["snail mail", "обычная почта (шутливо)"], ["link up with", "связаться, найти друг друга"],
      ["keep in touch", "поддерживать связь"], ["die out", "исчезать, отмирать"], ["seldom", "редко"],
      ["job interview", "собеседование"], ["highway", "шоссе"], ["on foot", "пешком"], ["prediction", "предсказание"],
      ["arrangement", "договорённость"], ["intention", "намерение"], ["odd", "странный"], ["leather jacket", "кожаная куртка"],
      ["wallet", "кошелёк"], ["silly", "глупый"], ["observant", "наблюдательный"], ["fasten your seat belt", "пристегнуть ремень"],
      ["heads or tails", "орёл или решка"],
    ],
    phrases: [
      ["How about going to a restaurant for dinner?", "Как насчёт ужина в ресторане?"],
      ["I've already reserved a table for two.", "Я уже заказал столик на двоих."],
      ["Pleased to meet you. — The pleasure is mine.", "Приятно познакомиться. — Взаимно."],
      ["I'd like to know more about this.", "Я хотела бы узнать об этом побольше."],
      ["Could you please get my wallet?", "Можешь, пожалуйста, достать мой кошелёк?"],
      ["I don't really like that kind of book.", "Мне не очень нравятся такие книги."],
      ["I don't like the look of him.", "Мне не нравится, как он выглядит."],
      ["Actually, he's a good laugh.", "Вообще-то с ним весело."],
    ],
    mistakes: [],
    remember: "There IS + одно, there ARE + много · going to — собираюсь, I'm meeting — уже договорились · с go: I'm going home.",
  },
  {
    id: "pv-growup_simple", kicker: "Puzzle English · видео", title: "Grow или grow up?", date: "2026-10-28", by: "Claude",
    items: ["/video/growup_simple"],
    summary: "Видео «Как использовать grow и grow up? (часть 1)»: три значения grow — расти, увеличиваться, постепенно становиться — и чем от него отличается фразовый глагол grow up (только про людей).",
    rules: [
      {
        title: "GROW — расти, становиться больше и выше",
        text: "Про растения, животных, детей. Неправильный глагол: grow — grew — grown.",
        ex: [["Plants grow. They get bigger and taller.", "Растения растут. Они становятся больше и выше."], ["Hey, you've grown since I last saw you.", "О, ты вырос с тех пор, как я тебя в последний раз видела."]],
      },
      {
        title: "GROW — увеличиваться в размере и количестве",
        text: "Растут очередь, население, компании, продажи, прибыль. На сколько выросло — через BY: grow by 50%.",
        ex: [["Our profits have grown by fifty percent this year.", "Наша прибыль выросла на 50% в этом году."], ["The population of a country or city can grow.", "Население страны или города может расти."]],
      },
      {
        title: "GROW + прилагательное = постепенно становиться",
        text: "Как «становиться», но медленно, со временем: grow dark (темнеть), grow bored (заскучать), grow impatient (терять терпение), grow excited (приходить в восторг).",
        ex: [["The sky is growing dark.", "Небо темнеет."]],
      },
      {
        title: "GROW UP — только про людей",
        text: "Вырасти из ребёнка во взрослого, повзрослеть. Растения и цифры — просто grow, никогда не grow up. Частая ошибка: plants grow up ✗ → plants grow ✓.",
        ex: [["I grew up in Brooklyn, but now I live in Philadelphia.", "Я вырос в Бруклине, но теперь живу в Филадельфии."], ["What do you want to be when you grow up?", "Кем ты хочешь стать, когда вырастешь?"]],
      },
      {
        title: "Grow up! — «повзрослей!»",
        text: "Так говорят, когда человек ведёт себя по-детски и нужно, чтобы он вёл себя зрело и ответственно.",
        ex: [["Oh, grow up, Jay!", "Ой, да повзрослей уже, Джей!"]],
      },
      {
        title: "GROWN-UP — «взрослый»",
        text: "Прилагательное: grown-up children — взрослые дети. Существительное a grown-up — то же, что an adult, но по-детски: так говорят с детьми.",
        ex: [["Parents might say they have grown-up children.", "Родители могут сказать, что у них взрослые дети."], ["So, I'm a grown-up.", "Итак, я взрослый."]],
      },
    ],
    words: [
      ["grow — grew — grown", "расти"], ["grow up — grew up — grown up", "вырасти, повзрослеть"], ["puppy", "щенок"],
      ["height", "рост"], ["tall", "высокий"], ["adult", "взрослый"], ["queue", "очередь"], ["population", "население"],
      ["sales", "продажи"], ["profit", "прибыль"], ["increase", "увеличиваться"], ["gradually", "постепенно"],
      ["bored", "скучающий"], ["impatient", "нетерпеливый"], ["excited", "взволнованный, в восторге"], ["human being", "человек"],
      ["develop", "развиваться"], ["mature", "зрелый"], ["responsible", "ответственный"], ["behave", "вести себя"],
      ["grown-up", "взрослый"], ["childish", "детский, ребяческий"],
    ],
    phrases: [
      ["You've grown since I last saw you.", "Ты вырос с тех пор, как я тебя в последний раз видела."],
      ["Do you know how tall you are?", "Ты знаешь, какой у тебя рост?"],
      ["I'm almost five feet tall.", "У меня рост почти пять футов."],
      ["We're doing very well.", "У нас всё идёт отлично."],
      ["I think it's going to rain.", "Думаю, пойдёт дождь."],
      ["What do you want to be when you grow up?", "Кем ты хочешь стать, когда вырастешь?"],
      ["Oh, grow up!", "Ну повзрослей уже!"],
    ],
    mistakes: [],
    remember: "Растения, цифры, очередь — GROW · человек взрослеет — GROW UP · grow + прилагательное = постепенно становиться (grow dark).",
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
function pzLessonTitle(l) { const g = l.items.map(pzItem).find((x) => x && (x.type === "grammar" || x.type === "lesson")); return `Урок ${l.n}${g ? " · " + g.title : ""}`; }
function puzzleNote(id) { return PUZZLE.notes[id] || PUZZLE_NOTES.find((x) => x.id === String(id)) || null; }
function allPuzzleNotes() {
  const ids = new Set([...PUZZLE_NOTES.map((x) => x.id), ...Object.keys(PUZZLE.notes)]);
  return [...ids].map((id) => ({ ...puzzleNote(id), id })).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/* ---------- «Создай урок»: ~25 минут под твой уровень ---------- */
function pzFree(list) { return list.filter((x) => !pzIsDone(x.path) && !pzIsPlanned(x.path) && !(PUZZLE.skipped || {})[x.path]); }
function pzWordsOf(s) { return new Set(String(s).toLowerCase().match(/[a-z]{3,}/g) || []); }
const PZ_BREAK_MIN = 5;
const PZ_TARGET_MIN = 80;
function puzzleBuildLesson() {
  const n = PUZZLE.lessons.length + 1;
  const used = new Set();
  const take = (list, pred) => { const x = pzFree(list).find((v) => !used.has(v.path) && (!pred || pred(v))); if (x) used.add(x.path); return x; };
  const tag = (it) => ({ ...it, path: it.path + "#" + n });
  // блок 1: грамматика + видео по её теме
  const catKind = n % 2 ? "grammar" : "words";
  const g1 = take(PZ_GRAMMAR) || take(PZ_CATALOG, (x) => x.kind === "grammar");
  const g2 = take(PZ_CATALOG, (x) => x.kind === catKind) || take(PZ_CATALOG);
  const gw = new Set([...(g1 ? pzWordsOf(g1.title) : []), ...(g2 ? pzWordsOf(g2.title) : [])]);
  const v1 = take(PZ_VIDEOS, (v) => [...pzWordsOf(v.title)].some((w) => gw.has(w))) || take(PZ_VIDEOS, (v) => v.level.startsWith("A2"));
  // блок 2: слушаем и говорим
  const d1 = take(PZ_DIALOGS), d2 = take(PZ_DIALOGS), pod = take(PZ_PODCASTS);
  // блок 3: читаем и закрепляем — видео уровнем выше, чтобы тянуться к B1
  const v2 = take(PZ_VIDEOS, (v) => v.level === "B1") || take(PZ_VIDEOS);
  const blocks = [
    { t: "Грамматика", items: [g1, g2, v1] },
    { t: "Слушаем и говорим", items: [d1, d2, pod] },
    { t: "Читаем и закрепляем", items: [tag(PZ_BOOK_ITEM), v2, tag(PZ_WORDS_ITEM)] },
  ].map((b) => ({ t: b.t, items: b.items.filter(Boolean).map((x) => x.path) })).filter((b) => b.items.length);
  // если чего-то не хватило (каталог кончился) — добираем грамматикой до ~80 минут
  const mins = () => blocks.reduce((s, b) => s + b.items.reduce((a, q) => a + pzItem(q).min, 0), 0) + PZ_BREAK_MIN * (blocks.length - 1);
  while (mins() < PZ_TARGET_MIN - 8) { const g = take(PZ_CATALOG) || take(PZ_VIDEOS); if (!g) break; blocks[0].items.push(g.path); }
  return { id: "pl-" + n, n, at: todayStr(), blocks, items: blocks.flatMap((b) => b.items), finished: null };
}
function pzLessonBlocks(l) { return l.blocks || [{ t: "", items: l.items }]; }
function pzLessonMinutes(l) {
  const b = pzLessonBlocks(l);
  return b.reduce((s, x) => s + x.items.reduce((a, q) => a + ((pzItem(q) || {}).min || 0), 0), 0) + PZ_BREAK_MIN * (b.length - 1);
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
  const pool = { grammar: PZ_GRAMMAR, lesson: PZ_CATALOG.filter((x) => x.kind === it.kind), video: PZ_VIDEOS, dialog: PZ_DIALOGS, podcast: PZ_PODCASTS }[it.type];
  if (!pool) return;
  PUZZLE.skipped = PUZZLE.skipped || {};
  PUZZLE.skipped[path] = todayStr();
  const next = pzFree(pool)[0];
  if (!next) { delete PUZZLE.skipped[path]; return; }
  l.items = l.items.map((p) => (p === path ? next.path : p));
  if (l.blocks) l.blocks.forEach((b) => { b.items = b.items.map((p) => (p === path ? next.path : p)); });
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
  const lesson = pzCurrentLesson() || [...PUZZLE.lessons].reverse().find((l) => l.finished && !puzzleNote(l.id));
  let note = null;
  if (!lesson && items.some((m) => m.v >= 100)) step("В этом браузере нет урока из приложения — войди в аккаунт: «Архив» → «Войти и синхронизировать» и нажми закладку ещё раз.");
  if (lesson) {
    const mats = items.filter((m) => lesson.items.includes(m.path) && ((m.c && m.c.length) || m.x));
    const left = lesson.items.filter((p) => !pzIsDone(p) && !["words", "book"].includes((pzItem(p) || {}).type));
    if (!left.length && !lesson.finished) lesson.finished = todayStr();
    if (mats.length && !puzzleNote(lesson.id)) {
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
  const canSwap = lesson && !lesson.finished && !done && ["grammar", "lesson", "video", "dialog", "podcast"].includes(it.type);
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
    ["Грамматика (трек Elementary)", `${cnt(PZ_GRAMMAR)} из ${PZ_GRAMMAR.length}`],
    ["Уроки из каталога", `${cnt(PZ_CATALOG)} из ${PZ_CATALOG.length}`],
    ["Видеопазлы", `${cnt(PZ_VIDEOS)} из ${PZ_VIDEOS.length}`],
    ["Диалоги", `${cnt(PZ_DIALOGS)} из ${PZ_DIALOGS.length}`],
    ["Подкасты", `${cnt(PZ_PODCASTS)} из ${PZ_PODCASTS.length}`],
  ];
}
function renderPuzzleLessons() {
  const cur = pzCurrentLesson();
  let html = `<p class="pz-level">${ico("target")} Подобрано под твой уровень: <b>${PZ_LEVEL}</b></p>`;
  if (cur) {
    const total = pzLessonMinutes(cur);
    const left = cur.items.filter((p) => !pzIsDone(p)).length;
    const blocks = pzLessonBlocks(cur);
    html += `<div class="card pz-current">
      <div class="pz-kicker">Урок ${cur.n} · ≈${total} мин</div>
      <h2 class="pz-h">${escapeHtml(pzLessonTitle(cur).replace(/^Урок \d+ · /, ""))}</h2>
      ${blocks.map((b, i) => {
        const bm = b.items.reduce((a, q) => a + ((pzItem(q) || {}).min || 0), 0);
        const bd = b.items.filter(pzIsDone).length;
        return `${i ? `<div class="pz-break">${ico("bolt")} Перерыв ${PZ_BREAK_MIN} минут: встань, выпей воды, не листай ленту</div>` : ""}
        ${b.t ? `<div class="pz-block-head"><span>Блок ${i + 1}. ${b.t}</span><small>${bd}/${b.items.length} · ≈${bm} мин</small></div>` : ""}
        <div class="pz-items">${b.items.map((p) => pzItemRow(p, cur)).join("")}</div>`;
      }).join("")}
      <p class="block-note pz-howto">${ico("bookmark")} Прошла всё? Открой любую страницу puzzle-english.com и нажми закладку «Мой английский» — она отметит пройденное и сделает конспект в Нотатник.</p>
      <div class="cta-alt"><button class="link-btn" onclick="puzzleFinishLesson()">${ico("check")} ${left ? "Закончить урок" : "Урок пройден"}</button></div>
    </div>`;
  } else {
    const preview = puzzleBuildLesson();
    const total = pzLessonMinutes(preview);
    html += `<div class="card pz-current pz-empty">
      <div class="pz-kicker">Следующий · урок ${preview.n}</div>
      <p class="pz-topic">≈${total} мин: ${pzLessonBlocks(preview).map((b) => b.t.toLowerCase()).join(" → ")}, между блоками перерывы по ${PZ_BREAK_MIN} минут</p>
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
