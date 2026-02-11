import { useState, useEffect, useCallback } from 'react';

export interface Theme {
  id: string;
  name: string;
  nameAr: string;
  nameKu: string;
  colors: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundDark: string;
    surface: string;
    surfaceDark: string;
    text: string;
    textDark: string;
    border: string;
    borderDark: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    nameAr: 'أزرق المحيط',
    nameKu: 'شینی دەریا',
    colors: {
      primary: '#4f46e5',
      primaryHover: '#4338ca',
      primaryLight: '#eef2ff',
      secondary: '#7c3aed',
      accent: '#06b6d4',
      background: '#f8fafc',
      backgroundDark: '#0f172a',
      surface: '#ffffff',
      surfaceDark: '#1e293b',
      text: '#1e293b',
      textDark: '#f1f5f9',
      border: '#e2e8f0',
      borderDark: '#334155',
    },
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    nameAr: 'أخضر الغابة',
    nameKu: 'سەوزی دارستان',
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      primaryLight: '#ecfdf5',
      secondary: '#10b981',
      accent: '#14b8a6',
      background: '#f0fdf4',
      backgroundDark: '#022c22',
      surface: '#ffffff',
      surfaceDark: '#064e3b',
      text: '#064e3b',
      textDark: '#d1fae5',
      border: '#d1fae5',
      borderDark: '#065f46',
    },
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    nameAr: 'برتقالي الغروب',
    nameKu: 'پرتەقاڵی ڕۆژئاوا',
    colors: {
      primary: '#ea580c',
      primaryHover: '#c2410c',
      primaryLight: '#fff7ed',
      secondary: '#f97316',
      accent: '#fb923c',
      background: '#fffbeb',
      backgroundDark: '#431407',
      surface: '#ffffff',
      surfaceDark: '#7c2d12',
      text: '#7c2d12',
      textDark: '#fed7aa',
      border: '#fed7aa',
      borderDark: '#9a3412',
    },
  },
  {
    id: 'purple-dreams',
    name: 'Purple Dreams',
    nameAr: 'أحلام بنفسجية',
    nameKu: 'خەونی مۆر',
    colors: {
      primary: '#7c3aed',
      primaryHover: '#6d28d9',
      primaryLight: '#f5f3ff',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      background: '#faf5ff',
      backgroundDark: '#1e1033',
      surface: '#ffffff',
      surfaceDark: '#2e1065',
      text: '#2e1065',
      textDark: '#e9d5ff',
      border: '#e9d5ff',
      borderDark: '#4c1d95',
    },
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    nameAr: 'ذهبي وردي',
    nameKu: 'ئاڵتونی سوور',
    colors: {
      primary: '#e11d48',
      primaryHover: '#be123c',
      primaryLight: '#fff1f2',
      secondary: '#f43f5e',
      accent: '#fb7185',
      background: '#fdf2f8',
      backgroundDark: '#500724',
      surface: '#ffffff',
      surfaceDark: '#881337',
      text: '#881337',
      textDark: '#fecdd3',
      border: '#fecdd3',
      borderDark: '#9f1239',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    nameAr: 'منتصف الليل',
    nameKu: 'نیوەشەو',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryLight: '#eff6ff',
      secondary: '#6366f1',
      accent: '#818cf8',
      background: '#0f172a',
      backgroundDark: '#020617',
      surface: '#1e293b',
      surfaceDark: '#0f172a',
      text: '#e2e8f0',
      textDark: '#f1f5f9',
      border: '#334155',
      borderDark: '#1e293b',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald',
    nameAr: 'زمردي',
    nameKu: 'زومرد',
    colors: {
      primary: '#10b981',
      primaryHover: '#059669',
      primaryLight: '#d1fae5',
      secondary: '#34d399',
      accent: '#6ee7b7',
      background: '#ecfdf5',
      backgroundDark: '#022c22',
      surface: '#ffffff',
      surfaceDark: '#064e3b',
      text: '#064e3b',
      textDark: '#a7f3d0',
      border: '#a7f3d0',
      borderDark: '#047857',
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    nameAr: 'الساعة الذهبية',
    nameKu: 'کاتژمێری ئاڵتونی',
    colors: {
      primary: '#d97706',
      primaryHover: '#b45309',
      primaryLight: '#fffbeb',
      secondary: '#f59e0b',
      accent: '#fbbf24',
      background: '#fffbeb',
      backgroundDark: '#451a03',
      surface: '#ffffff',
      surfaceDark: '#78350f',
      text: '#78350f',
      textDark: '#fde68a',
      border: '#fde68a',
      borderDark: '#92400e',
    },
  },
  {
    id: 'arctic',
    name: 'Arctic',
    nameAr: 'قطبي',
    nameKu: 'قوتبی',
    colors: {
      primary: '#0ea5e9',
      primaryHover: '#0284c7',
      primaryLight: '#e0f2fe',
      secondary: '#38bdf8',
      accent: '#7dd3fc',
      background: '#f0f9ff',
      backgroundDark: '#0c4a6e',
      surface: '#ffffff',
      surfaceDark: '#075985',
      text: '#0c4a6e',
      textDark: '#bae6fd',
      border: '#bae6fd',
      borderDark: '#0369a1',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender Fields',
    nameAr: 'حقول اللافندر',
    nameKu: 'کێڵگەی لاڤەندەر',
    colors: {
      primary: '#a855f7',
      primaryHover: '#9333ea',
      primaryLight: '#faf5ff',
      secondary: '#c084fc',
      accent: '#d8b4fe',
      background: '#fdf4ff',
      backgroundDark: '#3b0764',
      surface: '#ffffff',
      surfaceDark: '#581c87',
      text: '#581c87',
      textDark: '#e9d5ff',
      border: '#e9d5ff',
      borderDark: '#6b21a8',
    },
  },
  {
    id: 'coral',
    name: 'Coral Reef',
    nameAr: 'الشعاب المرجانية',
    nameKu: 'پەیتی مەرجان',
    colors: {
      primary: '#f43f5e',
      primaryHover: '#e11d48',
      primaryLight: '#fff1f2',
      secondary: '#fb7185',
      accent: '#fda4af',
      background: '#fff1f2',
      backgroundDark: '#4c0519',
      surface: '#ffffff',
      surfaceDark: '#881337',
      text: '#881337',
      textDark: '#fecdd3',
      border: '#fecdd3',
      borderDark: '#9f1239',
    },
  },
  {
    id: 'slate',
    name: 'Slate Gray',
    nameAr: 'رمادي أردوازي',
    nameKu: 'خۆڵەمێشی',
    colors: {
      primary: '#475569',
      primaryHover: '#334155',
      primaryLight: '#f1f5f9',
      secondary: '#64748b',
      accent: '#94a3b8',
      background: '#f8fafc',
      backgroundDark: '#0f172a',
      surface: '#ffffff',
      surfaceDark: '#1e293b',
      text: '#1e293b',
      textDark: '#cbd5e1',
      border: '#cbd5e1',
      borderDark: '#334155',
    },
  },
  {
    id: 'mint',
    name: 'Mint Fresh',
    nameAr: 'نعناع منعش',
    nameKu: 'پوونەی تازە',
    colors: {
      primary: '#14b8a6',
      primaryHover: '#0d9488',
      primaryLight: '#ccfbf1',
      secondary: '#2dd4bf',
      accent: '#5eead4',
      background: '#f0fdfa',
      backgroundDark: '#042f2e',
      surface: '#ffffff',
      surfaceDark: '#134e4a',
      text: '#134e4a',
      textDark: '#99f6e4',
      border: '#99f6e4',
      borderDark: '#0f766e',
    },
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    nameAr: 'زهر الكرز',
    nameKu: 'گوڵی گێلاس',
    colors: {
      primary: '#ec4899',
      primaryHover: '#db2777',
      primaryLight: '#fdf2f8',
      secondary: '#f472b6',
      accent: '#f9a8d4',
      background: '#fdf2f8',
      backgroundDark: '#500724',
      surface: '#ffffff',
      surfaceDark: '#831843',
      text: '#831843',
      textDark: '#fbcfe8',
      border: '#fbcfe8',
      borderDark: '#9d174d',
    },
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    nameAr: 'الفضاء العميق',
    nameKu: 'ئاسمانی قووڵ',
    colors: {
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      primaryLight: '#e0e7ff',
      secondary: '#818cf8',
      accent: '#a5b4fc',
      background: '#030712',
      backgroundDark: '#030712',
      surface: '#111827',
      surfaceDark: '#030712',
      text: '#e5e7eb',
      textDark: '#f3f4f6',
      border: '#1f2937',
      borderDark: '#111827',
    },
  },
];

const THEME_STORAGE_KEY = 'dentro-theme';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem(THEME_STORAGE_KEY);
      return themes.find(t => t.id === savedId) || themes[0];
    }
    return themes[0];
  });

  // تطبيق الثيم على CSS Variables
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const colors = currentTheme.colors;

    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-primary-hover', colors.primaryHover);
    root.style.setProperty('--theme-primary-light', colors.primaryLight);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-background-dark', colors.backgroundDark);
    root.style.setProperty('--theme-surface', colors.surface);
    root.style.setProperty('--theme-surface-dark', colors.surfaceDark);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-text-dark', colors.textDark);
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-border-dark', colors.borderDark);

    // تطبيق ألوان الخلفية على body
    const isDark = root.classList.contains('dark');
    if (isDark) {
      body.style.backgroundColor = colors.backgroundDark;
    } else {
      body.style.backgroundColor = colors.background;
    }

    localStorage.setItem(THEME_STORAGE_KEY, currentTheme.id);
  }, [currentTheme]);

  const setTheme = useCallback((themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  }, []);

  return {
    currentTheme,
    setTheme,
    themes,
  };
};
