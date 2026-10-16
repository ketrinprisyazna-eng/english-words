---
name: Мой английский
description: A personal English study notebook — warm paper, ink, and one terracotta margin line.
colors:
  paper: "#F3ECDF"
  sheet: "#FBF7EF"
  sheet-2: "#EEE5D5"
  ink: "#221C14"
  ink-2: "#5E5444"
  ink-3: "#766A57"
  rule: "#DCD0BB"
  rule-2: "#C7B89E"
  red: "#B0452A"
  red-ink: "#8E3520"
  red-tint: "#F2DCD2"
  blue: "#2E5283"
  blue-tint: "#DDE5EF"
  moss: "#4B6A35"
  moss-tint: "#E1E9D5"
  amber: "#8C6411"
  amber-tint: "#F2E4C4"
  on-ink: "#FBF7EF"
  chip-on: "#FBF7EF"
  scrim: "rgba(34, 28, 20, 0.45)"
  dark-paper: "#1A1813"
  dark-sheet: "#232019"
  dark-sheet-2: "#2C2820"
  dark-ink: "#EEE7D8"
  dark-ink-2: "#B5AA96"
  dark-ink-3: "#9A8F7B"
  dark-rule: "#3A342A"
  dark-rule-2: "#4C4537"
  dark-red: "#E2805F"
  dark-red-ink: "#F0A487"
  dark-red-tint: "#3E251A"
  dark-blue: "#98B3DC"
  dark-blue-tint: "#1F2A3B"
  dark-moss: "#A8C387"
  dark-moss-tint: "#263121"
  dark-amber: "#DDB461"
  dark-amber-tint: "#362C16"
  dark-on-ink: "#1A1813"
  dark-chip-on: "#433C30"
  dark-scrim: "rgba(0, 0, 0, 0.6)"
typography:
  display:
    fontFamily: "Literata, Georgia, Times New Roman, serif"
    fontSize: "34px"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Literata, Georgia, Times New Roman, serif"
    fontSize: "30px"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  numeral:
    fontFamily: "Literata, Georgia, Times New Roman, serif"
    fontSize: "28px"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: "lining-nums tabular-nums"
  answer:
    fontFamily: "Literata, Georgia, Times New Roman, serif"
    fontSize: "21px"
    fontWeight: 500
    lineHeight: 1.3
  title:
    fontFamily: "Literata, Georgia, Times New Roman, serif"
    fontSize: "19px"
    fontWeight: 650
    letterSpacing: "-0.01em"
  reading:
    fontFamily: "Literata, Georgia, Times New Roman, serif"
    fontSize: "18.5px"
    lineHeight: 1.75
  body:
    fontFamily: "Golos Text, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  button:
    fontFamily: "Golos Text, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 600
  label:
    fontFamily: "Golos Text, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.3
rounded:
  r-sm: "8px"
  control: "10px"
  r: "12px"
  pill: "999px"
spacing:
  gutter: "16px"
  card-pad: "16px"
  section-gap: "30px"
  column: "640px"
  card-column: "460px"
components:
  cta:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.r}"
    padding: "0 18px"
    height: "56px"
    width: "100%"
  reveal-btn:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.r}"
    padding: "0 16px"
    height: "52px"
  reveal-btn-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.r}"
    height: "44px"
  small-btn:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 13px"
    height: "40px"
  small-btn-learn:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.control}"
  small-btn-danger:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.red}"
    rounded: "{rounded.control}"
  icon-btn:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    size: "40px"
  speak-btn:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.control}"
    size: "36px"
  input:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
    height: "46px"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 13px"
    height: "36px"
  filter-chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.pill}"
  seg-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.r-sm}"
    padding: "0 11px"
    height: "36px"
  seg-chip-active:
    backgroundColor: "{colors.chip-on}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r-sm}"
  card:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r}"
    padding: "16px"
  flashcard:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r}"
    padding: "66px 20px 26px"
    height: "250px"
  toc-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "12px 2px"
    height: "54px"
  nav-btn:
    backgroundColor: "transparent"
    textColor: "{colors.ink-3}"
    height: "56px"
  nav-btn-active:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
  verdict-good:
    backgroundColor: "{colors.moss-tint}"
    textColor: "{colors.moss}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
  verdict-bad:
    backgroundColor: "{colors.red-tint}"
    textColor: "{colors.red-ink}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
  hint-note:
    backgroundColor: "{colors.amber-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
---

# Design System: Мой английский

## Overview

**Creative North Star: "Тетрадь — The Kept Exercise Book"**

