"use client";

import { useState, useRef, useEffect } from "react";
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
  Camera, 
  Upload, 
  Loader2, 
  Check, 
  Sparkles, 
  ImagePlus,
  FileText,
  Save,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet
} from "lucide-react";
import { extractTextFromImage } from "@/lib/ocr";
import { 
  EXPENSE_CATEGORY_OPTIONS, 
  INCOME_CATEGORY_OPTIONS,
  TransactionCategory,
  TransactionType 
} from "@/types/transaction";
import { WalletWithBalance } from "@/types/wallet";
import { ReceiptData, OCRResult } from "@/types/receipt";
import { toast } from "sonner";

export default function ScanPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<ReceiptData | null>(null);
  const [ocrMethod, setOcrMethod] = useState<"ai" | "tesseract" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wallet state
  const [wallets, setWallets] = useState<WalletWithBalance[]>([]);
  const [walletId, setWalletId] = useState<string>("");
  const [loadingWallets, setLoadingWallets] = useState(true);

  // Form state
  const [type, setType] = useState<TransactionType>("expense");
  const [storeName, setStoreName] = useState("");
  const [date, setDate] = useState("");
  const [total, setTotal] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("belanja");

  // Fetch wallets on mount
  useEffect(() => {
    async function fetchWallets() {
      try {
        const res = await fetch("/api/wallets");
        if (res.ok) {
          const data = await res.json() as { wallets: WalletWithBalance[] };
          setWallets(data.wallets || []);
          // Pre-select default wallet
          const defaultWallet = data.wallets?.find((w: WalletWithBalance) => w.isDefault);
          if (defaultWallet) {
            setWalletId(defaultWallet.id);
          } else if (data.wallets?.length > 0) {
            setWalletId(data.wallets[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch wallets:", error);
      } finally {
        setLoadingWallets(false);
      }
    }
    fetchWallets();
  }, []);

  // Get category options based on type
  const categoryOptions = type === "expense" 
    ? EXPENSE_CATEGORY_OPTIONS 
    : INCOME_CATEGORY_OPTIONS;

  // Reset category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === "expense" ? "belanja" : "gaji");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setOcrResult(null);
      setOcrMethod(null);
    }
  };

  // AI OCR via API
  const handleAIScan = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("image", image);

      setProgress(30);
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      setProgress(80);
      const result = await response.json() as OCRResult;

      if (result.success && result.data) {
        setOcrResult(result.data);
        setOcrMethod("ai");
        // Pre-fill form with OCR results
        if (result.data.storeName) setStoreName(result.data.storeName);
        if (result.data.date) setDate(result.data.date);
        if (result.data.total) setTotal(result.data.total.toString());
        toast.success("Struk berhasil di-scan dengan AI!");
      } else {
        // Fallback to Tesseract
        toast.info("AI OCR gagal, mencoba Tesseract...");
        await handleTesseractScan();
      }
    } catch (error) {
      // Fallback to Tesseract on error
      toast.info("AI tidak tersedia, menggunakan Tesseract...");
      await handleTesseractScan();
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  // Tesseract OCR (fallback)
  const handleTesseractScan = async () => {
    if (!image) return;

    try {
      const result = await extractTextFromImage(image, (p) => setProgress(p));

      if (result.success && result.data) {
        setOcrResult(result.data);
        setOcrMethod("tesseract");
        // Pre-fill form with OCR results
        if (result.data.storeName) setStoreName(result.data.storeName);
        if (result.data.date) setDate(result.data.date);
        if (result.data.total) setTotal(result.data.total.toString());
        toast.success("Struk berhasil di-scan!");
      } else {
        toast.error(result.error || "Gagal membaca struk");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memproses gambar");
    }
  };

  const handleScan = async () => {
    if (!image) return;
    // Try AI first, fallback to Tesseract
    await handleAIScan();
  };

  const handleSave = async () => {
    if (!storeName || !date || !total || !category) {
      toast.error("Lengkapi semua field");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          storeName,
          date,
          total: parseFloat(total.replace(/[^0-9]/g, "")),
          category,
          walletId: walletId || undefined,
          rawOcrText: ocrResult?.rawText,
          ocrConfidence: ocrResult?.confidence,
          items: ocrResult?.items || [],
        }),
      });

      if (response.ok) {
        toast.success("Transaksi berhasil disimpan!");
        // Reset form
        setImage(null);
        setImagePreview(null);
        setOcrResult(null);
        setStoreName("");
        setDate("");
        setTotal("");
        setType("expense");
        setCategory("belanja");
      } else {
        const data = await response.json() as { error?: string };
        toast.error(data.error || "Gagal menyimpan transaksi");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">Tambah Transaksi</h1>
        <p className="font-medium text-muted-foreground">Scan struk atau input manual</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5" />
              Upload Struk (Opsional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group flex cursor-pointer flex-col items-center justify-center border-[3px] border-dashed border-black bg-white p-12 transition-all hover:bg-primary/10"
              >
                <div className="mb-4 flex h-20 w-20 items-center justify-center border-[3px] border-black bg-primary shadow-[4px_4px_0px_#000] transition-transform group-hover:shadow-[6px_6px_0px_#000] group-hover:-translate-x-[2px] group-hover:-translate-y-[2px]">
                  <Camera className="h-10 w-10" />
                </div>
                <p className="mb-1 font-bold uppercase">Klik untuk upload</p>
                <p className="text-sm font-medium text-muted-foreground">
                  JPG, PNG, WebP (max 5MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-[3px] border-black bg-white p-2 shadow-[4px_4px_0px_#000]">
                  <img
                    src={imagePreview}
                    alt="Preview struk"
                    className="max-h-72 w-full object-contain"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4" />
                    Ganti
                  </Button>
                  <Button 
                    onClick={handleScan} 
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {progress}%
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Scan AI
                      </>
                    )}
                  </Button>
                </div>

                {/* Progress bar */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="h-4 border-[3px] border-black bg-white">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-center text-sm font-bold uppercase">
                      Memproses...
                    </p>
                  </div>
                )}
              </div>
            )}

            {ocrResult && (
              <div className="flex items-center gap-3 border-[3px] border-black bg-secondary p-4 shadow-[4px_4px_0px_#000]">
                <div className="flex h-12 w-12 items-center justify-center border-[3px] border-black bg-white">
                  {ocrMethod === "ai" ? (
                    <Sparkles className="h-6 w-6" />
                  ) : (
                    <Check className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <p className="font-black uppercase">
                    {ocrMethod === "ai" ? "AI OCR" : "Tesseract"} Berhasil!
                  </p>
                  <p className="text-sm font-medium">
                    Confidence: {ocrResult.confidence.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detail Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Transaction Type Toggle */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Tipe Transaksi</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={type === "expense" ? "default" : "outline"}
                  onClick={() => handleTypeChange("expense")}
                  className={`flex items-center gap-2 ${
                    type === "expense" 
                      ? "bg-destructive hover:bg-destructive/90 text-white" 
                      : ""
                  }`}
                >
                  <ArrowDownCircle className="h-4 w-4" />
                  Pengeluaran
                </Button>
                <Button
                  type="button"
                  variant={type === "income" ? "default" : "outline"}
                  onClick={() => handleTypeChange("income")}
                  className={`flex items-center gap-2 ${
                    type === "income" 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : ""
                  }`}
                >
                  <ArrowUpCircle className="h-4 w-4" />
                  Pemasukan
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeName" className="text-xs font-bold uppercase">
                {type === "expense" ? "Nama Toko" : "Sumber Pemasukan"}
              </Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder={type === "expense" ? "Contoh: Alfamart" : "Contoh: PT ABC"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs font-bold uppercase">
                Tanggal
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total" className="text-xs font-bold uppercase">
                {type === "expense" ? "Total (Rp)" : "Jumlah (Rp)"}
              </Label>
              <Input
                id="total"
                type="text"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="Contoh: 50000"
              />
            </div>

            {/* Wallet Selection */}
            <div className="space-y-2">
              <Label htmlFor="wallet" className="text-xs font-bold uppercase">
                <span className="flex items-center gap-1">
                  <Wallet className="h-3 w-3" />
                  Dompet
                </span>
              </Label>
              <Select
                value={walletId}
                onValueChange={setWalletId}
                disabled={loadingWallets}
              >
                <SelectTrigger className="border-[3px] border-black shadow-[4px_4px_0px_#000]">
                  <SelectValue placeholder={loadingWallets ? "Memuat..." : "Pilih dompet"} />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 border-[2px] border-black"
                          style={{ backgroundColor: w.color || "#3B82F6" }}
                        />
                        {w.name}
                        {w.isDefault && (
                          <span className="text-xs text-muted-foreground">(Default)</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-bold uppercase">
                Kategori
              </Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as TransactionCategory)}
              >
                <SelectTrigger className="border-[3px] border-black shadow-[4px_4px_0px_#000]">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleSave}
              disabled={isSaving || !storeName || !date || !total}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* OCR Raw Text */}
      {ocrResult?.rawText && (
        <Card>
          <CardHeader>
            <CardTitle>Hasil OCR</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-48 overflow-auto border-[3px] border-black bg-white p-4 font-mono text-xs shadow-[4px_4px_0px_#000]">
              {ocrResult.rawText}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
