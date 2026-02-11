import { useState } from 'react';
import { FileText, Trash2, Printer, Search, Calendar, User, Pill, AlertCircle, Loader2 } from 'lucide-react';
import { translations } from '../i18n';
import { Language, Prescription, AppData } from '../types';
import { generateRxPdf } from '../utils/pdfGenerator';
import { Theme } from '../hooks/useTheme';

interface PrescriptionListProps {
  language: Language;
  prescriptions: Prescription[];
  appData: AppData;
  onDelete: (id: string) => void;
  currentTheme?: Theme;
}

export function PrescriptionList({ language, prescriptions, appData, onDelete, currentTheme }: PrescriptionListProps) {
  const t = translations[language];
  const isRTL = language === 'ar' || language === 'ku';
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);

  const filteredPrescriptions = prescriptions.filter(rx =>
    rx.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by time
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = today - 30 * 24 * 60 * 60 * 1000;

  const grouped = {
    today: filteredPrescriptions.filter(rx => new Date(rx.date).getTime() >= today),
    week: filteredPrescriptions.filter(rx => {
      const d = new Date(rx.date).getTime();
      return d >= weekAgo && d < today;
    }),
    month: filteredPrescriptions.filter(rx => {
      const d = new Date(rx.date).getTime();
      return d >= monthAgo && d < weekAgo;
    }),
    older: filteredPrescriptions.filter(rx => new Date(rx.date).getTime() < monthAgo),
  };

  const handlePrint = async (rx: Prescription) => {
    setPrintingId(rx.id);
    try {
      const blob = await generateRxPdf(appData, rx, language);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('Print error:', error);
      alert(isRTL ? 'حدث خطأ أثناء إنشاء الملف' : 'Error generating PDF');
    } finally {
      setPrintingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === 'en' ? 'en-GB' : 'ar-EG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const themeColors = currentTheme?.colors;

  const PrescriptionCard = ({ rx }: { rx: Prescription }) => (
    <div 
      className="rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
      style={{
        backgroundColor: themeColors ? 'var(--theme-surface)' : undefined,
        borderColor: themeColors ? 'var(--theme-border)' : undefined,
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User size={16} className="shrink-0" style={{ color: themeColors?.primary || '#6366f1' }} />
              <h3 className="font-bold text-gray-800 dark:text-white truncate">{rx.patientName}</h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(rx.date)}
              </span>
              {rx.patientAge > 0 && (
                <span>{rx.patientAge} {isRTL ? 'سنة' : 'y'}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePrint(rx)}
              disabled={printingId === rx.id}
              className="p-2.5 rounded-xl transition-colors disabled:opacity-50"
              style={{ color: themeColors?.primary || '#4f46e5' }}
              title={t.print}
            >
              {printingId === rx.id ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Printer size={18} />
              )}
            </button>
            <button
              onClick={() => handleDelete(rx.id)}
              className={`p-2.5 rounded-xl transition-all ${
                confirmDeleteId === rx.id
                  ? 'bg-red-500 text-white'
                  : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
              }`}
              title={confirmDeleteId === rx.id ? t.confirmDelete : t.delete}
            >
              {confirmDeleteId === rx.id ? <AlertCircle size={18} /> : <Trash2 size={18} />}
            </button>
          </div>
        </div>

        {/* Medications Preview */}
        <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
            <Pill size={12} />
            <span className="font-bold uppercase tracking-wider">{t.medications}</span>
            <span className="ml-auto bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full font-bold">{rx.medications.length}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {rx.medications.slice(0, 4).map((med, i) => (
              <span 
                key={i} 
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ 
                  backgroundColor: themeColors?.primaryLight || '#eef2ff',
                  color: themeColors?.primary || '#4338ca',
                }}
              >
                {med.name}
              </span>
            ))}
            {rx.medications.length > 4 && (
              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg text-xs font-bold">
                +{rx.medications.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const Section = ({ title, items }: { title: string; items: Prescription[] }) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
          <Calendar size={14} />
          {title}
          <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{items.length}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(rx => (
            <PrescriptionCard key={rx.id} rx={rx} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-gray-400`} size={20} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 outline-none font-medium shadow-sm transition-all dark:text-white`}
          placeholder={t.search}
        />
      </div>

      {/* List */}
      {filteredPrescriptions.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={64} className="mx-auto mb-4 text-gray-200 dark:text-gray-700" />
          <p className="text-gray-400 font-bold">{searchQuery ? t.noResults : t.noPrescriptions}</p>
        </div>
      ) : (
        <div className="space-y-8">
          <Section title={t.today} items={grouped.today} />
          <Section title={t.thisWeek} items={grouped.week} />
          <Section title={t.thisMonth} items={grouped.month} />
          <Section title={t.older} items={grouped.older} />
        </div>
      )}
    </div>
  );
}
