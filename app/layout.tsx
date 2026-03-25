import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StreetPass - Encounter Strangers',
  description:
    'A browser-based StreetPass experience. Create your Mii avatar and discover people nearby.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
