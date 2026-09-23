import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ФСП Чувашии · Олимпиадная платформа",
  description: "Система спортивного программирования для школьников 1–9 классов",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen flex flex-col font-sans">
        {/* Modern Minimal Glass Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/75 border-b border-zinc-200/70 transition-all">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-black text-xs tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
                ФСП
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors">
                  ФСП Чувашии
                </span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                  1–9 классы
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/60 text-xs font-medium text-zinc-600">
              <Link
                href="/student"
                className="px-3.5 py-1.5 rounded-lg hover:text-zinc-900 hover:bg-white transition-all shadow-none hover:shadow-sm"
              >
                Ученик
              </Link>
              <Link
                href="/curator"
                className="px-3.5 py-1.5 rounded-lg hover:text-zinc-900 hover:bg-white transition-all shadow-none hover:shadow-sm"
              >
                Куратор
              </Link>
              <Link
                href="/admin"
                className="px-3.5 py-1.5 rounded-lg hover:text-zinc-900 hover:bg-white transition-all shadow-none hover:shadow-sm"
              >
                Администратор
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 pb-16">{children}</main>

        <footer className="border-t border-zinc-200/60 py-6 text-center text-xs text-zinc-400 font-mono">
          Федерация спортивного программирования Чувашской Республики · Хакатон 2026
        </footer>
      </body>
    </html>
  );
}