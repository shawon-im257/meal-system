import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-wide bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          <span>🍽️</span> MessTracker
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 font-medium text-xs sm:text-sm">
          <Link
            href="/"
            className="hidden sm:inline-block hover:text-blue-400 transition-colors duration-150"
          >
            ড্যাশবোর্ড
          </Link>
          <Link
            href="/sheet"
            className="px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-400/20 text-teal-300 hover:bg-teal-500/20 transition-all duration-150"
          >
            মিল খাতা
          </Link>
          <Link
            href="/summary"
            className="px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/40 transition-all duration-150"
          >
            মেস হিসাব
          </Link>
          <Link
            href="/members"
            className="hidden md:inline-block px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-400/20 text-blue-300 hover:bg-blue-500/20 transition-all duration-150"
          >
            সদস্যবৃন্দ
          </Link>
          <Link
            href="/history"
            className="hidden md:inline-block px-3 py-1.5 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/40 transition-all duration-150"
          >
            লগ
          </Link>
          <Link
            href="/bulk-meal"
            className="px-3 py-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/50 transition-all duration-150 font-bold"
          >
            ⚡ বাল্ক মিল
          </Link>
          <Link
            href="/add-meal"
            className="hidden sm:inline-block px-3 py-1.5 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:bg-blue-600/50 transition-all duration-150"
          >
            + মিল
          </Link>
          <Link
            href="/add-expense"
            className="px-3 py-1.5 rounded-lg bg-amber-600/20 border border-amber-500/30 text-amber-300 hover:bg-amber-600/40 transition-all duration-150"
          >
            + বাজার
          </Link>
          <Link
            href="/add-deposit"
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/40 transition-all duration-150"
          >
            + জমা
          </Link>
        </div>
      </div>
    </nav>
  );
}
