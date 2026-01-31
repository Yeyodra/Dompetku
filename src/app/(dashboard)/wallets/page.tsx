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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Wallet,
  Banknote,
  CreditCard,
  Smartphone,
  MoreHorizontal,
  Loader2,
  Pencil,
  Trash2,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";

type WalletType = "cash" | "bank" | "e-wallet" | "other";

interface WalletWithBalance {
  id: string;
  name: string;
  type: WalletType;
  icon?: string;
  color?: string;
  initialBalance: number;
  balance: number;
  isDefault: boolean;
}

const WALLET_TYPES: { value: WalletType; label: string; icon: typeof Wallet }[] = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "bank", label: "Bank", icon: CreditCard },
  { value: "e-wallet", label: "E-Wallet", icon: Smartphone },
  { value: "other", label: "Lainnya", icon: MoreHorizontal },
];

const WALLET_COLORS = [
  { value: "#FFE500", label: "Yellow" },
  { value: "#A8E6CF", label: "Mint" },
  { value: "#FF6B9D", label: "Pink" },
  { value: "#88D8FF", label: "Blue" },
  { value: "#FFB366", label: "Orange" },
  { value: "#C4B5FD", label: "Purple" },
];

function getWalletIcon(type: WalletType) {
  const found = WALLET_TYPES.find((t) => t.value === type);
  return found?.icon || Wallet;
}

