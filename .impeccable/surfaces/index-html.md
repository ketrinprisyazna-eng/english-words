---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["style.css"]
---

## Scope

Whole app shell (index.html + style.css): Home, review session overlay, Words, Rules, Associations, Texts/reader, Lessons + Mistakes, Phrasal trainer, login modal. Mode: Operate. Build path: code-led.

## Audience and task

The owner alone, Android Chrome, daily 5–15 minute sessions. Task: start the due review in one tap, answer typed cards, glance at progress; occasionally read a rule, a mistake, or a generated text.

## Constraints

Keep every id, class hook and global function app.js uses; data and sync files untouched; vanilla HTML/CSS/JS; cache-bust ?v= on changed assets. Emoji replaced by one drawn icon set (approved). Feedback on answers stays calm: tinted verdict strip, no red-pen imitation (user declined).

## Direction contract

THESIS: A personal study notebook, not a game. Refuses the Duolingo-green dashboard of equal stat tiles and emoji buttons; one clear next action, the rest reads like a well-kept exercise book.

OWN-WORLD: Warm paper ground with ink-dark text, terracotta as the single margin-red accent, a muted ink-blue for "learning" state. Literata (serif) sets words, headings and numerals; Golos Text runs the UI. Hairline rules instead of shadowed cards; 1px paper-edge borders, radii 10–14px. Line icons (Tabler, 1.75 stroke).

STORY: She opens it, sees today's date and how many words wait, taps the dark "Повторить 25 слов" bar, works through index cards, and leaves knowing what is due tomorrow.

FIRST VIEWPORT: Serif title with the date line under it (no eyebrow above the heading), a three-column ruled stat row (ждут повтора in terracotta, сегодня, пройдено), a full-width ink bar CTA with 15/40 and translation direction as quiet text links below (active one underlined in terracotta), then the "Тренажёры" contents list. Bottom nav: six line icons, terracotta active.

FORM: Pinned by user (direction A "Тетрадь", chosen from three shown). Signature move: the contents-page list — trainers and rules set as table-of-contents rows with dotted leaders running to a serif count; the review card is an index card with a margin line.

seed:4b2e7a9313575af7 (operate roll recorded after the fact; the user's pinned pick of direction A stands)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
