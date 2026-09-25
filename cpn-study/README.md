# Perioperative Study Lab

An independent, static question bank for CNA CPN(C) exam preparation, published at
`https://casstform.github.io/pf2e-rules-quiz/cpn-study/`.

The site has no build step or external service. It loads `bank.json` and stores
attempts, missed status, and bookmarks in the visitor's browser. The six study
domains and approximate session weights follow CNA's perioperative blueprint.
This is not affiliated with CNA or ORNAC and contains no official exam items.

## Maintain the bank

Edit `questions.tsv`, `cases.tsv`, and `case-contexts.json`. Each question
has a source code, four answer choices (the correct choice first), and an
explanation. Run `python3 build-bank.py` to regenerate `bank.json`.
The site shuffles answer choices at display time. The script checks field
counts, categories, sources, distinct choices, duplicate prompts and IDs.

The source-code mapping and exact links are in `build-bank.py`. The source
link shown after each answer is a starting point for study, not a replacement
for local policy or the current edition of a standard.

When the owner supplies the ORNAC Standards PDF, review its edition and
licence, add original scenario questions with section-specific citations,
then update the source list and bank version. Do not paste large portions of
the standards into the public repository.
