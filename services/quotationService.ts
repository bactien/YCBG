
// FIX: Import required enums for type safety.
import { QuotationRequest, Status, RequesterType, DoorType, OpenDirection } from '../types';
import { LOCAL_STORAGE_KEY } from '../constants';

const getQuotationsFromStorage = (): QuotationRequest[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveQuotationsToStorage = (quotations: QuotationRequest[]): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotations));
};

export const getAllQuotations = (): QuotationRequest[] => {
  return getQuotationsFromStorage();
};

export const getQuotationById = (id: string): QuotationRequest | undefined => {
  const quotations = getQuotationsFromStorage();
  return quotations.find(q => q.id === id);
};

export const saveQuotation = (quotation: QuotationRequest): QuotationRequest => {
  const quotations = getQuotationsFromStorage();
  const existingIndex = quotations.findIndex(q => q.id === quotation.id);

  if (existingIndex > -1) {
    quotations[existingIndex] = quotation;
  } else {
    quotations.push(quotation);
  }

  saveQuotationsToStorage(quotations);
  return quotation;
};

export const deleteQuotation = (id: string): void => {
  let quotations = getQuotationsFromStorage();
  quotations = quotations.filter(q => q.id !== id);
  saveQuotationsToStorage(quotations);
};

export const generateRequestCode = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `YCBG-${year}${month}-`;

  const quotations = getQuotationsFromStorage();
  const relevantCodes = quotations
    .map(q => q.code)
    .filter(code => code.startsWith(prefix))
    .map(code => parseInt(code.replace(prefix, ''), 10))
    .filter(num => !isNaN(num));

  const maxNum = relevantCodes.length > 0 ? Math.max(...relevantCodes) : 0;
  const nextNum = (maxNum + 1).toString().padStart(4, '0');

  return `${prefix}${nextNum}`;
};

// Seed initial data if none exists
const seedData = () => {
  if (getQuotationsFromStorage().length === 0) {
    const seed: QuotationRequest[] = [
      {
        id: 'c7a4f5b2-3e1d-4c8a-9b6f-0a1b2c3d4e5f',
        code: 'YCBG-202407-0001',
        date: '2024-07-21',
        requesterType: RequesterType.NVKD,
        system: 'Aluman-DW50',
        color: 'Anode Silver',
        glass: '8.38mm Laminated',
        paint: 'Powder Coat',
        shipping: 'Giao tại công trình',
        customerCode: 'KH-00123',
        customerName: 'Công ty TNHH Xây Dựng ABC',
        customerAddress: '123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',
        status: Status.Final,
        discountPercentage: 5, // Added discount data
        items: [
          { id: 'item-1', doorName: 'SG-DW01.1', system: 'Aluman-DW50', glass: 'Clear Tempered 10mm', quantity: 1, doorType: DoorType.Door, openDir: OpenDirection.Outward, imageUrl: 'https://picsum.photos/seed/SG-DW01.1/200/200', accessories: 'Bản lề 3D, Khóa đa điểm, Tay nắm' },
          { id: 'item-2', doorName: 'SG-DW02.1', system: 'Aluman-DW50', glass: 'Low-E', quantity: 2, doorType: DoorType.Window, openDir: OpenDirection.Inward, imageUrl: 'https://picsum.photos/seed/SG-DW02.1/200/200', accessories: 'Thanh hạn vị, tay nắm gạt' },
          { id: 'item-3', doorName: 'SG-WD01.1', system: 'Aluman-WD60', glass: 'Double Glazing', quantity: 5, doorType: DoorType.Window, openDir: OpenDirection.Inward, accessories: 'Tay nắm, thanh hạn vị' },
          { id: 'item-4', doorName: 'Vách cố định', system: 'Aluman-FIX50', glass: '10mm cường lực', quantity: 4, doorType: DoorType.Vach, openDir: null, accessories: 'Nẹp sập, keo silicone' },
        ],
      },
       {
        id: 'd8b5g6c3-4f2e-5d9b-0c7g-1b2c3d4e5f6g',
        code: 'YCBG-202407-0002',
        date: '2024-07-22',
        requesterType: RequesterType.Other,
        system: 'Xingfa Class A',
        color: 'Xám Ghi',
        glass: '10mm cường lực',
        paint: 'Sơn tĩnh điện',
        shipping: 'Tự vận chuyển',
        customerCode: 'KH-00124',
        customerName: 'Anh Nguyễn Văn B',
        customerAddress: '456 Đường Lê Lợi, Quận 3, TP.HCM',
        status: Status.Draft,
        items: [
          { id: 'item-5', doorName: 'Cửa chính', system: 'Xingfa Class A', glass: '10mm cường lực', quantity: 1, doorType: DoorType.Door, openDir: OpenDirection.Outward, accessories: 'Khóa vân tay, mắt thần' },
        ],
      }
    ];
    saveQuotationsToStorage(seed);
  }
};

seedData();