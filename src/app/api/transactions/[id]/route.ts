import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, transactions, transactionItems } from "@/db";
import { eq, and } from "drizzle-orm";
import { UpdateTransactionInput } from "@/types/transaction";

export const runtime = "edge";

// GET /api/transactions/[id] - Get single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const result = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const items = await db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, id));

    return NextResponse.json({ transaction: { ...result[0], items } });
  } catch (error) {
    console.error("GET /api/transactions/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - Update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existing = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body: UpdateTransactionInput = await request.json();

    // Update transaction
    await db
      .update(transactions)
      .set({
        ...(body.storeName && { storeName: body.storeName }),
        ...(body.date && { date: body.date }),
        ...(body.total !== undefined && { total: body.total }),
        ...(body.category && { category: body.category }),
        ...(body.receiptImageUrl && { receiptImageUrl: body.receiptImageUrl }),
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id));

    // Update items if provided
    if (body.items) {
      // Delete existing items
      await db
        .delete(transactionItems)
        .where(eq(transactionItems.transactionId, id));

      // Insert new items
      if (body.items.length > 0) {
        await db.insert(transactionItems).values(
          body.items.map((item) => ({
            id: crypto.randomUUID(),
            transactionId: id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          }))
        );
      }
    }

    // Fetch updated transaction
    const updated = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    const items = await db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, id));

    return NextResponse.json({ transaction: { ...updated[0], items } });
  } catch (error) {
    console.error("PUT /api/transactions/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existing = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete transaction (items will cascade delete)
    await db.delete(transactions).where(eq(transactions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
