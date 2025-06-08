'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRecipeSearch } from '@/hooks/useRecipeSearch';
import RecipeCard from '@/components/home/RecipeCard';
import styles from './search.module.css';
import type { Recipe } from '@/hooks/useRecipes';

/**
 * This is the Search Results Page Component.
 * It's a Client Component because it uses hooks for interactivity.
 */
export default function SearchPage() {
  // `useSearchParams` is a hook to read the current URL's query parameters (e.g., ?q=chicken)
  const searchParams = useSearchParams();
  const query = searchParams.get('q'); // Get the search query 'q' from the URL

  // Use our custom hook to get search functionality and state
  const { searchResults, loading, error, searchRecipes } = useRecipeSearch();

  // This `useEffect` hook runs the search whenever the 'q' parameter in the URL changes.
  // This is how the page knows to fetch new data when the user searches for something else.
  useEffect(() => {
    if (query) {
      searchRecipes(query);
    }
  }, [query, searchRecipes]);

  // A helper component for rendering the loading state UI
  const LoadingSkeleton = () => (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonContent}></div>
    </div>
  );

  // This helper function decides what to render based on the current state (loading, error, etc.)
  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 6 }).map((_, index) => <LoadingSkeleton key={index} />);
    }

    if (error) {
      return <p className={styles.message}>Error: {error}</p>;
    }

    if (searchResults?.length === 0) {
      // FIX HERE: Replaced " with &quot;
      return <p className={styles.message}>No results found for &quot;<strong>{query}</strong>&quot;. Please try another search term.</p>;
    }

    // If we have results, map over them and render a RecipeCard for each
    return searchResults?.map((recipe: Recipe) => (
      <RecipeCard
        key={recipe.id}
        id={recipe.id}
        title={recipe.title}
        description={recipe.description}
        imageUrl={recipe.imageUrl}
      />
    ));
  };

  return (
    <main className="container">
      <section className={styles.searchPage}>
        <h1 className={styles.title}>
          {/* FIX HERE: Replaced " with &quot; */}
          {query ? `Search Results for &quot;${query}&quot;` : 'Search for a recipe'}
        </h1>
        <div className={styles.resultsGrid}>
          {renderContent()}
        </div>
      </section>
    </main>
  );
}