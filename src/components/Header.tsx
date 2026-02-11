import { Pill, Settings, Moon, Sun, Download, Instagram } from 'lucide-react';
import { translations } from '../i18n';
import { Language } from '../types';
import { Theme } from '../hooks/useTheme';

interface HeaderProps {
  language: Language;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  installPrompt: any;
  onInstall: () => void;
  currentTheme?: Theme;
}

export function Header({ language, darkMode, onToggleDarkMode, onOpenSettings, installPrompt, onInstall, currentTheme }: HeaderProps) {
  const t = translations[language];
  
  const headerStyle = currentTheme ? {
    background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
  } : {};

  return (
    <header className="text-white shadow-xl sticky top-0 z-50" style={headerStyle}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
              <Pill size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{t.appName}</h1>
              <p className="text-xs text-indigo-200 font-medium">{t.appSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Instagram Link */}
            <a
              href="https://instagram.com/dentro_app"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-pink-500/30 hover:scale-105"
              title={`${t.followUs}: @dentro_app`}
            >
              <Instagram size={20} />
            </a>
            {installPrompt && (
              <button
                onClick={onInstall}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                title={t.installApp}
              >
                <Download size={20} />
              </button>
            )}
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
              title={darkMode ? t.lightMode : t.darkMode}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
              title={t.settings}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
