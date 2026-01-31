import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet, 
  TrendingUp, 
  Receipt, 
  Calendar, 
  ArrowRight,
  ScanLine,
  Sparkles 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const { userId } = await auth();

  // TODO: Fetch actual stats from API
  const stats = {
    totalExpense: 0,
    thisMonth: 0,
    transactionCount: 0,
    lastTransaction: null as string | null,
  };

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
            Scan Struk
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total - Primary Yellow */}
        <div className="border-[3px] border-black bg-primary p-6 shadow-[6px_6px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase">Total Pengeluaran</span>
            <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-white">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black">
              Rp {stats.totalExpense.toLocaleString("id-ID")}
            </div>
            <p className="mt-1 text-sm font-medium">Seluruh waktu</p>
          </div>
        </div>

        {/* This Month - Green */}
        <div className="border-[3px] border-black bg-secondary p-6 shadow-[6px_6px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase">Bulan Ini</span>
            <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-white">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black">
              Rp {stats.thisMonth.toLocaleString("id-ID")}
            </div>
            <p className="mt-1 text-sm font-medium">
              {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Transaction Count - Pink */}
        <div className="border-[3px] border-black bg-accent p-6 shadow-[6px_6px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase">Transaksi</span>
            <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-white">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black">{stats.transactionCount}</div>
            <p className="mt-1 text-sm font-medium">Total transaksi</p>
          </div>
        </div>

        {/* Last Transaction - Blue */}
        <div className="border-[3px] border-black bg-[#88D8FF] p-6 shadow-[6px_6px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase">Terakhir</span>
            <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-white">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black">
              {stats.lastTransaction || "-"}
            </div>
            <p className="mt-1 text-sm font-medium">Tanggal terakhir</p>
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
            Selamat datang di Dompetku! Mulai catat pengeluaran dengan scan struk menggunakan AI.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/scan">
              <Button>
                <ScanLine className="h-4 w-4" />
                Scan Struk
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
    </div>
  );
}
