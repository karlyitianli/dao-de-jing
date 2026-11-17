# Dao De Jing

A minimalist reading app: simplified Chinese with pinyin, and English. One chapter at a time, with previous and next, a chapter grid, dark and light mode, and a font switcher.

Live site: https://karls.design/dao-de-jing/

## What is in this first version

- `index.html`, `styles.css`, `app.js`: the reader, no build step
- `data/index.json`: all 81 chapter numbers
- `data/chapters/001.json` to `data/chapters/081.json`: one file per chapter, each with number, chinese lines, pinyin lines, and english paragraphs. The app fetches only the chapter being read, and preloads the next one.
- Dark and light mode, saved in the browser, with the system setting as the default
- Font switcher, default Inter. Fonts in the switcher: Inter, EB Garamond, Marcellus, Newsreader, IBM Plex Mono. They are in the `FONTS` array in `app.js`, each with an id, label, CSS family, Google Fonts URL, and letter spacing. Inter uses letter spacing -0.02em, which is -2 percent. The other fonts use 0.
- Toggles to show or hide Chinese, pinyin, and English, saved in the browser

## Text sources

- Chinese: Wang Bi received edition, converted to simplified Chinese. The text for all 81 chapters was taken from the Chinese original on laozi-taoteching.org, converted from traditional to simplified with OpenCC, and split into lines at 。 and ；. Its modern English translation on that site was not used. Chapters 1 to 3 changed slightly from the first version to match this single consistent source, for example chapter 2 now reads 长短相较 and 万物作焉而不辞.
- Pinyin: generated per character with pypinyin, tone marks, one line per Chinese line.
- English in this version: J.H. McDonald, 1996, a translation for the public domain. Taken from the PDF Karl linked: https://faculty.mnsu.edu/scottgr/wp-content/uploads/sites/34/2014/08/TaoTeChing.pdf . Its title page says "Tao Te Ching - Written by Lao-Tzu / A Translation for the PUBLIC DOMAIN / by j.h.mcdonald, 1996". McDonald numbers the chapters only, with no chapter titles, so the Legge titles used in the first version were removed. The PDF repeats chapters 21 and 22, page 7 first 6 blocks are exact duplicates of page 6 last 6 blocks, and those duplicates were skipped during extraction. Cross-checked against a plain-text mirror of the same translation for chapters 1, 40, and 81.
- Total Chinese text: 5,296 characters across 81 chapters.

## Stephen Mitchell note, please read before publishing that translation

Stephen Mitchell, Tao Te Ching, 1988, HarperCollins: translation copyright 1988 by Stephen Mitchell, all rights reserved. The book says no part may be used or reproduced in any manner without written permission, except brief quotations in critical articles and reviews.

So the Mitchell text is not included in this public repo. The public site uses McDonald.

## Local-only Mitchell version

Karl chose the local-only option on Nov 16, 2026. That works like this:

1. Copy `data/mitchell.example.json` to `data/mitchell.json` on your own device.
2. Fill in the `english` array for each chapter, one paragraph per string, from your own copy.
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