function getWalletTypeLabel(type: WalletType) {
  const found = WALLET_TYPES.find((t) => t.value === type);
  return found?.label || type;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletWithBalance | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<WalletType>("cash");
  const [formInitialBalance, setFormInitialBalance] = useState("");
  const [formColor, setFormColor] = useState(WALLET_COLORS[0].value);
  const [formIsDefault, setFormIsDefault] = useState(false);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/wallets");
      if (!res.ok) throw new Error("Failed to fetch wallets");
      const data = (await res.json()) as { wallets: WalletWithBalance[] };
      setWallets(data.wallets || []);
    } catch (err) {
      console.error("Error fetching wallets:", err);
      setError("Gagal memuat dompet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormType("cash");
    setFormInitialBalance("");
    setFormColor(WALLET_COLORS[0].value);
    setFormIsDefault(false);
    setEditingWallet(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (wallet: WalletWithBalance) => {
    setEditingWallet(wallet);
    setFormName(wallet.name);
    setFormType(wallet.type);
    setFormInitialBalance(wallet.initialBalance.toString());
    setFormColor(wallet.color || WALLET_COLORS[0].value);
    setFormIsDefault(wallet.isDefault);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error("Nama dompet wajib diisi");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: formName.trim(),
        type: formType,
        initialBalance: parseFloat(formInitialBalance.replace(/[^0-9.-]/g, "")) || 0,
        color: formColor,
        isDefault: formIsDefault,
      };

      const url = editingWallet
        ? `/api/wallets/${editingWallet.id}`
        : "/api/wallets";
      const method = editingWallet ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Gagal menyimpan");
      }

      toast.success(editingWallet ? "Dompet berhasil diperbarui!" : "Dompet berhasil ditambahkan!");
      setIsModalOpen(false);
      resetForm();
      fetchWallets();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (walletId: string) => {
    if (!confirm("Yakin ingin menghapus dompet ini?")) return;

    setIsDeleting(walletId);

    try {
      const res = await fetch(`/api/wallets/${walletId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Gagal menghapus");
      }

      toast.success("Dompet berhasil dihapus!");
      fetchWallets();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsDeleting(null);
    }
  };

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">Dompet</h1>
          <p className="font-medium text-muted-foreground">Kelola dompet dan saldo kamu</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4" />
          Tambah Dompet
        </Button>
      </div>

      {/* Total Balance Card */}
      <Card className="bg-black text-white">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-white/70">Total Saldo</p>
              <p className="text-3xl font-black md:text-4xl">
                Rp {totalBalance.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center border-[3px] border-white bg-primary">
              <Wallet className="h-8 w-8 text-black" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallets Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="mt-4 font-medium text-muted-foreground">Memuat dompet...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="font-medium text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => fetchWallets()}>
            Coba Lagi
          </Button>
        </div>
      ) : wallets.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center border-[3px] border-black bg-primary shadow-[4px_4px_0px_#000]">
                <Wallet className="h-10 w-10" />
              </div>
              <h3 className="mb-2 text-xl font-black uppercase">Belum Ada Dompet</h3>
              <p className="mb-6 max-w-sm text-center font-medium text-muted-foreground">
                Tambahkan dompet pertamamu untuk mulai mencatat keuangan
              </p>
              <Button onClick={openAddModal}>
                <Plus className="h-4 w-4" />
                Tambah Dompet
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => {
            const Icon = getWalletIcon(wallet.type);
            return (
              <Card
                key={wallet.id}
                className="relative overflow-hidden"
                style={{ borderColor: wallet.color || "#000" }}
              >
                {/* Color indicator bar */}
                <div
                  className="absolute left-0 top-0 h-full w-2"
                  style={{ backgroundColor: wallet.color || WALLET_COLORS[0].value }}
                />

                <CardHeader className="pb-2 pl-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center border-[3px] border-black"
                        style={{ backgroundColor: wallet.color || WALLET_COLORS[0].value }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{wallet.name}</CardTitle>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-block border-[2px] border-black bg-secondary px-2 py-0.5 text-xs font-bold uppercase">
                            {getWalletTypeLabel(wallet.type)}
                          </span>
                          {wallet.isDefault && (
                            <span className="inline-flex items-center gap-1 border-[2px] border-black bg-primary px-2 py-0.5 text-xs font-bold uppercase">
                              <Star className="h-3 w-3" />
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pl-8">
                  <p className="text-2xl font-black">
                    Rp {wallet.balance.toLocaleString("id-ID")}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Saldo awal: Rp {wallet.initialBalance.toLocaleString("id-ID")}
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(wallet)}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(wallet.id)}
                      disabled={isDeleting === wallet.id}
                    >
                      {isDeleting === wallet.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-[3px] border-black bg-white p-0 shadow-[8px_8px_0px_#000] sm:max-w-md">
          <DialogHeader className="border-b-[3px] border-black p-6">
            <DialogTitle className="flex items-center justify-between text-xl font-black uppercase">
              {editingWallet ? "Edit Dompet" : "Tambah Dompet"}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 p-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="walletName" className="text-xs font-bold uppercase">
                Nama Dompet
              </Label>
              <Input
                id="walletName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Dompet Utama"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="walletType" className="text-xs font-bold uppercase">
                Tipe
              </Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as WalletType)}>
                <SelectTrigger className="border-[3px] border-black shadow-[4px_4px_0px_#000]">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  {WALLET_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Initial Balance */}
            <div className="space-y-2">
              <Label htmlFor="initialBalance" className="text-xs font-bold uppercase">
                Saldo Awal (Rp)
              </Label>
              <Input
                id="initialBalance"
                type="text"
                value={formInitialBalance}
                onChange={(e) => setFormInitialBalance(e.target.value)}
                placeholder="Contoh: 500000"
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Warna</Label>
              <div className="flex flex-wrap gap-2">
                {WALLET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormColor(c.value)}
                    className={`h-10 w-10 border-[3px] transition-all ${
                      formColor === c.value
                        ? "border-black shadow-[2px_2px_0px_#000]"
                        : "border-black/30 hover:border-black"
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Default Checkbox */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormIsDefault(!formIsDefault)}
                className={`flex h-6 w-6 items-center justify-center border-[3px] border-black transition-all ${
                  formIsDefault ? "bg-primary" : "bg-white"
                }`}
              >
                {formIsDefault && <Star className="h-4 w-4" />}
              </button>
              <Label
                className="cursor-pointer text-sm font-bold"
                onClick={() => setFormIsDefault(!formIsDefault)}
              >
                Jadikan dompet default
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={isSaving || !formName.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  {editingWallet ? "Simpan Perubahan" : "Tambah Dompet"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
