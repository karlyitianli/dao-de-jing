// Dao De Jing reader.
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
  chapters: [],
  current: 1,
  theme: localStorage.getItem("dao-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  font: localStorage.getItem("dao-font") || "Inter",
  showChinese: localStorage.getItem("dao-show-chinese") !== "false",
  showPinyin: localStorage.getItem("dao-show-pinyin") !== "false",
  showEnglish: localStorage.getItem("dao-show-english") !== "false"
};

const $ = (id) => document.getElementById(id);

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  $("theme-toggle").textContent = state.theme === "dark" ? "Light" : "Dark";
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
// arrays replace the Legge english for matching chapter numbers.
// That file is gitignored, so it is never pushed to GitHub. If the file is
// missing, which is the case on the public site, Legge stays in place.
async function applyLocalMitchell() {
  try {
    const res = await fetch("data/mitchell.json");
    if (!res.ok) return false;
    const local = await res.json();
    let replaced = 0;
    (local.chapters || []).forEach((entry) => {
      const chapter = chapterByNumber(entry.number);
      if (chapter && Array.isArray(entry.english) && entry.english.length) {
        chapter.english = entry.english;
        replaced++;
      }
    });
    if (replaced) {
      const note = $("translation-note");
      if (note) note.textContent = "English in this local copy: Stephen Mitchell, local only, not published. Chinese text: Wang Bi received edition, simplified.";
    }
    return replaced > 0;
  } catch (e) {
    return false;
  }
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

function chapterByNumber(n) {
  return state.chapters.find((c) => c.number === n);
}

function render() {
  const chapter = chapterByNumber(state.current);
  const el = $("chapter");
  if (!chapter) {
    el.innerHTML = "<p>Chapter not loaded yet.</p>";
    return;
  }

  const chinese = state.showChinese
    ? `<section class="chinese" lang="zh-Hans">${chapter.chinese.map((line) => `<p>${line}</p>`).join("")}</section>` : "";
  const pinyin = state.showPinyin
    ? `<section class="pinyin" lang="zh-Latn">${chapter.pinyin.map((line) => `<p>${line}</p>`).join("")}</section>` : "";
  const english = state.showEnglish
    ? `<section class="english">${chapter.english.map((para) => `<p>${para}</p>`).join("")}</section>` : "";

  el.innerHTML = `
    <p class="chapter-no">Chapter ${chapter.number}</p>
    <h2 class="chapter-title">${chapter.title}</h2>
    ${chinese}${pinyin}${english}`;

  $("progress").textContent = `Chapter ${chapter.number} of 81`;
  $("prev").disabled = !chapterByNumber(state.current - 1);
  $("next").disabled = !chapterByNumber(state.current + 1);
  localStorage.setItem("dao-chapter", String(state.current));
  renderGrid();
}

function renderGrid() {
  const grid = $("chapter-grid");
  grid.innerHTML = "";
  for (let n = 1; n <= 81; n++) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(n);
    button.disabled = !chapterByNumber(n);
    if (n === state.current) button.setAttribute("aria-current", "true");
    button.addEventListener("click", () => { state.current = n; render(); });
    grid.appendChild(button);
  }
}

function go(delta) {
  const next = chapterByNumber(state.current + delta);
  if (next) { state.current = next.number; render(); }
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
  $("show-chinese").addEventListener("change", (e) => { state.showChinese = e.target.checked; localStorage.setItem("dao-show-chinese", String(state.showChinese)); render(); });
  $("show-pinyin").addEventListener("change", (e) => { state.showPinyin = e.target.checked; localStorage.setItem("dao-show-pinyin", String(state.showPinyin)); render(); });
  $("show-english").addEventListener("change", (e) => { state.showEnglish = e.target.checked; localStorage.setItem("dao-show-english", String(state.showEnglish)); render(); });
  $("prev").addEventListener("click", () => go(-1));
  $("next").addEventListener("click", () => go(1));

  // Keyboard hotkeys: left arrow goes to the previous chapter,
  // right arrow goes to the next chapter.
  // Ignored while the font select or a checkbox has focus,
  // so arrow keys keep working normally in those controls.
  document.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  });

  const saved = Number(localStorage.getItem("dao-chapter") || "1");
  const res = await fetch("data/chapters.json");
  const data = await res.json();
  state.chapters = data.chapters || [];
  await applyLocalMitchell();
  if (chapterByNumber(saved)) state.current = saved;
  render();
}

load();
