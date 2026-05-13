import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight text-slate-900">
          Allo<span className="text-blue-600">Health</span>
        </Link>
        <div className="text-sm text-slate-500 font-medium">
        </div>
      </div>
    </nav>
  );
}
