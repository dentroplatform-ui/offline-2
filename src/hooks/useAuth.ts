import { useState, useEffect, useCallback } from 'react';
import {
  supabase,
  saveEncryptedSession,
  getEncryptedSession,
  clearSession,
  isSubscriptionValid,
  fetchSubscription,
} from '../lib/supabase';

export type AuthState = 'loading' | 'login' | 'expired' | 'authenticated';

interface AuthData {
  userEmail: string;
  expiresAt: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // التحقق من الجلسة المحلية عند بدء التطبيق
  useEffect(() => {
    checkLocalSession();
  }, []);

  const checkLocalSession = useCallback(() => {
    try {
      const session = getEncryptedSession();
      
      if (session && session.expiresAt && session.userEmail) {
        // التحقق من صلاحية الاشتراك
        if (isSubscriptionValid(session.expiresAt)) {
          setAuthData({
            userEmail: session.userEmail,
            expiresAt: session.expiresAt,
          });
          setAuthState('authenticated');
        } else {
          // الاشتراك منتهي
          setAuthData({
            userEmail: session.userEmail,
            expiresAt: session.expiresAt,
          });
          setAuthState('expired');
        }
      } else {
        // لا توجد جلسة - يجب تسجيل الدخول
        setAuthState('login');
      }
    } catch (e) {
      console.error('Session check error:', e);
      setAuthState('login');
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoggingIn(true);
    setError(null);

    try {
      // محاولة تسجيل الدخول
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message === 'Invalid login credentials' 
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          : authError.message
        );
        setIsLoggingIn(false);
        return false;
      }

      if (!authData.user) {
        setError('فشل في تسجيل الدخول');
        setIsLoggingIn(false);
        return false;
      }

      // جلب معلومات الاشتراك
      const { expiresAt, error: subError } = await fetchSubscription(authData.user.id);

      if (subError || !expiresAt) {
        setError('لا يوجد اشتراك مرتبط بهذا الحساب');
        await supabase.auth.signOut();
        setIsLoggingIn(false);
        return false;
      }

      // حفظ الجلسة
      const sessionData = {
        userEmail: email,
        expiresAt: expiresAt,
        timestamp: Date.now(),
      };
      saveEncryptedSession(sessionData);

      // التحقق من صلاحية الاشتراك
      if (isSubscriptionValid(expiresAt)) {
        setAuthData({
          userEmail: email,
          expiresAt: expiresAt,
        });
        setAuthState('authenticated');
        setIsLoggingIn(false);
        return true;
      } else {
        // الاشتراك منتهي
        setAuthData({
          userEmail: email,
          expiresAt: expiresAt,
        });
        setAuthState('expired');
        setIsLoggingIn(false);
        return false;
      }
    } catch (e) {
      console.error('Login error:', e);
      setError('حدث خطأ أثناء تسجيل الدخول');
      setIsLoggingIn(false);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
    clearSession();
    setAuthData(null);
    setAuthState('login');
  }, []);

  const refreshSubscription = useCallback(async () => {
    // محاولة تحديث معلومات الاشتراك من السيرفر
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { expiresAt } = await fetchSubscription(user.id);
        if (expiresAt) {
          const sessionData = {
            userEmail: authData?.userEmail || user.email || '',
            expiresAt: expiresAt,
            timestamp: Date.now(),
          };
          saveEncryptedSession(sessionData);

          if (isSubscriptionValid(expiresAt)) {
            setAuthData({
              userEmail: sessionData.userEmail,
              expiresAt: expiresAt,
            });
            setAuthState('authenticated');
            return true;
          }
        }
      }
    } catch (e) {
      console.error('Refresh subscription error:', e);
    }
    return false;
  }, [authData]);

  return {
    authState,
    authData,
    error,
    isLoggingIn,
    login,
    logout,
    refreshSubscription,
    checkLocalSession,
  };
};
