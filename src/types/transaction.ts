export type TransactionType = "expense" | "income" | "transfer";

export type TransactionCategory =
  | "makanan"
  | "minuman"
  | "belanja"
  | "transportasi"
  | "hiburan"
  | "kesehatan"
  | "pendidikan"
  | "gaji"
  | "bonus"
  | "investasi"
  | "lainnya";

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  "makanan",
  "minuman",
  "belanja",
  "transportasi",
  "hiburan",
  "kesehatan",
  "pendidikan",
  "lainnya",
];

export const INCOME_CATEGORIES: TransactionCategory[] = [
  "gaji",
  "bonus",
  "investasi",
  "lainnya",
];

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  makanan: "Makanan",
  minuman: "Minuman",
  belanja: "Belanja",
  transportasi: "Transportasi",
  hiburan: "Hiburan",
  kesehatan: "Kesehatan",
  pendidikan: "Pendidikan",
  gaji: "Gaji",
  bonus: "Bonus",
  investasi: "Investasi",
  lainnya: "Lainnya",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({
    value: value as TransactionCategory,
    label,
  })
);

export const EXPENSE_CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((cat) => ({
  value: cat,
  label: CATEGORY_LABELS[cat],
}));

export const INCOME_CATEGORY_OPTIONS = INCOME_CATEGORIES.map((cat) => ({
  value: cat,
  label: CATEGORY_LABELS[cat],
}));

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  category?: TransactionCategory;
  type?: TransactionType;
  search?: string;
}

export interface TransactionWithItems {
  id: string;
  userId: string;
  walletId?: string | null;
  type: TransactionType;
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
  wallet?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
}

export interface CreateTransactionInput {
  type: TransactionType;
  storeName: string;
  date: string;
  total: number;
  category: TransactionCategory;
  walletId?: string;
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
  type?: TransactionType;
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
