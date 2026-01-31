import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

// Users table - synced with Clerk
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Transactions table
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  storeName: text("store_name").notNull(),
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  total: real("total").notNull(),
  category: text("category").notNull(), // makanan, minuman, belanja, etc.
  receiptImageUrl: text("receipt_image_url"),
  rawOcrText: text("raw_ocr_text"),
  ocrConfidence: real("ocr_confidence"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
}, (table) => [
  index("transactions_user_id_idx").on(table.userId),
  index("transactions_date_idx").on(table.date),
  index("transactions_category_idx").on(table.category),
]);

// Transaction items table
export const transactionItems = sqliteTable("transaction_items", {
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
