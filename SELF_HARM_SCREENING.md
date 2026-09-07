# Self-Harm Screening: Concept, Design, and Testing

This document records why and how the app's self-harm/distress screening feature works, so a
future reviewer (human or AI) can understand the reasoning, extend the training data, or retune
the model without having to reverse-engineer it from the code alone. It also records what testing
was actually performed and what its results were — including the one real limitation found.

**Read this before changing anything about screening or before treating a flag/no-flag result
as more reliable than it is: this is a supplementary heuristic, not a validated clinical
screening tool.**

## 1. Why this exists

The app screens journal entries for language suggesting the author may be at risk of suicide or
self-injury, and routes flagged entries to `/support-resources` (crisis line numbers, etc.). It
existed originally as a hand-written regex system (`utils/mentalHealthScreening.ts`). That system
works well for phrasing its author anticipated, but has two structural weaknesses:

1. It can only catch wording explicitly written into a pattern — novel phrasing slips through
   entirely.
2. Until this change, it had **no coverage of self-injury** (cutting, burning, etc.) at all —
   only suicidal ideation/hopelessness themes.

The feature described here adds a second, complementary detection layer: a small on-device
statistical text classifier that catches some of what the regex rules miss, while leaving the
rules in place as the fast, transparent first pass.

Everything runs **on-device**. No message text is ever sent anywhere — this matches the app's
existing "no cloud sync, no external data transmission" design.

## 2. Architecture: rules first, model for ambiguous cases

```
screenMessage(text)
  │
  ├─► runRuleBasedScreening(text)      (unchanged regex system, + new self-injury patterns)
  │      returns { isFlagged, confidence: low|medium|high, matchedPatterns }
  │
  ├─► confidence === 'high'?  ─── yes ──► return rules result as-is (source: 'rules')
  │        │
  │        no
  │        ▼
  ├─► classifyText(text)               (Naive Bayes classifier, utils/selfHarmClassifier.ts)
  │      returns a score in [0, 1]
  │
  └─► combine:
         finalConfidence = max(ruleConfidence, modelConfidence)
         finalIsFlagged  = ruleIsFlagged OR modelConfidence is medium/high
         (source: 'rules' | 'model' | 'both')
```

**The combination rule is deliberate and important**: the model can only *add* a flag or *raise*
confidence. It can never remove or lower what the rule engine already decided. This is a
one-directional safety bias: a missed signal (false negative) is a far worse outcome than an
unnecessary nudge toward support resources (false positive), so the design leans toward
over-flagging rather than under-flagging whenever the two signals disagree.

When rules alone reach `'high'` confidence, the model isn't even run — a match that strong is
already explainable on its own, and there's no upside to a second, less transparent opinion.

## 3. Where the training data's categories come from

The classifier's training examples (`data/self-harm-training-data.json`, full details in
`data/README.md`) were **hand-authored in one sitting** — they are not sourced from a validated
crisis-text corpus and have not been reviewed by a mental health professional. What *is*
evidence-based is the taxonomy used to decide what to write examples about, drawn from two
publicly available sources:

- **Columbia-Suicide Severity Rating Scale (C-SSRS)** (Posner et al., Columbia University/NIMH,
  distributed via SAMHSA and the 988 Suicide & Crisis Lifeline) — specifically its suicidal
  ideation severity ladder:
  1. Wish to be dead
  2. Non-specific active suicidal thoughts
  3. Active ideation with a method considered (but no plan/intent)
  4. Active ideation with some intent (no specific plan)
  5. Active ideation with a specific plan and intent

  ...plus its separate **"self-injury behavior without suicidal intent"** category, and several
  "Clinical Status" risk indicators it tracks: hopelessness, helplessness, feeling trapped,
  perceived burden on others.

- **CDC/SAMHSA public suicide warning-signs guidance** — "talking about wanting to die," "talking
  about feeling hopeless," "talking about being a burden," "talking about feeling trapped,"
  giving away possessions, saying goodbye.

