import { useState } from 'react';
import { X, Plus, Trash2, Search, Edit2, LayoutGrid, Folder, ArrowLeft, PlusCircle, CheckCircle2, Loader2, Pill } from 'lucide-react';
import { translations } from '../i18n';
import { Language, Medication, MedicationCategory, Prescription } from '../types';
import { generateId } from '../utils/helpers';
import { Theme } from '../hooks/useTheme';

interface PrescriptionFormProps {
  language: Language;
  medications: Medication[];
  categories: MedicationCategory[];
  onSave: (prescription: Prescription) => Promise<void>;
  onCancel: () => void;
  currentTheme?: Theme;
}

export function PrescriptionForm({
  language,
  medications,
  categories,
  onSave,
  onCancel,
  currentTheme,
}: PrescriptionFormProps) {
  const t = translations[language];
  const isRTL = language === 'ar' || language === 'ku';
  const themeColors = currentTheme?.colors;

  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [addedMeds, setAddedMeds] = useState<Medication[]>([]);
  const [medSearch, setMedSearch] = useState('');
  const [rxMode, setRxMode] = useState<'select' | 'write'>('select');
  const [groupView, setGroupView] = useState<'groups' | 'meds'>('groups');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [medForm, setMedForm] = useState<Partial<Medication>>({ name: '', dose: '', form: '', frequency: '', notes: '' });
  const [isSaving, setIsSaving] = useState(false);

  const filteredMedsForSearch = medSearch.trim()
    ? medications.filter(m => m.name.toLowerCase().includes(medSearch.toLowerCase()))
    : [];

  const handleAddFromSearch = (med: Medication) => {
    setAddedMeds([...addedMeds, { ...med, id: generateId() }]);
    setMedSearch('');
  };

  const handleAddManual = () => {
    if (!medForm.name?.trim()) return;
    setAddedMeds([...addedMeds, { ...medForm, id: generateId() } as Medication]);
    setMedForm({ name: '', dose: '', form: '', frequency: '', notes: '' });
  };

  const handleSave = async () => {
    if (!patientName.trim() || addedMeds.length === 0) return;

    setIsSaving(true);
    try {
      const prescription: Prescription = {
        id: generateId(),
        date: new Date().toISOString(),
        patientName: patientName.trim(),
        patientAge: parseInt(patientAge) || 0,
        medications: addedMeds,
        createdAt: Date.now(),
      };
      await onSave(prescription);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`bg-white dark:bg-gray-900 w-full max-w-5xl rounded-2xl sm:rounded-[2rem] shadow-2xl flex flex-col lg:flex-row h-[95vh] sm:h-[90vh] overflow-hidden ${isRTL ? 'font-cairo' : 'font-inter'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 shrink-0 bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-md">
                <Pill size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">{t.newPrescription}</h3>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-all"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 bg-gray-50 dark:bg-gray-800">
            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1 block">{t.patientName} *</label>
                <input
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm sm:text-base text-gray-800 dark:text-white shadow-sm transition-all"
                  placeholder={t.patientName}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1 block">{t.patientAge}</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm sm:text-base text-gray-800 dark:text-white shadow-sm transition-all"
                  placeholder={t.patientAge}
                />
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="relative group">
                <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3 sm:right-4' : 'left-3 sm:left-4'} text-gray-400 group-focus-within:text-indigo-500 transition-colors`} size={18} />
                <input
                  value={medSearch}
                  onChange={(e) => setMedSearch(e.target.value)}
                  autoComplete="off"
                  className={`w-full ${isRTL ? 'pr-10 sm:pr-12 pl-3 sm:pl-4' : 'pl-10 sm:pl-12 pr-3 sm:pr-4'} py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 dark:text-white outline-none font-bold text-sm sm:text-base shadow-sm transition-all`}
                  placeholder={t.searchMedications}
                />
              </div>
              {medSearch.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 z-[160] mt-1 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 max-h-48 sm:max-h-56 overflow-y-auto">
                  {filteredMedsForSearch.length > 0 ? (
                    filteredMedsForSearch.map(med => (
                      <button
                        key={med.id}
                        onClick={() => handleAddFromSearch(med)}
                        className="w-full text-start p-3 sm:p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-b last:border-0 border-gray-50 dark:border-gray-700 flex items-center justify-between group transition-all"
                      >
                        <div>
                          <div className="font-bold text-sm sm:text-base text-gray-800 dark:text-white group-hover:text-indigo-600">{med.name}</div>
                          <div className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase mt-0.5">{med.dose} • {med.form} • {med.frequency}</div>
                        </div>
                        <Plus size={16} className="text-indigo-200 group-hover:text-indigo-600" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 sm:p-6 text-center text-gray-400 font-bold italic text-sm">{t.noMedicationsFound}</div>
                  )}
                </div>
              )}
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-white dark:bg-gray-700 p-1 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
              <button
                onClick={() => setRxMode('select')}
                className={`flex-1 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${rxMode === 'select' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid size={14} className="sm:w-4 sm:h-4" /> {t.selectMedication}
              </button>
              <button
                onClick={() => setRxMode('write')}
                className={`flex-1 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${rxMode === 'write' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Edit2 size={14} className="sm:w-4 sm:h-4" /> {t.writeMedication}
              </button>
            </div>

            {/* Form / Select Area */}
            <div className="flex-1">
              {rxMode === 'write' ? (
                <div className="flex flex-col space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="col-span-2 sm:col-span-1 space-y-1">
                      <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">{t.drugName} *</label>
                      <input
                        value={medForm.name}
                        onChange={e => setMedForm({ ...medForm, name: e.target.value })}
                        className="w-full p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm shadow-sm"
                        placeholder={t.drugName}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 space-y-1">
                      <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">{t.dose}</label>
                      <input
                        value={medForm.dose}
                        onChange={e => setMedForm({ ...medForm, dose: e.target.value })}
                        className="w-full p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm shadow-sm text-end"
                        dir="ltr"
                        placeholder="500mg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">{t.form}</label>
                      <input
                        value={medForm.form}
                        onChange={e => setMedForm({ ...medForm, form: e.target.value })}
                        className="w-full p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm shadow-sm"
                        placeholder="Tab, Cap..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">{t.frequency}</label>
                      <input
                        value={medForm.frequency}
                        onChange={e => setMedForm({ ...medForm, frequency: e.target.value })}
                        className="w-full p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm shadow-sm text-end"
                        dir="ltr"
                        placeholder="1 x 3"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">{t.medNotes}</label>
                    <input
                      value={medForm.notes}
                      onChange={e => setMedForm({ ...medForm, notes: e.target.value })}
                      className="w-full p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 outline-none font-medium text-sm shadow-sm"
                      placeholder={t.medNotes}
                    />
                  </div>
                  <button
                    onClick={handleAddManual}
                    disabled={!medForm.name?.trim()}
                    className="w-full py-3 sm:py-4 bg-indigo-600 text-white font-bold rounded-lg sm:rounded-xl shadow-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                  >
                    <PlusCircle size={18} /> {t.addMedication}
                  </button>
                </div>
              ) : (
                <div className="p-1">
                  {groupView === 'groups' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {categories.length === 0 ? (
                        <div className="col-span-full text-center py-8 sm:py-12 text-gray-400">
                          <Folder size={40} className="mx-auto mb-2 opacity-30" />
                          <p className="font-bold text-sm">{t.noCategories}</p>
                        </div>
                      ) : (
                        categories.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => { setActiveGroupId(cat.id); setGroupView('meds'); }}
                            className="p-3 sm:p-4 bg-white dark:bg-gray-700 rounded-xl sm:rounded-2xl border-2 border-transparent hover:border-indigo-400 shadow-sm transition-all flex flex-col items-center gap-1.5 sm:gap-2 text-center group"
                          >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Folder size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <span className="font-bold text-gray-800 dark:text-white text-[11px] sm:text-xs leading-tight">{cat.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      <button onClick={() => setGroupView('groups')} className="flex items-center gap-1.5 sm:gap-2 text-indigo-600 font-bold text-[11px] sm:text-xs uppercase hover:underline">
                        <ArrowLeft size={12} className="rtl:rotate-180" /> {t.back}
                      </button>
                      <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                        {medications.filter(m => m.categoryId === activeGroupId).length === 0 ? (
                          <div className="text-center py-6 sm:py-8 text-gray-400">
                            <Pill size={28} className="mx-auto mb-2 opacity-30" />
                            <p className="font-bold text-xs sm:text-sm">{t.noMedicationsFound}</p>
                          </div>
                        ) : (
                          medications.filter(m => m.categoryId === activeGroupId).map(med => (
                            <button
                              key={med.id}
                              onClick={() => setAddedMeds([...addedMeds, { ...med, id: generateId() }])}
                              className="w-full flex items-center justify-between p-2.5 sm:p-3.5 bg-white dark:bg-gray-700 rounded-lg sm:rounded-xl border border-transparent hover:border-indigo-300 transition-all group shadow-sm text-start"
                            >
                              <div>
                                <div className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">{med.name}</div>
                                <div className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase" dir="ltr">{med.dose} • {med.form} • {med.frequency}</div>
                              </div>
                              <Plus size={16} className="text-indigo-300 group-hover:text-indigo-600" />
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Show added meds at bottom */}
          <div className="lg:hidden shrink-0">
            {addedMeds.length > 0 && (
              <div className="bg-white dark:bg-gray-700 px-3 sm:px-5 py-2 sm:py-3 border-t border-gray-100 dark:border-gray-800 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">{t.addedMedications}</span>
                  <span className="bg-indigo-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">{addedMeds.length}</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {addedMeds.map((med, idx) => (
                    <div key={med.id} className="flex items-center gap-1.5 sm:gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-indigo-100 dark:border-indigo-800 shrink-0">
                      <div className="text-start">
                        <div className="font-bold text-indigo-900 dark:text-indigo-100 text-[10px] sm:text-xs leading-none mb-0.5">{med.name}</div>
                        <div className="text-[8px] sm:text-[9px] text-indigo-600/80 font-bold leading-none">{med.dose} • {med.frequency}</div>
                      </div>
                      <button onClick={() => setAddedMeds(addedMeds.filter((_, i) => i !== idx))} className="p-0.5 sm:p-1 text-red-500 bg-white dark:bg-gray-800 rounded-md sm:rounded-lg shadow-sm hover:scale-110 transition-transform">
                        <Trash2 size={10} className="sm:w-3 sm:h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 sm:p-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2 sm:gap-3">
              <button
                onClick={onCancel}
                disabled={isSaving}
                className="flex-1 py-3 sm:py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl sm:rounded-2xl hover:bg-gray-200 transition disabled:opacity-50 text-sm sm:text-base"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !patientName.trim() || addedMeds.length === 0}
                className="flex-1 py-3 sm:py-4 bg-indigo-600 text-white font-bold rounded-xl sm:rounded-2xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{isRTL ? 'جاري الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>{t.save}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: Sidebar for Added Medications */}
        <div className="hidden lg:flex flex-col w-72 xl:w-80 bg-gray-100 dark:bg-gray-850 border-s border-gray-200 dark:border-gray-700">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Pill size={18} className="text-indigo-600" />
                {t.addedMedications}
              </h4>
              {addedMeds.length > 0 && (
                <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {addedMeds.length}
                </span>
              )}
            </div>
          </div>

          {/* Medications List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {addedMeds.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 px-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  <Pill size={28} className="opacity-40" />
                </div>
                <p className="text-sm font-bold text-center">{t.noMedicationsFound}</p>
                <p className="text-xs text-center mt-1 opacity-70">
                  {isRTL ? 'أضف أدوية من القائمة' : 'Add medications from the list'}
                </p>
              </div>
            ) : (
              addedMeds.map((med, idx) => (
                <div
                  key={med.id}
                  className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 rounded-md flex items-center justify-center text-xs font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-gray-800 dark:text-white text-sm truncate">
                          {med.name}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {med.dose && (
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md font-bold">
                            {med.dose}
                          </span>
                        )}
                        {med.form && (
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md font-bold">
                            {med.form}
                          </span>
                        )}
                        {med.frequency && (
                          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-2 py-0.5 rounded-md font-bold">
                            {med.frequency}
                          </span>
                        )}
                      </div>
                      {med.notes && (
                        <p className="text-[10px] text-gray-400 mt-1.5 italic truncate">
                          {med.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setAddedMeds(addedMeds.filter((_, i) => i !== idx))}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-60 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-2">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !patientName.trim() || addedMeds.length === 0}
              className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{isRTL ? 'جاري الحفظ...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>{t.save}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
