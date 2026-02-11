import { useState } from 'react';
import { Pill, Mail, Lock, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  language: 'ar' | 'en' | 'ku';
}

export function LoginPage({ onLogin, isLoading, error, language }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isRTL = language === 'ar' || language === 'ku';

  const texts = {
    ar: {
      title: 'تسجيل الدخول',
      subtitle: 'مرحباً بك في Dentro',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      login: 'تسجيل الدخول',
      loggingIn: 'جاري تسجيل الدخول...',
    },
    en: {
      title: 'Sign In',
      subtitle: 'Welcome to Dentro',
      email: 'Email',
      password: 'Password',
      login: 'Sign In',
      loggingIn: 'Signing in...',
    },
    ku: {
      title: 'چوونەژوورەوە',
      subtitle: 'بەخێربێیت بۆ Dentro',
      email: 'ئیمەیڵ',
      password: 'وشەی نهێنی',
      login: 'چوونەژوورەوە',
      loggingIn: 'چاوەڕوان بە...',
    },
  };

  const t = texts[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    await onLogin(email.trim(), password);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4 ${isRTL ? 'font-cairo' : 'font-inter'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl mb-6">
            <Pill size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">{t.subtitle}</h1>
          <p className="text-indigo-200 font-medium">{t.title}</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-2xl flex items-center gap-3 animate-fade-in">
              <AlertCircle size={20} className="text-red-300 shrink-0" />
              <span className="text-red-100 font-medium text-sm">{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="mb-5">
            <label className="block text-white/80 text-sm font-bold mb-2">{t.email}</label>
            <div className="relative">
              <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-indigo-500`}>
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium shadow-sm`}
                placeholder={t.email}
                disabled={isLoading}
                autoComplete="email"
                dir="ltr"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className="block text-white/80 text-sm font-bold mb-2">{t.password}</label>
            <div className="relative">
              <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-indigo-500`}>
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full ${isRTL ? 'pr-12 pl-14' : 'pl-12 pr-14'} py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium shadow-sm`}
                placeholder={t.password}
                disabled={isLoading}
                autoComplete="current-password"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} text-gray-400 hover:text-indigo-600 transition-colors`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password.trim()}
            className="w-full py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-xl hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                <span>{t.loggingIn}</span>
              </>
            ) : (
              <span>{t.login}</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-white/50 text-sm mt-6 font-medium">
          Dentro © 2024
        </p>
      </div>
    </div>
  );
}
