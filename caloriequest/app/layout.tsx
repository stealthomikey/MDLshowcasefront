import type { Metadata } from 'next';
import './globals.css';

import Navbar from '@/components/nav/Navbar';
import Footer from '@/components/footer/Footer';

// This sets the default title and description for your entire application
export const metadata: Metadata = {
  title: "Calorie Quest",
  description: "Finding recipes and tracking calories made easy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}