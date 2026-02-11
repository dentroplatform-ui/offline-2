import { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, Settings, Image, Layout, Pill, Trash2, Upload, AlignLeft, Bold, Minus, FileStack, Eye, Plus, FileText, Folder, Download, UploadCloud, RefreshCw, CheckCircle, AlertTriangle, HardDrive, User, LogOut, Palette, Check } from 'lucide-react';
import { translations } from '../i18n';
import { Language, AppSettings, TextStyleConfig, LineStyleConfig, Medication, MedicationCategory, Prescription } from '../types';
import { generateId } from '../utils/helpers';
import { themes, Theme } from '../hooks/useTheme';

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  language: Language;
  settings: AppSettings;
  prescriptions: Prescription[];
  medications: Medication[];
  categories: MedicationCategory[];
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onAddMedication: (med: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onAddCategory: (cat: MedicationCategory) => void;
  onDeleteCategory: (id: string) => void;
  onSetLanguage: (lang: Language) => void;
  onRestorePrescriptions: (prescriptions: Prescription[]) => Promise<void>;
  onClearPrescriptions: () => Promise<void>;
  // New props for account and themes
  subscriptionExpiresAt?: string;
  userEmail?: string;
  onLogout?: () => void;
  currentThemeId?: string;
  onSetTheme?: (themeId: string) => void;
}

type SettingsView =
  | 'menu'
  | 'language'
  | 'manage_meds'
  | 'upload_bg'
  | 'paper_size'
  | 'spacing'
  | 'style_meds'
  | 'style_rx'
  | 'style_header_info'
  | 'style_header_line'
  | 'backup'
  | 'account'
  | 'themes';

