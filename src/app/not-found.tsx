import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

export default function NotFound() {
  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-6xl font-extrabold text-brand mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Page not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link
          href="/"
          className="px-6 py-2 rounded-md bg-brand text-white font-medium hover:opacity-90 transition-opacity"
        >
          Go back home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
