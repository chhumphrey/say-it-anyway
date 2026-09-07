# Self-harm screening training data

`self-harm-training-data.json` trains the on-device classifier in
`utils/selfHarmClassifier.ts`, which supplements the regex-based rules in
`utils/mentalHealthScreening.ts` for messages the rules don't confidently resolve either
way. Run `npm run train:classifier` after editing this file to regenerate
`assets/models/self-harm-classifier-weights.json`.

## What this is, and isn't

**This is not a validated clinical screening tool.** The 180-ish examples in this file were
hand-authored in a single session, guided by the *categories* used in publicly available,
professionally developed resources -- not copied from them, and not validated against real
crisis text data or reviewed by a mental health professional:

- The [Columbia-Suicide Severity Rating Scale (C-SSRS)](https://cssrs.columbia.edu/) (Posner
  et al., Columbia University / NIMH, distributed via SAMHSA and the 988 Suicide & Crisis
  Lifeline) — its suicidal-ideation severity ladder (wish to be dead -> non-specific active
  thoughts -> thoughts with method -> intent without a plan -> intent with a plan) and its
  separate "self-injury behavior without suicidal intent" category shaped which concern
  sub-categories this dataset covers.
- CDC/SAMHSA public suicide warning-signs guidance (talking about wanting to die, feeling
  hopeless, feeling like a burden, feeling trapped, giving away possessions, saying goodbye).
- General clinical description of non-suicidal self-injury (NSSI) methods (cutting, burning,
  scratching, hitting oneself), as described by resources like the Cornell Research Program
  on Self-Injury and Recovery.

Method-related examples are deliberately non-specific (no named means), following standard
safe-messaging guidance against detailing methods.

## Known limitations

- Small, hand-authored dataset (~180 examples) — real-world coverage of how people actually
  phrase distress is far broader than what's represented here.
- English only.
- The "benign" examples were chosen specifically to cover known false-positive traps
  (hyperbole like "this traffic is killing me", negated/recovery statements, third-person/
  media mentions, protective-factor statements) — but that list is necessarily incomplete.
- No calibration against real usage. The classifier's score thresholds in
  `mentalHealthScreening.ts` are starting points, not tuned values.

**Please test this feature yourself with realistic, varied phrasing before treating it as
done**, and treat any single flag/no-flag outcome as a heuristic nudge toward support
resources, not a diagnosis. If you extend this dataset over time, keep the "benign" side
just as carefully curated as the "concern" side — that's what keeps false positives down.
