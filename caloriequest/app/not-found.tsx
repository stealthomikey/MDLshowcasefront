// 404 page

import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';

export default function NotFound() {
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        {/* icon and text for the 404 page */}
        <UtensilsCrossed size={64} color="#9ca3af" />
        <h1 style={styles.title}>Page Not Found</h1>
        {/* FIX HERE: Replace ' with &apos; */}
        <p style={styles.text}>Sorry, we couldn&apos;t find the page you were looking for.</p>
        <Link href="/" style={styles.link}>
          Return to Homepage
        </Link>
      </div>
    </main>
  );
}

// styles for 404
const styles = {
  main: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 200px)',
    textAlign: 'center' as const, padding: '2rem'
  },

  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center', gap: '1rem'
  },

  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '1rem 0 0.5rem'
  },

  text: {
    fontSize: '1.1rem',
    color: '#4b5563'
  },

  link: {
    display: 'inline-block',
    marginTop: '1.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4f46e5',
    color: 'white', borderRadius: '0.5rem',
    textDecoration: 'none',
    fontWeight: '500'
  }
};