import { useState, useEffect, useCallback } from 'react';
import {
  loadAllData,
  savePrescription,
  deletePrescription as deleteRx,
  saveMedication,
  deleteMedication as deleteMed,
  saveCategory,
  deleteCategory as deleteCat,
  saveSettings,
  getAllPrescriptions,
  getAllMedications,
  getAllCategories,
} from '../utils/db';
import { AppData, Prescription, Medication, MedicationCategory, AppSettings, Language } from '../types';

const defaultSettings: AppSettings = {
  language: 'ar',
  rxBackgroundImage: '',
  rxTemplate: {
    rxSymbol: { fontSize: 30, color: '#000000', isBold: true },
    medications: { fontSize: 14, color: '#000000', isBold: true },
    headerInfo: { fontSize: 12, color: '#000000', isBold: true },
    headerLine: { color: '#000000', thickness: 1, style: 'solid' },
    topMargin: 100,
    paperSize: 'A5',
  },
};

export const useApp = () => {
  const [data, setData] = useState<AppData>({
    prescriptions: [],
    medications: [],
    medicationCategories: [],
    settings: defaultSettings,
    lastUpdated: Date.now(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage on initial load
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dentro-dark-mode');
      const isDark = saved === 'true';
      return isDark;
    }
    return false;
  });

  // Apply dark mode class on mount and changes
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (darkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
      body.style.backgroundColor = '#111827'; // gray-900
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.colorScheme = 'light';
      body.style.backgroundColor = '';
    }
  }, [darkMode]);

  // Load data on mount
  useEffect(() => {
    const init = async () => {
      try {
        const loadedData = await loadAllData();
        setData(loadedData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('dentro-dark-mode', String(newValue));
      return newValue;
    });
  }, []);

  // Prescriptions
  const addPrescription = useCallback(async (prescription: Prescription) => {
    await savePrescription(prescription);
    const prescriptions = await getAllPrescriptions();
    setData(prev => ({ ...prev, prescriptions, lastUpdated: Date.now() }));
  }, []);

  const deletePrescription = useCallback(async (id: string) => {
    await deleteRx(id);
    const prescriptions = await getAllPrescriptions();
    setData(prev => ({ ...prev, prescriptions, lastUpdated: Date.now() }));
  }, []);

  // Medications
  const addMedication = useCallback(async (medication: Medication) => {
    await saveMedication(medication);
    const medications = await getAllMedications();
    setData(prev => ({ ...prev, medications, lastUpdated: Date.now() }));
  }, []);

  const deleteMedication = useCallback(async (id: string) => {
    await deleteMed(id);
    const medications = await getAllMedications();
    setData(prev => ({ ...prev, medications, lastUpdated: Date.now() }));
  }, []);

  // Categories
  const addCategory = useCallback(async (category: MedicationCategory) => {
    await saveCategory(category);
    const categories = await getAllCategories();
    setData(prev => ({ ...prev, medicationCategories: categories, lastUpdated: Date.now() }));
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await deleteCat(id);
    const categories = await getAllCategories();
    setData(prev => ({ ...prev, medicationCategories: categories, lastUpdated: Date.now() }));
  }, []);

  // Settings
  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...data.settings, ...newSettings };
    await saveSettings(updatedSettings);
    setData(prev => ({ ...prev, settings: updatedSettings, lastUpdated: Date.now() }));
  }, [data.settings]);

  const setLanguage = useCallback(async (lang: Language) => {
    await updateSettings({ language: lang });
  }, [updateSettings]);

  return {
    data,
    isLoading,
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
  };
};
