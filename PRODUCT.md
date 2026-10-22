# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person: the owner, a Russian speaker learning English at roughly A2–B1. Uses it daily in short sessions (5–15 minutes), mostly on an Android phone in Chrome. Not shared with other learners.

## Product Purpose

A personal review companion for the English she is actually studying in Duolingo and Puzzle English. It turns those lessons into spaced-repetition review, short memory-hook grammar rules, mnemonics, a translate-the-reply dialogue with an AI partner limited to her own vocabulary, and a worked review of her own Duolingo and dialogue mistakes. Success is a daily habit that sticks: open, review the words that are due, close.

## Positioning

Built from her own material, not a generic course: every word, rule, mistake and lesson note comes from lessons she has completed, and new words automatically appear in the matching rules and texts.

## Operating Context

- Daily ritual on the phone: one tap on Home starts today's spaced review of what she studied on earlier days; the grade goes to the Diary.
- New Duolingo/Puzzle English material arrives two ways: a bookmarklet run on duolingo.com / puzzle-english.com (import.js: new words, mistakes and key phrases are stored in the browser, translated and explained with her Gemini key, and become a study day), or a manual sync by Claude into the data files.
- Pronunciation check uses the browser microphone (Chrome only); the dialogue partner and its answer checks use her own Google Gemini key stored in the browser.
- Progress syncs between phone and computer through Firebase, sharing the account with a sibling Spanish-words app.

## Capabilities and Constraints

- Static site: plain HTML, CSS and JavaScript, no build step or framework. Scripts are cache-busted with `?v=` query strings.
- Interface language is Russian; studied language is English (EN → RU, RU → EN, mixed).
- Screens (bottom nav: Повторение · Диалог · Дневник · Архив): Home shows only today's review — study-day groups due by the 1/3/7/14/30/60/120/240-day schedule (new Duolingo/Puzzle material, that day's mistakes, plus a daily 15-word portion of the old dictionary); a review runs words → trainers (phrasal verbs, key phrases) → rules (her own mistakes and rule words) and ends with a 5/4/3/2 grade. Diary lists every grade with week/month averages. Archive holds everything else: Words, Rules (learned ones struck out), Mistakes, lesson notes, key phrases, phrasal verbs, associations, the review schedule, free word practice, sync and backup. Dialogue: AI partner limited to her vocabulary.
- Review uses typed answers with a "Check" step, a five-box spaced-repetition schedule (0, 1, 3, 7, 14, 30 days), and an optional association hint.
- Data files (words.js, rules.js, phrasal.js, mistakes.js, assoc.js, duo.js) and sync (sync.js, firebase-config.js) are content/infrastructure, not design surface.

## Evidence on Hand

Real vocabulary, rules, lesson notes and mistakes live in the data files listed above. There are no users other than the owner, no testimonials, and no public marketing surface.

## Product Principles

1. The daily review is the product; everything else supports it and must not compete with it.
2. Her own material over generic content: show where a word, rule or mistake came from.
3. Explain "why", briefly: rules and mistakes are short hooks, not textbook pages.
4. Low friction on a phone: one hand, short sessions, nothing to configure before starting.
