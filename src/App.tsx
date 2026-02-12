import { useState, useEffect } from 'react';
import { Plus, FileText, Loader2, Wifi, WifiOff, CheckCircle } from 'lucide-react';
import { Header } from './components/Header';
import { PrescriptionForm } from './components/PrescriptionForm';
import { PrescriptionList } from './components/PrescriptionList';
import { SettingsModal } from './components/SettingsModal';
import { LoginPage } from './components/LoginPage';
import { ExpiredSubscription } from './components/ExpiredSubscription';
import { useApp } from './hooks/useApp';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { translations } from './i18n';

export function App() {
  const {
    data,
    isLoading: isAppLoading,
    darkMode,
    toggleDarkMode,
    addPrescription,
    deletePrescription,
    addMedication,
    deleteMedication,
    addCategory,
    deleteCategory,
    updateSettings,
    setLanguage,
  } = useApp();

  const {
    authState,
    authData,
    error: authError,
    isLoggingIn,
    login,
    logout,
    refreshSubscription,
  } = useAuth();

  const { currentTheme, setTheme } = useTheme();

  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  const t = translations[data.settings.language];
  const isRTL = data.settings.language === 'ar' || data.settings.language === 'ku';

  // Apply theme colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', currentTheme.colors.primary);
    root.style.setProperty('--theme-secondary', currentTheme.colors.secondary);
  }, [currentTheme]);

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Online/Offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineNotice(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineNotice(true);
      setTimeout(() => setShowOfflineNotice(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);



  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setSwRegistered(true);
      });
    }
  }, []);


  // Pre-cache fonts when online
  useEffect(() => {
    if (isOnline && swRegistered) {
      const fontUrls = [
        'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Regular.ttf',
        'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Bold.ttf',
      ];

      fontUrls.forEach(url => {
        fetch(url, { mode: 'cors' })
          .then(response => {
            if (response.ok) {
              console.log('Font pre-cached:', url);
            }
          })
          .catch(() => {});
      });
    }
  }, [isOnline, swRegistered]);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Show loading while checking auth
  if (authState === 'loading' || isAppLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${isRTL ? 'font-cairo' : 'font-inter'}`}>
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Show login page
  if (authState === 'login') {
    return (
      <LoginPage
        onLogin={login}
        isLoading={isLoggingIn}
        error={authError}
        language={data.settings.language}
      />
    );
  }

  // Show expired subscription
  if (authState === 'expired') {
    return (
      <ExpiredSubscription
        userEmail={authData?.userEmail || ''}
        expiresAt={authData?.expiresAt || ''}
        onLogout={logout}
        onRefresh={refreshSubscription}
        language={data.settings.language}
      />
    );
  }

  // Main app (authenticated)
  return (
    <div
      className={`min-h-screen ${isRTL ? 'font-cairo' : 'font-inter'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        background: darkMode 
          ? `linear-gradient(135deg, ${currentTheme.colors.backgroundDark}, ${currentTheme.colors.surfaceDark})`
          : `linear-gradient(135deg, ${currentTheme.colors.background}, ${currentTheme.colors.primaryLight})`,
      }}
    >
      <Header
        language={data.settings.language}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenSettings={() => setShowSettings(true)}
        installPrompt={installPrompt}
        onInstall={handleInstall}
        currentTheme={currentTheme}
      />

      {/* Offline Notice */}
      {showOfflineNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-in">
          <WifiOff size={20} />
          <span className="font-bold">{isRTL ? 'أنت غير متصل بالإنترنت - التطبيق يعمل بدون إنترنت' : 'You are offline - App works offline'}</span>
        </div>
      )}

      {/* Online/Offline indicator */}
      <div className={`fixed bottom-4 ${isRTL ? 'left-4' : 'right-4'} z-40`}>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold shadow-lg ${
          isOnline
            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
        }`}>
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          {isOnline ? (isRTL ? 'متصل' : 'Online') : (isRTL ? 'غير متصل' : 'Offline')}
          {swRegistered && !isOnline && (
            <CheckCircle size={14} className="text-green-500" />
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Title Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <FileText className="text-indigo-600" style={{ color: currentTheme.colors.primary }} />
            {t.prescriptionHistory}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {data.prescriptions.length} {isRTL ? 'وصفة' : 'prescriptions'}
          </p>
        </div>

        <PrescriptionList
          language={data.settings.language}
          prescriptions={data.prescriptions}
          appData={data}
          onDelete={deletePrescription}
          currentTheme={currentTheme}
        />
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowNewPrescription(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 text-white px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-3 font-bold text-lg hover:-translate-y-1 active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
          boxShadow: `0 10px 40px ${currentTheme.colors.primary}40`,
        }}
      >
        <Plus size={24} />
        {t.newPrescription}
      </button>

      {/* Modals */}
      {showNewPrescription && (
        <PrescriptionForm
          language={data.settings.language}
          medications={data.medications}
          categories={data.medicationCategories}
          onSave={async (rx) => {
            await addPrescription(rx);
            setShowNewPrescription(false);
          }}
          onCancel={() => setShowNewPrescription(false)}
        />
      )}

      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        language={data.settings.language}
        settings={data.settings}
        prescriptions={data.prescriptions}
        medications={data.medications}
        categories={data.medicationCategories}
        onUpdateSettings={updateSettings}
        onAddMedication={addMedication}
        onDeleteMedication={deleteMedication}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
        onSetLanguage={setLanguage}
        onRestorePrescriptions={async (prescriptions) => {
          for (const rx of prescriptions) {
            await addPrescription(rx);
          }
        }}
        onClearPrescriptions={async () => {
          for (const rx of data.prescriptions) {
            await deletePrescription(rx.id);
          }
        }}
        subscriptionExpiresAt={authData?.expiresAt}
        userEmail={authData?.userEmail}
        onLogout={logout}
        currentThemeId={currentTheme.id}
        onSetTheme={setTheme}
      />
    </div>
  );
}