const StyleEditor = ({ config, onChange, label, t }: {
  config: TextStyleConfig;
  onChange: (c: TextStyleConfig) => void;
  label: string;
  t: any;
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl space-y-4">
      <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 text-sm uppercase flex items-center gap-2">
        <AlignLeft size={16} /> {label}
      </h4>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">{t.fontSize}</label>
          <input
            type="number"
            value={config.fontSize}
            onChange={(e) => onChange({ ...config, fontSize: parseInt(e.target.value) })}
            className="w-16 p-2 rounded-lg border dark:bg-gray-800 dark:text-white outline-none text-center"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">{t.textColor}</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.color}
              onChange={(e) => onChange({ ...config, color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
            />
            <span className="text-xs font-mono text-gray-500">{config.color}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            onClick={() => onChange({ ...config, isBold: !config.isBold })}
            className={`p-2 rounded-lg border flex items-center gap-1 ${config.isBold ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'}`}
          >
            <Bold size={16} /> <span className="text-xs font-bold">{t.bold}</span>
          </button>
        </div>
      </div>
      <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 flex justify-center items-center h-16 overflow-hidden">
        <span style={{
          fontSize: `${config.fontSize}px`,
          color: config.color,
          fontWeight: config.isBold ? 'bold' : 'normal'
        }}>
          Preview Text
        </span>
      </div>
    </div>
  );
};

const LineStyleEditor = ({ config, onChange, label, t }: {
  config: LineStyleConfig;
  onChange: (c: LineStyleConfig) => void;
  label: string;
  t: any;
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl space-y-4">
      <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 text-sm uppercase flex items-center gap-2">
        <Minus size={16} /> {label}
      </h4>
      <div className="flex flex-wrap gap-6 items-center">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">{t.textColor}</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.color}
              onChange={(e) => onChange({ ...config, color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
            />
            <span className="text-xs font-mono text-gray-500">{config.color}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">{t.lineThickness}</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={config.thickness}
              onChange={(e) => onChange({ ...config, thickness: parseFloat(e.target.value) })}
              className="w-24 accent-indigo-600"
            />
            <span className="text-xs font-bold text-gray-700 dark:text-white">{config.thickness} pt</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">{t.lineStyle}</label>
          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border dark:border-gray-600">
            <button
              onClick={() => onChange({ ...config, style: 'solid' })}
              className={`px-3 py-1 text-xs font-bold rounded ${config.style === 'solid' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500'}`}
            >
              {t.solid}
            </button>
            <button
              onClick={() => onChange({ ...config, style: 'dashed' })}
              className={`px-3 py-1 text-xs font-bold rounded ${config.style === 'dashed' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500'}`}
            >
              {t.dashed}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 flex flex-col justify-center gap-2">
        <div
          style={{
            height: config.thickness,
            backgroundColor: config.style === 'dashed' ? 'transparent' : config.color,
            width: '100%',
            borderBottom: config.style === 'dashed' ? `${config.thickness}px dashed ${config.color}` : 'none'
          }}
        />
        <span className="text-[9px] text-gray-400 text-center uppercase tracking-widest">Line Preview</span>
      </div>
    </div>
  );
};

export function SettingsModal({
  show,
  onClose,
  language,
  settings,
  prescriptions,
  medications,
  categories,
  onUpdateSettings,
  onAddMedication,
  onDeleteMedication,
  onAddCategory,
  onDeleteCategory,
  onSetLanguage,
  onRestorePrescriptions,
  onClearPrescriptions,
  subscriptionExpiresAt,
  userEmail,
  onLogout,
  currentThemeId,
  onSetTheme,
}: SettingsModalProps) {
  const t = translations[language];
  const isRTL = language === 'ar' || language === 'ku';

  const [currentView, setCurrentView] = useState<SettingsView>('menu');
  const [rxSymbolConfig, setRxSymbolConfig] = useState<TextStyleConfig>(settings.rxTemplate.rxSymbol);
  const [medsConfig, setMedsConfig] = useState<TextStyleConfig>(settings.rxTemplate.medications);
  const [headerInfoConfig, setHeaderInfoConfig] = useState<TextStyleConfig>(settings.rxTemplate.headerInfo);
  const [headerLineConfig, setHeaderLineConfig] = useState<LineStyleConfig>(settings.rxTemplate.headerLine);
  const [topMargin, setTopMargin] = useState(settings.rxTemplate.topMargin);
  const [paperSize, setPaperSize] = useState<'A4' | 'A5'>(settings.rxTemplate.paperSize);

  // Medication management
  const [newMedForm, setNewMedForm] = useState<Partial<Medication>>({ name: '', dose: '', form: '', frequency: '', notes: '', categoryId: '' });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingMed, setIsAddingMed] = useState(false);

  // Backup states
  const [showRestoreOptions, setShowRestoreOptions] = useState(false);
  const [showBackupTypeChoice, setShowBackupTypeChoice] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<any>(null);
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (show) {
      setCurrentView('menu');
      setRxSymbolConfig(settings.rxTemplate.rxSymbol);
      setMedsConfig(settings.rxTemplate.medications);
      setHeaderInfoConfig(settings.rxTemplate.headerInfo);
      setHeaderLineConfig(settings.rxTemplate.headerLine);
      setTopMargin(settings.rxTemplate.topMargin);
      setPaperSize(settings.rxTemplate.paperSize);
    }
  }, [show, settings]);

  if (!show) return null;

  const handleSaveStyle = () => {
    onUpdateSettings({
      rxTemplate: {
        rxSymbol: rxSymbolConfig,
        medications: medsConfig,
        headerInfo: headerInfoConfig,
        headerLine: headerLineConfig,
        topMargin,
        paperSize,
      }
    });
    setCurrentView('menu');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateSettings({ rxBackgroundImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBg = () => {
    onUpdateSettings({ rxBackgroundImage: '' });
  };

  const handleAddMedication = () => {
    if (!newMedForm.name?.trim()) return;
    onAddMedication({
      id: generateId(),
      name: newMedForm.name,
      dose: newMedForm.dose || '',
      form: newMedForm.form || '',
      frequency: newMedForm.frequency || '',
      notes: newMedForm.notes || '',
      categoryId: newMedForm.categoryId || '',
    });
    setNewMedForm({ name: '', dose: '', form: '', frequency: '', notes: '', categoryId: '' });
    setIsAddingMed(false);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    onAddCategory({ id: generateId(), name: newCategoryName.trim() });
    setNewCategoryName('');
  };

  const MenuCard = ({ title, icon: Icon, onClick, colorClass }: any) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-transparent transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-gray-700/50 shadow-sm group ${colorClass}`}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-current/10 mb-3 group-hover:scale-110 transition-transform">
        <Icon size={24} className="opacity-80" />
      </div>
      <span className="font-bold text-gray-800 dark:text-white text-center text-xs">{title}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`bg-gray-50 dark:bg-gray-800 w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden ${isRTL ? 'font-cairo' : 'font-inter'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 shrink-0">
          <div className="flex items-center gap-3">
            {currentView !== 'menu' && (
              <button onClick={() => setCurrentView('menu')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300 rtl:rotate-180" />
              </button>
            )}
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              {currentView === 'menu' && <><Settings className="text-indigo-600" /> {t.rxSettings}</>}
              {currentView === 'language' && t.language}
              {currentView === 'manage_meds' && t.manageMedications}
              {currentView === 'upload_bg' && t.uploadRxBg}
              {currentView === 'paper_size' && t.paperSize}
              {currentView === 'spacing' && t.headerSpacing}
              {currentView === 'style_meds' && t.medsTextStyle}
              {currentView === 'style_rx' && t.rxSymbolStyle}
              {currentView === 'style_header_info' && t.headerInfoStyle}
              {currentView === 'style_header_line' && t.headerLineStyle}
              {currentView === 'backup' && t.backup}
              {currentView === 'account' && t.accountSettings}
              {currentView === 'themes' && t.themes}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-0">
          {/* Menu */}
          {currentView === 'menu' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MenuCard title={t.language} icon={FileText} onClick={() => setCurrentView('language')} colorClass="hover:border-blue-200 text-blue-600" />
              <MenuCard title={t.manageMedications} icon={Pill} onClick={() => setCurrentView('manage_meds')} colorClass="hover:border-purple-200 text-purple-600" />
              <MenuCard title={t.uploadRxBg} icon={Image} onClick={() => setCurrentView('upload_bg')} colorClass="hover:border-green-200 text-green-600" />
              <MenuCard title={t.paperSize} icon={FileStack} onClick={() => setCurrentView('paper_size')} colorClass="hover:border-rose-200 text-rose-600" />
              <MenuCard title={t.headerSpacing} icon={Layout} onClick={() => setCurrentView('spacing')} colorClass="hover:border-indigo-200 text-indigo-600" />
              <MenuCard title={t.headerInfoStyle} icon={AlignLeft} onClick={() => setCurrentView('style_header_info')} colorClass="hover:border-amber-200 text-amber-600" />
              <MenuCard title={t.headerLineStyle} icon={Minus} onClick={() => setCurrentView('style_header_line')} colorClass="hover:border-gray-300 text-gray-500" />
              <MenuCard title={t.medsTextStyle} icon={AlignLeft} onClick={() => setCurrentView('style_meds')} colorClass="hover:border-teal-200 text-teal-600" />
              <MenuCard title={t.rxSymbolStyle} icon={AlignLeft} onClick={() => setCurrentView('style_rx')} colorClass="hover:border-orange-200 text-orange-600" />
              <MenuCard title={t.backup} icon={HardDrive} onClick={() => setCurrentView('backup')} colorClass="hover:border-emerald-200 text-emerald-600" />
              <MenuCard title={t.themes} icon={Palette} onClick={() => setCurrentView('themes')} colorClass="hover:border-pink-200 text-pink-600" />
              <MenuCard title={t.accountSettings} icon={User} onClick={() => setCurrentView('account')} colorClass="hover:border-red-200 text-red-600" />
            </div>
          )}

          {/* Account Settings */}
          {currentView === 'account' && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center">
                    <User size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-lg">{userEmail || '-'}</h4>
                    <p className="text-sm text-gray-500">{isRTL ? 'الحساب المسجل' : 'Registered Account'}</p>
                  </div>
                </div>

                {/* Subscription Info */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">{t.subscriptionExpiresAt}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {subscriptionExpiresAt 
                        ? new Date(subscriptionExpiresAt).toLocaleDateString(language === 'en' ? 'en-GB' : 'ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '-'
                      }
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center justify-center gap-3"
                  >
                    <LogOut size={20} />
                    {t.logout}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Themes */}
          {currentView === 'themes' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {isRTL ? 'اختر ثيم لتغيير ألوان التطبيق' : 'Choose a theme to change app colors'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {themes.map((theme: Theme) => (
                  <button
                    key={theme.id}
                    onClick={() => onSetTheme?.(theme.id)}
                    className={`p-4 rounded-2xl border-2 transition-all hover:shadow-lg ${
                      currentThemeId === theme.id
                        ? 'border-gray-800 dark:border-white shadow-lg'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: theme.colors.primaryLight }}
                  >
                    <div className="flex gap-1 mb-3">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors.secondary }} />
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm" style={{ color: theme.colors.text }}>
                        {language === 'ar' ? theme.nameAr : language === 'ku' ? theme.nameKu : theme.name}
                      </span>
                      {currentThemeId === theme.id && (
                        <Check size={16} style={{ color: theme.colors.primary }} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Language */}
          {currentView === 'language' && (
            <div className="space-y-3">
              {(['ar', 'en', 'ku'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => { onSetLanguage(lang); setCurrentView('menu'); }}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    language === lang
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-indigo-300'
                  }`}
                >
                  <span className="font-bold text-gray-800 dark:text-white">
                    {lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : 'کوردی'}
                  </span>
                  {language === lang && (
                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Manage Medications */}
          {currentView === 'manage_meds' && (
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Folder size={14} /> {t.addCategory}
                </h4>
                <div className="flex gap-2 mb-3">
                  <input
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder={t.categoryName}
                    className="flex-1 p-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none font-medium"
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    className="px-4 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                      <span className="font-bold text-sm">{cat.name}</span>
                      <button onClick={() => onDeleteCategory(cat.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Medication */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Pill size={14} /> {t.medications}
                  </h4>
                  <button
                    onClick={() => setIsAddingMed(!isAddingMed)}
                    className="text-indigo-600 font-bold text-sm flex items-center gap-1"
                  >
                    <Plus size={16} /> {t.addMedication}
                  </button>
                </div>

                {isAddingMed && (
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={newMedForm.name}
                        onChange={e => setNewMedForm({ ...newMedForm, name: e.target.value })}
                        placeholder={t.drugName}
                        className="col-span-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none font-medium"
                      />
                      <input
                        value={newMedForm.dose}
                        onChange={e => setNewMedForm({ ...newMedForm, dose: e.target.value })}
                        placeholder={t.dose}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none font-medium"
                      />
                      <input
                        value={newMedForm.form}
                        onChange={e => setNewMedForm({ ...newMedForm, form: e.target.value })}
                        placeholder={t.form}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none font-medium"
                      />
                      <input
                        value={newMedForm.frequency}
                        onChange={e => setNewMedForm({ ...newMedForm, frequency: e.target.value })}
                        placeholder={t.frequency}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none font-medium"
                      />
                      <select
                        value={newMedForm.categoryId}
                        onChange={e => setNewMedForm({ ...newMedForm, categoryId: e.target.value })}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none font-medium"
                      >
                        <option value="">{t.selectCategory}</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setIsAddingMed(false)} className="flex-1 py-2 bg-gray-100 rounded-lg font-bold">
                        {t.cancel}
                      </button>
                      <button onClick={handleAddMedication} disabled={!newMedForm.name?.trim()} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold disabled:opacity-50">
                        {t.save}
                      </button>
                    </div>
                  </div>
                )}

                {/* Medications List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {medications.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Pill size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="font-bold text-sm">{t.noMedicationsFound}</p>
                    </div>
                  ) : (
                    medications.map(med => (
                      <div key={med.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                        <div>
                          <div className="font-bold text-gray-800 dark:text-white">{med.name}</div>
                          <div className="text-xs text-gray-400">{med.dose} • {med.form} • {med.frequency}</div>
                        </div>
                        <button onClick={() => onDeleteMedication(med.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upload Background */}
          {currentView === 'upload_bg' && (
            <div className="space-y-6">
              {settings.rxBackgroundImage ? (
                <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-700 dark:text-white flex items-center gap-2">
                      <Eye size={18} className="text-indigo-500" />
                      {isRTL ? 'الخلفية الحالية' : 'Current Background'}
                    </h4>
                    <button onClick={handleRemoveBg} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="aspect-[1/1.4] max-h-64 mx-auto overflow-hidden rounded-xl border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                    {settings.rxBackgroundImage.startsWith('data:application/pdf') ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <FileText size={48} className="text-gray-300" />
                      </div>
                    ) : (
                      <img src={settings.rxBackgroundImage} alt="Background" className="w-full h-full object-contain" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center opacity-60">
                  <Image size={40} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-bold">{isRTL ? 'لا توجد خلفية' : 'No background set'}</p>
                </div>
              )}

              <div className="p-8 bg-white dark:bg-gray-700 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-center">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Upload size={32} />
                </div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.uploadRxBg}</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm font-bold">{t.recSize}</p>
                <label className="inline-flex cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg">
                  {t.upload}
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          )}

          {/* Paper Size */}
          {currentView === 'paper_size' && (
            <div className="space-y-6">
              <div className="flex bg-gray-100 dark:bg-gray-700 p-2 rounded-2xl gap-2">
                <button
                  onClick={() => setPaperSize('A5')}
                  className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl transition-all border-2 ${
                    paperSize === 'A5' ? 'bg-white dark:bg-gray-600 border-indigo-500 shadow-lg' : 'border-transparent text-gray-500'
                  }`}
                >
                  <div className="w-10 h-14 border-2 border-current rounded mb-3 flex items-center justify-center font-bold text-xs">A5</div>
                  <span className="font-bold text-lg">A5</span>
                  <span className="text-xs opacity-60 uppercase font-bold">Small</span>
                </button>
                <button
                  onClick={() => setPaperSize('A4')}
                  className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl transition-all border-2 ${
                    paperSize === 'A4' ? 'bg-white dark:bg-gray-600 border-indigo-500 shadow-lg' : 'border-transparent text-gray-500'
                  }`}
                >
                  <div className="w-12 h-16 border-2 border-current rounded mb-3 flex items-center justify-center font-bold text-xs">A4</div>
                  <span className="font-bold text-lg">A4</span>
                  <span className="text-xs opacity-60 uppercase font-bold">Standard</span>
                </button>
              </div>
              <button onClick={handleSaveStyle} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">
                {t.save}
              </button>
            </div>
          )}

          {/* Spacing */}
          {currentView === 'spacing' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-gray-800 dark:text-white">{t.topMargin}</h4>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-mono font-bold">{topMargin} pt</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="5"
                  value={topMargin}
                  onChange={(e) => setTopMargin(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-8"
                />
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-xl p-4 relative min-h-[200px] bg-gray-50 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="bg-indigo-100 dark:bg-indigo-900/40 border-b-2 border-indigo-300 dark:border-indigo-700 flex items-center justify-center transition-all duration-300"
                    style={{ height: `${topMargin / 2}px` }}
                  >
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{t.headerSpacing}</span>
                  </div>
                </div>
              </div>
              <button onClick={handleSaveStyle} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">
                {t.save}
              </button>
            </div>
          )}

          {/* Style Editors */}
          {currentView === 'style_meds' && (
            <div className="space-y-6">
              <StyleEditor config={medsConfig} onChange={setMedsConfig} label={t.medsTextStyle} t={t} />
              <button onClick={handleSaveStyle} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">
                {t.save}
              </button>
            </div>
          )}

          {currentView === 'style_rx' && (
            <div className="space-y-6">
              <StyleEditor config={rxSymbolConfig} onChange={setRxSymbolConfig} label="RX/" t={t} />
              <button onClick={handleSaveStyle} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">
                {t.save}
              </button>
            </div>
          )}

          {currentView === 'style_header_info' && (
            <div className="space-y-6">
              <StyleEditor config={headerInfoConfig} onChange={setHeaderInfoConfig} label={t.headerInfoStyle} t={t} />
              <button onClick={handleSaveStyle} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">
                {t.save}
              </button>
            </div>
          )}

          {currentView === 'style_header_line' && (
            <div className="space-y-6">
              <LineStyleEditor config={headerLineConfig} onChange={setHeaderLineConfig} label={t.headerLineStyle} t={t} />
              <button onClick={handleSaveStyle} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">
                {t.save}
              </button>
            </div>
          )}

          {/* Backup */}
          {currentView === 'backup' && (
            <div className="space-y-6">
              {/* Success/Error Message */}
              {backupMessage && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${
                  backupMessage.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}>
                  {backupMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                  <span className="font-bold">{backupMessage.text}</span>
                </div>
              )}

              {/* Create Backup Section */}
              <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600 space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <UploadCloud size={28} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 dark:text-white text-lg">{t.createBackup}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isRTL ? 'اختر نوع النسخة الاحتياطية' : 'Choose backup type'}
                    </p>
                  </div>
                </div>

                {!showBackupTypeChoice ? (
                  <button
                    onClick={() => setShowBackupTypeChoice(true)}
                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                  >
                    <UploadCloud size={20} />
                    {t.createBackup}
                  </button>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    {/* Backup Settings */}
                    <button
                      onClick={() => {
                        const backupData = {
                          version: '1.0',
                          type: 'settings',
                          exportDate: new Date().toISOString(),
                          settings: settings,
                          medications: medications,
                          medicationCategories: categories,
                        };
                        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        const date = new Date().toISOString().split('T')[0];
                        a.download = `dentro_settings_backup_${date}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        setBackupMessage({ type: 'success', text: t.backupSuccess });
                        setShowBackupTypeChoice(false);
                        setTimeout(() => setBackupMessage(null), 3000);
                      }}
                      className="w-full p-4 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl hover:border-indigo-400 transition text-start"
                    >
                      <div className="flex items-center gap-3">
                        <Settings size={24} className="text-indigo-600 shrink-0" />
                        <div>
                          <div className="font-bold text-indigo-700 dark:text-indigo-300">{t.backupSettings}</div>
                          <div className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">{t.settingsBackupDesc}</div>
                        </div>
                      </div>
                    </button>

                    {/* Backup Prescriptions */}
                    <button
                      onClick={() => {
                        const backupData = {
                          version: '1.0',
                          type: 'prescriptions',
                          exportDate: new Date().toISOString(),
                          prescriptions: prescriptions,
                        };
                        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        const date = new Date().toISOString().split('T')[0];
                        a.download = `dentro_prescriptions_backup_${date}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        setBackupMessage({ type: 'success', text: t.backupSuccess });
                        setShowBackupTypeChoice(false);
                        setTimeout(() => setBackupMessage(null), 3000);
                      }}
                      className="w-full p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl hover:border-purple-400 transition text-start"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={24} className="text-purple-600 shrink-0" />
                        <div>
                          <div className="font-bold text-purple-700 dark:text-purple-300">{t.backupPrescriptions}</div>
                          <div className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                            {t.prescriptionsBackupDesc} ({prescriptions.length} {isRTL ? 'وصفة' : 'prescriptions'})
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Cancel */}
                    <button
                      onClick={() => setShowBackupTypeChoice(false)}
                      className="w-full py-3 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition"
                    >
                      {t.cancel}
                    </button>
                  </div>
                )}
              </div>

              {/* Restore Backup Section */}
              <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Download size={28} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 dark:text-white text-lg">{t.restoreBackup}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isRTL ? 'استعادة البيانات من ملف نسخة احتياطية' : 'Restore data from a backup file'}
                    </p>
                  </div>
                </div>

                <input
                  ref={restoreInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        if (!data.version || !data.exportDate) {
                          setBackupMessage({ type: 'error', text: t.invalidBackupFile });
                          setTimeout(() => setBackupMessage(null), 3000);
                          return;
                        }
                        setPendingRestoreData(data);
                        setShowRestoreOptions(true);
                      } catch {
                        setBackupMessage({ type: 'error', text: t.invalidBackupFile });
                        setTimeout(() => setBackupMessage(null), 3000);
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }}
                />

                {!showRestoreOptions ? (
                  <button
                    onClick={() => restoreInputRef.current?.click()}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    {t.restoreBackup}
                  </button>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    {/* Show what type of backup was detected */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <span className="text-xs font-bold text-gray-500 uppercase">
                        {pendingRestoreData?.type === 'prescriptions'
                          ? (isRTL ? 'ملف وصفات' : 'Prescriptions Backup')
                          : (isRTL ? 'ملف إعدادات' : 'Settings Backup')
                        }
                      </span>
                    </div>

                    <h5 className="font-bold text-gray-700 dark:text-gray-200 text-center">{t.chooseRestoreMethod}</h5>

                    {/* Replace Option */}
                    <button
                      onClick={async () => {
                        if (!pendingRestoreData) return;

                        if (pendingRestoreData.type === 'prescriptions') {
                          // Restore prescriptions - replace
                          await onClearPrescriptions();
                          if (pendingRestoreData.prescriptions) {
                            await onRestorePrescriptions(pendingRestoreData.prescriptions);
                          }
                        } else {
                          // Restore settings - replace
                          for (const med of medications) {
                            await onDeleteMedication(med.id);
                          }
                          for (const cat of categories) {
                            await onDeleteCategory(cat.id);
                          }

                          if (pendingRestoreData.medicationCategories) {
                            for (const cat of pendingRestoreData.medicationCategories) {
                              await onAddCategory(cat);
                            }
                          }
                          if (pendingRestoreData.medications) {
                            for (const med of pendingRestoreData.medications) {
                              await onAddMedication(med);
                            }
                          }
                          if (pendingRestoreData.settings?.rxTemplate) {
                            onUpdateSettings({ rxTemplate: pendingRestoreData.settings.rxTemplate });
                          }
                        }

                        setShowRestoreOptions(false);
                        setPendingRestoreData(null);
                        setBackupMessage({ type: 'success', text: t.restoreSuccess });
                        setTimeout(() => setBackupMessage(null), 3000);
                      }}
                      className="w-full p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl hover:border-orange-400 transition text-start"
                    >
                      <div className="flex items-center gap-3">
                        <RefreshCw size={24} className="text-orange-600 shrink-0" />
                        <div>
                          <div className="font-bold text-orange-700 dark:text-orange-300">{t.replaceData}</div>
                          <div className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">{t.replaceWarning}</div>
                        </div>
                      </div>
                    </button>

                    {/* Merge Option */}
                    <button
                      onClick={async () => {
                        if (!pendingRestoreData) return;

                        if (pendingRestoreData.type === 'prescriptions') {
                          // Restore prescriptions - merge
                          if (pendingRestoreData.prescriptions) {
                            const existingIds = prescriptions.map(p => p.id);
                            const newPrescriptions = pendingRestoreData.prescriptions.filter(
                              (p: Prescription) => !existingIds.includes(p.id)
                            );
                            await onRestorePrescriptions(newPrescriptions);
                          }
                        } else {
                          // Restore settings - merge
                          if (pendingRestoreData.medicationCategories) {
                            for (const cat of pendingRestoreData.medicationCategories) {
                              if (!categories.find(c => c.id === cat.id)) {
                                await onAddCategory(cat);
                              }
                            }
                          }
                          if (pendingRestoreData.medications) {
                            for (const med of pendingRestoreData.medications) {
                              if (!medications.find(m => m.id === med.id)) {
                                await onAddMedication(med);
                              }
                            }
                          }
                        }

                        setShowRestoreOptions(false);
                        setPendingRestoreData(null);
                        setBackupMessage({ type: 'success', text: t.restoreSuccess });
                        setTimeout(() => setBackupMessage(null), 3000);
                      }}
                      className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl hover:border-blue-400 transition text-start"
                    >
                      <div className="flex items-center gap-3">
                        <Plus size={24} className="text-blue-600 shrink-0" />
                        <div>
                          <div className="font-bold text-blue-700 dark:text-blue-300">{t.mergeData}</div>
                          <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">{t.mergeDescription}</div>
                        </div>
                      </div>
                    </button>

                    {/* Cancel */}
                    <button
                      onClick={() => {
                        setShowRestoreOptions(false);
                        setPendingRestoreData(null);
                      }}
                      className="w-full py-3 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition"
                    >
                      {t.cancel}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
