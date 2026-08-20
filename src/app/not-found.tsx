import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0C1116] items-center justify-center p-4 font-sans">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="w-20 h-20 bg-[#141C24] rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-sm">
          <AlertCircle className="w-10 h-10 text-[#FF3E46]" />
        </div>
        <h1 className="text-4xl font-semibold text-white mb-3">Page Not Found</h1>
        <p className="text-[#8C8C8C] mb-8 text-sm sm:text-base leading-relaxed">
          Sorry, we couldn't find the page you were looking for. It might have been removed, renamed, or did not exist in the first place.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 rounded-[12px] bg-white text-[#0C1116] hover:bg-white/90 font-medium transition-colors text-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
