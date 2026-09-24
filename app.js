import { categories, questions, sources } from "./questions.js";

const EXAM_LENGTH = 10;
const STORAGE_KEY = "rules-crucible-progress-v2";
const LEGACY_STORAGE_KEY = "rules-crucible-progress-v1";

const screens = {
  home: document.querySelector("#home-screen"),
  quiz: document.querySelector("#quiz-screen"),
  result: document.querySelector("#result-screen")
};

const els = {
  grid: document.querySelector("#category-grid"),
  loreGrid: document.querySelector("#lore-grid"),
  characterGrid: document.querySelector("#character-grid"),
  total: document.querySelector("#question-total"),
  examCount: document.querySelector("#exam-count"),
  mixedStart: document.querySelector("#mixed-start"),
  homeButton: document.querySelector("#home-button"),
  headerMeta: document.querySelector("#header-meta"),
  quit: document.querySelector("#quit-button"),
  quizTheme: document.querySelector("#quiz-theme"),
  quizScore: document.querySelector("#quiz-score"),
  progress: document.querySelector("#progress-bar"),
  number: document.querySelector("#question-number"),
  difficulty: document.querySelector("#difficulty"),
  category: document.querySelector("#question-category"),
  heading: document.querySelector("#question-heading"),
  answers: document.querySelector("#answers"),
  feedback: document.querySelector("#feedback"),
  verdict: document.querySelector("#feedback-verdict"),
  explanation: document.querySelector("#feedback-explanation"),
  source: document.querySelector("#source-link"),
  next: document.querySelector("#next-button"),
  resultScore: document.querySelector("#result-score"),
  resultTitle: document.querySelector("#result-title"),
  resultMessage: document.querySelector("#result-message"),
  categoryResults: document.querySelector("#category-results"),
  missedReview: document.querySelector("#missed-review"),
  resultsHome: document.querySelector("#results-home"),
  retry: document.querySelector("#retry-button")
};

let state = { theme: "mixed", exam: [], index: 0, score: 0, answered: false, responses: [] };

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    return { completed: Number(legacy?.completed) || 0, best: {} };
  } catch {
    return { completed: 0, best: {} };
  }
}

function saveProgress(result) {
  const progress = loadProgress();
  progress.completed += 1;
  progress.best[state.theme] = Math.max(progress.best[state.theme] || 0, result);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function drawDistinctFacts(categoryId) {
  const grouped = new Map();
  questions.filter((item) => item.category === categoryId).forEach((item) => {
    const factId = item.fact || item.id;
    const variants = grouped.get(factId) || [];
    variants.push(item);
    grouped.set(factId, variants);
  });
  return shuffle([...grouped.values()]).map((variants) => shuffle(variants)[0]);
}

function buildExam(theme) {
  if (theme !== "mixed") return drawDistinctFacts(theme).slice(0, EXAM_LENGTH);
  const groups = shuffle(categories).map((category) => drawDistinctFacts(category.id));
  const mixed = [];
  let round = 0;
  while (mixed.length < EXAM_LENGTH) {
    for (const group of groups) {
      if (mixed.length === EXAM_LENGTH) break;
      if (group[round]) mixed.push(group[round]);
    }
    round += 1;
  }
  return shuffle(mixed);
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => { screen.hidden = key !== name; });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderHome() {
  const progress = loadProgress();
  els.total.textContent = questions.length;
  els.examCount.textContent = progress.completed;
  els.headerMeta.textContent = "Rules & lore";
  const renderCards = (items, offset = 0) => items.map((category, index) => {
    const count = questions.filter((item) => item.category === category.id).length;
    const best = progress.best[category.id];
    const record = Number.isInteger(best) ? `Best ${best}/${EXAM_LENGTH}` : `${count} questions`;
    const cardClass = category.group === "characters" ? " character-card" : category.group === "lore" ? " lore-card" : "";
    return `<button class="category-card${cardClass}" type="button" data-theme="${category.id}" data-number="${String(offset + index + 1).padStart(2, "0")}">
      <h3>${category.name}</h3>
      <p>${category.description}</p>
      <span class="card-footer"><span>${record}</span><span>Begin →</span></span>
    </button>`;
  }).join("");
  const rulesCategories = categories.filter((category) => !category.group);
  const loreCategories = categories.filter((category) => category.group === "lore");
  const characterCategories = categories.filter((category) => category.group === "characters");
  els.grid.innerHTML = renderCards(rulesCategories);
  els.loreGrid.innerHTML = renderCards(loreCategories, rulesCategories.length);
  els.characterGrid.innerHTML = renderCards(characterCategories, rulesCategories.length + loreCategories.length);
  document.querySelectorAll("[data-theme]").forEach((button) => {
    button.addEventListener("click", () => startExam(button.dataset.theme));
  });
  showScreen("home");
}

function startExam(theme) {
  state = { theme, exam: buildExam(theme), index: 0, score: 0, answered: false, responses: [] };
  const category = categories.find((item) => item.id === theme);
  els.quizTheme.textContent = category?.name || "Grand Test";
  els.headerMeta.textContent = category?.name || "Grand Test";
  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  const item = state.exam[state.index];
  const category = categories.find((entry) => entry.id === item.category);
  state.answered = false;
  els.number.textContent = `Question ${state.index + 1} of ${EXAM_LENGTH}`;
  els.progress.style.width = `${((state.index + 1) / EXAM_LENGTH) * 100}%`;
  els.quizScore.textContent = `${state.score} correct`;
  els.difficulty.textContent = item.difficulty;
  els.category.textContent = category.name;
  els.heading.textContent = item.prompt;
  els.feedback.hidden = true;
  els.next.disabled = true;
  els.next.innerHTML = state.index === EXAM_LENGTH - 1 ? "See results <span aria-hidden=\"true\">→</span>" : "Next question <span aria-hidden=\"true\">→</span>";
  els.answers.innerHTML = item.choices.map((choice, index) => `<button class="answer-button" type="button" data-answer="${index}">
    <span class="answer-letter">${String.fromCharCode(65 + index)}</span><span>${choice}</span>
  </button>`).join("");
  els.answers.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => answerQuestion(Number(button.dataset.answer)));
  });
  els.heading.focus({ preventScroll: true });
}

