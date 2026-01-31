import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { LayoutDashboard, Receipt, ScanLine, Wallet } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", icon: Receipt, label: "Transaksi" },
  { href: "/scan", icon: ScanLine, label: "Scan Struk" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFFEF0]">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r-[3px] border-black bg-black md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b-[3px] border-white/20 px-6">
          <div className="flex h-10 w-10 items-center justify-center border-[3px] border-white bg-primary">
            <Wallet className="h-5 w-5 text-black" />
          </div>
          <span className="text-lg font-black uppercase text-white">Dompetku</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 border-[3px] border-transparent px-4 py-3 font-bold uppercase text-white transition-all hover:border-white hover:bg-white hover:text-black"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t-[3px] border-white/20 p-4">
          <div className="flex items-center gap-3 border-[3px] border-white/30 bg-white/10 px-4 py-3">
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 border-2 border-white"
                }
              }}
            />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold uppercase text-white">Akun</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="md:pl-64">
        {/* Header - Mobile & Desktop */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b-[3px] border-black bg-[#FFFEF0] px-4 md:px-6">
          {/* Mobile logo */}
          <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center border-[2px] border-black bg-primary">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="font-black uppercase">Dompetku</span>
          </Link>

          {/* Desktop: spacer */}
          <div className="hidden md:block" />

          {/* Right side - Desktop user */}
          <div className="hidden items-center gap-3 md:flex">
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10 border-[3px] border-black"
                }
              }}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-4rem)] p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-[3px] border-black bg-white md:hidden">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 border-r-[3px] border-black py-3 font-bold transition-colors last:border-r-0 hover:bg-primary"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs uppercase">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
