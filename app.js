// Dao De Jing reader.
// Chapters are split, one file per chapter: data/chapters/001.json to 081.json.
// data/index.json lists all 81 numbers and titles. Only the chapter being
// read is fetched, plus the next one preloaded in the background.
// Fonts, in switcher order. Inter stays first and is the default.
// letterSpacing is per font: Inter is -0.02em, which is -2 percent, the others are 0.
const FONTS = [
  { id: "Inter", label: "Inter", family: "'Inter', system-ui, sans-serif", google: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap", letterSpacing: "-0.02em" },
  { id: "EB Garamond", label: "EB Garamond", family: "'EB Garamond', Georgia, serif", google: "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&display=swap", letterSpacing: "0em" },
  { id: "Marcellus", label: "Marcellus", family: "'Marcellus', Georgia, serif", google: "https://fonts.googleapis.com/css2?family=Marcellus&display=swap", letterSpacing: "0em" },
  { id: "Newsreader", label: "Newsreader", family: "'Newsreader', Georgia, serif", google: "https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600&display=swap", letterSpacing: "0em" },
  { id: "IBM Plex Mono", label: "IBM Plex Mono", family: "'IBM Plex Mono', ui-monospace, monospace", google: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap", letterSpacing: "0em" }
];

const state = {
  index: [],
  cache: {},
  chapter: null,
  current: 1,
  mitchell: null,
  theme: localStorage.getItem("dao-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  font: localStorage.getItem("dao-font") || "Inter",
  showChinese: localStorage.getItem("dao-show-chinese") !== "false",
  showPinyin: localStorage.getItem("dao-show-pinyin") !== "false",
  showEnglish: localStorage.getItem("dao-show-english") !== "false"
};

const $ = (id) => document.getElementById(id);

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  // The button shows the icon of the mode it switches to: a moon in
  // light mode, a sun in dark mode. CSS on [data-theme] picks which
  // of the two inline SVGs is visible.
  const themeButton = $("theme-toggle");
  const label = state.theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  themeButton.setAttribute("aria-label", label);
  themeButton.setAttribute("title", label);
  localStorage.setItem("dao-theme", state.theme);
}

function applyFont() {
  const font = FONTS.find((f) => f.id === state.font) || FONTS[0];
  document.documentElement.style.setProperty("--app-font", font.family);
  document.documentElement.style.setProperty("--letter-spacing", font.letterSpacing || "0em");
  const link = $("font-link");
  if (link && font.google) link.href = font.google;
  $("font-select").value = font.id;
  localStorage.setItem("dao-font", font.id);
}

// Local-only Mitchell support.
// If data/mitchell.json exists on the device running the site, its english
// arrays replace the McDonald english for matching chapter numbers, per chapter
// as each chapter file is loaded. That file is gitignored, so it is never
// pushed to GitHub. If the file is missing, which is the case on the public
// site, McDonald stays in place.
async function loadMitchell() {
  if (state.mitchell !== null) return state.mitchell;
  state.mitchell = {};
  try {
    const res = await fetch("data/mitchell.json");
    if (!res.ok) return state.mitchell;
    const local = await res.json();
    (local.chapters || []).forEach((entry) => {
      if (Array.isArray(entry.english) && entry.english.length) {
        state.mitchell[entry.number] = entry.english;
      }
    });
    if (Object.keys(state.mitchell).length) {
      const note = $("translation-note");
      if (note) note.textContent = "English in this local copy: Stephen Mitchell, local only, not published. Chinese text: Wang Bi received edition, simplified.";
    }
  } catch (e) {
    // No local Mitchell file, Legge stays.
  }
  return state.mitchell;
}

function applyMitchellTo(chapter) {
  const replacement = state.mitchell && state.mitchell[chapter.number];
  if (replacement) chapter.english = replacement;
  return chapter;
}

function initFonts() {
  const select = $("font-select");
  select.innerHTML = "";
  FONTS.forEach((font) => {
    const option = document.createElement("option");
    option.value = font.id;
    option.textContent = font.label;
    select.appendChild(option);
  });
  select.addEventListener("change", () => {
    state.font = select.value;
    applyFont();
  });
}

function chapterExists(n) {
  return state.index.some((c) => c.number === n);
}

function chapterTitle(n) {
  const entry = state.index.find((c) => c.number === n);
  return entry ? entry.title : "";
}

async function loadChapter(n) {
  if (!chapterExists(n)) return;
  state.current = n;
  localStorage.setItem("dao-chapter", String(n));
  if (state.cache[n]) {
    state.chapter = state.cache[n];
    render();
    return;
  }
  const el = $("chapter");
  if (el && !state.chapter) el.innerHTML = "<p>Loading chapter…</p>";
  try {
    const res = await fetch(`data/chapters/${String(n).padStart(3, "0")}.json`);
    const chapter = await res.json();
    state.cache[n] = applyMitchellTo(chapter);
    state.chapter = state.cache[n];
  } catch (e) {
    if (el) el.innerHTML = "<p>Chapter could not be loaded.</p>";
    return;
  }
  render();
  // Preload the next chapter in the background, so the next key press is instant.
  const next = n + 1;
  if (chapterExists(next) && !state.cache[next]) {
    fetch(`data/chapters/${String(next).padStart(3, "0")}.json`)
      .then((r) => r.json())
      .then((chapter) => { state.cache[next] = applyMitchellTo(chapter); })
      .catch(() => {});
  }
}

function render() {
  const chapter = state.chapter;
  const el = $("chapter");
  if (!chapter) {
    el.innerHTML = "<p>Chapter not loaded yet.</p>";
    return;
  }

  // Pinyin sits above each Chinese character with <ruby> and <rt>,
  // so the two stay together instead of living in separate blocks.
  // The Pinyin toggle controls whether the <rt> annotations render.
  // Pairing is positional: one pinyin token per Chinese character.
  // A few lines carry extra punctuation tokens (for example ﹕, ﹑, or a
  // stray comma), so a punctuation character consumes a following
  // punctuation-only token instead of letting it attach to the next
  // character, and trailing punctuation is stripped from each <rt>.
  function rubyLine(cline, pline) {
    const tokens = pline.split(" ");
    let ti = 0;
    const clean = (tok) => tok.replace(/^[^\p{L}\p{M}]+/u, "").replace(/[^\p{L}\p{M}]+$/u, "");
    const isPunct = (tok) => tok !== "" && /^[^\p{L}\p{M}]+$/u.test(tok);
    let out = "";
    for (const ch of cline) {
      if (/[\u4e00-\u9fff]/.test(ch)) {
        const tok = ti < tokens.length ? tokens[ti++] : "";
        const rt = clean(tok);
        out += rt ? `<ruby>${ch}<rt>${rt}</rt></ruby>` : ch;
      } else {
        if (ti < tokens.length && isPunct(tokens[ti])) ti++;
        out += ch;
      }
    }
    return out;
  }
  const chinese = state.showChinese
    ? `<section class="chinese" lang="zh-Hans">${chapter.chinese.map((line, i) => `<p>${state.showPinyin ? rubyLine(line, chapter.pinyin[i] || "") : line}</p>`).join("")}</section>` : "";
  // English paragraphs carry the PDF's line breaks as "\n".
  // Render each line break as a <br>, so the text looks like the PDF:
  // short lines, with a blank gap between paragraphs.
  // A local Mitchell paragraph without "\n" just renders as one block.
  const english = state.showEnglish
    ? `<section class="english">${chapter.english.map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`).join("")}</section>` : "";

  const title = chapter.title
    ? `<h2 class="chapter-title">${chapter.title}</h2>` : "";
  el.innerHTML = `
    <p class="chapter-no">Chapter ${chapter.number}</p>
    ${title}
    ${chinese}${english}`;

  $("progress-text").textContent = `Chapter ${chapter.number} of 81`;
  $("prev").disabled = !chapterExists(state.current - 1);
  $("next").disabled = !chapterExists(state.current + 1);
  renderGrid();
}

function renderGrid() {
  const grid = $("chapter-grid");
  grid.innerHTML = "";
  for (let n = 1; n <= 81; n++) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(n);
    button.disabled = !chapterExists(n);
    button.title = chapterTitle(n) || `Chapter ${n}`;
    if (n === state.current) button.setAttribute("aria-current", "true");
    button.addEventListener("click", () => {
      if (n !== state.current) playPageFlip();
      loadChapter(n);
      closePicker();
    });
    grid.appendChild(button);
  }
}

// Chapter picker: the progress button opens a modal on desktop and
// a bottom drawer on mobile, both showing the same chapter grid.
// The CSS switches the presentation by viewport; this code only
// opens, closes, and keeps focus inside the dialog while it is open.
let pickerReturnFocus = null;
function pickerOpen() { return !$("chapter-picker").hidden; }
function openPicker() {
  pickerReturnFocus = document.activeElement;
  $("chapter-picker").hidden = false;
  $("progress").setAttribute("aria-expanded", "true");
  document.body.classList.add("picker-open");
  const current = $("chapter-picker").querySelector('[aria-current="true"]');
  (current || $("picker-close")).focus();
  if (current && current.scrollIntoView) current.scrollIntoView({ block: "nearest" });
}
function closePicker() {
  const picker = $("chapter-picker");
  if (picker.hidden) return;
  picker.hidden = true;
  $("progress").setAttribute("aria-expanded", "false");
  document.body.classList.remove("picker-open");
  // Focus goes back where it came from, or to the progress button
  // when the picker was opened without keyboard focus, as with a
  // mouse click that never focused the button.
  const target = pickerReturnFocus && pickerReturnFocus !== document.body
    ? pickerReturnFocus : $("progress");
  if (target && target.focus) target.focus();
}

// Page flip sound: a short 0.55s clip, preloaded so it plays instantly.
// Played on every user-initiated chapter change, never on first load.
// Restarting from 0 each time means fast repeated presses replay it.
function playPageFlip() {
  const pageAudio = $("page-audio");
  if (!pageAudio) return;
  pageAudio.currentTime = 0;
  const p = pageAudio.play();
  if (p) p.catch(() => {});
}

function go(delta) {
  const next = state.current + delta;
  if (chapterExists(next)) {
    playPageFlip();
    loadChapter(next);
  }
}

async function load() {
  initFonts();
  applyTheme();
  applyFont();
  $("show-chinese").checked = state.showChinese;
  $("show-pinyin").checked = state.showPinyin;
  $("show-english").checked = state.showEnglish;

  $("theme-toggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
  });

  // Singing bowl: one button, play on first click, pause on the next.
  // A plain <audio> element, no library. preload="none" in index.html
  // means the 119KB file is only fetched on the first click.
  // The audio element lives outside the chapter article, so the sound
  // keeps playing while you change chapters.
  const bowlAudio = $("bowl-audio");
  const bowlButton = $("bowl-toggle");
  // Sound levels: both sounds play at half volume (0.5).
  // The MP3 files are unchanged, this only turns playback down.
  bowlAudio.volume = 0.5;
  $("page-audio").volume = 0.5;
  function syncBowlButton() {
    const playing = bowlAudio && !bowlAudio.paused && !bowlAudio.ended;
    bowlButton.setAttribute("aria-pressed", String(playing));
    bowlButton.setAttribute("aria-label", playing ? "Pause singing bowl" : "Play singing bowl");
    bowlButton.classList.toggle("playing", playing);
  }
  bowlButton.addEventListener("click", () => {
    if (bowlAudio.paused) {
      const p = bowlAudio.play();
      if (p) p.catch(() => {});
    } else {
      bowlAudio.pause();
    }
  });
  bowlAudio.addEventListener("play", syncBowlButton);
  bowlAudio.addEventListener("pause", syncBowlButton);
  bowlAudio.addEventListener("ended", syncBowlButton);
  $("show-chinese").addEventListener("change", (e) => { state.showChinese = e.target.checked; localStorage.setItem("dao-show-chinese", String(state.showChinese)); render(); });
  $("show-pinyin").addEventListener("change", (e) => { state.showPinyin = e.target.checked; localStorage.setItem("dao-show-pinyin", String(state.showPinyin)); render(); });
  $("show-english").addEventListener("change", (e) => { state.showEnglish = e.target.checked; localStorage.setItem("dao-show-english", String(state.showEnglish)); render(); });
  $("prev").addEventListener("click", () => go(-1));
  $("next").addEventListener("click", () => go(1));
  $("progress").addEventListener("click", openPicker);
  $("picker-close").addEventListener("click", closePicker);
  $("chapter-picker").querySelector(".picker-backdrop").addEventListener("click", closePicker);

  // Keyboard hotkeys: left arrow goes to the previous chapter,
  // right arrow goes to the next chapter.
  // Ignored while the font select or a checkbox has focus,
  // so arrow keys keep working normally in those controls.
  document.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA") return;
    // While the picker is open, only Escape closes it and Tab stays
    // inside it. Chapter hotkeys wait until it is closed.
    if (pickerOpen()) {
      if (e.key === "Escape") closePicker();
      if (e.key === "Tab") {
        const focusable = [...$("chapter-picker").querySelectorAll("button:not([disabled])")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
    if (e.key === "r" || e.key === "R") {
      if (state.current !== 1) playPageFlip();
      loadChapter(1);
    }
  });

  const saved = Number(localStorage.getItem("dao-chapter") || "1");
  const res = await fetch("data/index.json");
  const data = await res.json();
  state.index = data.chapters || [];
  await loadMitchell();
  loadChapter(chapterExists(saved) ? saved : 1);
}

load();
