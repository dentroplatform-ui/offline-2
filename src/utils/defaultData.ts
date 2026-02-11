import { Medication, MedicationCategory } from '../types';
import { generateId } from './helpers';

// Default medication categories
export const defaultCategories: MedicationCategory[] = [
  { id: 'cat-antibiotics', name: 'Antibiotics / المضادات الحيوية' },
  { id: 'cat-painkillers', name: 'Painkillers / مسكنات الألم' },
  { id: 'cat-antiinflamm', name: 'Anti-inflammatory / مضادات الالتهاب' },
  { id: 'cat-antihist', name: 'Antihistamines / مضادات الحساسية' },
  { id: 'cat-gastro', name: 'Gastrointestinal / أدوية المعدة' },
  { id: 'cat-cardiov', name: 'Cardiovascular / أدوية القلب' },
  { id: 'cat-diabetes', name: 'Diabetes / أدوية السكري' },
  { id: 'cat-vitamins', name: 'Vitamins / الفيتامينات' },
  { id: 'cat-respiratory', name: 'Respiratory / أدوية الجهاز التنفسي' },
  { id: 'cat-topical', name: 'Topical / الأدوية الموضعية' },
];

// Default medications organized by category
export const defaultMedications: Medication[] = [
  // Antibiotics
  { id: generateId(), name: 'Amoxicillin', dose: '500mg', form: 'Capsule', frequency: '1x3', notes: '', categoryId: 'cat-antibiotics' },
  { id: generateId(), name: 'Amoxicillin + Clavulanic Acid', dose: '1g', form: 'Tablet', frequency: '1x2', notes: 'Augmentin', categoryId: 'cat-antibiotics' },
  { id: generateId(), name: 'Azithromycin', dose: '500mg', form: 'Tablet', frequency: '1x1', notes: 'Zithromax', categoryId: 'cat-antibiotics' },
  { id: generateId(), name: 'Ciprofloxacin', dose: '500mg', form: 'Tablet', frequency: '1x2', notes: '', categoryId: 'cat-antibiotics' },
  { id: generateId(), name: 'Metronidazole', dose: '500mg', form: 'Tablet', frequency: '1x3', notes: 'Flagyl', categoryId: 'cat-antibiotics' },
  { id: generateId(), name: 'Cephalexin', dose: '500mg', form: 'Capsule', frequency: '1x4', notes: 'Keflex', categoryId: 'cat-antibiotics' },
  { id: generateId(), name: 'Clarithromycin', dose: '500mg', form: 'Tablet', frequency: '1x2', notes: '', categoryId: 'cat-antibiotics' },
  { id: generateId(), name: 'Doxycycline', dose: '100mg', form: 'Capsule', frequency: '1x2', notes: '', categoryId: 'cat-antibiotics' },
  { id: generateId(), name: 'Levofloxacin', dose: '500mg', form: 'Tablet', frequency: '1x1', notes: '', categoryId: 'cat-antibiotics' },
  { id: generateId(), name: 'Cefixime', dose: '400mg', form: 'Tablet', frequency: '1x1', notes: 'Suprax', categoryId: 'cat-antibiotics' },
];
