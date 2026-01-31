export interface ReceiptData {
  storeName: string | null;
  date: string | null;
  total: number | null;
  items: ReceiptItem[];
  rawText: string;
  confidence: number;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OCRResult {
  success: boolean;
  data?: ReceiptData;
  error?: string;
}

export interface OCRProgress {
  status: string;
  progress: number;
}
