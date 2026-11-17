# Dao De Jing

A minimalist reading app: simplified Chinese with pinyin, and English. One chapter at a time, with previous and next, a chapter grid, dark and light mode, and a font switcher.

Live site, once Pages is on: https://karlyitianli.github.io/dao-de-jing/

## What is in this first version

- `index.html`, `styles.css`, `app.js`: the reader, no build step
- `data/chapters.json`: chapters 1 to 3, in the format for all 81
- Dark and light mode, saved in the browser, with the system setting as the default
- Font switcher, default Inter. Add fonts in the `FONTS` array in `app.js` when Karl enumerates them. Each entry needs an id, label, CSS family, and Google Fonts URL.
- Toggles to show or hide Chinese, pinyin, and English, saved in the browser

## Text sources

- Chinese: Wang Bi received edition, converted to simplified Chinese
- English in this version: James Legge, 1891, public domain. Checked against Standard Ebooks, Tao Te Ching by Laozi, translated by James Legge.

## Stephen Mitchell note, please read before publishing that translation

Stephen Mitchell, Tao Te Ching, 1988, HarperCollins: translation copyright 1988 by Stephen Mitchell, all rights reserved. The book says no part may be used or reproduced in any manner without written permission, except brief quotations in critical articles and reviews.

So the Mitchell text is not included in this public repo. The data format is ready to swap it in, by replacing the `english` array for each chapter, but do that only if one of these applies:

1. You have written permission from HarperCollins or Mitchell, or
2. You keep the Mitchell version private, for personal use only, and do not publish it on GitHub Pages, or
3. You choose to publish with Legge, or another public domain translation, instead.

If you want Mitchell as the reading text, tell me which of those three you want, and I will do the matching next step.

## Run it locally

Open `index.html` in a browser, or serve the folder with any static server, for example `python3 -m http.server` in this folder, then open http://localhost:8000

## GitHub Pages

Settings, Pages, Deploy from a branch, branch `main`, folder `/ (root)`, Save. The site then serves from the repo root.
