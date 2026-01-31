import { pgTable, text, timestamp, real, integer, boolean, index } from "drizzle-orm/pg-core";

// Users table - synced with Clerk
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Wallets table
export const wallets = pgTable("wallets", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(), // "Cash", "BCA", "Gopay"
  type: text("type").notNull().default("cash"), // "cash", "bank", "e-wallet", "other"
  icon: text("icon"), // icon name: "wallet", "bank", "smartphone"
  color: text("color"), // hex color: "#FF6B9D"
  initialBalance: real("initial_balance").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("wallets_user_id_idx").on(table.userId),
  index("wallets_type_idx").on(table.type),
  index("wallets_is_default_idx").on(table.userId, table.isDefault),
]);

// Transactions table
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  walletId: text("wallet_id").references(() => wallets.id), // Source wallet
  toWalletId: text("to_wallet_id").references(() => wallets.id), // Target wallet (for transfers)
  type: text("type").notNull().default("expense"), // "expense", "income", or "transfer"
  storeName: text("store_name").notNull(),
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  total: real("total").notNull(),
  category: text("category").notNull(), // makanan, minuman, belanja, etc.
  receiptImageUrl: text("receipt_image_url"),
  rawOcrText: text("raw_ocr_text"),
  ocrConfidence: real("ocr_confidence"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("transactions_user_id_idx").on(table.userId),
  index("transactions_wallet_id_idx").on(table.walletId),
  index("transactions_date_idx").on(table.date),
  index("transactions_category_idx").on(table.category),
  index("transactions_type_idx").on(table.type),
]);

// Transaction items table
export const transactionItems = pgTable("transaction_items", {
  id: text("id").primaryKey(),
  transactionId: text("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type TransactionItem = typeof transactionItems.$inferSelect;
export type NewTransactionItem = typeof transactionItems.$inferInsert;
