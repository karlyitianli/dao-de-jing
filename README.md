# Dao De Jing

A minimalist reading app: simplified Chinese with pinyin, and English. One chapter at a time, with previous and next, a chapter grid, dark and light mode, and a font switcher.

Live site: https://karls.design/dao-de-jing/

## What is in this first version

- `index.html`, `styles.css`, `app.js`: the reader, no build step
- `data/index.json`: all 81 chapter numbers
- `data/chapters/001.json` to `data/chapters/081.json`: one file per chapter, each with number, chinese lines, pinyin lines, and english paragraphs. The app fetches only the chapter being read, and preloads the next one.
- Dark and light mode, saved in the browser, with the system setting as the default
- Font switcher, default Inter. Fonts in the switcher: Inter, EB Garamond, Marcellus, Newsreader, IBM Plex Mono. They are in the `FONTS` array in `app.js`, each with an id, label, CSS family, Google Fonts URL, and letter spacing. Inter uses letter spacing -0.02em, which is -2 percent. The other fonts use 0. The font selector sits in the same row as the language checkboxes, flush right.
- Toggles to show or hide English, Chinese, and pinyin, in that order, saved in the browser. Pinyin renders above each Chinese character as an inline-block syllable unit. The Pinyin toggle controls whether the units carry annotations. Pairing is positional, one pinyin token per character, with a few lines carrying extra punctuation tokens that the pairing code handles.
- Language cards: English and Chinese each sit in their own rounded card, at every breakpoint, and no text wraps, each card sizes to its longest line. The two cards sit side by side in a row; when they are wider than the row it scrolls horizontally, with soft gradient fades on the left and right hinting at the cards on either side, and tapping a partly visible card scrolls it into view. With only one language toggled on, its card stretches to fill the row and the gradients hide.
- Pinyin: each Chinese character carries its pinyin above it as an inline-block syllable unit, a small muted sans annotation over the character, the unit as wide as the wider of the two so neighbouring syllables can never touch. This replaced the HTML `<ruby>` rendering, which failed twice in the live browser with long syllables running together. Pairing is positional, one pinyin token per character, with a few lines carrying extra punctuation tokens that the pairing code handles.
- Chapter picker: the "Chapter X of 81" text in the pager is a button with a caret-down icon. Clicking it opens a modal on desktop and a bottom drawer that slides up on mobile, both showing the same 81-chapter grid to jump to a chapter. It closes from the close button, the backdrop, or Escape, and returns focus to the progress button. Chapter hotkeys wait while it is open.
- Theme toggle: Phosphor sun and moon icons, inlined as SVGs like the bowl icon. The button shows the mode it switches to, a moon in light mode and a sun in dark mode.

## Text sources

