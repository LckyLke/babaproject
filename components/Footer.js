import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 mt-auto py-3 border-t border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 text-center text-sm flex items-center justify-center gap-4">
        <span className="text-slate-600 dark:text-slate-400">© 2023 Luke Friedrichs</span>
        <Link
          href="/impressum"
          target="_blank"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Impressum
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
