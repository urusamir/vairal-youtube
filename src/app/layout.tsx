import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Viral Creator Hub',
  description: 'Manage creator campaigns end to end securely and seamlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