- Chinese: Wang Bi received edition, converted to simplified Chinese. The text for all 81 chapters was taken from the Chinese original on laozi-taoteching.org, converted from traditional to simplified with OpenCC, and split into lines at 。 and ；. Its modern English translation on that site was not used. Chapters 1 to 3 changed slightly from the first version to match this single consistent source, for example chapter 2 now reads 长短相较 and 万物作焉而不辞.
- Pinyin: generated per character with pypinyin, tone marks, one line per Chinese line, rendered above the characters as inline-block syllable units.
- English in this version: J.H. McDonald, 1996, a translation for the public domain. Taken from the PDF Karl linked: https://faculty.mnsu.edu/scottgr/wp-content/uploads/sites/34/2014/08/TaoTeChing.pdf . Its title page says "Tao Te Ching - Written by Lao-Tzu / A Translation for the PUBLIC DOMAIN / by j.h.mcdonald, 1996". McDonald numbers the chapters only, with no chapter titles, so the Legge titles used in the first version were removed. The PDF repeats chapters 21 and 22, page 7 first 6 blocks are exact duplicates of page 6 last 6 blocks, and those duplicates were skipped during extraction. Cross-checked against a plain-text mirror of the same translation for chapters 1, 40, and 81.
- English line breaks: each English paragraph in `data/chapters/` carries the line breaks from the GitHub PDF Karl linked, https://github.com/mozoku24/Dao-De-Jing/blob/main/Tao%20Te%20Ching%20-%20trans.%20by%20J.H..%20McDonald.pdf , as "\n" inside the paragraph string, and `app.js` renders each one as a `<br>`. The words are the MNSU PDF's text, not the GitHub PDF's retyping, which has small typos like "loosing", "it's own trouble", and "an frozen stream". Paragraph breaks are the MNSU PDF's, because the GitHub PDF splits some paragraphs at page boundaries, for example chapter 20 "Ordinary people are bright;" alone at the bottom of a page.
- Singing bowl sound: `assets/singing-bowl.mp3`, 7.5 seconds, 119KB, mono. Trimmed with ffmpeg from a 43.44 second Pixabay clip (the second clip Karl sent, a long slow decay), cut at 7.5 seconds, 1 second fade-out from 6.5 seconds, level set so the peak is -2.5 dB with no clipping. Checked for artifacts the same way as the first clip and found none in the first 7.5 seconds, so no repairs were needed. It replaces the first clip, which had a low thump at about 1.4 seconds and a scratch at about 4.7 seconds; a repaired version of that first clip was made but never published. Pixabay's Content License allows free use without attribution and allows modifying the content; the clip is used inside this app, not sold or distributed on its own. The button in the header uses the Phosphor `bowl-steam` icon, inlined as a single SVG so the page does not load the whole Phosphor library.
- Page flip sound: `assets/page-flip.mp3`, 0.55 seconds, 9.8KB, mono, preloaded so it plays instantly. Trimmed with ffmpeg from a 0.84 second Pixabay clip, cut the first 0.05 seconds of silence and the quiet tail after 0.6 seconds, 0.1 second fade-out, level raised so the peak is -6.6 dB with no clipping. It plays on every user-initiated chapter change, Previous and Next buttons, arrow keys, R, and the chapter grid, and only when the chapter actually changes, never on first load. Fast repeated presses restart it from the start.
- Sound levels: both the bowl and the page flip play at half volume, set in app.js with `volume = 0.5` on each audio element. The MP3 files are unchanged.
- Favicon: `assets/favicon.svg`, a yin-yang symbol supplied by Karl, linked only in this app's `index.html`, so the main karls.design site is unaffected.
- Total Chinese text: 5,296 characters across 81 chapters.

## Stephen Mitchell note, please read before publishing that translation

Stephen Mitchell, Tao Te Ching, 1988, HarperCollins: translation copyright 1988 by Stephen Mitchell, all rights reserved. The book says no part may be used or reproduced in any manner without written permission, except brief quotations in critical articles and reviews.

So the Mitchell text is not included in this public repo. The public site uses McDonald.

## Local-only Mitchell version

Karl chose the local-only option on Nov 16, 2026. That works like this:

1. Copy `data/mitchell.example.json` to `data/mitchell.json` on your own device.
2. Fill in the `english` array for each chapter, one paragraph per string, from your own copy. A paragraph can contain "\n" line breaks, as the McDonald paragraphs do, and the app will render each one as a line break.
3. Serve the folder locally, or run it on a device where that file exists. `app.js` will try to load `data/mitchell.json` first, and if it is there it replaces the McDonald English for matching chapters and updates the footer note to say Mitchell, local only.
4. Do not commit `data/mitchell.json`. It is listed in `.gitignore`, so it can never be pushed to GitHub by accident. Check with `git status` before any commit, and the file should not appear there.

Do not put Mitchell text in `data/chapters.json`, in a pull request, or in any other file in this repo. Publishing it would need written permission from HarperCollins or Mitchell.

## Run it locally

Do not open `index.html` directly from Finder. The app loads its chapters with fetch(), which does not work from a file address, so the page would load blank.

Instead, in Terminal, from this folder, run:

```
./serve.sh
```

Then open http://localhost:8000 in a browser. Stop the server with Ctrl+C.

That is also how to view the local Mitchell version: if `data/mitchell.json` exists in that folder, the local server will serve it and the app will use it. The public site at karls.design will still show McDonald, because that file is never pushed.

## GitHub Pages

Settings, Pages, Deploy from a branch, branch `main`, folder `/ (root)`, Save. The site then serves from the repo root.
