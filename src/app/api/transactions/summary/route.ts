import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "edge";

// GET /api/transactions/summary - Get income/expense summary
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "1900-01-01";
    const endDate = searchParams.get("endDate") || "2100-12-31";

    const sql = neon(process.env.DATABASE_URL!);

    const result = await sql`
      SELECT type, COALESCE(SUM(total), 0) as total, COUNT(*) as count 
      FROM transactions 
      WHERE user_id = ${userId}
        AND date >= ${startDate}
        AND date <= ${endDate}
      GROUP BY type
    `;

    const income = result.find((r: any) => r.type === "income");
    const expense = result.find((r: any) => r.type === "expense");

    const totalIncome = parseFloat(income?.total || "0");
    const totalExpense = parseFloat(expense?.total || "0");
    const balance = totalIncome - totalExpense;

    return NextResponse.json({
      summary: {
        income: totalIncome,
        expense: totalExpense,
        balance,
        incomeCount: parseInt(income?.count || "0"),
        expenseCount: parseInt(expense?.count || "0"),
      },
    });
  } catch (error) {
    console.error("GET /api/transactions/summary error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
