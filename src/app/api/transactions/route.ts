import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createDb, transactions, transactionItems, users } from "@/db";
import { eq, desc, and, gte, lte, like } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CreateTransactionInput, TransactionCategory } from "@/types/transaction";

export const runtime = "edge";

// GET /api/transactions - List transactions with filters
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = createDb(env.DB);

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category") as TransactionCategory | null;
    const search = searchParams.get("search");

    // Build query conditions
    const conditions = [eq(transactions.userId, userId)];

    if (startDate) {
      conditions.push(gte(transactions.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.date, endDate));
    }
    if (category) {
      conditions.push(eq(transactions.category, category));
    }
    if (search) {
      conditions.push(like(transactions.storeName, `%${search}%`));
    }

    const result = await db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.date), desc(transactions.createdAt));

    // Get items for each transaction
    const transactionsWithItems = await Promise.all(
      result.map(async (tx) => {
        const items = await db
          .select()
          .from(transactionItems)
          .where(eq(transactionItems.transactionId, tx.id));
        return { ...tx, items };
      })
    );

    return NextResponse.json({ transactions: transactionsWithItems });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = createDb(env.DB);

    const body: CreateTransactionInput = await request.json();

    // Ensure user exists in DB (sync from Clerk)
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      // Create user record
      await db.insert(users).values({
        id: userId,
        email: "user@example.com", // Will be updated via webhook
        name: "User",
        createdAt: new Date(),
      });
    }

    const transactionId = crypto.randomUUID();
    const now = new Date();

    // Insert transaction
    await db.insert(transactions).values({
      id: transactionId,
      userId,
      storeName: body.storeName,
      date: body.date,
      total: body.total,
      category: body.category,
      receiptImageUrl: body.receiptImageUrl || null,
      rawOcrText: body.rawOcrText || null,
      ocrConfidence: body.ocrConfidence || null,
      createdAt: now,
      updatedAt: now,
    });

    // Insert items if provided
    if (body.items && body.items.length > 0) {
      await db.insert(transactionItems).values(
        body.items.map((item) => ({
          id: crypto.randomUUID(),
          transactionId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        }))
      );
    }

    // Fetch the created transaction with items
    const created = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    const items = await db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, transactionId));

    return NextResponse.json(
      { transaction: { ...created[0], items } },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
