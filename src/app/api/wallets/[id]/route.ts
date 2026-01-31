import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { db, wallets } from "@/db";
import { eq, and } from "drizzle-orm";

export const runtime = "edge";

type WalletType = "cash" | "bank" | "e-wallet" | "other";

interface UpdateWalletInput {
  name?: string;
  type?: WalletType;
  icon?: string;
  color?: string;
  initialBalance?: number;
  isDefault?: boolean;
}

interface WalletWithBalance {
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
  balance: number;
}

// GET /api/wallets/[id] - Get single wallet with balance
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
    const sql = neon(process.env.DATABASE_URL!);

    const result = await sql`
      SELECT 
        w.id,
        w.user_id,
        w.name,
        w.type,
        w.icon,
        w.color,
        w.initial_balance,
        w.is_default,
        w.created_at,
        w.updated_at,
        COALESCE(w.initial_balance, 0) 
          + COALESCE(income.total, 0) 
          - COALESCE(expense.total, 0)
          + COALESCE(transfer_in.total, 0)
          - COALESCE(transfer_out.total, 0) as balance
      FROM wallets w
      LEFT JOIN (
        SELECT wallet_id, SUM(total) as total
        FROM transactions
        WHERE type = 'income' AND wallet_id = ${id}
        GROUP BY wallet_id
      ) income ON income.wallet_id = w.id
      LEFT JOIN (
        SELECT wallet_id, SUM(total) as total
        FROM transactions
        WHERE type = 'expense' AND wallet_id = ${id}
        GROUP BY wallet_id
      ) expense ON expense.wallet_id = w.id
      LEFT JOIN (
        SELECT to_wallet_id, SUM(total) as total
        FROM transactions
        WHERE type = 'transfer' AND to_wallet_id = ${id}
        GROUP BY to_wallet_id
      ) transfer_in ON transfer_in.to_wallet_id = w.id
      LEFT JOIN (
        SELECT wallet_id, SUM(total) as total
        FROM transactions
        WHERE type = 'transfer' AND wallet_id = ${id}
        GROUP BY wallet_id
      ) transfer_out ON transfer_out.wallet_id = w.id
      WHERE w.id = ${id} AND w.user_id = ${userId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const row = result[0];
    const wallet: WalletWithBalance = {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type as WalletType,
      icon: row.icon,
      color: row.color,
      initialBalance: parseFloat(row.initial_balance || "0"),
      isDefault: row.is_default,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      balance: parseFloat(row.balance || "0"),
    };

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error("GET /api/wallets/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/wallets/[id] - Update wallet
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
    const body: UpdateWalletInput = await request.json();

    // Verify wallet exists and belongs to user
    const existing = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.id, id), eq(wallets.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // If setting as default, unset other defaults first
    if (body.isDefault) {
      await sql`
        UPDATE wallets 
        SET is_default = false 
        WHERE user_id = ${userId} AND is_default = true AND id != ${id}
      `;
    }

    // Build update object
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.type !== undefined) updateData.type = body.type;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.initialBalance !== undefined) updateData.initialBalance = body.initialBalance;
    if (body.isDefault !== undefined) updateData.isDefault = body.isDefault;

    await db
      .update(wallets)
      .set(updateData)
      .where(and(eq(wallets.id, id), eq(wallets.userId, userId)));

    // Fetch updated wallet with balance
    const result = await sql`
      SELECT 
        w.id,
        w.user_id,
        w.name,
        w.type,
        w.icon,
        w.color,
        w.initial_balance,
        w.is_default,
        w.created_at,
        w.updated_at,
        COALESCE(w.initial_balance, 0) 
          + COALESCE(income.total, 0) 
          - COALESCE(expense.total, 0)
          + COALESCE(transfer_in.total, 0)
          - COALESCE(transfer_out.total, 0) as balance
      FROM wallets w
      LEFT JOIN (
        SELECT wallet_id, SUM(total) as total
        FROM transactions
        WHERE type = 'income' AND wallet_id = ${id}
        GROUP BY wallet_id
      ) income ON income.wallet_id = w.id
      LEFT JOIN (
        SELECT wallet_id, SUM(total) as total
        FROM transactions
        WHERE type = 'expense' AND wallet_id = ${id}
        GROUP BY wallet_id
      ) expense ON expense.wallet_id = w.id
      LEFT JOIN (
        SELECT to_wallet_id, SUM(total) as total
        FROM transactions
        WHERE type = 'transfer' AND to_wallet_id = ${id}
        GROUP BY to_wallet_id
      ) transfer_in ON transfer_in.to_wallet_id = w.id
      LEFT JOIN (
        SELECT wallet_id, SUM(total) as total
        FROM transactions
        WHERE type = 'transfer' AND wallet_id = ${id}
        GROUP BY wallet_id
      ) transfer_out ON transfer_out.wallet_id = w.id
      WHERE w.id = ${id}
      LIMIT 1
    `;

    const row = result[0];
    const wallet: WalletWithBalance = {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type as WalletType,
      icon: row.icon,
      color: row.color,
      initialBalance: parseFloat(row.initial_balance || "0"),
      isDefault: row.is_default,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      balance: parseFloat(row.balance || "0"),
    };

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error("PUT /api/wallets/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/wallets/[id] - Delete wallet (only if no transactions)
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

    // Verify wallet exists and belongs to user
    const existing = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.id, id), eq(wallets.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Check if wallet has any transactions (as source or target)
    const transactionCount = await sql`
      SELECT COUNT(*) as count
      FROM transactions
      WHERE wallet_id = ${id} OR to_wallet_id = ${id}
    `;

    if (parseInt(transactionCount[0].count) > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete wallet with transactions",
          message: "This wallet has linked transactions. Delete or reassign them first.",
        },
        { status: 400 }
      );
    }

    // Check if this is the only wallet
    const walletCount = await sql`
      SELECT COUNT(*) as count FROM wallets WHERE user_id = ${userId}
    `;

    if (parseInt(walletCount[0].count) <= 1) {
      return NextResponse.json(
        {
          error: "Cannot delete last wallet",
          message: "You must have at least one wallet.",
        },
        { status: 400 }
      );
    }

    const wasDefault = existing[0].isDefault;

    // Delete the wallet
    await db
      .delete(wallets)
      .where(and(eq(wallets.id, id), eq(wallets.userId, userId)));

    // If deleted wallet was default, set another one as default
    if (wasDefault) {
      await sql`
        UPDATE wallets 
        SET is_default = true 
        WHERE user_id = ${userId} 
        AND id != ${id}
        ORDER BY created_at ASC
        LIMIT 1
      `;
    }

    return NextResponse.json({ success: true, message: "Wallet deleted" });
  } catch (error) {
    console.error("DELETE /api/wallets/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
