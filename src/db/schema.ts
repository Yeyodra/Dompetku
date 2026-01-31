import { pgTable, text, timestamp, real, integer, index } from "drizzle-orm/pg-core";

// Users table - synced with Clerk
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull().default("expense"), // "expense" or "income"
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
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type TransactionItem = typeof transactionItems.$inferSelect;
export type NewTransactionItem = typeof transactionItems.$inferInsert;
