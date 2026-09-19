import { categories, questions, sources } from "./questions.js";

const errors = [];
const seen = new Set();
const categoryIds = new Set(categories.map((item) => item.id));

for (const question of questions) {
  if (seen.has(question.id)) errors.push(`Duplicate id: ${question.id}`);
  seen.add(question.id);
  if (!categoryIds.has(question.category)) errors.push(`${question.id}: unknown category ${question.category}`);
  if (!Array.isArray(question.choices) || question.choices.length !== 4) errors.push(`${question.id}: expected exactly 4 choices`);
  if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct > 3) errors.push(`${question.id}: invalid correct index`);
  if (!sources[question.source]) errors.push(`${question.id}: unknown source ${question.source}`);
  if (!question.prompt || !question.explanation) errors.push(`${question.id}: missing content`);
}

for (const category of categories) {
  const count = questions.filter((question) => question.category === category.id).length;
  if (count < 20) errors.push(`${category.name}: only ${count} questions`);
  console.log(`${category.name}: ${count}`);
}

if (errors.length) {
  console.error(`\nValidation failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`\nValidated ${questions.length} questions across ${categories.length} categories.`);
