import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#0C1116] items-center justify-center p-4 font-sans overflow-hidden">
      {/* Background Ellipse Image matching auth theme */}
      <Image
        src="/images/auth-ellipse.png"
        alt=""
        fill
        className="object-cover pointer-events-none z-0 opacity-50"
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md bg-[#141C24]/80 backdrop-blur-md p-10 rounded-[20px] border border-white/5 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-[#66859E] to-[#849EB2] text-transparent bg-clip-text">404</h1>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-3">Page Not Found</h2>
        <p className="text-[#919191] mb-8 text-sm leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          href="/dashboard"
          className="w-full max-w-[200px] h-[40px] flex items-center justify-center bg-gradient-to-r from-[#66859E] to-[#849EB2] rounded-[10px] text-xs font-bold text-white capitalize hover:opacity-95 transition-opacity shadow-md border-0"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
