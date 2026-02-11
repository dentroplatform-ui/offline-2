import { AlertTriangle, Instagram, LogOut, RefreshCw, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ExpiredSubscriptionProps {
  userEmail: string;
  expiresAt: string;
  onLogout: () => void;
  onRefresh: () => Promise<boolean>;
  language: 'ar' | 'en' | 'ku';
}

export function ExpiredSubscription({
  userEmail,
  expiresAt,
  onLogout,
  onRefresh,
  language,
}: ExpiredSubscriptionProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRTL = language === 'ar' || language === 'ku';

  const texts = {
    ar: {
      title: 'انتهى الاشتراك',
      subtitle: 'عذراً، اشتراكك قد انتهى',
      message: 'لا يمكنك استخدام التطبيق حتى يتم تجديد الاشتراك. تواصل معنا لتجديد اشتراكك.',
      expiredOn: 'انتهى في:',
      account: 'الحساب:',
      contactUs: 'تواصل معنا',
      logout: 'تسجيل الخروج',
      tryAgain: 'إعادة المحاولة',
      refreshing: 'جاري التحقق...',
    },
    en: {
      title: 'Subscription Expired',
      subtitle: 'Sorry, your subscription has expired',
      message: 'You cannot use the app until your subscription is renewed. Contact us to renew.',
      expiredOn: 'Expired on:',
      account: 'Account:',
      contactUs: 'Contact Us',
      logout: 'Log Out',
      tryAgain: 'Try Again',
      refreshing: 'Checking...',
    },
    ku: {
      title: 'بەشداری تەواو بوو',
      subtitle: 'ببورە، بەشداریەکەت تەواو بووە',
      message: 'ناتوانیت ئەپەکە بەکاربهێنیت هەتا بەشداری نوێ نەکەیتەوە. پەیوەندیمان پێوە بکە بۆ نوێکردنەوە.',
      expiredOn: 'تەواو بوو لە:',
      account: 'هەژمار:',
      contactUs: 'پەیوەندیمان پێوە بکە',
      logout: 'چوونەدەرەوە',
      tryAgain: 'هەوڵدانەوە',
      refreshing: 'پشکنین...',
    },
  };

  const t = texts[language];

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-GB' : 'ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-red-600 via-rose-600 to-pink-700 flex items-center justify-center p-4 ${isRTL ? 'font-cairo' : 'font-inter'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-300 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Warning Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-md rounded-full shadow-2xl mb-4">
            <AlertTriangle size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">{t.title}</h1>
          <p className="text-rose-100 font-medium">{t.subtitle}</p>
        </div>

        {/* Content Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
          {/* Message */}
          <p className="text-white/90 text-center mb-6 leading-relaxed font-medium">
            {t.message}
          </p>

          {/* Info */}
          <div className="bg-white/10 rounded-2xl p-4 space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-white/60 font-medium">{t.account}</span>
              <span className="text-white font-bold text-sm" dir="ltr">{userEmail}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 font-medium">{t.expiredOn}</span>
              <span className="text-rose-200 font-bold">{formatDate(expiresAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Contact Instagram */}
            <a
              href="https://instagram.com/dentro_app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-3"
            >
              <Instagram size={22} />
              <span>{t.contactUs}</span>
            </a>

            {/* Try Again */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full py-3.5 bg-white/20 text-white font-bold rounded-2xl hover:bg-white/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isRefreshing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>{t.refreshing}</span>
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  <span>{t.tryAgain}</span>
                </>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="w-full py-3 text-white/70 font-medium hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-sm mt-6 font-medium">
          @dentro_app
        </p>
      </div>
    </div>
  );
}