- General clinical description of non-suicidal self-injury (NSSI) methods (cutting, burning,
  scratching, hitting oneself) — used to write both new regex patterns and training examples for
  a category the old system had zero coverage of.

No clinical scale's question wording is reproduced verbatim (the C-SSRS is a validated
instrument, not something to casually repurpose as training text), and method-related examples
are deliberately non-specific (no named means), following standard safe-messaging guidance.

The **"benign" side** of the dataset was written just as deliberately, specifically targeting
known false-positive traps:
- Ordinary grief journaling ("I miss you so much grandma")
- Hyperbolic, non-literal language ("this traffic is going to kill me")
- Third-person/media mentions ("the movie character committed suicide")
- Negated/recovery statements ("I don't want to hurt myself anymore")
- Protective-factor statements, mirroring the C-SSRS's own "Protective Factors" checklist
  (reasons for living, supportive relationships) — these look emotionally similar to concerning
  content but aren't, and are exactly the kind of hard negative that improves precision.

## 4. How the classifier works

`utils/selfHarmClassifier.ts` (runtime) and `scripts/train-self-harm-classifier.js` (training)
implement a **multinomial Naive Bayes** classifier — not a neural network. This was a deliberate
choice: it's trainable and runnable in pure TypeScript/JavaScript with **zero new dependencies**,
no native modules, small (tens of KB), fast enough to run synchronously with no perceptible
delay, and auditable (you can see exactly which words pushed a score up).

