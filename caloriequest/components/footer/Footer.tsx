import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  // get current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>

      <div className={`${styles.footerContainer} container`}>
        <div className={styles.footerContent}>
          <div className={styles.brandSection}>
            <Link href="/"><h3 className={styles.brandName}>CaloireQuest</h3></Link>
            <p className={styles.brandSlogan}>Finding recipes and tracking calories made easy. MDL software engineering intern submission</p>
          </div>

          <div className={styles.linksSection}>
            <div className={styles.linkGroup}>
              <h4>Navigation</h4>
              <Link href="/">Home</Link>
              <Link href="/scan">scan</Link>
              <Link href="/track">track</Link>
            </div>
          </div>

        </div>

        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © {currentYear} CalorieQuest.
          </p>
          { /* links to socials */}
          <div className={styles.socialIcons}>
            <a href="https://github.com/stealthomikey" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github size={20} />
            </a>
            <a href="https://www.linkedin.com/in/michael-piercey-41b4aa312/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;