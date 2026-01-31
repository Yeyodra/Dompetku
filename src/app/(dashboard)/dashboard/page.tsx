import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Receipt, Calendar } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/scan">
          <Button>Scan Struk Baru</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Pengeluaran
            </CardTitle>
            <Wallet className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {stats.totalExpense.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-500">Seluruh waktu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bulan Ini
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {stats.thisMonth.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Jumlah Transaksi
            </CardTitle>
            <Receipt className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactionCount}</div>
            <p className="text-xs text-gray-500">Total transaksi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Transaksi Terakhir
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.lastTransaction || "-"}
            </div>
            <p className="text-xs text-gray-500">Tanggal terakhir</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Mulai Mencatat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Selamat datang di Dompetku! Mulai catat pengeluaran kamu dengan scan struk belanja.
          </p>
          <div className="flex gap-4">
            <Link href="/scan">
              <Button>Scan Struk</Button>
            </Link>
            <Link href="/transactions">
              <Button variant="outline">Lihat Transaksi</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
