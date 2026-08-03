import { APP_NAME } from "@/utils/constants";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="text-gray-400 hover:text-gray-500">
            Terms
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
