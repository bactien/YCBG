import { GlassType } from '../types';
import { GLASS_TYPES_STORAGE_KEY } from '../constants';

const getFromStorage = (): GlassType[] => {
  const data = localStorage.getItem(GLASS_TYPES_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = (data: GlassType[]): void => {
  localStorage.setItem(GLASS_TYPES_STORAGE_KEY, JSON.stringify(data));
};

export const getAllGlassTypes = (): GlassType[] => {
  return getFromStorage();
};

export const saveGlassType = (glass: GlassType): GlassType => {
  const glasses = getFromStorage();
  const existingIndex = glasses.findIndex(g => g.id === glass.id);

  if (existingIndex > -1) {
    glasses[existingIndex] = glass;
  } else {
    glasses.push(glass);
  }

  saveToStorage(glasses);
  return glass;
};

export const deleteGlassType = (id: string): void => {
  let glasses = getFromStorage();
  glasses = glasses.filter(g => g.id !== id);
  saveToStorage(glasses);
};

const seedData = () => {
  if (getFromStorage().length === 0) {
    const seed: GlassType[] = [
      { id: 'glass-1', name: '10mm cường lực' },
      { id: 'glass-2', name: '8.38mm dán an toàn' },
      { id: 'glass-3', name: 'Kính hộp 5-9-5' },
      { id: 'glass-4', name: 'Kính Low-E' },
      { id: 'glass-5', name: 'Kính phản quang' },
    ];
    saveToStorage(seed);
  }
};

seedData();