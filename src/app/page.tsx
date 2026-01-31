import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wallet, ScanLine, Receipt, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <Wallet className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold">Dompetku</span>
        </div>
        <div className="flex gap-4">
          <Link href="/sign-in">
            <Button variant="ghost">Masuk</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Daftar</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
          Catat Pengeluaran
          <br />
          <span className="text-blue-600">Dengan Mudah</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          Scan struk belanja dan otomatis catat pengeluaran kamu. 
          Pantau keuangan dengan lebih mudah menggunakan teknologi OCR.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/sign-up">
            <Button size="lg">
              Mulai Gratis
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline">
              Sudah Punya Akun
            </Button>
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Fitur Unggulan</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <ScanLine className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Scan Struk OCR</h3>
            <p className="text-gray-600">
              Foto struk belanja dan biarkan sistem membaca otomatis. 
              Tidak perlu input manual lagi.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Receipt className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Kategori Otomatis</h3>
            <p className="text-gray-600">
              Kelompokkan pengeluaran berdasarkan kategori: 
              makanan, transportasi, belanja, dan lainnya.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Laporan Keuangan</h3>
            <p className="text-gray-600">
              Lihat ringkasan pengeluaran harian, mingguan, 
              dan bulanan dalam satu dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2026 Dompetku - Penelitian Ilmiah Universitas Gunadarma</p>
        </div>
      </footer>
    </div>
  );
}
