export type WalletType = "cash" | "bank" | "e-wallet" | "other";

export const WALLET_TYPES: WalletType[] = [
  "cash",
  "bank",
  "e-wallet",
  "other",
];

export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  cash: "Tunai",
  bank: "Bank",
  "e-wallet": "E-Wallet",
  other: "Lainnya",
};

export const WALLET_TYPE_OPTIONS = WALLET_TYPES.map((type) => ({
  value: type,
  label: WALLET_TYPE_LABELS[type],
}));

export const WALLET_ICONS = [
  "wallet",
  "banknote",
  "building-2",
  "credit-card",
  "smartphone",
  "piggy-bank",
  "coins",
  "landmark",
] as const;

export type WalletIcon = (typeof WALLET_ICONS)[number];

export const WALLET_COLORS = [
  "#FF6B9D", // pink
  "#7C3AED", // purple
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#6366F1", // indigo
  "#14B8A6", // teal
] as const;

export type WalletColor = (typeof WALLET_COLORS)[number];

export interface WalletWithBalance {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  icon: string | null;
  color: string | null;
  initialBalance: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  currentBalance: number; // computed from initialBalance + income - expense
}

export interface CreateWalletInput {
  name: string;
  type: WalletType;
  icon?: string;
  color?: string;
  initialBalance?: number;
  isDefault?: boolean;
}

export interface UpdateWalletInput {
  name?: string;
  type?: WalletType;
  icon?: string;
  color?: string;
  initialBalance?: number;
  isDefault?: boolean;
}

export interface TransferInput {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  date: string;
  note?: string;
}
