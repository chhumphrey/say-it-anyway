#!/usr/bin/env node
/**
 * Trains the on-device self-harm/distress classifier used by
 * utils/selfHarmClassifier.ts, from the hand-authored data in
 * data/self-harm-training-data.json (see data/README.md for provenance/caveats).
 *
 * Plain Node, zero dependencies (this project has no test/build tooling for this kind
 * of thing yet, and a ~180-example bag-of-words Naive Bayes model doesn't need any).
 *
 * Usage: npm run train:classifier
 *
 * Output: assets/models/self-harm-classifier-weights.json, bundled into the app via a
 * static `import` in utils/selfHarmClassifier.ts.
 *
 * IMPORTANT: tokenize() below MUST stay in sync with the identical function in
 * utils/selfHarmClassifier.ts -- the model's weights are only meaningful if inference
 * uses the exact same feature extraction as training.
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'self-harm-training-data.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'assets', 'models', 'self-harm-classifier-weights.json');
const VALIDATION_FRACTION = 0.2;
const RANDOM_SEED = 42; // fixed seed so re-running on unchanged data gives the same split/metrics

// ─── Feature extraction (mirrors utils/selfHarmClassifier.ts) ─────────────────────

const NEGATORS = new Set([
  'not', "don't", 'dont', "didn't", 'didnt', "doesn't", 'doesnt',
  "won't", 'wont', "can't", 'cant', 'cannot', 'never', 'no', "isn't", 'isnt',
  "wasn't", 'wasnt', "wouldn't", 'wouldnt', "couldn't", 'couldnt',
  "shouldn't", 'shouldnt', 'without',
]);
const NEGATION_WINDOW = 3;

function tokenize(text) {
  const lower = text.toLowerCase();
  const cleaned = lower.replace(/[^a-z0-9'\s]/g, ' ');
  const rawTokens = cleaned.split(/\s+/).filter(Boolean);

  const tagged = [];
  let negationRemaining = 0;
  for (const token of rawTokens) {
    if (negationRemaining > 0) {
      tagged.push(`NOT_${token}`);
      negationRemaining--;
    } else {
      tagged.push(token);
    }
    if (NEGATORS.has(token)) {
      negationRemaining = NEGATION_WINDOW;
    }
  }

  const bigrams = [];
  for (let i = 0; i < tagged.length - 1; i++) {
    bigrams.push(`${tagged[i]}_${tagged[i + 1]}`);
  }

  return tagged.concat(bigrams);
}

// ─── Deterministic shuffle (mulberry32 seeded PRNG) ────────────────────────────────

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(array, rng) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── Naive Bayes training ───────────────────────────────────────────────────────────

function trainNaiveBayes(examples) {
  const classes = ['benign', 'concern'];
  const counts = { benign: new Map(), concern: new Map() };
  const totalTokens = { benign: 0, concern: 0 };
  const docCounts = { benign: 0, concern: 0 };
  const vocab = new Set();

  for (const { text, label } of examples) {
    docCounts[label]++;
    for (const token of tokenize(text)) {
      vocab.add(token);
      counts[label].set(token, (counts[label].get(token) || 0) + 1);
      totalTokens[label]++;
    }
  }

  const vocabSize = vocab.size;
  const totalDocs = docCounts.benign + docCounts.concern;
  const logPriors = [Math.log(docCounts.benign / totalDocs), Math.log(docCounts.concern / totalDocs)];

  const wordLogProb = {};
  for (const token of vocab) {
    const benignCount = counts.benign.get(token) || 0;
    const concernCount = counts.concern.get(token) || 0;
    wordLogProb[token] = [
      Math.log((benignCount + 1) / (totalTokens.benign + vocabSize)),
      Math.log((concernCount + 1) / (totalTokens.concern + vocabSize)),
    ];
  }

  // An unseen token (not in the training vocabulary) carries no real evidence either
  // way, so both classes should treat it identically. Using each class's own
  // Laplace-smoothing denominator here (the naive per-class formula) instead gives an
  // unseen word higher probability under whichever class had fewer total training
  // tokens -- a pure artifact of class size, not signal -- which systematically biased
  // ordinary messages full of untrained vocabulary (people's names, everyday words)
  // toward "concern". Pooling the denominator makes unseen tokens score-neutral.
  const pooledDenominator = (totalTokens.benign + totalTokens.concern) / 2 + vocabSize;
  const unseenLogProb = [
    Math.log(1 / pooledDenominator),
    Math.log(1 / pooledDenominator),
  ];

  return { classes, logPriors, wordLogProb, unseenLogProb, vocabSize };
}

function scoreText(model, text) {
  let logBenign = model.logPriors[0];
  let logConcern = model.logPriors[1];

  for (const token of tokenize(text)) {
    const [benignLogProb, concernLogProb] = model.wordLogProb[token] || model.unseenLogProb;
    logBenign += benignLogProb;
    logConcern += concernLogProb;
  }

  const maxLog = Math.max(logBenign, logConcern);
  const expBenign = Math.exp(logBenign - maxLog);
  const expConcern = Math.exp(logConcern - maxLog);
  return expConcern / (expBenign + expConcern);
}

// ─── Main ────────────────────────────────────────────────────────────────────────────

function main() {
  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const examples = raw.examples;
  console.log(`Loaded ${examples.length} labeled examples from ${path.relative(process.cwd(), DATA_PATH)}`);

  const rng = mulberry32(RANDOM_SEED);
  const shuffled = shuffle(examples, rng);
  const valCount = Math.round(shuffled.length * VALIDATION_FRACTION);
  const validationSet = shuffled.slice(0, valCount);
  const trainSet = shuffled.slice(valCount);
  console.log(`Split: ${trainSet.length} train / ${validationSet.length} validation`);

  const model = trainNaiveBayes(trainSet);
  console.log(`Vocabulary size (unigrams + bigrams): ${model.vocabSize}`);

  // ─── Validation metrics ───────────────────────────────────────────────────────────
  let truePositive = 0, trueNegative = 0, falsePositive = 0, falseNegative = 0;
  const misclassified = [];
  for (const { text, label } of validationSet) {
    const score = scoreText(model, text);
    const predicted = score >= 0.5 ? 'concern' : 'benign';
    if (label === 'concern' && predicted === 'concern') truePositive++;
    else if (label === 'benign' && predicted === 'benign') trueNegative++;
    else if (label === 'benign' && predicted === 'concern') falsePositive++;
    else falseNegative++;
    if (predicted !== label) {
      misclassified.push({ text, label, predicted, score });
    }
  }
  const accuracy = (truePositive + trueNegative) / validationSet.length;
  const precision = truePositive / (truePositive + falsePositive) || 0;
  const recall = truePositive / (truePositive + falseNegative) || 0;
  const f1 = (2 * precision * recall) / (precision + recall) || 0;

  console.log('\n=== Validation metrics (held-out 20%, @0.5 threshold) ===');
  console.log(`Accuracy:  ${(accuracy * 100).toFixed(1)}%`);
  console.log(`Precision: ${(precision * 100).toFixed(1)}% (of flagged, how many were actually concern)`);
  console.log(`Recall:    ${(recall * 100).toFixed(1)}% (of actual concern examples, how many were caught)`);
  console.log(`F1:        ${f1.toFixed(3)}`);
  console.log(`Confusion: TP=${truePositive} TN=${trueNegative} FP=${falsePositive} FN=${falseNegative}`);
  if (misclassified.length > 0) {
    console.log('\nMisclassified validation examples:');
    for (const { text, label, predicted, score } of misclassified) {
      console.log(`  [${label} -> predicted ${predicted}, score=${score.toFixed(3)}] "${text}"`);
    }
  }

  // ─── Smoke test against sentences NOT in the dataset at all ───────────────────────
  const smokeTests = [
    { text: "I don't think I want to keep living like this", expected: 'concern' },
    { text: 'I want to disappear and never come back', expected: 'concern' },
    { text: "I've been hurting myself when no one's around", expected: 'concern' },
    { text: 'This project deadline is going to be the death of me', expected: 'benign' },
    { text: 'I read a news story about a local suicide last week', expected: 'benign' },
    { text: "I don't feel hopeless anymore, therapy has really helped", expected: 'benign' },
  ];
  console.log('\n=== Smoke test (sentences outside the training/validation data) ===');
  for (const { text, expected } of smokeTests) {
    const score = scoreText(model, text);
    const predicted = score >= 0.5 ? 'concern' : 'benign';
    const flag = predicted === expected ? '✓' : '✗ MISMATCH';
    console.log(`${flag}  score=${score.toFixed(3)}  predicted=${predicted}  expected=${expected}  "${text}"`);
  }

  // ─── Write model weights ───────────────────────────────────────────────────────────
  const output = {
    classes: model.classes,
    logPriors: model.logPriors,
    wordLogProb: model.wordLogProb,
    unseenLogProb: model.unseenLogProb,
    meta: {
      trainedAt: new Date().toISOString(),
      trainExamples: trainSet.length,
      validationExamples: validationSet.length,
      vocabSize: model.vocabSize,
      validationAccuracy: accuracy,
    },
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output));
  console.log(`\nWrote weights to ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main();
