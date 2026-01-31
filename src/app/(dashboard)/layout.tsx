import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { LayoutDashboard, Receipt, ScanLine, Wallet } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Dompetku</span>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 border-r bg-white md:block">
          <nav className="flex flex-col gap-1 p-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/transactions"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              <Receipt className="h-5 w-5" />
              Transaksi
            </Link>
            <Link
              href="/scan"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              <ScanLine className="h-5 w-5" />
              Scan Struk
            </Link>
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
          <div className="flex justify-around py-2">
            <Link
              href="/dashboard"
              className="flex flex-col items-center gap-1 px-4 py-2 text-gray-700"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-xs">Dashboard</span>
            </Link>
            <Link
              href="/transactions"
              className="flex flex-col items-center gap-1 px-4 py-2 text-gray-700"
            >
              <Receipt className="h-5 w-5" />
              <span className="text-xs">Transaksi</span>
            </Link>
            <Link
              href="/scan"
              className="flex flex-col items-center gap-1 px-4 py-2 text-gray-700"
            >
              <ScanLine className="h-5 w-5" />
              <span className="text-xs">Scan</span>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
