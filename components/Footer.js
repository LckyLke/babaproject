import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 mt-auto py-3 border-t border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-slate-600 dark:text-slate-400 text-sm">© 2025 Luke Friedrichs</span>
          <Link
            href="/impressum"
            className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
          >
            Impressum
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </footer>
  );
};

export default Footer;
