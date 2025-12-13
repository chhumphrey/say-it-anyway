
export interface ScreeningResult {
  isFlagged: boolean;
  confidence: 'low' | 'medium' | 'high';
  matchedPatterns: string[];
}

export const screenMessage = (text: string): ScreeningResult => {
  const lowerText = text.toLowerCase();
  const matchedPatterns: string[] = [];
  let confidence: 'low' | 'medium' | 'high' = 'low';

  const firstPersonPronouns = /\b(i|i'm|i am|i've|i have|i'd|i would|i'll|i will|my|me|myself)\b/gi;
  const hasFirstPerson = firstPersonPronouns.test(lowerText);

  const highRiskPatterns = [
    { pattern: /\b(want to|going to|plan to|planning to|thinking about|thought about).{0,20}(kill myself|end my life|take my life|die|suicide)\b/i, weight: 'high' as const },
    { pattern: /\b(i|i'm|i am).{0,20}(going to|want to|planning to).{0,20}(kill myself|end my life|take my life|commit suicide)\b/i, weight: 'high' as const },
    { pattern: /\b(can't|cannot|can not).{0,20}(go on|take it|do this|live like this).{0,20}(anymore|any longer|any more)\b/i, weight: 'high' as const },
    { pattern: /\b(better off|world would be better).{0,20}(without me|if i was|if i were).{0,20}(dead|gone)\b/i, weight: 'high' as const },
  ];

  const mediumRiskPatterns = [
    { pattern: /\b(i|i'm|i am).{0,30}(hopeless|worthless|useless|burden|pointless)\b/i, weight: 'medium' as const },
    { pattern: /\b(no reason|nothing).{0,20}(to live|worth living|to go on)\b/i, weight: 'medium' as const },
    { pattern: /\b(i|i'm|i am).{0,20}(so|very|extremely).{0,20}(depressed|sad|alone|lonely|empty)\b/i, weight: 'medium' as const },
    { pattern: /\b(wish|wished).{0,20}(i was|i were|i could be).{0,20}(dead|gone|not here)\b/i, weight: 'medium' as const },
    { pattern: /\b(everyone|everybody).{0,20}(would be|be).{0,20}(better off|happier).{0,20}without me\b/i, weight: 'medium' as const },
  ];

  const lowRiskPatterns = [
    { pattern: /\b(i|i'm|i am).{0,30}(struggling|hurting|in pain|suffering)\b/i, weight: 'low' as const },
    { pattern: /\b(i|i'm|i am).{0,20}(not okay|not ok|not doing well)\b/i, weight: 'low' as const },
    { pattern: /\b(i|i'm|i am).{0,20}(lost|confused|scared|afraid)\b/i, weight: 'low' as const },
  ];

  const exclusionPatterns = [
    /\b(he|she|they|them|someone|people).{0,30}(kill|suicide|hurt|harm)\b/i,
    /\b(movie|book|show|story|news).{0,30}(suicide|death|kill)\b/i,
    /\b(heard|read|saw).{0,30}(someone|person).{0,30}(suicide|kill)\b/i,
  ];

  for (const exclusion of exclusionPatterns) {
    if (exclusion.test(lowerText)) {
      return { isFlagged: false, confidence: 'low', matchedPatterns: [] };
    }
  }

  if (!hasFirstPerson) {
    return { isFlagged: false, confidence: 'low', matchedPatterns: [] };
  }

  for (const { pattern, weight } of highRiskPatterns) {
    if (pattern.test(lowerText)) {
      matchedPatterns.push(`High risk: ${pattern.source.substring(0, 50)}...`);
      confidence = 'high';
    }
  }

  for (const { pattern, weight } of mediumRiskPatterns) {
    if (pattern.test(lowerText)) {
      matchedPatterns.push(`Medium risk: ${pattern.source.substring(0, 50)}...`);
      if (confidence !== 'high') {
        confidence = 'medium';
      }
    }
  }

  for (const { pattern, weight } of lowRiskPatterns) {
    if (pattern.test(lowerText)) {
      matchedPatterns.push(`Low risk: ${pattern.source.substring(0, 50)}...`);
    }
  }

  const isFlagged = matchedPatterns.length > 0 && (confidence === 'high' || confidence === 'medium');

  return {
    isFlagged,
    confidence,
    matchedPatterns,
  };
};