The app is a personal study notebook, not a game. Warm paper is the ground, near-black ink carries the text, and a single terracotta line plays the part of the red margin rule in a school exercise book. Everything that is not the next review reads like a tidy page: hairline rules, ruled number rows, contents lists with dotted leaders. There is exactly one loud object per screen, the dark ink bar that starts the review.

Density is calm and single-column, tuned for one hand on an Android phone in short daily sessions; the interface speaks Russian, the words being studied are English. Serif type (Literata) is reserved for what is studied and counted: words, headings, numerals, reading text. A humanist sans (Golos Text) runs every control. Depth is almost absent: surfaces are separated by 1px paper-edge lines, and only two objects ever lift off the page, the review index card and the login sheet.

The world explicitly refuses the game-dashboard look it replaced: no grid of equal coloured stat tiles, no emoji buttons, no bright green progress candy.

**Key Characteristics:**
- Warm paper ground, ink text, one terracotta margin-red accent.
- Literata for words, headings and numbers; Golos Text for the interface.
- Hairline rules and ruled rows instead of shadowed cards.
- Contents-page rows with dotted leaders running to a serif count.
- The review card is an index card with a red margin line.
- One drawn icon family (Tabler outline, 1.75 stroke) via an inline SVG sprite.
- One expressive motion: the answer settles into the paper like ink.
- Full light and dark themes from the same token names.

## Colors

A warm, low-chroma paper-and-ink palette with one terracotta accent and three quiet state inks (blue, moss, amber), each paired with a pale tint of itself.

