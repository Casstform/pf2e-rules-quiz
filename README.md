# Rules Crucible

A mobile-friendly, static Pathfinder Second Edition rules quiz. Every exam contains 10 randomly selected multiple-choice questions and provides an explanation plus a linked rules reference after each answer.

## Included exam themes

- General Rules — 1,000 distinct action, feat, background, and foundational rules facts
- Attack & Damage Rolls — 1,000 distinct attack, weapon, ammunition, damage, and attack-option facts
- Conditions
- Death & Dying
- Underwater Rules
- Crafting — 1,000 distinct crafting, formula-relevant, item-level, price, usage, and equipment facts
- Stealth
- Familiars & Pets
- Aerial Rules
- Spellcasting — 1,000 distinct casting and spell-catalog facts

## Lore examinations

- Gaileia Lore — 100 independently testable canon facts covering the Dreamer, cosmology, theology, magic, history, government, law, institutions, geography, education, technology, ancestries, currency, and everyday life
- Envoys of the Fall — 100 independently testable campaign facts covering the party's origins, guild life, contracts, investigations, Gaius City, recurring allies, character memories, and current voyage

One question equals one distinct tested fact. The bank never inflates its counts with alternate wording, prompt prefixes, or reordered choices. Lore questions are spoiler-safe: they draw on established current canon and events already encountered by the party. Unresolved setting contradictions and GM-only material are excluded. Questions derived from Kiera's session record explicitly use Ritsa's perspective.

The 1,000-question banks are limited to topics with enough genuine breadth to support them. Narrow subsystems and individual level-3 characters keep smaller, focused banks rather than padding their totals with variations of the same rule. The large rules catalogs use remastered entries from PF2e system data release 8.5.1 and link back to the appropriate Archives of Nethys index.

## Player-focused examinations

- Ritsa — animist attunement, dual casting, familiar, Medicine, and herbal fieldcraft
- WE4LAND — pistolero reloads, firearms, alchemical ammunition, and automaton rules
- Oziza — Cosmos oracle curses, spontaneous divine magic, focus spells, and azarketi rules
- Sara — Tiger Stance, Flurry of Blows, climbing, breath control, and innate magic

## Run locally

Because the site uses JavaScript modules, serve the folder with any small local web server rather than opening `index.html` directly. For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create an empty GitHub repository.
2. Add this project as the repository contents and push it to the `main` branch.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **GitHub Actions** as the source.
5. The included workflow publishes the site after each push to `main`.

## Maintaining the question bank

Questions live in `questions.js`, `question-expansion.js`, `lore-questions.js`, and the `catalog-*.js` modules. Each has a stable ID, category, difficulty, four choices, the zero-based index of its correct answer, an explanation, and a source key. Catalog entries also carry a stable semantic fact key. The validator rejects duplicate IDs, prompts, fact keys, and repeated catalog entities. Run `node validate.mjs` after changing the bank.

## Notice

This is an unofficial fan-made learning project and is not affiliated with or endorsed by Paizo Inc. Pathfinder is a trademark of Paizo Inc. Rules text in the question bank is paraphrased for educational use, and source links are provided so players can check the authoritative wording.
