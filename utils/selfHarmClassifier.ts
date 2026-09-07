
// On-device text classifier used by mentalHealthScreening.ts as a second opinion for
// messages the regex rules don't confidently resolve one way or the other.
//
// This is a small multinomial Naive Bayes model over unigrams + bigrams (with simple
// negation tagging), trained entirely offline by scripts/train-self-harm-classifier.js
// against data/self-harm-training-data.json. Nothing here calls out to the network --
// the trained weights are bundled as a JSON asset and everything runs synchronously,
// on-device, matching the rest of this app's offline-first design.
//
// IMPORTANT: the tokenize() function below MUST stay in sync with the identical function
// in scripts/train-self-harm-classifier.js -- the model's weights are only meaningful if
// inference uses the exact same feature extraction as training. If you change one, change
// the other and re-run `npm run train:classifier`.
//
// See data/README.md for where the training data's categories come from and this
// feature's real limitations -- it is a supplementary heuristic, not a validated
// clinical screening tool.

import weights from '@/assets/models/self-harm-classifier-weights.json';

interface ClassifierWeights {
  classes: ['benign', 'concern'];
  logPriors: [number, number];
  wordLogProb: Record<string, [number, number]>;
  unseenLogProb: [number, number];
}

const model = weights as unknown as ClassifierWeights;

export interface ClassificationResult {
  // Probability-like score in [0, 1] that the text expresses self-harm-related concern.
  // Naive Bayes scores are known to be overconfident/poorly calibrated -- treat this as a
  // ranking signal, not a true probability.
  score: number;
}

// Words that flip the meaning of what follows. Tokens within NEGATION_WINDOW words after
// one of these get a NOT_ prefix, so e.g. "don't want to die" produces different features
// than "want to die" instead of looking identical to a bag-of-words model.
const NEGATORS = new Set([
  'not', "don't", 'dont', "didn't", 'didnt', "doesn't", 'doesnt',
  "won't", 'wont', "can't", 'cant', 'cannot', 'never', 'no', "isn't", 'isnt',
  "wasn't", 'wasnt', "wouldn't", 'wouldnt', "couldn't", 'couldnt',
  "shouldn't", 'shouldnt', 'without',
]);
const NEGATION_WINDOW = 3;

function tokenize(text: string): string[] {
  const lower = text.toLowerCase();
  // Strip punctuation but keep apostrophes so contractions ("don't") survive as one token.
  const cleaned = lower.replace(/[^a-z0-9'\s]/g, ' ');
  const rawTokens = cleaned.split(/\s+/).filter(Boolean);

  const tagged: string[] = [];
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

  const bigrams: string[] = [];
  for (let i = 0; i < tagged.length - 1; i++) {
    bigrams.push(`${tagged[i]}_${tagged[i + 1]}`);
  }

  return tagged.concat(bigrams);
}

export function classifyText(text: string): ClassificationResult {
  const tokens = tokenize(text);

  let logBenign = model.logPriors[0];
  let logConcern = model.logPriors[1];

  for (const token of tokens) {
    const [benignLogProb, concernLogProb] = model.wordLogProb[token] ?? model.unseenLogProb;
    logBenign += benignLogProb;
    logConcern += concernLogProb;
  }

  // Stable softmax (subtract the max before exponentiating) to turn the two class
  // log-scores into a probability without risking overflow on longer messages.
  const maxLog = Math.max(logBenign, logConcern);
  const expBenign = Math.exp(logBenign - maxLog);
  const expConcern = Math.exp(logConcern - maxLog);
  const score = expConcern / (expBenign + expConcern);

  return { score };
}
