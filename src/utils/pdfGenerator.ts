import { PDFDocument, rgb, PDFFont, PDFPage, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { AppData, Prescription, Medication } from '../types';
import { processArabicText, containsArabic } from './arabicHelper';
import { getCachedData, setCachedData } from './db';

// — CONFIGURATION —
const FONT_REGULAR_URL = 'https://cdn.jsdelivr.net/npm/@fontsource/tajawal@5.0.18/files/tajawal-arabic-400-normal.woff';
const FONT_BOLD_URL = 'https://cdn.jsdelivr.net/npm/@fontsource/tajawal@5.0.18/files/tajawal-arabic-700-normal.woff';
const FONT_FALLBACK_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Regular.ttf';
const FONT_BOLD_FALLBACK_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Bold.ttf';

const COLORS = {
  primary: rgb(0.1, 0.1, 0.1),
  secondary: rgb(0.4, 0.4, 0.4),
  accent: rgb(0, 0, 0),
  line: rgb(0.7, 0.7, 0.7),
};

// — FONT LOADING —

interface CachedFonts {
  regular: ArrayBuffer | null;
  bold: ArrayBuffer | null;
}

const cachedFonts: CachedFonts = {
  regular: null,
  bold: null,
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const fetchFont = async (primaryUrl: string, fallbackUrl: string): Promise<ArrayBuffer> => {
  try {
    const response = await fetch(primaryUrl);
    if (response.ok) {
      return await response.arrayBuffer();
    }
  } catch (e) {
    console.log('Primary font URL failed, trying fallback');
  }

  const response = await fetch(fallbackUrl);
  if (response.ok) {
    return await response.arrayBuffer();
  }

  throw new Error('Failed to load font');
};

const loadFonts = async (): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> => {
  // Check memory cache
  if (cachedFonts.regular && cachedFonts.bold) {
    return { regular: cachedFonts.regular, bold: cachedFonts.bold };
  }

  // Check IndexedDB
  try {
    const storedRegular = await getCachedData('tajawal-regular-font');
    const storedBold = await getCachedData('tajawal-bold-font');

    if (storedRegular && storedBold) {
      console.log('Fonts loaded from IndexedDB');
      cachedFonts.regular = base64ToArrayBuffer(storedRegular);
      cachedFonts.bold = base64ToArrayBuffer(storedBold);
      return { regular: cachedFonts.regular, bold: cachedFonts.bold };
    }
  } catch (e) {
    console.log('Fonts not in IndexedDB, will fetch');
  }

  // Fetch from network
  try {
    const [regularBytes, boldBytes] = await Promise.all([
      fetchFont(FONT_REGULAR_URL, FONT_FALLBACK_URL),
      fetchFont(FONT_BOLD_URL, FONT_BOLD_FALLBACK_URL),
    ]);

    cachedFonts.regular = regularBytes;
    cachedFonts.bold = boldBytes;

    // Save to IndexedDB
    try {
      await setCachedData('tajawal-regular-font', arrayBufferToBase64(regularBytes));
      await setCachedData('tajawal-bold-font', arrayBufferToBase64(boldBytes));
    } catch (e) {
      console.log('Failed to cache fonts');
    }

    return { regular: regularBytes, bold: boldBytes };
  } catch (e) {
    console.error('Failed to load fonts:', e);
    throw e;
  }
};

// — HELPERS —

const hexToPdfColor = (hex: string) => {
  if (!hex || hex.length < 4) return COLORS.primary;
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
};

const drawLine = (
  page: PDFPage,
  startX: number,
  endX: number,
  y: number,
  thickness = 1,
  color = COLORS.line,
  isDashed = false
) => {
  page.drawLine({
    start: { x: startX, y },
    end: { x: endX, y },
    thickness,
    color,
    dashArray: isDashed ? [thickness * 2, thickness * 2] : undefined
  });
};

/**
 * معالجة النص للعرض في PDF
 */
const prepareText = (text: string): string => {
  if (!text) return '';
  if (containsArabic(text)) {
    return processArabicText(text);
  }
  return text;
};

/**
 * رسم نص بسيط
 */
const drawText = (
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>
) => {
  page.drawText(text, {
    x,
    y,
    size,
    font,
    color,
  });
};

// — MAIN GENERATOR —

export const generateRxPdf = async (
  data: AppData,
  prescription: Prescription,
  currentLang: string
): Promise<Blob> => {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // تحميل الخطوط
  let regularFont: PDFFont;
  let boldFont: PDFFont;

  try {
    const fontBytes = await loadFonts();
    regularFont = await pdfDoc.embedFont(fontBytes.regular);
    boldFont = await pdfDoc.embedFont(fontBytes.bold);
  } catch (e) {
    console.error('Failed to load Arabic fonts, using fallback:', e);
    regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  }

  // إعدادات الوصفة
  const s = data.settings.rxTemplate;
  const rxConfig = s?.rxSymbol || { fontSize: 28, color: '#000000', isBold: true };
  const medsConfig = s?.medications || { fontSize: 13, color: '#000000', isBold: true };
  const headerInfoConfig = s?.headerInfo || { fontSize: 11, color: '#000000', isBold: true };
  const headerLineConfig = s?.headerLine || { color: '#000000', thickness: 1, style: 'solid' };
  const customTopMargin = s?.topMargin ?? 100;
  const paperSize = s?.paperSize || 'A5';

  // أبعاد الصفحة
  const pageDimensions: [number, number] = paperSize === 'A4' ? [595, 842] : [420, 595];
  const page = pdfDoc.addPage(pageDimensions);
  const { width, height } = page.getSize();
  const margin = 25;

  const isRTL = currentLang === 'ar' || currentLang === 'ku';

  // رسم خلفية الوصفة إن وجدت
  const bgImageBase64 = data.settings.rxBackgroundImage;

  if (bgImageBase64) {
    try {
      if (bgImageBase64.startsWith('data:application/pdf')) {
        const pdfBase64 = bgImageBase64.split(',')[1];
        const pdfBytesArray = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
        const bgPdf = await PDFDocument.load(pdfBytesArray);
        const [bgPage] = await pdfDoc.embedPdf(bgPdf, [0]);
        page.drawPage(bgPage, { x: 0, y: 0, width, height });
      } else if (bgImageBase64.startsWith('data:image/png')) {
        const bgImage = await pdfDoc.embedPng(bgImageBase64);
        page.drawImage(bgImage, { x: 0, y: 0, width, height });
      } else if (bgImageBase64.startsWith('data:image/jpeg') || bgImageBase64.startsWith('data:image/jpg')) {
        const bgImage = await pdfDoc.embedJpg(bgImageBase64);
        page.drawImage(bgImage, { x: 0, y: 0, width, height });
      }
    } catch (e) {
      console.error("Failed to load background:", e);
    }
  }

  let y = height - customTopMargin;

  // ترجمات
  const translations = {
    ar: { name: 'الاسم:', age: 'العمر:', date: 'التاريخ:' },
    ku: { name: 'ناو:', age: 'تەمەن:', date: 'بەروار:' },
    en: { name: 'Name:', age: 'Age:', date: 'Date:' }
  };

  const t = translations[currentLang as keyof typeof translations] || translations.en;
  const dateStr = new Date(prescription.date).toLocaleDateString('en-GB');

  // اختيار الخط حسب الإعداد
  const headerFont = headerInfoConfig.isBold ? boldFont : regularFont;
  const headerColor = hexToPdfColor(headerInfoConfig.color);
  const headerSize = headerInfoConfig.fontSize || 11;

  // رسم معلومات المريض
  if (isRTL) {
    // RTL Layout - من اليمين لليسار
    let xPos = width - margin;

    // الاسم
    const nameLabel = prepareText(t.name);
    const nameLabelWidth = headerFont.widthOfTextAtSize(nameLabel, headerSize);
    drawText(page, nameLabel, xPos - nameLabelWidth, y, headerFont, headerSize, headerColor);
    xPos -= nameLabelWidth + 5;

    const patientName = prepareText(prescription.patientName);
    const patientNameWidth = headerFont.widthOfTextAtSize(patientName, headerSize);
    drawText(page, patientName, xPos - patientNameWidth, y, headerFont, headerSize, headerColor);
    xPos -= patientNameWidth + 20;

    // العمر
    const ageLabel = prepareText(t.age);
    const ageLabelWidth = headerFont.widthOfTextAtSize(ageLabel, headerSize);
    drawText(page, ageLabel, xPos - ageLabelWidth, y, headerFont, headerSize, headerColor);
    xPos -= ageLabelWidth + 5;

    const ageValue = String(prescription.patientAge || '');
    const ageValueWidth = headerFont.widthOfTextAtSize(ageValue, headerSize);
    drawText(page, ageValue, xPos - ageValueWidth, y, headerFont, headerSize, headerColor);

    // التاريخ - على اليسار
    const dateLabel = prepareText(t.date);
    const dateLabelWidth = headerFont.widthOfTextAtSize(dateLabel, headerSize);
    drawText(page, dateStr, margin, y, headerFont, headerSize, headerColor);
    const dateStrWidth = headerFont.widthOfTextAtSize(dateStr, headerSize);
    drawText(page, dateLabel, margin + dateStrWidth + 5, y, headerFont, headerSize, headerColor);

    // تجنب تحذير المتغير غير المستخدم
    void dateLabelWidth;
  } else {
    // LTR Layout - من اليسار لليمين
    let xPos = margin;

    // Name
    drawText(page, t.name, xPos, y, headerFont, headerSize, headerColor);
    xPos += headerFont.widthOfTextAtSize(t.name, headerSize) + 5;

    drawText(page, prescription.patientName, xPos, y, headerFont, headerSize, headerColor);
    xPos += headerFont.widthOfTextAtSize(prescription.patientName, headerSize) + 20;

    // Age
    drawText(page, t.age, xPos, y, headerFont, headerSize, headerColor);
    xPos += headerFont.widthOfTextAtSize(t.age, headerSize) + 5;

    drawText(page, String(prescription.patientAge || ''), xPos, y, headerFont, headerSize, headerColor);

    // Date - على اليمين
    drawText(page, t.date, width - margin - 100, y, headerFont, headerSize, headerColor);
    drawText(page, dateStr, width - margin - 55, y, headerFont, headerSize, headerColor);
  }

  // خط فاصل
  y -= 15;
  drawLine(
    page,
    margin,
    width - margin,
    y,
    headerLineConfig.thickness || 1,
    hexToPdfColor(headerLineConfig.color),
    headerLineConfig.style === 'dashed'
  );

  // رمز RX
  y -= 40;
  const rxFont = rxConfig.isBold ? boldFont : regularFont;
  const rxColor = hexToPdfColor(rxConfig.color);
  const rxSize = rxConfig.fontSize || 28;

  drawText(page, 'Rx/', margin, y, rxFont, rxSize, rxColor);

  // قائمة الأدوية
  y -= 35;
  const medsFont = medsConfig.isBold ? boldFont : regularFont;
  const medsColor = hexToPdfColor(medsConfig.color);
  const medsSize = medsConfig.fontSize || 13;
  const lineHeight = medsSize * 2;

  prescription.medications.forEach((med: Medication, idx: number) => {
    // التحقق من الحاجة لصفحة جديدة
    if (y < margin + 50) {
      return;
    }

    const indexText = `${idx + 1}.`;
    let xPos = margin;

    // رقم الدواء
    drawText(page, indexText, xPos, y, boldFont, medsSize, COLORS.accent);
    xPos += boldFont.widthOfTextAtSize(indexText, medsSize) + 10;

    // اسم الدواء
    const medName = prepareText(med.name);
    drawText(page, medName, xPos, y, medsFont, medsSize, medsColor);
    const medNameWidth = medsFont.widthOfTextAtSize(medName, medsSize);
    xPos += medNameWidth + 15;

    // تفاصيل الدواء (جرعة، شكل، تكرار)
    const details: string[] = [];
    if (med.dose) details.push(med.dose);
    if (med.form) details.push(med.form);
    if (med.frequency) details.push(med.frequency);

    if (details.length > 0) {
      const detailsText = details.join(' - ');
      const processedDetails = prepareText(detailsText);
      const detailsSize = Math.max(10, medsSize - 2);

      drawText(page, processedDetails, xPos, y, regularFont, detailsSize, COLORS.secondary);
    }

    // ملاحظات الدواء
    if (med.notes) {
      y -= (medsSize + 5);
      const notesText = `(${med.notes})`;
      const processedNotes = prepareText(notesText);

      drawText(page, processedNotes, margin + 30, y, regularFont, Math.max(9, medsSize - 3), COLORS.secondary);
    }

    y -= lineHeight;
  });

  // حفظ وإرجاع PDF
  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
};
