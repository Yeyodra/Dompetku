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
  Loader2,
  Banknote,
  Building2,
  Smartphone,
  CircleDollarSign,
  Plus,
  Star
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

type WalletType = "cash" | "bank" | "e-wallet" | "other";

interface WalletData {
  id: string;
  name: string;
  type: WalletType;
  color: string | null;
  balance: number;
  isDefault: boolean;
}

const walletTypeIcons: Record<WalletType, React.ElementType> = {
  cash: Banknote,
  bank: Building2,
  "e-wallet": Smartphone,
  other: CircleDollarSign,
};

const walletTypeLabels: Record<WalletType, string> = {
  cash: "Tunai",
  bank: "Bank",
  "e-wallet": "E-Wallet",
  other: "Lainnya",
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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

        // Fetch summary and wallets in parallel
        const [summaryRes, walletsRes] = await Promise.all([
          fetch(`/api/transactions/summary?${params}`),
          fetch("/api/wallets"),
        ]);

        if (summaryRes.ok) {
          const data = await summaryRes.json() as { summary: Summary };
          setSummary(data.summary);
        }

        if (walletsRes.ok) {
          const data = await walletsRes.json() as { wallets: WalletData[] };
          setWallets(data.wallets);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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

          {/* Wallets Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                DOMPET
              </CardTitle>
              <Link href="/wallets">
                <Button variant="outline" size="sm">
                  Lihat Semua
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {wallets.length === 0 ? (
                <div className="border-[3px] border-dashed border-black bg-muted/50 p-8 text-center">
                  <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-bold uppercase">Belum Ada Dompet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Buat dompet pertamamu untuk mulai mencatat keuangan
                  </p>
                  <Link href="/wallets">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4" />
                      Buat Dompet
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {wallets.slice(0, 6).map((wallet) => {
                    const Icon = walletTypeIcons[wallet.type];
                    return (
                      <Link key={wallet.id} href="/wallets">
                        <div
                          className="group relative border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000]"
                        >
                          {/* Color indicator */}
                          <div
                            className="absolute left-0 top-0 h-full w-2 border-r-[3px] border-black"
                            style={{ backgroundColor: wallet.color || "#FFD93D" }}
                          />
                          
                          <div className="ml-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center border-[2px] border-black bg-muted">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm font-bold uppercase truncate max-w-[120px]">
                                      {wallet.name}
                                    </span>
                                    {wallet.isDefault && (
                                      <Star className="h-3 w-3 fill-primary text-primary" />
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground uppercase">
                                    {walletTypeLabels[wallet.type]}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className={`mt-2 text-lg font-black ${wallet.balance < 0 ? "text-destructive" : ""}`}>
                              Rp {wallet.balance.toLocaleString("id-ID")}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

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
