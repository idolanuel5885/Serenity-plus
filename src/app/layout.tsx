import type { Metadata } from 'next';
import { Raleway, Nunito } from 'next/font/google';
import './globals.css';

const raleway = Raleway({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const nunito = Nunito({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Serenity Plus',
  description: 'Meditate daily with a gentle nudge. Pair with one buddy. Tiny steps, big change.',
  manifest: '/manifest.json',
  themeColor: '#f97316',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Serenity Plus',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Serenity Plus" />
        <link rel="apple-touch-icon" href="/icons/meditation-1.svg" />
      </head>
      <body className={`${raleway.variable} ${nunito.variable} antialiased`}>{children}</body>
    </html>
  );
}
