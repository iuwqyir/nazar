import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import Nav from './nav';
import { Suspense } from 'react';
import { Web3ModalProvider } from "../context/Web3Modal";

export const metadata = {
  title: 'Next.js App Router + NextAuth + Tailwind CSS',
  description:
    'A user admin dashboard configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, ESLint, and Prettier.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" className="h-full bg-gray-50">
        <body className="h-full">
          <Web3ModalProvider>
              <Suspense>
                <Nav />
              </Suspense>
              {children}
              <Analytics />
            </Web3ModalProvider>
        </body>
      </html>
  );
}
