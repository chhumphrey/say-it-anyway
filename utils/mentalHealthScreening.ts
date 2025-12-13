
export interface ScreeningResult {
  isFlagged: boolean;
  confidence: 'low' | 'medium' | 'high';
  matchedPatterns: string[];
  reason?: string;
}

export const screenMessage = (text: string): ScreeningResult => {
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
      description: 'Passive suicidal ideation'
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

// Helper function to test the screening with sample messages
export const testScreening = () => {
  const testMessages = [
    "I'm thinking about ending my life",
    "I can't go on anymore",
    "Everyone would be better off without me",
    "I'm feeling really hopeless today",
    "I'm struggling with everything",
    "I miss you so much grandma",
    "The movie character committed suicide",
    "He killed himself yesterday",
  ];

  console.log('=== MENTAL HEALTH SCREENING TESTS ===');
  testMessages.forEach((msg, index) => {
    console.log(`\nTest ${index + 1}: "${msg}"`);
    const result = screenMessage(msg);
    console.log('Result:', result);
  });
};