Every colour is a CSS custom property on `:root`. Dark theme redefines the same names (frontmatter keys prefixed `dark-`) under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`. Components never reference a dark value directly; they reference the role name and the theme swaps it.

### Primary
- **Margin Terracotta** (`red`; dark `dark-red`): the single accent. Used for the count of words waiting for review, the active bottom-nav icon and its 2px underline, the active translation-direction underline, the review-session progress bar, the flashcard margin line, text caret, hover colour on contents rows and rule titles, and destructive text. Never a fill for large surfaces.
- **Deep Terracotta** (`red-ink`): text on `red-tint` (the "wrong" verdict strip, wrong particle answer), where plain `red` would be too light on the tint.
- **Terracotta Wash** (`red-tint`): background of the wrong-answer verdict, the listening mic state, selection highlight, pronunciation-miss highlight.

### Secondary
- **Ink Blue** (`blue`; dark `dark-blue`): the "learning" state and the answer. Sets the revealed translation on the flashcard, links, the focus ring and input focus border, learning swatches and box dots, phrasal-verb highlights.
- **Blue Wash** (`blue-tint`): input focus halo (3px), tapped-word and word-translation popup background.

### Tertiary
- **Moss** (`moss`): "mastered" and "right". Progress bar fill, mastered swatch, correct verdict text, correct particle answer, lesson scores. The legacy `--primary` alias points here.
- **Moss Wash** (`moss-tint`): correct verdict strip, mastered rule-word chip, words already in the dictionary, pronunciation-ok highlight.
- **Ochre** (`amber`): "difficult" and source/hint labelling. Difficult swatch, Puzzle English badge, auto-association tag, Duolingo rule titles, association-hint icon.
- **Ochre Wash** (`amber-tint`): association hint box on the flashcard, "why" explanation of a mistake, lesson-rule boxes, unknown-word highlight in the reader.

### Neutral
- **Paper** (`paper`): page ground, bottom nav, session overlay, and the masking background behind contents-row text.
- **Sheet** (`sheet`): raised paper: cards, flashcard, inputs, secondary buttons.
- **Second Sheet** (`sheet-2`): recessed paper: segmented-control track, chips, badges, quoted explanation boxes.
- **Ink** (`ink`): body text and the dark CTA fill. **On Ink** (`on-ink`) is the text on that fill.
- **Faded Ink** (`ink-2`): secondary text, labels, inactive controls. **Pencil** (`ink-3`): placeholders, tertiary meta, inactive nav items.
- **Rule** (`rule`): 1px hairlines between rows and around cards. **Strong Rule** (`rule-2`): control borders, the top rule of the stat row, dotted leaders, swatch/dot rest state.
- **Chip On** (`chip-on`): the active segment in a segmented control (equals `sheet` in light; a lifted brown `dark-chip-on` in dark).
- **Scrim** (`scrim`): modal backdrop.

### Named Rules
**The One Margin Line Rule.** Terracotta is the only accent and it marks, it never fills: a number, an underline, a 1px line, an icon stroke. If a screen shows terracotta as a background larger than a tint strip, it is wrong.

**The State Ink Rule.** Word state always maps the same way: moss = mastered/right, blue = learning/answer, amber = difficult/hint, `rule-2` = new. Each state ink is paired with its own tint for backgrounds; never put a state ink on another state's tint.

## Typography

**Display Font:** Literata (with Georgia, Times New Roman, serif), loaded from Google Fonts with optical sizing 7–72, weights 400–700, italic 400–600.
**Body Font:** Golos Text (with system-ui, -apple-system, Segoe UI, Roboto, sans-serif), weights 400–600.

**Character:** A bookish, optically sized serif for the things being learned and counted, against a plain Cyrillic-friendly grotesque for the machinery. The pairing reads as a printed exercise book with a handwritten-neat interface around it.

### Hierarchy
- **Display** (Literata 650, 34px, 1.15, -0.015em): the word on the flashcard. Wraps anywhere rather than overflowing.
- **Headline** (Literata 650, 30px, 1.1, -0.015em): the home title. View titles use the same setting at 27px; session-done heading 26px; reader title 23px.
- **Numeral** (Literata 650, 28px, 1.1, -0.02em, lining tabular figures): the three numbers in the home stat row.
- **Answer** (Literata italic 500, 21px, 1.3, ink blue): the revealed translation on the flashcard. The phrasal-trainer sentence uses Literata 500 at 21px upright.
- **Title** (Literata 650, 19px, -0.01em): section titles on a page (15.5px inside a card). Block titles 17px, source names 18px, word rows and mistake prompts Literata 600 at 16.5px, rule titles 600 at 16px.
- **Reading** (Literata 400, 18.5px, 1.75, max 65ch): generated reading texts.
- **Body** (Golos 400, 15px, 1.45): the base. Lead and note text 13.5px at 1.5; contents-row labels 15.5px weight 500.
- **Button** (Golos 600, 16px): the CTA; reveal button 15.5px, check button 15px, small buttons 13.5px weight 500.
- **Label** (Golos 400, 12.5px, 1.3): stat labels, breakdowns, counts, meta. Bottom-nav labels 11px, -0.01em. Source badges 10.5px weight 600.

Counts in contents rows and rule rows are set in Literata (14.5–15px, `ink-2`, tabular figures), never in the sans.

### Named Rules
**The Studied-In-Serif Rule.** If it is an English word, a heading, a number or reading text, it is Literata. If you press it or it labels a control, it is Golos Text. The empty state is the one place the serif speaks in italic prose.

**The No Eyebrow Rule.** A heading stands alone; the date or context line goes under it (`.today`), never above it as a small-caps kicker.

## Layout

A single centred column, max 640px wide, with a 16px side gutter plus safe-area insets. There are no width breakpoints: the same column serves phone and desktop. The bottom nav is fixed (64px reserved height, `--nav-h`) and the body pads for it plus the safe-area inset.

Rhythm is driven by ruled rows rather than boxes. Section titles open with 30px above and 8px below; cards pad 16px (14–16px for list cards); contents rows have a 54px minimum height; word rows pad 12px vertically. The home stat row is a three-column grid split by 1px vertical rules, with a strong rule above and a plain rule below, numbers left-aligned in each cell.

The review session is a full-screen paper overlay: a top bar (close, 3px terracotta progress line, tabular count), then the card column centred at max 460px, then answer controls in the same column. Touch targets are at least 36px, primary actions 52–56px tall.

## Elevation & Depth

The system is flat by default and conveys structure with hairlines and tonal paper steps (`paper` → `sheet` raised, `sheet-2` recessed). Shadows exist in only three places.

### Shadow Vocabulary
- **Lift** (`--lift`; light `0 1px 2px rgba(60, 40, 10, 0.08), 0 10px 24px -12px rgba(60, 40, 10, 0.28)`, dark `0 1px 2px rgba(0, 0, 0, 0.4), 0 12px 28px -12px rgba(0, 0, 0, 0.7)`): the review flashcard and the login modal card. Nothing else.
- **Segment nub** (`0 1px 2px rgba(60, 40, 10, 0.12)`): the active option in a segmented control or language toggle.
- **Focus halo** (`0 0 0 3px` `blue-tint`): text inputs on focus, together with a `blue` border.

### Named Rules
**The Hairline-Not-Shadow Rule.** Content cards, list cards, rule bodies and reader panels are separated by a 1px `rule` border on `sheet`, never by a shadow. Lift is reserved for the one object you are holding: the index card in review, or a modal sheet.

## Shapes

Gently rounded paper rectangles. `--r` (12px) is the large radius for cards, the flashcard, the CTA, reveal and check buttons and the typed-answer field. 10px is the control radius for inputs, small and icon buttons, segmented tracks, verdict strips and hint boxes (written as a literal, reused throughout). 8px (`--r-sm` value) for segment options, rule-word and lesson chips. Small badges step down to 7, 6 and 5px; swatches 2px. Filter chips in scrolling rows are full pills (999px); state dots are circles.

Borders are 1px everywhere. Dashed 1px `rule-2` separates the rule hint inside a flashcard; a 1px `rule-2` left border marks example sentences. The flashcard carries a 1px terracotta line across its full width 50px from the top, at 0.55 opacity.

## Components

### Icons
One family: Tabler Icons, outline, drawn from an inline SVG `<symbol>` sprite at the top of `index.html` (`#i-home`, `#i-books`, `#i-ruler-2`, `#i-bulb`, `#i-book`, `#i-school`, `#i-puzzle`, `#i-circle-x`, `#i-volume`, `#i-microphone`, `#i-player-stop`, `#i-check`, `#i-x`, `#i-arrow-left`, `#i-arrow-right`, `#i-chevron-right`, `#i-refresh`, `#i-language`, `#i-sparkles`, `#i-copy`, `#i-pencil`, `#i-book-2`, `#i-list`, `#i-target`, `#i-confetti`, `#i-bolt`, `#i-download`, `#i-upload`, `#i-cloud`, `#i-loader-2`, `#i-trash`). Used as `<svg class="ico"><use href="#i-…"/></svg>`: 1.2em square, no fill, `currentColor` stroke at 1.75, round caps and joins. Contextual sizes: 15–16px inline, 18px in speak/mic buttons, 20–22px in icon buttons, nav and CTA, 48px at stroke 1.5 on the session-done screen. Icons inherit text colour; only the active nav icon and the session-done mark turn terracotta.

