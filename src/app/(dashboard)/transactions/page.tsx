"use client";

import { useState } from "react";
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
  ScanLine
} from "lucide-react";
import Link from "next/link";
import { CATEGORY_OPTIONS, TransactionCategory } from "@/types/transaction";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TransactionCategory | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // TODO: Fetch transactions from API
  const transactions: Array<{
    id: string;
    storeName: string;
    date: string;
    total: number;
    category: TransactionCategory;
  }> = [];

  const filteredTransactions = transactions.filter((tx) => {
    if (search && !tx.storeName.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (category !== "all" && tx.category !== category) {
      return false;
    }
    if (startDate && tx.date < startDate) {
      return false;
    }
    if (endDate && tx.date > endDate) {
      return false;
    }
    return true;
  });

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
          {filteredTransactions.length === 0 ? (
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
              <div className="grid grid-cols-4 gap-4 bg-black p-4 font-bold uppercase text-white">
                <div>Tanggal</div>
                <div>Toko</div>
                <div>Kategori</div>
                <div className="text-right">Total</div>
              </div>
              {/* Table Body */}
              {filteredTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="grid grid-cols-4 gap-4 p-4 font-medium transition-colors hover:bg-primary/20"
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
                    <span className="inline-block border-[2px] border-black bg-secondary px-2 py-1 text-xs font-bold uppercase">
                      {CATEGORY_OPTIONS.find((c) => c.value === tx.category)?.label}
                    </span>
                  </div>
                  <div className="text-right font-black">
                    Rp {tx.total.toLocaleString("id-ID")}
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
