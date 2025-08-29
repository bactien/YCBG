import { AluminumSystem } from '../types';
import { ALUMINUM_SYSTEMS_STORAGE_KEY } from '../constants';

const getFromStorage = (): AluminumSystem[] => {
  const data = localStorage.getItem(ALUMINUM_SYSTEMS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = (data: AluminumSystem[]): void => {
  localStorage.setItem(ALUMINUM_SYSTEMS_STORAGE_KEY, JSON.stringify(data));
};

export const getAllAluminumSystems = (): AluminumSystem[] => {
  return getFromStorage();
};

export const saveAluminumSystem = (system: AluminumSystem): AluminumSystem => {
  const systems = getFromStorage();
  const existingIndex = systems.findIndex(s => s.id === system.id);

  if (existingIndex > -1) {
    systems[existingIndex] = system;
  } else {
    systems.push(system);
  }

  saveToStorage(systems);
  return system;
};

export const deleteAluminumSystem = (id: string): void => {
  let systems = getFromStorage();
  systems = systems.filter(s => s.id !== id);
  saveToStorage(systems);
};

const seedData = () => {
  if (getFromStorage().length === 0) {
    const seed: AluminumSystem[] = [
      { id: 'sys-1', name: 'Xingfa Class A' },
      { id: 'sys-2', name: 'Aluman-DW50' },
      { id: 'sys-3', name: 'Aluman-WD60' },
      { id: 'sys-4', name: 'Aluman-FIX50' },
      { id: 'sys-5', name: 'Topal Prima' },
    ];
    saveToStorage(seed);
  }
};

seedData();