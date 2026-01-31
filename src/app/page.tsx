import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  ScanLine, 
  Receipt, 
  TrendingUp, 
  Sparkles, 
  Shield, 
  Zap,
  ArrowRight,
  Star
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FFFEF0]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b-[3px] border-black bg-[#FFFEF0]">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-primary shadow-[3px_3px_0px_#000]">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-xl font-black uppercase tracking-tight">Dompetku</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Masuk
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">
                Daftar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b-[3px] border-black">
        {/* Background pattern */}
        <div className="absolute inset-0 -z-10 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #000 0,
            #000 1px,
            transparent 0,
            transparent 50%
          )`,
          backgroundSize: '20px 20px'
        }} />
        
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-4xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 border-[3px] border-black bg-secondary px-4 py-2 font-bold uppercase shadow-[4px_4px_0px_#000]">
              <Sparkles className="h-4 w-4" />
              AI + OCR Technology
            </div>
            
            <h1 className="mb-6 text-5xl font-black uppercase leading-tight tracking-tight md:text-7xl">
              Kelola Uang
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">Lebih Pintar</span>
                <span className="absolute bottom-2 left-0 -z-0 h-4 w-full bg-primary md:h-6" />
              </span>
            </h1>
            
            <p className="mb-8 max-w-2xl text-lg font-medium md:text-xl">
              Scan struk belanja, langsung tercatat. Pantau pengeluaran dengan 
              teknologi AI yang akurat dan super cepat.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto">
                  Mulai Gratis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sudah Punya Akun
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 border-[3px] border-black bg-white px-4 py-2 shadow-[4px_4px_0px_#000]">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span className="font-bold">100% Gratis</span>
              </div>
              <div className="flex items-center gap-2 border-[3px] border-black bg-white px-4 py-2 shadow-[4px_4px_0px_#000]">
                <Shield className="h-5 w-5" />
                <span className="font-bold">Data Aman</span>
              </div>
              <div className="flex items-center gap-2 border-[3px] border-black bg-white px-4 py-2 shadow-[4px_4px_0px_#000]">
                <Zap className="h-5 w-5" />
                <span className="font-bold">Super Cepat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b-[3px] border-black bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-black uppercase tracking-tight md:text-5xl">
              Fitur Unggulan
            </h2>
            <p className="text-lg text-muted-foreground">
              Semua yang kamu butuhkan untuk mengelola keuangan
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group border-[3px] border-black bg-primary p-6 shadow-[6px_6px_0px_#000] transition-all hover:shadow-[8px_8px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px]">
              <div className="mb-4 flex h-14 w-14 items-center justify-center border-[3px] border-black bg-white">
                <ScanLine className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-black uppercase">Scan AI + OCR</h3>
              <p className="font-medium">
                Foto struk, AI membaca otomatis. Akurasi tinggi dengan teknologi hybrid.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group border-[3px] border-black bg-secondary p-6 shadow-[6px_6px_0px_#000] transition-all hover:shadow-[8px_8px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px]">
              <div className="mb-4 flex h-14 w-14 items-center justify-center border-[3px] border-black bg-white">
                <Receipt className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-black uppercase">Kategori Auto</h3>
              <p className="font-medium">
                Pengeluaran otomatis dikategorikan: makanan, transport, belanja, dll.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group border-[3px] border-black bg-accent p-6 shadow-[6px_6px_0px_#000] transition-all hover:shadow-[8px_8px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px]">
              <div className="mb-4 flex h-14 w-14 items-center justify-center border-[3px] border-black bg-white">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-black uppercase">Dashboard</h3>
              <p className="font-medium">
                Lihat ringkasan pengeluaran harian, mingguan, bulanan dengan jelas.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group border-[3px] border-black bg-[#88D8FF] p-6 shadow-[6px_6px_0px_#000] transition-all hover:shadow-[8px_8px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px]">
              <div className="mb-4 flex h-14 w-14 items-center justify-center border-[3px] border-black bg-white">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-black uppercase">Super Cepat</h3>
              <p className="font-medium">
                Hasil scan dalam hitungan detik. Tidak perlu nunggu lama.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group border-[3px] border-black bg-[#C4B5FD] p-6 shadow-[6px_6px_0px_#000] transition-all hover:shadow-[8px_8px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px]">
              <div className="mb-4 flex h-14 w-14 items-center justify-center border-[3px] border-black bg-white">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-black uppercase">Aman & Privat</h3>
              <p className="font-medium">
                Data terenkripsi dan tersimpan aman. Hanya kamu yang bisa akses.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group border-[3px] border-black bg-white p-6 shadow-[6px_6px_0px_#000] transition-all hover:shadow-[8px_8px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px]">
              <div className="mb-4 flex h-14 w-14 items-center justify-center border-[3px] border-black bg-primary">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-black uppercase">Hybrid AI</h3>
              <p className="font-medium">
                Gemini AI + Tesseract OCR untuk hasil terbaik dengan fallback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b-[3px] border-black py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-black uppercase tracking-tight md:text-5xl">
              Cara Kerja
            </h2>
            <p className="text-lg text-muted-foreground">
              Tiga langkah mudah untuk mulai
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center border-[3px] border-black bg-primary text-4xl font-black shadow-[4px_4px_0px_#000]">
                1
              </div>
              <h3 className="mb-2 text-xl font-black uppercase">Foto Struk</h3>
              <p className="font-medium text-muted-foreground">
                Ambil foto atau upload dari galeri
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center border-[3px] border-black bg-secondary text-4xl font-black shadow-[4px_4px_0px_#000]">
                2
              </div>
              <h3 className="mb-2 text-xl font-black uppercase">AI Baca</h3>
              <p className="font-medium text-muted-foreground">
                Sistem AI ekstrak data otomatis
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center border-[3px] border-black bg-accent text-4xl font-black shadow-[4px_4px_0px_#000]">
                3
              </div>
              <h3 className="mb-2 text-xl font-black uppercase">Selesai!</h3>
              <p className="font-medium text-muted-foreground">
                Transaksi tersimpan di dashboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b-[3px] border-black bg-primary py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-black uppercase tracking-tight md:text-5xl">
              Mulai Sekarang
            </h2>
            <p className="mb-8 text-lg font-medium">
              Gratis, mudah, dan aman. Daftar sekarang!
            </p>
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="bg-white">
                Daftar Gratis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center border-[2px] border-black bg-primary">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="font-black uppercase">Dompetku</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              © 2026 Dompetku - Penelitian Ilmiah Universitas Gunadarma
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
