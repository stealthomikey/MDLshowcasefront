// use client while developing
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = () => {
  // useRouter hook to navigate
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // toggle the mobile menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // handle search form submissions
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // open new page with the search query
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <>
      <header className={styles.navbar}>
        <div className={`${styles.navContainer} container`}>
          <Link href="/" className={styles.logo}>
            <span>Calorie Quest</span>
          </Link>
          
          <nav className={styles.desktopNavLinks}>
            <Link href="/">Home</Link>
            <Link href="/scan">scan</Link>
            <Link href="/track">track</Link>
            <Link href="/foodlogs">log</Link>
          </nav>


          <div className={styles.navControls}>
            <form className={styles.searchWrapper} onSubmit={handleSearch}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className={styles.desktopOnlyControls}>
              <button className={styles.accountButton}>
                <User size={20} />
              </button>
            </div>

            <button
              className={`${styles.iconButton} ${styles.menuIcon}`}
              onClick={toggleMenu}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        <nav className={styles.mobileNavLinks}>
          <Link href="/" onClick={toggleMenu}>Home</Link>
          <Link href="/scan" onClick={toggleMenu}>scan</Link>
          <Link href="/track" onClick={toggleMenu}>track</Link>
          <Link href="/foodlogs" onClick={toggleMenu}>log</Link>
          <Link href="/" onClick={toggleMenu}>My Account</Link>
        </nav>
      </div>
    </>
  );
};

export default Navbar;