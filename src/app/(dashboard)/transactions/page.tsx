"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Filter, 
  Receipt, 
  ScanLine,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";
import Link from "next/link";
import { CATEGORY_OPTIONS, TransactionCategory, TransactionType } from "@/types/transaction";

interface Transaction {
  id: string;
  type: TransactionType;
  storeName: string;
  date: string;
  total: number;
  category: TransactionCategory;
  wallet?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TransactionCategory | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions from API
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        if (category !== "all") params.set("category", category);
        if (search) params.set("search", search);
        
        const res = await fetch(`/api/transactions?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Failed to fetch transactions");
        }
        
        const data = await res.json() as { transactions: Transaction[] };
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Gagal memuat transaksi");
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [startDate, endDate, category, search]);

  const filteredTransactions = transactions;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">Transaksi</h1>
          <p className="font-medium text-muted-foreground">Riwayat pengeluaran kamu</p>
        </div>
        <Link href="/scan">
          <Button>
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-xs font-bold uppercase">
                Cari Toko
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="search"
                  placeholder="Nama toko..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-bold uppercase">
                Kategori
              </Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as TransactionCategory | "all")}
              >
                <SelectTrigger className="border-[3px] border-black shadow-[4px_4px_0px_#000]">
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs font-bold uppercase">
                Dari Tanggal
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs font-bold uppercase">
                Sampai Tanggal
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="mt-4 font-medium text-muted-foreground">Memuat transaksi...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="font-medium text-destructive">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </Button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-20 w-20 items-center justify-center border-[3px] border-black bg-primary shadow-[4px_4px_0px_#000]">
                <Receipt className="h-10 w-10" />
              </div>
              <h3 className="mb-2 text-xl font-black uppercase">Belum Ada</h3>
              <p className="mb-6 max-w-sm text-center font-medium text-muted-foreground">
                Mulai catat pengeluaranmu dengan scan struk
              </p>
              <Link href="/scan">
                <Button>
                  <ScanLine className="h-4 w-4" />
                  Scan Struk
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y-[3px] divide-black">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 bg-black p-4 font-bold uppercase text-white">
                <div>Tanggal</div>
                <div>Toko/Sumber</div>
                <div>Dompet</div>
                <div>Kategori</div>
                <div>Tipe</div>
                <div className="text-right">Jumlah</div>
              </div>
              {/* Table Body */}
              {filteredTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="grid grid-cols-6 gap-4 p-4 font-medium transition-colors hover:bg-primary/20"
                >
                  <div>
                    {new Date(tx.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </div>
                  <div className="font-bold">{tx.storeName}</div>
                  <div>
                    {tx.wallet ? (
                      <span className="inline-flex items-center gap-1 border-[2px] border-black px-2 py-1 text-xs font-bold">
                        <span
                          className="h-2 w-2 border border-black"
                          style={{ backgroundColor: tx.wallet.color || "#3B82F6" }}
                        />
                        {tx.wallet.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </div>
                  <div>
                    <span className="inline-block border-[2px] border-black bg-secondary px-2 py-1 text-xs font-bold uppercase">
                      {CATEGORY_OPTIONS.find((c) => c.value === tx.category)?.label}
                    </span>
                  </div>
                  <div>
                    {tx.type === "income" ? (
                      <span className="inline-flex items-center gap-1 border-[2px] border-black bg-green-100 px-2 py-1 text-xs font-bold uppercase text-green-700">
                        <ArrowUpCircle className="h-3 w-3" />
                        Masuk
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 border-[2px] border-black bg-red-100 px-2 py-1 text-xs font-bold uppercase text-red-700">
                        <ArrowDownCircle className="h-3 w-3" />
                        Keluar
                      </span>
                    )}
                  </div>
                  <div className={`text-right font-black ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "income" ? "+" : "-"}Rp {tx.total.toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
