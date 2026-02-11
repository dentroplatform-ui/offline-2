export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Arabic text shaping for PDF rendering - Complete Fixed version
// This handles the proper shaping and ordering for PDF rendering
export const processArabicText = (text: string): string => {
  if (!text) return '';

  // Check if text contains Arabic characters
  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
  if (!hasArabic) return text;

  // Character forms: [isolated, initial, medial, final]
  const arabicForms: Record<string, string[]> = {
    'ا': ['ﺍ', 'ﺍ', 'ﺎ', 'ﺎ'],
    'أ': ['ﺃ', 'ﺃ', 'ﺄ', 'ﺄ'],
    'إ': ['ﺇ', 'ﺇ', 'ﺈ', 'ﺈ'],
    'آ': ['ﺁ', 'ﺁ', 'ﺂ', 'ﺂ'],
    'ب': ['ﺏ', 'ﺑ', 'ﺒ', 'ﺐ'],
    'ت': ['ﺕ', 'ﺗ', 'ﺘ', 'ﺖ'],
    'ث': ['ﺙ', 'ﺛ', 'ﺜ', 'ﺚ'],
    'ج': ['ﺝ', 'ﺟ', 'ﺠ', 'ﺞ'],
    'ح': ['ﺡ', 'ﺣ', 'ﺤ', 'ﺢ'],
    'خ': ['ﺥ', 'ﺧ', 'ﺨ', 'ﺦ'],
    'د': ['ﺩ', 'ﺩ', 'ﺪ', 'ﺪ'],
    'ذ': ['ﺫ', 'ﺫ', 'ﺬ', 'ﺬ'],
    'ر': ['ﺭ', 'ﺭ', 'ﺮ', 'ﺮ'],
    'ز': ['ﺯ', 'ﺯ', 'ﺰ', 'ﺰ'],
    'س': ['ﺱ', 'ﺳ', 'ﺴ', 'ﺲ'],
    'ش': ['ﺵ', 'ﺷ', 'ﺸ', 'ﺶ'],
    'ص': ['ﺹ', 'ﺻ', 'ﺼ', 'ﺺ'],
    'ض': ['ﺽ', 'ﺿ', 'ﻀ', 'ﺾ'],
    'ط': ['ﻁ', 'ﻃ', 'ﻄ', 'ﻂ'],
    'ظ': ['ﻅ', 'ﻇ', 'ﻈ', 'ﻆ'],
    'ع': ['ﻉ', 'ﻋ', 'ﻌ', 'ﻊ'],
    'غ': ['ﻍ', 'ﻏ', 'ﻐ', 'ﻎ'],
    'ف': ['ﻑ', 'ﻓ', 'ﻔ', 'ﻒ'],
    'ق': ['ﻕ', 'ﻗ', 'ﻘ', 'ﻖ'],
    'ك': ['ﻙ', 'ﻛ', 'ﻜ', 'ﻚ'],
    'ل': ['ﻝ', 'ﻟ', 'ﻠ', 'ﻞ'],
    'م': ['ﻡ', 'ﻣ', 'ﻤ', 'ﻢ'],
    'ن': ['ﻥ', 'ﻧ', 'ﻨ', 'ﻦ'],
    'ه': ['ﻩ', 'ﻫ', 'ﻬ', 'ﻪ'],
    'و': ['ﻭ', 'ﻭ', 'ﻮ', 'ﻮ'],
    'ي': ['ﻱ', 'ﻳ', 'ﻴ', 'ﻲ'],
    'ى': ['ﻯ', 'ﻯ', 'ﻰ', 'ﻰ'],
    'ة': ['ﺓ', 'ﺓ', 'ﺔ', 'ﺔ'],
    'ئ': ['ﺉ', 'ﺋ', 'ﺌ', 'ﺊ'],
    'ء': ['ء', 'ء', 'ء', 'ء'],
    'ؤ': ['ﺅ', 'ﺅ', 'ﺆ', 'ﺆ'],
    'لا': ['ﻻ', 'ﻻ', 'ﻼ', 'ﻼ'],
    'لأ': ['ﻷ', 'ﻷ', 'ﻸ', 'ﻸ'],
    'لإ': ['ﻹ', 'ﻹ', 'ﻺ', 'ﻺ'],
    'لآ': ['ﻵ', 'ﻵ', 'ﻶ', 'ﻶ'],
    // Kurdish characters
    'ک': ['ک', 'ﮐ', 'ﮑ', 'ﮏ'],
    'گ': ['گ', 'ﮔ', 'ﮕ', 'ﮓ'],
    'پ': ['پ', 'ﭘ', 'ﭙ', 'ﭗ'],
    'چ': ['چ', 'ﭼ', 'ﭽ', 'ﭻ'],
    'ژ': ['ژ', 'ژ', 'ﮋ', 'ﮋ'],
    'ڤ': ['ڤ', 'ﭬ', 'ﭭ', 'ﭫ'],
    'ڵ': ['ڵ', 'ڵ', 'ڵ', 'ڵ'],
    'ڕ': ['ڕ', 'ڕ', 'ڕ', 'ڕ'],
    'ێ': ['ێ', 'ێ', 'ێ', 'ێ'],
    'ۆ': ['ۆ', 'ۆ', 'ۆ', 'ۆ'],
    'ۊ': ['ۊ', 'ۊ', 'ۊ', 'ۊ'],
  };

  // Characters that don't connect to the next letter
  const nonJoinersRight = new Set(['ا', 'أ', 'إ', 'آ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ة', 'ء', 'ى', 'ژ', 'ۆ', 'ڕ']);

  const isArabicChar = (char: string) => arabicForms[char] !== undefined;
  const canJoinRight = (char: string) => isArabicChar(char) && !nonJoinersRight.has(char);

  const chars = [...text];
  let result = '';

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    // Check for Lam-Alef combinations
    if (char === 'ل' && chars[i + 1]) {
      const next = chars[i + 1];
      const combo = char + next;
      if (arabicForms[combo]) {
        const prevChar = chars[i - 1];
        const prevCanJoin = prevChar && canJoinRight(prevChar);
        const formIndex = prevCanJoin ? 2 : 0; // medial or isolated
        result += arabicForms[combo][formIndex];
        i++; // Skip next char
        continue;
      }
    }

    const forms = arabicForms[char];

    if (!forms) {
      result += char;
      continue;
    }

    const prevChar = chars[i - 1];
    const nextChar = chars[i + 1];

    const prevCanJoin = prevChar && canJoinRight(prevChar);
    const nextIsArabic = nextChar && isArabicChar(nextChar);

    let formIndex = 0; // isolated
    if (prevCanJoin && nextIsArabic) {
      formIndex = 2; // medial
    } else if (prevCanJoin) {
      formIndex = 3; // final
    } else if (nextIsArabic) {
      formIndex = 1; // initial
    }

    result += forms[formIndex];
  }

  // DO NOT REVERSE - PDF-lib handles the text positioning, we just need proper shaping
  // The reversal was causing the text to appear backwards
  return result;
};

// Process mixed text (Arabic and Latin) for PDF
export const processMixedText = (text: string): { segments: Array<{ text: string; isRTL: boolean }> } => {
  if (!text) return { segments: [] };

  const segments: Array<{ text: string; isRTL: boolean }> = [];
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g;

  let lastIndex = 0;
  let match;

  while ((match = arabicRegex.exec(text)) !== null) {
    // Add non-Arabic text before this match
    if (match.index > lastIndex) {
      const latinText = text.slice(lastIndex, match.index);
      if (latinText.trim()) {
        segments.push({ text: latinText, isRTL: false });
      }
    }

    // Add Arabic text
    segments.push({ text: match[0], isRTL: true });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining non-Arabic text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining.trim()) {
      segments.push({ text: remaining, isRTL: false });
    }
  }

  return { segments };
};
