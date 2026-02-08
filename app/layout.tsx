// ============================================
// Root Layout
// Общий layout для всего приложения
// ============================================

import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quest Messenger — Детективный квест',
  description: 'Раскройте убийство директора IT-компании через диалоги с AI-персонажами',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased bg-gray-50">
        <Toaster
          position="bottom-center"
          richColors
          duration={3000}
          toastOptions={{
            style: {
              padding: '16px',
              fontSize: '14px',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