### Buttons
- **CTA (ink bar):** full width, 56px tall, `ink` fill, `on-ink` text, 12px radius, 0 18px padding, label left and arrow icon right. Hover nudges the arrow 3px right; press scales to 0.985. One per screen.
- **Reveal / Check:** the same ink fill at 52px for the in-session actions. Ghost reveal: transparent, `ink-2` text, 1px `rule-2` border, 44px.
- **Small button:** `sheet` fill, 1px `rule-2` border, 10px radius, 40px tall, icon + label. Hover darkens the border to `ink-3`; press scales 0.98. Variants: learn (ink fill) and danger (terracotta text only).
- **Icon button / close:** 40px square, `sheet`, 1px `rule`, 10px radius.
- **Speak / mic buttons:** 36px square (34px in word rows, 28px inline), transparent with 1px `rule`, `ink-2` icon. Mic states: listening (terracotta on `red-tint`, pulsing halo), ok (moss on `moss-tint`), bad (terracotta on `red-tint`).
- **Text links:** `link-btn` is ink text with a `rule-2` underline that turns terracotta on hover; used for the 15 / 40 word alternatives under the CTA.

### Chips
- **Direction links:** text-only chips separated by middots; the active one is ink, weight 600, with a 2px terracotta underline offset 5px.
- **Segmented control:** `sheet-2` track (3px padding, 10px radius), options 36px tall at 8px radius; active option `chip-on` with the segment nub shadow.
- **Filter pills:** horizontally scrolling row, 36px pills, 1px `rule-2` border, transparent; active is ink-filled with `on-ink` text.
- **Badges and tags:** small `sheet-2` or tint chips (source badge, rule chip, particle pill, association tag) in 10.5–12.5px sans.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** `sheet` on `paper`; recessed boxes inside cards use `sheet-2`.
- **Shadow Strategy:** none (see Hairline-Not-Shadow).
- **Border:** 1px `rule`.
- **Internal Padding:** 16px (14–18px by context).
- Rule cards collapse into ruled rows: no background, no border except a bottom `rule`, 0 radius; the open rule's body is a bordered `sheet` panel.

### Inputs / Fields
- **Style:** `sheet` fill, 1px `rule-2` border, 10px radius, 46px minimum, 16px text (prevents mobile zoom), terracotta caret, `ink-3` placeholder. The in-session answer field is 52px with the 12px radius, paired with a 52px mic button and the ink check button.
- **Focus:** border turns `blue` with a 3px `blue-tint` halo; no outline.
- **Error:** a 13px terracotta line under the form.

### Navigation
Fixed bottom bar on `paper` with a 1px `rule` top border; six equal items (max 108px), each a 22px icon over an 11px label, `ink-3` at rest. Active item: label `ink` weight 600, icon terracotta, and a 22×2px terracotta bar on the top edge that scales in from the centre.

