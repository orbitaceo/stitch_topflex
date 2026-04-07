import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lavaja.com.br'),
  title: {
    default: 'LavaJá — Lavadoras Recondicionadas | Como Novas, Pelo Preço Certo',
    template: '%s | LavaJá',
  },
  description:
    'Lavadoras e secadoras recondicionadas com garantia de 3 a 6 meses. Revisão técnica completa, higienização profissional e entrega com instalação inclusa. A partir de R$ 399.',
  keywords: [
    'lavadora recondicionada',
    'máquina de lavar seminova',
    'lavadora usada garantia',
    'lavadora barata',
    'brastemp recondicionada',
    'samsung lavadora',
    'lg lavadora',
  ],
  authors: [{ name: 'LavaJá' }],
  creator: 'LavaJá',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://lavaja.com.br',
    siteName: 'LavaJá',
    title: 'LavaJá — Lavadoras Recondicionadas | Como Novas, Pelo Preço Certo',
    description: 'Lavadoras e secadoras recondicionadas com garantia. A partir de R$ 399.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LavaJá — Lavadoras Recondicionadas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LavaJá — Lavadoras Recondicionadas',
    description: 'Lavadoras recondicionadas com garantia. A partir de R$ 399.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        {/* Material Symbols Outlined — ícones */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="bg-background text-on-surface antialiased">{children}</body>
    </html>
  );
}
