import { categories, questions, sources } from "./questions.js";

const errors = [];
const seen = new Set();
const seenPrompts = new Set();
const seenFacts = new Set();
const seenCatalogEntities = new Set();
const categoryIds = new Set(categories.map((item) => item.id));

for (const question of questions) {
  if (seen.has(question.id)) errors.push(`Duplicate id: ${question.id}`);
  seen.add(question.id);
  const normalizedPrompt = question.prompt.trim().toLowerCase();
  if (seenPrompts.has(normalizedPrompt)) errors.push(`Duplicate prompt: ${question.prompt}`);
  seenPrompts.add(normalizedPrompt);
  const factKey = question.fact || `${question.category}|${question.id}`;
  if (seenFacts.has(factKey)) errors.push(`Duplicate tested fact: ${factKey}`);
  seenFacts.add(factKey);
  if (question.id.startsWith("cat-") && question.fact) {
    const entityKey = question.fact.split("|").slice(0, -1).join("|");
    if (seenCatalogEntities.has(entityKey)) errors.push(`Catalog entity tested more than once: ${entityKey}`);
    seenCatalogEntities.add(entityKey);
  }
  if (!categoryIds.has(question.category)) errors.push(`${question.id}: unknown category ${question.category}`);
  if (!Array.isArray(question.choices) || question.choices.length !== 4) errors.push(`${question.id}: expected exactly 4 choices`);
  if (new Set(question.choices).size !== 4) errors.push(`${question.id}: answer choices must be unique`);
  if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct > 3) errors.push(`${question.id}: invalid correct index`);
  if (!sources[question.source]) errors.push(`${question.id}: unknown source ${question.source}`);
  if (!question.prompt || !question.explanation) errors.push(`${question.id}: missing content`);
}

for (const category of categories) {
  const count = questions.filter((question) => question.category === category.id).length;
  if (count < 30) errors.push(`${category.name}: only ${count} questions`);
  console.log(`${category.name}: ${count}`);
}

for (const categoryId of ["general", "attacks", "crafting", "spellcasting"]) {
  const count = questions.filter((question) => question.category === categoryId).length;
  if (count !== 1000) errors.push(`${categoryId}: expected 1,000 distinct questions, found ${count}`);
}

for (const categoryId of ["gaileia", "campaign"]) {
  const count = questions.filter((question) => question.category === categoryId).length;
  if (count < 100) errors.push(`${categoryId}: expected at least 100 distinct questions, found ${count}`);
}

if (errors.length) {
  console.error(`\nValidation failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`\nValidated ${questions.length} questions across ${categories.length} categories.`);
