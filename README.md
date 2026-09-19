# Rules Crucible

A mobile-friendly, static Pathfinder Second Edition rules quiz. Every exam contains 20 randomly selected multiple-choice questions and provides an explanation plus a linked rules reference after each answer.

## Included exam themes

- General Rules
- Underwater Rules
- Crafting
- Stealth
- Familiars & Pets
- Aerial Rules
- Conditions & Recovery
- Spellcasting

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

Questions live in `questions.js`. Each has a stable ID, category, difficulty, four choices, the zero-based index of its correct answer, an explanation, and a source key. Run `node validate.mjs` after changing the bank.

## Notice

This is an unofficial fan-made learning project and is not affiliated with or endorsed by Paizo Inc. Pathfinder is a trademark of Paizo Inc. Rules text in the question bank is paraphrased for educational use, and source links are provided so players can check the authoritative wording.
