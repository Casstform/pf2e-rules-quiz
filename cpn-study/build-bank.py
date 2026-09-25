#!/usr/bin/env python3
"""Turn the reviewed, line-oriented question authoring files into the site bank."""
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).parent
SOURCES = {
    "B": {
        "name": "CNA Perioperative Nursing Exam Blueprint and Competencies (2020)",
        "url": "https://hl-prod-ca-oc-download.s3-ca-central-1.amazonaws.com/CNA/2f975e7e-4a40-45ca-863c-5ebf0a138d5e/UploadedImages/documents/perioperative_blueprint_and_competencies_e.pdf",
        "note": "Competency and exam coverage source; some scenarios are reasoned applications of its competencies."
    },
    "W": {
        "name": "WHO Surgical Safety Checklist (2009)",
        "url": "https://www.who.int/docs/default-source/patient-safety/9789241598590-eng-checklist.pdf"
    },
    "D": {
        "name": "CDC Guideline for Disinfection and Sterilization in Healthcare Facilities",
        "url": "https://www.cdc.gov/infection-control/media/pdfs/guideline-disinfection-h.pdf"
    },
    "H": {
        "name": "CDC Clinical Safety: Hand Hygiene for Healthcare Workers",
        "url": "https://www.cdc.gov/clean-hands/hcp/clinical-safety/"
    },
    "I": {
        "name": "WHO Infection Prevention and Control: Surgical Site Infections",
        "url": "https://www.who.int/news-room/questions-and-answers/item/surgical-site-infections"
    },
    "F": {
        "name": "AHRQ PSNet: Operating Room Fires",
        "url": "https://psnet.ahrq.gov/issue/operating-room-fires"
    },
    "M": {
        "name": "MHAUS: Managing an MH Crisis",
        "url": "https://www.mhaus.org/healthcare-professionals/managing-a-crisis/"
    }
}
CATEGORIES = [
    "Ethical & professional", "Safety", "Infection prevention",
    "Perioperative phases & anesthesia", "Exceptional clinical events",
    "Managing resources"
]

def parse(path, with_case=False):
    result = []
    for line_number, line in enumerate(path.read_text().splitlines(), 1):
        if not line.strip() or line.startswith("#"):
            continue
        bits = line.split("|")
        assert len(bits) == (9 if with_case else 8), (path, line_number, len(bits))
        case = bits.pop(0) if with_case else None
        category, source, prompt, answer, *rest = bits
        wrong = rest[:3]
        explanation = rest[3]
        assert category in CATEGORIES and source in SOURCES
        assert len(set([answer, *wrong])) == 4, (path, line_number)
        assert len(prompt) > 30 and explanation
        result.append({
            "id": f"CPN-{len(result)+1:03d}" if not with_case else f"CASE-{len(result)+1:03d}",
            "category": category, "source": source, "prompt": prompt,
            "options": [answer, *wrong], "answer": 0,
            "explanation": explanation, **({"case": case} if case else {})
        })
    return result

questions = parse(ROOT / "questions.tsv") + parse(ROOT / "cases.tsv", True)
assert len({q["prompt"].casefold() for q in questions}) == len(questions)
assert len({q["id"] for q in questions}) == len(questions)
concepts = json.loads((ROOT / "learning-concepts.json").read_text())
assert all(item["source"] in SOURCES for item in concepts.values())
learning = {}
for line_number, line in enumerate((ROOT / "learning.tsv").read_text().splitlines(), 1):
    if not line.strip() or line.startswith("#"):
        continue
    bits = line.split("|")
    assert len(bits) == 5, ("learning.tsv", line_number, len(bits))
    question_id, concept, *reasons = bits
    assert question_id not in learning, ("duplicate learning ID", question_id)
    assert concept in concepts and all(reasons), ("incomplete learning note", question_id)
    learning[question_id] = {"concept": concept, "whyOthers": reasons}
assert set(learning) == {q["id"] for q in questions}, (
    "missing", {q["id"] for q in questions} - set(learning),
    "extra", set(learning) - {q["id"] for q in questions}
)
for question in questions:
    question.update(learning[question["id"]])
contexts = json.loads((ROOT / "case-contexts.json").read_text())
assert {q["case"] for q in questions if "case" in q} == set(contexts)
bank = {
    "version": "2026-09-25", "questions": questions, "cases": contexts,
    "sources": SOURCES, "concepts": concepts, "categories": CATEGORIES,
    "blueprintWeights": {
        "Ethical & professional": 12.5, "Safety": 25,
        "Infection prevention": 22.5, "Perioperative phases & anesthesia": 20,
        "Exceptional clinical events": 12.5, "Managing resources": 7.5
    }
}
(ROOT / "bank.json").write_text(json.dumps(bank, ensure_ascii=False, indent=2) + "\n")
print(f"{len(questions)} questions, {sum('case' in q for q in questions)} case questions")
print(dict(Counter(q["category"] for q in questions)))
