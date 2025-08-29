export enum RequesterType {
  NVKD = "NVKD",
  Other = "Khác",
}

export enum DoorType {
  Door = "Cửa đi",
  Window = "Cửa sổ",
  Vach = "Vách",
}

export enum OpenDirection {
  Inward = "Mở trong",
  Outward = "Mở ngoài",
}

export enum Status {
  Draft = "Nháp",
  Final = "Hoàn tất",
}

export interface Item {
  id: string;
  doorName: string;
  system: string;
  glass: string;
  quantity: number;
  doorType: DoorType | null;
  openDir: OpenDirection | null;
  imageUrl?: string;
  accessories?: string;
}

export interface QuotationRequest {
  id: string;
  code: string;
  date: string;
  requesterType: RequesterType;
  system: string;
  color: string;
  glass: string;
  paint: string;
  shipping: string;
  customerCode: string;
  customerName: string;
  customerAddress: string;
  status: Status;
  items: Item[];
  discountPercentage?: number;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  address: string;
}

export interface AluminumSystem {
  id: string;
  name: string;
}

export interface GlassType {
  id: string;
  name: string;
}

export interface AccessorySet {
  id: string;
  name: string;
  description: string;
}