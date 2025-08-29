
import { Customer } from '../types';
import { CUSTOMERS_STORAGE_KEY } from '../constants';

const getCustomersFromStorage = (): Customer[] => {
  const data = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveCustomersToStorage = (customers: Customer[]): void => {
  localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
};

export const getAllCustomers = (): Customer[] => {
  return getCustomersFromStorage();
};

export const getCustomerById = (id: string): Customer | undefined => {
  const customers = getCustomersFromStorage();
  return customers.find(c => c.id === id);
};

export const saveCustomer = (customer: Customer): Customer => {
  const customers = getCustomersFromStorage();
  const existingIndex = customers.findIndex(c => c.id === customer.id);

  if (existingIndex > -1) {
    customers[existingIndex] = customer;
  } else {
    customers.push(customer);
  }

  saveCustomersToStorage(customers);
  return customer;
};

export const deleteCustomer = (id: string): void => {
  let customers = getCustomersFromStorage();
  customers = customers.filter(c => c.id !== id);
  saveCustomersToStorage(customers);
};

export const generateCustomerCode = (): string => {
    const customers = getCustomersFromStorage();
    const prefix = 'KH-';
    
    const maxNum = customers
        .map(c => parseInt(c.code.replace(prefix, ''), 10))
        .filter(num => !isNaN(num))
        .reduce((max, num) => Math.max(max, num), 0);
        
    const nextNum = (maxNum + 1).toString().padStart(5, '0');
    return `${prefix}${nextNum}`;
};

// Seed initial data if none exists
const seedData = () => {
  if (getCustomersFromStorage().length === 0) {
    const seed: Customer[] = [
      {
        id: 'cust-1',
        code: 'KH-00001',
        name: 'Công ty TNHH Xây Dựng ABC',
        address: '123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',
      },
      {
        id: 'cust-2',
        code: 'KH-00002',
        name: 'Anh Nguyễn Văn B',
        address: '456 Đường Lê Lợi, Quận 3, TP.HCM',
      },
       {
        id: 'cust-3',
        code: 'KH-00003',
        name: 'Chị Trần Thị C - Biệt thự Thủ Đức',
        address: '789 Đường Võ Văn Ngân, TP. Thủ Đức, TP.HCM',
      },
    ];
    saveCustomersToStorage(seed);
  }
};

seedData();
