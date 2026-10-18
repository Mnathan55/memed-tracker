import type { Metadata } from 'next';
import { Space_Grotesk, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';

const body = Space_Grotesk({ subsets: ['latin'], variable: '--font-body' });
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: "Meme'd Payout Tracker",
  description: 'Post. Pop off. Get paid.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}