### Contents Row (signature)
The table-of-contents list used for trainers on Home and for the Rules index. Each row is a full-width button, 54px minimum, ruled by 1px `rule` below (and the list by one above), with an optional 21px `ink-2` icon. The title flows as text; a dotted leader (`rule-2` dots, 6px pitch, drawn as a repeating radial gradient positioned 0.38em above the line's bottom) runs along the title's last line to a serif tabular count floated right. Title and count each sit on a `paper` background with 8px padding so they mask the dots; `box-decoration-break: clone` keeps the mask on every wrapped line. Hover turns the title terracotta. Because the mask is `paper`, contents rows must sit directly on the page ground, not inside a `sheet` card.

### Review Index Card (signature)
The flashcard: `sheet`, 12px radius, Lift shadow, min 250px tall, centred content, padding 66px 20px 26px. A 1px terracotta margin line crosses the card 50px from the top at 0.55 opacity. Above the line: speak button top-left, mic button top-right, the direction badge (12.5px, `ink-2`) centred. Below: the word in Display serif, transcription in 14px `ink-2`, then on reveal the answer in italic ink-blue serif. Optional association hint in an ochre-wash box with a lightbulb icon; optional rule hint under a dashed `rule-2` divider.

### Verdict Strip
Feedback on typed answers is a calm tinted strip, never a red-pen mark: full width, 10px radius, 9px 12px padding, 14px text with a check or x icon. Right: `moss` on `moss-tint`. Wrong: `red-ink` on `red-tint`, with the correct answer in ink bold.

### Mistake Entry
A `card` per recorded Duolingo mistake: 12px `ink-3` meta, the prompt in Literata 600 at 16.5px, then her wrong answer in terracotta with a 1px strike-through and an x icon, and the correct answer in moss weight 600 with a check icon and an inline 28px speak button. The "why" opens as an ochre-wash box; the linked rule as a `sheet-2` box.

### Ledger (stat row)
The home stat row: three ruled cells, Numeral serif figures over 12.5px labels; the "waiting for review" figure is terracotta, the others ink. Below it, an inline breakdown with 8px square swatches in the state inks and a 4px progress bar (moss for mastered, blue for learning, on `rule`).

### Motion
One expressive motion, **ink-settle**: when the answer appears on the flashcard it fades from 0.25 opacity, 3px blur and 2px down to sharp over 0.6s on `--ease` (`cubic-bezier(0.16, 1, 0.3, 1)`), like ink soaking into paper. The text is legible from the first frame. Everything else is feedback only: press scales (0.94–0.985, 0.15s), the CTA arrow nudge, the nav underline scaling in (0.25s), progress width (0.5s), the mic listening pulse (1.2s loop while recording) and the loader spin. `prefers-reduced-motion: reduce` collapses all animation and transition durations to near zero.

## Do's and Don'ts

### Do:
- **Do** keep terracotta (`red`) to marks: numbers, underlines, 1px lines, icon strokes, caret.
- **Do** set English words, headings, numerals and reading text in Literata; set every control in Golos Text.
- **Do** separate content with 1px `rule` hairlines on `sheet`, and reserve the Lift shadow for the review card and modal sheets.
- **Do** present lists of destinations as contents rows with a dotted leader to a serif count, placed on the `paper` ground.
- **Do** keep one ink-bar CTA per screen and put alternatives beneath it as quiet text links.
- **Do** draw every icon from the Tabler outline sprite at stroke 1.75 with `currentColor`.
- **Do** define every new colour as a role token with both light and dark values, and reference only the role name in components.
- **Do** keep answer feedback to tinted verdict strips: moss on `moss-tint` for right, `red-ink` on `red-tint` for wrong.

### Don't:
- **Don't** build a dashboard of equal coloured stat tiles; numbers live in the ruled ledger row.
- **Don't** use emoji as icons or buttons, or mix in a second icon family.
- **Don't** imitate a teacher's red pen (scrawled marks, ticks, crossings-out over her typed answer) in the review session; the verdict strip is the only wrong-answer treatment there. (The Mistakes log's 1px terracotta strike-through on the recorded wrong sentence is a record, not a verdict, and stays.)
- **Don't** put a small label or kicker above a heading; context goes underneath.
- **Don't** add shadows to content cards, list cards or rows.
- **Don't** add decorative motion beyond ink-settle; new animations must answer a user action or show a live state.
- **Don't** place contents rows inside a `sheet` card: their `paper` mask will show as patches.
