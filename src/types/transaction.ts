export type TransactionCategory =
  | "makanan"
  | "minuman"
  | "belanja"
  | "transportasi"
  | "hiburan"
  | "kesehatan"
  | "pendidikan"
  | "lainnya";

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  makanan: "Makanan",
  minuman: "Minuman",
  belanja: "Belanja",
  transportasi: "Transportasi",
  hiburan: "Hiburan",
  kesehatan: "Kesehatan",
  pendidikan: "Pendidikan",
  lainnya: "Lainnya",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({
    value: value as TransactionCategory,
    label,
  })
);

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  category?: TransactionCategory;
  search?: string;
}

export interface TransactionWithItems {
  id: string;
  userId: string;
  storeName: string;
  date: string;
  total: number;
  category: TransactionCategory;
  receiptImageUrl?: string | null;
  rawOcrText?: string | null;
  ocrConfidence?: number | null;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

export interface CreateTransactionInput {
  storeName: string;
  date: string;
  total: number;
  category: TransactionCategory;
  receiptImageUrl?: string;
  rawOcrText?: string;
  ocrConfidence?: number;
  items?: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export interface UpdateTransactionInput {
  storeName?: string;
  date?: string;
  total?: number;
  category?: TransactionCategory;
  receiptImageUrl?: string;
  items?: {
    name: string;
    quantity: number;
    price: number;
  }[];
}
