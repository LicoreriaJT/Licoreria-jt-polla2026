import type { Metadata } from 'next';
import { Rye, DM_Sans, Playfair_Display, Special_Elite } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const rye = Rye({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-rye',
});
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['italic'],
  variable: '--font-playfair',
});
const specialElite = Special_Elite({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-special-elite',
});

export const metadata: Metadata = {
  title: 'Licorería JT · Polla Mundialera 2026',
  description: 'Polla futbolera oficial de Licorería JT · Mundial 2026',
  themeColor: '#1A0F08',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${rye.variable} ${dmSans.variable} ${playfair.variable} ${specialElite.variable}`}>
      <body className="bg-carbon text-cream min-h-screen">
        <div className="bg-noise fixed inset-0 pointer-events-none opacity-50" aria-hidden />
        <main className="relative z-10">{children}</main>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#2A1A0F',
              color: '#F5E6D3',
              border: '2px solid rgba(201,169,97,0.3)',
            },
            success: { iconTheme: { primary: '#C9A961', secondary: '#1A0F08' } },
          }}
        />
      </body>
    </html>
  );
}
