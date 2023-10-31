import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-100 mt-auto py-4 text-center">
      <p>© 2023 Luke Friedrichs</p>
      <Link
        href="/impressum"
        target="_blank"
        className="text-blue-600 hover:underline"
      >
        Impressum
      </Link>
    </footer>
  );
};

export default Footer;
