import Link from "next/link";
import { APP_NAME } from "@/utils/constants";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand to-purple-500">
                {APP_NAME}
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand">
              Log in
            </Link>
            <Link href="/auth/register" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:opacity-90">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
