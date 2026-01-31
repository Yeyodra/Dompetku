import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { db, wallets, users } from "@/db";
import { eq } from "drizzle-orm";

export const runtime = "edge";

type WalletType = "cash" | "bank" | "e-wallet" | "other";

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

interface CreateWalletInput {
  name: string;
  type?: WalletType;
  icon?: string;
  color?: string;
  initialBalance?: number;
  isDefault?: boolean;
}

// GET /api/wallets - List all wallets with calculated balance
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Get all wallets with calculated balance from transactions
    // Balance = initialBalance + income - expense + transfers_in - transfers_out
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
        WHERE type = 'income' AND user_id = ${userId}
        GROUP BY wallet_id
      ) income ON income.wallet_id = w.id
      LEFT JOIN (
        SELECT wallet_id, SUM(total) as total
        FROM transactions
        WHERE type = 'expense' AND user_id = ${userId}
        GROUP BY wallet_id
      ) expense ON expense.wallet_id = w.id
      LEFT JOIN (
        SELECT to_wallet_id, SUM(total) as total
        FROM transactions
        WHERE type = 'transfer' AND user_id = ${userId}
        GROUP BY to_wallet_id
      ) transfer_in ON transfer_in.to_wallet_id = w.id
      LEFT JOIN (
        SELECT wallet_id, SUM(total) as total
        FROM transactions
        WHERE type = 'transfer' AND user_id = ${userId}
        GROUP BY wallet_id
      ) transfer_out ON transfer_out.wallet_id = w.id
      WHERE w.user_id = ${userId}
      ORDER BY w.is_default DESC, w.created_at ASC
    `;

    const walletsWithBalance: WalletWithBalance[] = result.map((row: any) => ({
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
    }));

    return NextResponse.json({ wallets: walletsWithBalance });
  } catch (error) {
    console.error("GET /api/wallets error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/wallets - Create new wallet
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateWalletInput = await request.json();

    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Wallet name is required" },
        { status: 400 }
      );
    }

    // Ensure user exists in DB
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: userId,
        email: "user@example.com",
        name: "User",
        createdAt: new Date(),
      });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // If this wallet is set as default, unset other defaults first
    if (body.isDefault) {
      await sql`
        UPDATE wallets 
        SET is_default = false 
        WHERE user_id = ${userId} AND is_default = true
      `;
    }

    // Check if user has no wallets - make first one default
    const existingWallets = await sql`
      SELECT COUNT(*) as count FROM wallets WHERE user_id = ${userId}
    `;
    const isFirstWallet = parseInt(existingWallets[0].count) === 0;

    const walletId = crypto.randomUUID();
    const now = new Date();

    await db.insert(wallets).values({
      id: walletId,
      userId,
      name: body.name.trim(),
      type: body.type || "cash",
      icon: body.icon || null,
      color: body.color || null,
      initialBalance: body.initialBalance || 0,
      isDefault: body.isDefault ?? isFirstWallet,
      createdAt: now,
      updatedAt: now,
    });

    const created = await db
      .select()
      .from(wallets)
      .where(eq(wallets.id, walletId))
      .limit(1);

    return NextResponse.json(
      {
        wallet: {
          ...created[0],
          balance: created[0].initialBalance,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/wallets error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
