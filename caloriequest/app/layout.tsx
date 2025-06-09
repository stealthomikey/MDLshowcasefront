// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css'; // Make sure this is correctly imported
import Navbar from '@/components/nav/Navbar';
import Footer from '@/components/footer/Footer';
import styles from './page.module.css'; // This is where .content comes from

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
        <main className={styles.content}> {/* This 'main' element gets flex-grow */}
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}