function answerQuestion(selected) {
  if (state.answered) return;
  state.answered = true;
  const item = state.exam[state.index];
  const correct = selected === item.correct;
  if (correct) state.score += 1;
  state.responses.push({ item, selected, correct });
  els.quizScore.textContent = `${state.score} correct`;
  els.answers.querySelectorAll("[data-answer]").forEach((button) => {
    const index = Number(button.dataset.answer);
    button.disabled = true;
    if (index === item.correct) button.classList.add("correct");
    if (index === selected && !correct) button.classList.add("wrong");
  });
  const source = sources[item.source];
  els.verdict.textContent = correct ? "Correct." : `Not quite. The answer is ${item.choices[item.correct]}.`;
  els.explanation.textContent = item.explanation;
  els.source.textContent = source.url ? `${source.label} ↗` : `Source: ${source.label}`;
  if (source.url) {
    els.source.href = source.url;
    els.source.target = "_blank";
    els.source.rel = "noopener";
  } else {
    els.source.removeAttribute("href");
    els.source.removeAttribute("target");
    els.source.removeAttribute("rel");
  }
  els.feedback.hidden = false;
  els.next.disabled = false;
  els.next.focus({ preventScroll: true });
}

function nextQuestion() {
  if (!state.answered) return;
  if (state.index < EXAM_LENGTH - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    renderResults();
  }
}

function renderResults() {
  saveProgress(state.score);
  els.resultScore.textContent = state.score;
  const percent = state.score / EXAM_LENGTH;
  const [title, message] = percent === 1
    ? ["Rules arbiter", "A flawless result. Every ruling landed."]
    : percent >= .8
      ? ["Table ready", "Strong command of the rules, with only a few edges to sharpen."]
      : percent >= .6
        ? ["Solid foundation", "You have the shape of the rules. Review the misses, then test again."]
        : ["Back to the archives", "The difficult calls are now visible. That makes the next attempt useful."];
  els.resultTitle.textContent = title;
  els.resultMessage.textContent = message;

  const categoryStats = new Map();
  state.responses.forEach(({ item, correct }) => {
    const current = categoryStats.get(item.category) || { correct: 0, total: 0 };
    current.total += 1;
    if (correct) current.correct += 1;
    categoryStats.set(item.category, current);
  });
  els.categoryResults.innerHTML = [...categoryStats.entries()].map(([id, stats]) => {
    const category = categories.find((entry) => entry.id === id);
    const width = (stats.correct / stats.total) * 100;
    return `<div class="result-row"><div class="result-row-label"><span>${category.name}</span><strong>${stats.correct}/${stats.total}</strong></div><div class="result-row-bar"><span style="width:${width}%"></span></div></div>`;
  }).join("");

  const misses = state.responses.filter((response) => !response.correct);
  els.missedReview.innerHTML = misses.length ? misses.map(({ item }) => {
    const source = sources[item.source];
    const sourceMarkup = source.url
      ? `<a href="${source.url}" target="_blank" rel="noopener">${source.label} ↗</a>`
      : `<span class="source-note">Source: ${source.label}</span>`;
    return `<article class="missed-item"><h3>${item.prompt}</h3><p><strong>Answer:</strong> ${item.choices[item.correct]}. ${item.explanation}</p>${sourceMarkup}</article>`;
  }).join("") : `<p class="perfect">No misses. The rules tribunal has no notes.</p>`;
  els.headerMeta.textContent = "Exam complete";
  showScreen("result");
}

function confirmQuit() {
  if (state.index === 0 && !state.answered) return renderHome();
  if (window.confirm("Leave this exam? Your current attempt will not be saved.")) renderHome();
}

document.addEventListener("keydown", (event) => {
  if (screens.quiz.hidden) return;
  if (!state.answered && /^[a-d]$/i.test(event.key)) {
    const index = event.key.toLowerCase().charCodeAt(0) - 97;
    els.answers.querySelector(`[data-answer="${index}"]`)?.click();
  } else if (state.answered && event.key === "Enter") {
    event.preventDefault();
    nextQuestion();
  }
});

els.mixedStart.addEventListener("click", () => startExam("mixed"));
els.homeButton.addEventListener("click", renderHome);
els.quit.addEventListener("click", confirmQuit);
els.next.addEventListener("click", nextQuestion);
els.resultsHome.addEventListener("click", renderHome);
els.retry.addEventListener("click", () => startExam(state.theme));

renderHome();