**Feature extraction** (must be identical between training and inference — see the "keep in
sync" comments in both files):
1. Lowercase, strip punctuation (keep apostrophes so contractions survive).
2. Split into words.
3. **Negation tagging**: words within 3 tokens after a negator (`not`, `don't`, `never`, `no`,
   `without`, etc.) get a `NOT_` prefix, so "don't want to die" produces different features than
   "want to die" rather than looking identical to a plain bag-of-words model.
4. Generate both unigrams and bigrams (consecutive word pairs) from the tagged tokens — bigrams
   capture phrase structure ("kill myself" as one feature) that unigrams alone would lose.

**Training** (`npm run train:classifier`):
- Loads `data/self-harm-training-data.json`, shuffles with a fixed seed (reproducible), splits
  80/20 into train/validation.
- Counts unigram+bigram frequencies per class, applies Laplace (add-1) smoothing.
- Writes `assets/models/self-harm-classifier-weights.json` (class priors + per-token
  log-probabilities), which the app bundles via a normal `import` (Metro supports JSON natively).
- **Prints validation accuracy/precision/recall/F1 and every misclassified example** every time
  it runs — this is the main tool for iterating on the dataset. See §6 for actual results.

**Inference**: sum each token's log-probability per class, add class priors, convert to a
probability via a numerically-stable softmax. The result is a score in `[0, 1]`; thresholds
(`HIGH_MODEL_THRESHOLD = 0.85`, `MEDIUM_MODEL_THRESHOLD = 0.6` in `mentalHealthScreening.ts`)
map it to a confidence level. **Naive Bayes scores are known to be overconfident/poorly
calibrated** — treat these thresholds as starting points to tune against real usage, not
precise probabilities.

## 5. Testing performed and results

### 5.1 Automated: training/validation metrics

First pass (169 examples): 70.6% accuracy, 65.2% precision, **88.2% recall**, 2 false negatives.

Using the training script's own misclassification report, I identified a pattern — benign
statements containing words like "hard," "rough," "heavy" alongside resilience language were
false-positive-prone — and added ~15 targeted examples addressing it (see git history of
`data/self-harm-training-data.json`). Second pass (182 examples): **77.8% accuracy, 73.1%
precision, 95.0% recall**, 1 false negative, on a held-out validation split.

Recall matters most here given the one-directional combination rule in §2 (missing a real signal
is worse than an extra nudge), so the iteration deliberately optimized for recall over precision.

Note: the validation split is only ~36 examples, so these numbers carry real statistical noise —
don't over-index on small deltas.

### 5.2 End-to-end: the actual hybrid pipeline

Beyond the classifier alone, I compiled and ran the real `screenMessage()` function (rules +
model + combination logic together) against 16 test messages covering: original regex-covered
cases, new self-injury phrasing, phrasing designed to be classifier-only catches, and known
false-positive traps. **15 of 16 behaved correctly**, including four cases the regex genuinely
could not have caught alone, e.g.:

- *"I keep thinking the world would just move on fine without me in it"* → caught by the model
  alone (score 1.00), no regex pattern matches this phrasing.
- *"I've started giving away my things, people won't need to deal with them later"* → caught by
  the model alone (score 1.00).

### 5.3 The one confirmed limitation

*"I used to think about not being here anymore, but I don't feel that way now"* — a genuine
recovery statement, and one of the "benign" categories the training data explicitly targets —
**was incorrectly flagged** (score 0.91, high confidence).

**Root cause**: the negation-tagging window only tags the few words *after* a negator. In this
sentence, "not being here anymore" appears *before* "but I don't feel that way now" — the later
negation doesn't retroactively cancel the earlier phrase the way a human reader understands it
to. This is a structural limitation of a simple forward-only negation window, not a bug to
quick-patch: a special-case rule for "used to... but not anymore" framing risks suppressing
genuine current ideation phrased similarly (e.g., "I used to think about ending things and I
still do"), which would violate the one-directional safety bias in §2. It's left as a known,
documented limitation rather than patched.

## 6. Known limitations (read before trusting this feature)

- **Not a validated clinical tool.** Hand-authored training data, unreviewed by a mental health
  professional, not tested against real crisis text.
- **Small dataset** (182 examples) — real-world phrasing diversity is far larger than what's
  represented here.
- **English only.**
- **Retrospective/recovery framing can false-positive** (§5.3) — a known, unpatched limitation.
- **Score thresholds are untuned** against real usage — starting points only.
- **No persistence of screening outcome** — a flagged/unflagged result is still transient (same
  as before this feature existed); nothing is written back to the `Message` object.

## 7. How to extend or retune this in the future

1. **Add training examples**: edit `data/self-harm-training-data.json` directly — it's a flat
   array of `{ "text": "...", "label": "concern" | "benign" }`. Keep the "benign" side just as
   carefully curated as the "concern" side (targeting real false-positive patterns you observe)
   — that's what keeps precision from degrading as concern coverage grows.
2. **Retrain**: `npm run train:classifier`. Read the printed misclassified-examples list — it's
   the fastest way to find what the dataset is missing. Iterate: add a few targeted examples,
   retrain, check if the specific misses you cared about are fixed, without obsessing over noise
   in a small validation split.
3. **Retune thresholds**: `HIGH_MODEL_THRESHOLD` / `MEDIUM_MODEL_THRESHOLD` constants at the top
   of `utils/mentalHealthScreening.ts`.
4. **Add new regex categories**: `runRuleBasedScreening()` in the same file — follow the existing
   `{ pattern, weight, description }` shape.
5. If you ever want a fundamentally more capable model (e.g. real embeddings, a neural
   classifier), that's a bigger architectural step — see the "on-device ML text classifier" and
   "hybrid" options considered when this was designed; a full on-device ML runtime
   (TensorFlow Lite/ONNX) was deliberately avoided for a first version to keep this dependency-free
   and auditable, but isn't ruled out for the future if the accuracy ceiling of bag-of-words
   Naive Bayes proves limiting.

## 8. File map

| File | Role |
|---|---|
| `utils/mentalHealthScreening.ts` | Public entry point (`screenMessage`), rule patterns, hybrid combination logic |
| `utils/selfHarmClassifier.ts` | Runtime classifier — loads bundled weights, scores text |
| `data/self-harm-training-data.json` | Labeled training examples (edit this to improve coverage) |
| `data/README.md` | Dataset provenance and caveats (shorter version of §3/§6 above) |
| `scripts/train-self-harm-classifier.js` | Training script — run via `npm run train:classifier` |
| `assets/models/self-harm-classifier-weights.json` | Generated model weights (bundled into the app; regenerate, don't hand-edit) |
