"use client";

import { useState, useRef } from "react";
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
import { Camera, Upload, Loader2, Check } from "lucide-react";
import { extractTextFromImage } from "@/lib/ocr";
import { CATEGORY_OPTIONS, TransactionCategory } from "@/types/transaction";
import { ReceiptData } from "@/types/receipt";
import { toast } from "sonner";

export default function ScanPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<ReceiptData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [storeName, setStoreName] = useState("");
  const [date, setDate] = useState("");
  const [total, setTotal] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("belanja");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setOcrResult(null);
    }
  };

  const handleScan = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await extractTextFromImage(image, (p) => setProgress(p));

      if (result.success && result.data) {
        setOcrResult(result.data);
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
    } finally {
      setIsProcessing(false);
    }
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
          storeName,
          date,
          total: parseFloat(total.replace(/[^0-9]/g, "")),
          category,
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scan Struk</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Gambar Struk</CardTitle>
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
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 hover:border-gray-400"
              >
                <Camera className="mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">Klik untuk upload gambar struk</p>
                <p className="text-sm text-gray-400">
                  Format: JPG, PNG, WebP (max 5MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Preview struk"
                  className="max-h-96 w-full rounded-lg object-contain"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Ganti Gambar
                  </Button>
                  <Button onClick={handleScan} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses... {progress}%
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Scan Struk
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {ocrResult && (
              <div className="rounded-lg bg-green-50 p-4">
                <p className="flex items-center gap-2 text-sm text-green-700">
                  <Check className="h-4 w-4" />
                  OCR berhasil dengan confidence: {ocrResult.confidence.toFixed(1)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nama Toko</Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Contoh: Alfamart"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Total (Rp)</Label>
              <Input
                id="total"
                type="text"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="Contoh: 50000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as TransactionCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Transaksi"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* OCR Raw Text (Debug) */}
      {ocrResult?.rawText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Teks Hasil OCR</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-48 overflow-auto rounded bg-gray-100 p-4 text-xs">
              {ocrResult.rawText}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
