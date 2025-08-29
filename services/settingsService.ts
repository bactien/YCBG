import { COMPANY_LOGO_STORAGE_KEY } from '../constants';

export const saveCompanyLogo = (logoDataUrl: string): void => {
  localStorage.setItem(COMPANY_LOGO_STORAGE_KEY, logoDataUrl);
};

export const getCompanyLogo = (): string | null => {
  return localStorage.getItem(COMPANY_LOGO_STORAGE_KEY);
};

export const removeCompanyLogo = (): void => {
  localStorage.removeItem(COMPANY_LOGO_STORAGE_KEY);
};