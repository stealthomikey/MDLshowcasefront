// use client for developoment 
'use client';

// import the hook
import { useRecipes } from '@/hooks/useRecipes'; 
import RecipeCard from './RecipeCard';
import styles from './RecipeSection.module.css';

const RecipeSection = () => {
  // use hook to get data and state
  const { recipes, loading, error, loadMore } = useRecipes();

  // create loading animation
  const LoadingSkeleton = () => (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonText}></div>
        <div className={styles.skeletonText}></div>
      </div>
    </div>
  );

  return (
    <section className={styles.recipeSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>Discover New Recipes</h2>
          <p>Get inspired with these healthy and delicious meal ideas.</p>
        </div>

        {error && <div className={styles.errorState}>Error: {error}</div>}

        <div className={styles.recipeGrid}>
          {loading && recipes.length === 0 ? (
            // Show loading cards for inital load
            Array.from({ length: 6 }).map((_, index) => <LoadingSkeleton key={index} />)
          ) : (
            // displkay the recipes from the API
            recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id} 
                title={recipe.title}
                description={recipe.description}
                imageUrl={recipe.imageUrl}
              />
            ))
          )}
        </div>

        {!error && (
            <div className={styles.loadMoreContainer}>
            <button
              onClick={loadMore}
              disabled={loading} 
              className={styles.loadMoreButton}
            >
              {loading && recipes.length > 0 ? 'Loading More...' : 'Load More Recipes'}
            </button>
            </div>
        )}
      </div>
    </section>
  );
};

export default RecipeSection;