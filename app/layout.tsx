import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import Nav from './nav';
import React from 'react'
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
              <div className="bg-red-600 text-white p-1 text-center">
                <p>An new version is now available at <a href="https://beta.blocktorch.xyz/account-abstraction">https://beta.blocktorch.xyz</a></p>
              </div>
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
