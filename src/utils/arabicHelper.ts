/**
 * Arabic Text Processing for PDF Generation
 * يستخدم مكتبة arabic-persian-reshaper لتشكيل الحروف
 * ثم يعكس النص ليتناسب مع رسم PDF من اليسار لليمين
 */

// @ts-ignore
import ArabicReshaper from 'arabic-persian-reshaper';

/**
 * التحقق مما إذا كان الحرف عربياً
 */
export const isArabicChar = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x0600 && code <= 0x06FF) || // Arabic
    (code >= 0x0750 && code <= 0x077F) || // Arabic Supplement
    (code >= 0x08A0 && code <= 0x08FF) || // Arabic Extended-A
    (code >= 0xFB50 && code <= 0xFDFF) || // Arabic Presentation Forms-A
    (code >= 0xFE70 && code <= 0xFEFF) // Arabic Presentation Forms-B
  );
};

/**
 * التحقق مما إذا كان النص يحتوي على حروف عربية
 */
export const containsArabic = (text: string): boolean => {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
};

/**
 * التحقق مما إذا كان الحرف رقماً
 */
const isDigit = (char: string): boolean => {
  return /[0-9٠-٩]/.test(char);
};

/**
 * التحقق مما إذا كان الحرف إنجليزياً
 */
const isEnglish = (char: string): boolean => {
  return /[a-zA-Z]/.test(char);
};

/**
 * التحقق من أن الحرف محايد (رموز، مسافات، إلخ)
 */
export const isNeutral = (char: string): boolean => {
  return /[\s\-_.,;:!?()[\]{}'"/\\@#$%^&*+=<>|~`]/.test(char);
};

/**
 * عكس سلسلة نصية
 */
const reverseString = (str: string): string => {
  return str.split('').reverse().join('');
};

/**
 * معالجة النص العربي للطباعة في PDF
 * 1. تشكيل الحروف باستخدام arabic-persian-reshaper
 * 2. عكس النص ليتناسب مع آلية رسم PDF من اليسار لليمين
 */
export const processArabicText = (text: string): string => {
  if (!text) return '';

  // إذا لم يكن هناك نص عربي، أعده كما هو
  if (!containsArabic(text)) {
    return text;
  }

  try {
    // 1. تشكيل الحروف العربية (تحويلها لشكلها المتصل)
    const reshaped = ArabicReshaper.reshape(text);

    // 2. عكس النص بالكامل
    const reversed = reverseString(reshaped);

    return reversed;
  } catch (error) {
    console.error('Error processing Arabic text:', error);
    return text;
  }
};

/**
 * معالجة النصوص المختلطة (عربي + إنجليزي + أرقام)
 * يحافظ على الأرقام والكلمات الإنجليزية بالاتجاه الصحيح
 */
export const processArabicMixedText = (text: string): string => {
  if (!text) return '';

  // إذا لم يكن هناك نص عربي، أعده كما هو
  if (!containsArabic(text)) {
    return text;
  }

  try {
    // تقسيم النص إلى أجزاء: عربي، إنجليزي، أرقام، ومحايد
    const segments: { text: string; type: 'arabic' | 'english' | 'number' | 'neutral' }[] = [];
    let currentSegment = '';
    let currentType: 'arabic' | 'english' | 'number' | 'neutral' = 'neutral';

    for (const char of text) {
      let charType: 'arabic' | 'english' | 'number' | 'neutral';

      if (isArabicChar(char)) {
        charType = 'arabic';
      } else if (isEnglish(char)) {
        charType = 'english';
      } else if (isDigit(char)) {
        charType = 'number';
      } else {
        charType = 'neutral';
      }

      // إذا كان النوع مختلفاً، احفظ الجزء السابق وابدأ جزءاً جديداً
      if (charType !== currentType && currentSegment !== '') {
        // المسافات والرموز تُضاف للجزء السابق إذا كان محايداً
        if (currentType === 'neutral' && segments.length > 0) {
          segments[segments.length - 1].text += currentSegment;
        } else {
          segments.push({ text: currentSegment, type: currentType });
        }
        currentSegment = '';
      }

      currentSegment += char;
      currentType = charType;
    }

    // أضف الجزء الأخير
    if (currentSegment !== '') {
      if (currentType === 'neutral' && segments.length > 0) {
        segments[segments.length - 1].text += currentSegment;
      } else {
        segments.push({ text: currentSegment, type: currentType });
      }
    }

    // معالجة كل جزء حسب نوعه
    const processedSegments = segments.map(segment => {
      if (segment.type === 'arabic') {
        // تشكيل وعكس النص العربي
        const reshaped = ArabicReshaper.reshape(segment.text);
        return reverseString(reshaped);
      } else {
        // الإنجليزي والأرقام يبقون كما هم
        return segment.text;
      }
    });

    // عكس ترتيب الأجزاء للحصول على ترتيب RTL صحيح
    return processedSegments.reverse().join('');
  } catch (error) {
    console.error('Error processing mixed text:', error);
    return text;
  }
};

/**
 * معالجة نص بسيط (كلمة واحدة أو عبارة قصيرة بدون خلط)
 */
export const processSimpleArabic = (text: string): string => {
  if (!text || !containsArabic(text)) return text;

  try {
    const reshaped = ArabicReshaper.reshape(text);
    return reverseString(reshaped);
  } catch {
    return text;
  }
};
