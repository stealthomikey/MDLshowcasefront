import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { ChefHat, ArrowLeft } from 'lucide-react';
import styles from './recipeDetail.module.css';

// Define interfaces for menu data
interface Ingredient {
  name: string;
  measure: string;
}

interface FullMenu {
  idMeal: string;
  strMeal: string;
  strInstructions: string;
  strMealThumb: string;
  strSource: string | null;
  ingredients: Ingredient[];
}

// Define props interface for the page component
interface MenuPageProps {
  params: { menuId: string };
}

// Fetch menu data from the API
async function fetchMenu(menuId: string): Promise<FullMenu> {
  const res = await fetch(`http://127.0.0.1:8000/meals/${menuId}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch menu with ID ${menuId}`);
  }
  return res.json();
}

// Page component
export default async function MenuDetailPage({ params }: MenuPageProps) {
  let menu: FullMenu | null = null;
  let error: string | null = null;

  try {
    menu = await fetchMenu(params.menuId);
  } catch (err) {
    error = err instanceof Error ? err.message : 'An unexpected error occurred';
  }

  // Render error state if fetch failed
  if (error || !menu) {
    return (
      <main className="container">
        <div className={styles.pageContainer}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className={styles.title}>Error</h1>
          <p>{error || 'Menu not found'}</p>
        </div>
      </main>
    );
  }

  // Handle back link logic
  const headerList = headers();
  const referer = headerList.get('referer');
  let backHref = '/';
  let backText = 'Back to Home';

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const baseUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
      if (refererUrl.origin === baseUrl.origin && refererUrl.pathname === '/search') {
        backHref = referer;
        backText = 'Back to Search Results';
      }
    } catch {
      // Ignore invalid referer URLs
    }
  }

  // Split instructions into steps
  const instructionSteps = menu.strInstructions
    .split('\r\n')
    .filter(step => step.trim() !== '');

  return (
    <main className="container">
      <div className={styles.pageContainer}>
        <Link href={backHref} className={styles.backLink}>
          <ArrowLeft size={16} /> {backText}
        </Link>
        <h1 className={styles.title}>{menu.strMeal}</h1>

        <div className={styles.contentGrid}>
          <div className={styles.imageAndMeta}>
            <div className={styles.imageWrapper}>
              <Image
                src={menu.strMealThumb}
                alt={`Image of ${menu.strMeal}`}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                priority
              />
            </div>
          </div>

          <div className={styles.details}>
            <h2>Ingredients</h2>
            <ul className={styles.ingredientsList}>
              {menu.ingredients.map((ing, index) => (
                <li key={index}>
                  <span className={styles.measure}>{ing.measure}</span>
                  <span className={styles.name}>{ing.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className={styles.instructionsSection}>
          <h2>
            <ChefHat size={28} />
            Instructions
          </h2>
          <div className={styles.steps}>
            {instructionSteps.map((step, index) => (
              <div key={index} className={styles.step}>
                <div className={styles.stepNumber}>{index + 1}</div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}