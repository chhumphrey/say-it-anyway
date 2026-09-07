
import { classifyText } from './selfHarmClassifier';

export interface ScreeningResult {
  isFlagged: boolean;
  confidence: 'low' | 'medium' | 'high';
  matchedPatterns: string[];
  reason?: string;
  // Present only when the on-device classifier ran (see screenMessage below).
  modelScore?: number;
  source?: 'rules' | 'model' | 'both';
}

// Score thresholds for the on-device classifier stage. Naive Bayes scores tend to be
// overconfident/poorly calibrated, so treat these as starting points to tune against real
// usage, not precise probabilities.
const HIGH_MODEL_THRESHOLD = 0.85;
const MEDIUM_MODEL_THRESHOLD = 0.6;

// ─── Rule-based screening (regex patterns) ─────────────────────────────────────
//
// Pattern categories below are informed by two publicly available, professionally
// developed sources (used only to guide which THEMES to cover — no clinical scale wording
// is reproduced verbatim, and this is not a validated clinical instrument):
//  - The Columbia-Suicide Severity Rating Scale (C-SSRS; Posner et al., Columbia University/
//    NIMH, distributed via SAMHSA and 988lifeline.org) — its ideation severity ladder (wish
//    to be dead -> suicidal thoughts -> thoughts with method -> intent -> intent with plan)
//    and its separate "self-injury behavior w/o suicide intent" category.
//  - CDC/SAMHSA public suicide warning signs (talking about wanting to die, feeling
//    hopeless, feeling like a burden, feeling trapped).
const runRuleBasedScreening = (text: string): ScreeningResult => {
  // Handle empty or very short text
  if (!text || text.trim().length < 3) {
    console.log('Text too short to screen');
    return {
      isFlagged: false,
      confidence: 'low',
      matchedPatterns: [],
      reason: 'Text too short to analyze'
    };
  }

  const lowerText = text.toLowerCase().trim();
  const matchedPatterns: string[] = [];
  let confidence: 'low' | 'medium' | 'high' = 'low';

  console.log('Screening message:', lowerText.substring(0, 100) + '...');

  // Check for first-person pronouns to ensure it's about the user
  const firstPersonPronouns = /\b(i|i'm|i am|i've|i have|i'd|i would|i'll|i will|my|me|myself)\b/gi;
  const hasFirstPerson = firstPersonPronouns.test(lowerText);

  // High-risk patterns - immediate concern
  const highRiskPatterns = [
    {
      pattern: /\b(want to|going to|plan to|planning to|thinking about|thought about).{0,20}(kill myself|end my life|take my life|die|suicide)\b/i,
      weight: 'high' as const,
      description: 'Suicidal ideation with intent'
    },
    {
      pattern: /\b(i|i'm|i am).{0,20}(going to|want to|planning to).{0,20}(kill myself|end my life|take my life|commit suicide)\b/i,
      weight: 'high' as const,
      description: 'Direct suicidal statement'
    },
    {
      pattern: /\b(can't|cannot|can not).{0,20}(go on|take it|do this|live like this).{0,20}(anymore|any longer|any more)\b/i,
      weight: 'high' as const,
      description: 'Expression of inability to continue'
    },
    {
      pattern: /\b(better off|world would be better).{0,20}(without me|if i was|if i were).{0,20}(dead|gone)\b/i,
      weight: 'high' as const,
      description: 'Belief that others would be better off'
    },
    {
      pattern: /\b(i|i'm|i am).{0,20}(ready to|prepared to|about to).{0,20}(end it|die|kill myself)\b/i,
      weight: 'high' as const,
      description: 'Imminent suicidal intent'
    },
    {
      pattern: /\b(goodbye|farewell).{0,30}(forever|for good|won't see you|last time)\b/i,
      weight: 'high' as const,
      description: 'Farewell message indicating finality'
    },
    {
      pattern: /\b(i|i'm|i am).{0,20}(know|figured out|worked out).{0,20}how.{0,20}(i'd|i would|to).{0,20}(do it|end my life|kill myself)\b/i,
      weight: 'high' as const,
      description: 'Suicidal ideation with method (C-SSRS: thoughts with method)'
    },
    {
      pattern: /\b(i|i'm|i am).{0,20}(want to|going to|need to).{0,20}(hurt|cut|burn).{0,20}myself\b/i,
      weight: 'high' as const,
      description: 'Intent to self-injure'
    },
    {
      pattern: /\b(i|i'm|i am).{0,20}(can't stop|couldn't stop|keep).{0,20}(cutting|hurting|burning).{0,20}myself\b/i,
      weight: 'high' as const,
      description: 'Escalating self-injury behavior'
    },
  ];

  // Medium-risk patterns - significant concern
  const mediumRiskPatterns = [
    {
      pattern: /\b(i|i'm|i am).{0,30}(hopeless|worthless|useless|burden|pointless)\b/i,
      weight: 'medium' as const,
      description: 'Feelings of hopelessness or worthlessness'
    },
    {
      pattern: /\b(no reason|nothing).{0,20}(to live|worth living|to go on)\b/i,
      weight: 'medium' as const,
      description: 'Loss of purpose or meaning'
    },
    {
      pattern: /\b(i|i'm|i am).{0,20}(so|very|extremely).{0,20}(depressed|sad|alone|lonely|empty)\b/i,
      weight: 'medium' as const,
      description: 'Severe emotional distress'
    },
    {
      pattern: /\b(wish|wished).{0,20}(i was|i were|i could be).{0,20}(dead|gone|not here)\b/i,
      weight: 'medium' as const,
      description: 'Passive suicidal ideation (C-SSRS: wish to be dead)'
    },
    {
      pattern: /\b(everyone|everybody).{0,20}(would be|be).{0,20}(better off|happier).{0,20}without me\b/i,
      weight: 'medium' as const,
      description: 'Belief of being a burden'
    },
    {
      pattern: /\b(i|i'm|i am).{0,20}(giving up|done trying|can't fight|tired of fighting)\b/i,
      weight: 'medium' as const,
      description: 'Expression of giving up'
    },
    {
      pattern: /\b(i|i'm|i am).{0,20}(not worth|don't deserve).{0,20}(living|life|to live)\b/i,
      weight: 'medium' as const,
      description: 'Self-worth concerns'
    },
    {
      pattern: /\b(i|i'm|i am).{0,20}(trapped|stuck|no way out|no escape)\b/i,
      weight: 'medium' as const,
      description: 'Feeling trapped or hopeless'
    },
    {
      pattern: /\bi (cut|scratched|burned|burnt|hit) myself\b/i,
      weight: 'medium' as const,
      description: 'Self-injury disclosure (C-SSRS: self-injury behavior w/o suicide intent)'
    },
    {
      pattern: /\b(i|i'm|i am|i've|i have).{0,20}(been|started).{0,20}(cutting|burning) (myself|my arm|my skin)\b/i,
      weight: 'medium' as const,
      description: 'Self-injury behavior (C-SSRS: self-injury behavior w/o suicide intent)'
    },
  ];

  // Low-risk patterns - mild concern, but worth noting
  const lowRiskPatterns = [
    {
      pattern: /\b(i|i'm|i am).{0,30}(struggling|hurting|in pain|suffering)\b/i,
      weight: 'low' as const,
      description: 'Expression of struggle or pain'
    },
    {
      pattern: /\b(i|i'm|i am).{0,20}(not okay|not ok|not doing well)\b/i,
      weight: 'low' as const,
      description: 'Acknowledgment of distress'
    },
    {
      pattern: /\b(i|i'm|i am).{0,20}(lost|confused|scared|afraid)\b/i,
      weight: 'low' as const,
      description: 'Emotional vulnerability'
    },
    {
      pattern: /\b(i|i'm|i am).{0,20}(overwhelmed|can't cope|breaking down)\b/i,
      weight: 'low' as const,
      description: 'Feeling overwhelmed'
    },
  ];

  // Exclusion patterns - things that sound concerning but aren't about the user
  const exclusionPatterns = [
    /\b(he|she|they|them|someone|people|person).{0,30}(kill|suicide|hurt|harm|died|dead)\b/i,
    /\b(movie|book|show|story|news|article).{0,30}(suicide|death|kill|died)\b/i,
    /\b(heard|read|saw|watched).{0,30}(someone|person).{0,30}(suicide|kill|died)\b/i,
    /\b(character|actor|celebrity).{0,30}(died|dead|suicide)\b/i,
  ];

  // Check exclusion patterns first
  for (const exclusion of exclusionPatterns) {
    if (exclusion.test(lowerText)) {
      console.log('Message excluded - appears to be about someone else');
      return {
        isFlagged: false,
        confidence: 'low',
        matchedPatterns: [],
        reason: 'Content appears to be about someone else, not the user'
      };
    }
  }

  // If no first-person pronouns, it's likely not about the user
  if (!hasFirstPerson) {
    console.log('No first-person pronouns detected - likely not about user');
    return {
      isFlagged: false,
      confidence: 'low',
      matchedPatterns: [],
      reason: 'No first-person language detected'
    };
  }

  // Check high-risk patterns
  for (const { pattern, weight, description } of highRiskPatterns) {
    if (pattern.test(lowerText)) {
      matchedPatterns.push(`HIGH RISK: ${description}`);
      confidence = 'high';
      console.log('High-risk pattern matched:', description);
    }
  }

  // Check medium-risk patterns
  for (const { pattern, weight, description } of mediumRiskPatterns) {
    if (pattern.test(lowerText)) {
      matchedPatterns.push(`MEDIUM RISK: ${description}`);
      if (confidence !== 'high') {
        confidence = 'medium';
      }
      console.log('Medium-risk pattern matched:', description);
    }
  }

  // Check low-risk patterns
  for (const { pattern, weight, description } of lowRiskPatterns) {
    if (pattern.test(lowerText)) {
      matchedPatterns.push(`LOW RISK: ${description}`);
      console.log('Low-risk pattern matched:', description);
    }
  }

  // Flag if we have high or medium confidence matches
  const isFlagged = matchedPatterns.length > 0 && (confidence === 'high' || confidence === 'medium');

  if (isFlagged) {
    console.log('MESSAGE FLAGGED FOR MENTAL HEALTH CONCERNS');
    console.log('Confidence:', confidence);
    console.log('Matched patterns:', matchedPatterns);
  } else if (matchedPatterns.length > 0) {
    console.log('Low-risk patterns detected but not flagged');
  } else {
    console.log('No concerning patterns detected');
  }

  return {
    isFlagged,
    confidence,
    matchedPatterns,
    reason: isFlagged ? `Detected ${confidence}-risk mental health concerns` : undefined,
  };
};

// ─── Hybrid screening (rules first, on-device classifier for ambiguous cases) ──────
//
// This is a supplementary heuristic layer, NOT a validated clinical screening tool. The
// classifier's training data was hand-authored, not sourced from a validated crisis-text
// corpus, and has not been reviewed by a mental health professional -- see
// data/README.md for details and caveats.
//
// Combination rule: the classifier can only ADD a flag or RAISE confidence, never remove
// or lower what the rules already found. A missed signal is worse than an extra nudge
// toward support resources, so rules-plus-model is deliberately biased toward flagging.
export const screenMessage = (text: string): ScreeningResult => {
  const ruleResult = runRuleBasedScreening(text);

  // Rules are already confident on their own -- trust them and skip the model. A match
  // this strong is explainable as-is; there's no upside to a second, less transparent
  // opinion, and it saves the (small but nonzero) cost of running the classifier.
  if (ruleResult.confidence === 'high') {
    return { ...ruleResult, source: 'rules' };
  }

  // Otherwise the rules found nothing, or only a low/medium signal -- exactly where a
  // hand-written pattern list is weakest (novel phrasing, no matching regex). Run the
  // on-device classifier as a second opinion.
  let modelScore: number;
  try {
    modelScore = classifyText(text).score;
  } catch (err) {
    console.warn('mentalHealthScreening: classifier failed, falling back to rules only', err);
    return { ...ruleResult, source: 'rules' };
  }

  console.log('mentalHealthScreening: classifier score', modelScore.toFixed(3));

  let modelConfidence: 'low' | 'medium' | 'high' | null = null;
  if (modelScore >= HIGH_MODEL_THRESHOLD) {
    modelConfidence = 'high';
  } else if (modelScore >= MEDIUM_MODEL_THRESHOLD) {
    modelConfidence = 'medium';
  }

  if (!modelConfidence) {
    // Model doesn't see anything concerning either; go with whatever the rules decided.
    return { ...ruleResult, modelScore, source: 'rules' };
  }

  const rank = { low: 0, medium: 1, high: 2 } as const;
  const finalConfidence =
    rank[modelConfidence] > rank[ruleResult.confidence] ? modelConfidence : ruleResult.confidence;
  const matchedPatterns = [
    ...ruleResult.matchedPatterns,
    `MODEL: possible concern (score=${modelScore.toFixed(2)})`,
  ];
  const isFlagged = ruleResult.isFlagged || finalConfidence === 'high' || finalConfidence === 'medium';

  const combined: ScreeningResult = {
    isFlagged,
    confidence: finalConfidence,
    matchedPatterns,
    reason: isFlagged ? `Detected ${finalConfidence}-risk mental health concerns` : undefined,
    modelScore,
    source: ruleResult.matchedPatterns.length > 0 ? 'both' : 'model',
  };

  if (isFlagged) {
    console.log('MESSAGE FLAGGED BY CLASSIFIER:', combined);
  }

  return combined;
};

// Helper function to test the screening with sample messages
export const testScreening = () => {
  const testMessages = [
    // Regex-covered cases (unchanged from before)
    "I'm thinking about ending my life",
    "I can't go on anymore",
    "Everyone would be better off without me",
    "I'm feeling really hopeless today",
    "I'm struggling with everything",
    "I miss you so much grandma",
    "The movie character committed suicide",
    "He killed himself yesterday",
    // New: self-injury coverage (previously undetected by any pattern)
    "I've been cutting myself again this week",
    "I want to hurt myself right now",
    // New: phrasing the regex patterns don't cover, meant to exercise the classifier
    "Nothing matters anymore and I don't see the point of tomorrow",
    "I keep thinking the world would just move on fine without me in it",
    "I've started giving away my things, people won't need to deal with them later",
    // New: known false-positive traps for the classifier (hyperbole, negation, protective factors)
    "This traffic is actually going to kill me, I've been sitting here an hour",
    "I used to think about not being here anymore, but I don't feel that way now",
    "I'm having a hard week but my kids give me a reason to keep going",
  ];

  console.log('=== MENTAL HEALTH SCREENING TESTS ===');
  testMessages.forEach((msg, index) => {
    console.log(`\nTest ${index + 1}: "${msg}"`);
    const result = screenMessage(msg);
    console.log('Result:', result);
  });
};
