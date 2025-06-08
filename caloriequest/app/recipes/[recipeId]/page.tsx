// imports
import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers'; 
import { ChefHat, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import styles from './recipeDetail.module.css';

// define the structure of the ingredients and recipe data from the api
interface Ingredient {
  name: string;
  measure: string;
}

interface FullRecipe {
  idMeal: string;
  strMeal: string;
  strInstructions: string;
  strMealThumb: string;
  strSource: string | null;
  ingredients: Ingredient[];
}

// fetch the recipe data from the api
async function getRecipe(recipeId: string): Promise<FullRecipe> {
  const res = await fetch(`http://127.0.0.1:8000/meals/${recipeId}`, { cache: 'no-store' });
  if (!res.ok) {
    // error handling
    throw new Error('Failed to fetch recipe');
  }
  return res.json();
}

// recipe detail page component
export default async function RecipeDetailPage({ params }: { params: { recipeId: string } }) {
  // gets id from the url
  const recipe = await getRecipe(params.recipeId);

  // logic for the back link based on the referal link
  const headerList = await headers();
  // get the page the user came from
  const referer = headerList.get('referer');

  // default back link
  let backHref = '/';
  let backText = 'Back to Home';

  // ensure link is valid
  if (referer) {
    const refererUrl = new URL(referer);
    if (refererUrl.pathname === '/search') {
      // if they came from the search page set text to 'Back to Search Results'
      backHref = referer;
      backText = 'Back to Search Results';
    }
  }

  // Split the instructions 
  const instructionSteps = recipe.strInstructions.split('\r\n').filter(step => step.trim() !== '');

  return (
    <main className="container">
      <div className={styles.pageContainer}>
        <Link href={backHref} className={styles.backLink}>
          <ArrowLeft size={16} />
          {backText}
        </Link>
        <h1 className={styles.title}>{recipe.strMeal}</h1>

        <div className={styles.contentGrid}>
          <div className={styles.imageAndMeta}>
            <div className={styles.imageWrapper}>
              <Image
              // get image from the api
                src={recipe.strMealThumb}
                alt={`Image of ${recipe.strMeal}`}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                // load image first
                priority 
              />
            </div>
          </div>

          {/* Recipe details section */}
          <div className={styles.details}>
            <h2>Ingredients</h2>
            <ul className={styles.ingredientsList}>
              {recipe.ingredients.map((ing, index) => (
                <li key={index}>
                  <span className={styles.measure}>{ing.measure}</span>
                  <span className={styles.name}>{ing.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

          {/* recipe instructions section */}
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