import './globals.css';
import { Inter } from 'next/font/google';
import { ErzeugerProvider } from '@/context/erzeuger';
import { ImportDataProvider } from '@/context/importdata';
import { ThemeProvider } from '@/context/theme';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'babaproject',
  description: 'Generated by create next app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body className={inter.className}>
        <ThemeProvider>
          <ImportDataProvider>
            <ErzeugerProvider>{children}</ErzeugerProvider>
          </ImportDataProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
