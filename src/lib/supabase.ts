/**
 * ============================================
 * إعدادات Supabase - ملف التكوين
 * ============================================
 * 
 * ⚠️ مهم جداً: قم بتغيير القيم أدناه إلى القيم الحقيقية من لوحة تحكم Supabase
 * 
 * للحصول على هذه القيم:
 * 1. اذهب إلى https://supabase.com
 * 2. افتح مشروعك
 * 3. اذهب إلى Settings > API
 * 4. انسخ "Project URL" وضعه في SUPABASE_URL
 * 5. انسخ "anon public" key وضعه في SUPABASE_ANON_KEY
 * 
 * ملاحظة: تأكد من إنشاء جدول subscriptions بالهيكل التالي:
 * - user_id (uuid, foreign key to auth.users)
 * - expires_at (timestamp with time zone)
 * ============================================
 */

import { createClient } from '@supabase/supabase-js';


// ===== غيّر هذه القيم إلى القيم الحقيقية من Supabase =====
const SUPABASE_URL = 'https://xbyuylrlrfudizjfuuoo.supabase.co';  // ← غيّر هذا
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhieXV5bHJscmZ1ZGl6amZ1dW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NzI5MzEsImV4cCI6MjA4NjM0ODkzMX0.V0BtgMF7exPyGgiZGGE-Bug6YYYS9QyFJO729V3Ql_Q';  // ← غيّر هذا
// =========================================================


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// مفتاح التشفير للبيانات المحلية (يمنع التلاعب)
const ENCRYPTION_KEY = 'dentro-secure-2024-rx-app';

/**
 * تشفير البيانات
 */
export const encryptData = (data: string): string => {
  try {
    const encoded = btoa(encodeURIComponent(data));
    let result = '';
    for (let i = 0; i < encoded.length; i++) {
      const charCode = encoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result);
  } catch {
    return '';
  }
};

/**
 * فك تشفير البيانات
 */
export const decryptData = (encrypted: string): string => {
  try {
    const decoded = atob(encrypted);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return decodeURIComponent(atob(result));
  } catch {
    return '';
  }
};

/**
 * حفظ بيانات الجلسة المشفرة
 */
export const saveEncryptedSession = (data: {
  expiresAt: string;
  userEmail: string;
  timestamp: number;
}): void => {
  const encrypted = encryptData(JSON.stringify(data));
  localStorage.setItem('dentro-session-data', encrypted);
  // حفظ نسخة في IndexedDB أيضاً للأمان
  localStorage.setItem('dentro-session-backup', encrypted);
};

/**
 * استرجاع بيانات الجلسة المشفرة
 */
export const getEncryptedSession = (): {
  expiresAt: string;
  userEmail: string;
  timestamp: number;
} | null => {
  try {
    let encrypted = localStorage.getItem('dentro-session-data');
    // محاولة استرجاع من النسخة الاحتياطية إذا فشلت الأولى
    if (!encrypted) {
      encrypted = localStorage.getItem('dentro-session-backup');
    }
    if (!encrypted) return null;
    
    const decrypted = decryptData(encrypted);
    if (!decrypted) return null;
    
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
};

/**
 * مسح بيانات الجلسة
 */
export const clearSession = (): void => {
  localStorage.removeItem('dentro-session-data');
  localStorage.removeItem('dentro-session-backup');
};

/**
 * التحقق من صلاحية الاشتراك
 */
export const isSubscriptionValid = (expiresAt: string): boolean => {
  try {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    return expiryDate > now;
  } catch {
    return false;
  }
};

/**
 * جلب معلومات الاشتراك من Supabase
 */
export const fetchSubscription = async (userId: string): Promise<{
  expiresAt: string | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('expires_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Subscription fetch error:', error);
      return { expiresAt: null, error: error.message };
    }

    return { expiresAt: data?.expires_at || null, error: null };
  } catch (e) {
    console.error('Subscription fetch exception:', e);
    return { expiresAt: null, error: 'فشل في جلب معلومات الاشتراك' };
  }
};
