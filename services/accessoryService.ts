import { AccessorySet } from '../types';
import { ACCESSORY_SETS_STORAGE_KEY } from '../constants';

const getFromStorage = (): AccessorySet[] => {
  const data = localStorage.getItem(ACCESSORY_SETS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = (data: AccessorySet[]): void => {
  localStorage.setItem(ACCESSORY_SETS_STORAGE_KEY, JSON.stringify(data));
};

export const getAllAccessorySets = (): AccessorySet[] => {
  return getFromStorage();
};

export const saveAccessorySet = (accessory: AccessorySet): AccessorySet => {
  const accessories = getFromStorage();
  const existingIndex = accessories.findIndex(a => a.id === accessory.id);

  if (existingIndex > -1) {
    accessories[existingIndex] = accessory;
  } else {
    accessories.push(accessory);
  }

  saveToStorage(accessories);
  return accessory;
};

export const deleteAccessorySet = (id: string): void => {
  let accessories = getFromStorage();
  accessories = accessories.filter(a => a.id !== id);
  saveToStorage(accessories);
};

const seedData = () => {
  if (getFromStorage().length === 0) {
    const seed: AccessorySet[] = [
      { id: 'acc-1', name: 'Kinlong cửa đi', description: 'Bản lề 3D, Khóa đa điểm, Tay nắm' },
      { id: 'acc-2', name: 'Kinlong cửa sổ', description: 'Bản lề ma sát, Tay nắm gạt, Thanh hạn vị' },
      { id: 'acc-3', name: 'Cmech cửa lùa', description: 'Bánh xe đôi, Khóa sập, Chống rung' },
      { id: 'acc-4', name: 'Huy Hoàng cửa đi', description: 'Khóa vân tay, Mắt thần, Chặn cửa' },
    ];
    saveToStorage(seed);
  }
};

seedData();