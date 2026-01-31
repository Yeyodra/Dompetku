"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  Receipt, 
  ArrowRight,
  ScanLine,
  Sparkles,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Summary {
  income: number;
  expense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        // Get current month date range (timezone-safe)
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        // Format as YYYY-MM-DD without timezone conversion
        const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
        
        const params = new URLSearchParams({
          startDate,
          endDate,
        });

        const res = await fetch(`/api/transactions/summary?${params}`);
        if (res.ok) {
          const data = await res.json() as { summary: Summary };
          setSummary(data.summary);
        }
      } catch (error) {
        console.error("Error fetching summary:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  const totalTransactions = (summary?.incomeCount || 0) + (summary?.expenseCount || 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">Dashboard</h1>
          <p className="font-medium text-muted-foreground">Ringkasan keuangan kamu</p>
        </div>
        <Link href="/scan">
          <Button>
            <ScanLine className="h-4 w-4" />
            Tambah Transaksi
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Balance - Primary Yellow */}
            <div className="border-[3px] border-black bg-primary p-6 shadow-[6px_6px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase">Saldo</span>
                <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-white">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className={`text-3xl font-black ${(summary?.balance || 0) < 0 ? "text-destructive" : ""}`}>
                  Rp {(summary?.balance || 0).toLocaleString("id-ID")}
                </div>
                <p className="mt-1 text-sm font-medium">
                  {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Income - Green */}
            <div className="border-[3px] border-black bg-secondary p-6 shadow-[6px_6px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase">Pemasukan</span>
                <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-white">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-green-700">
                  +Rp {(summary?.income || 0).toLocaleString("id-ID")}
                </div>
                <p className="mt-1 text-sm font-medium">{summary?.incomeCount || 0} transaksi</p>
              </div>
            </div>

            {/* Expense - Pink */}
            <div className="border-[3px] border-black bg-accent p-6 shadow-[6px_6px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase">Pengeluaran</span>
                <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-white">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-red-600">
                  -Rp {(summary?.expense || 0).toLocaleString("id-ID")}
                </div>
                <p className="mt-1 text-sm font-medium">{summary?.expenseCount || 0} transaksi</p>
              </div>
            </div>

            {/* Transaction Count - Blue */}
            <div className="border-[3px] border-black bg-[#88D8FF] p-6 shadow-[6px_6px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase">Total Transaksi</span>
                <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-white">
                  <Receipt className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black">{totalTransactions}</div>
                <p className="mt-1 text-sm font-medium">Bulan ini</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Mulai Mencatat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-medium">
                Selamat datang di Dompetku! Catat pemasukan dan pengeluaran dengan mudah.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/scan">
                  <Button>
                    <ScanLine className="h-4 w-4" />
                    Tambah Transaksi
                  </Button>
                </Link>
                <Link href="/transactions">
                  <Button variant="outline">
                    Lihat Transaksi
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
