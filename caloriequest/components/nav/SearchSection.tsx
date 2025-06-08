import type { Recipe } from '@/hooks/useRecipes';
import RecipeCard from '@/components/home/RecipeCard';
import styles from './SearchSection.module.css';

interface SearchSectionProps {
  searchTerm: string;
  results: Recipe[] | null;
  loading: boolean;
  error: string | null;
}

export const SearchSection: React.FC<SearchSectionProps> = ({ searchTerm, results, loading, error }) => {
  // Don't render anything if there are no results to show
  if (results === null && !loading && !error) {
    return null;
  }

  const LoadingSkeleton = () => (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonContent}></div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 3 }).map((_, index) => <LoadingSkeleton key={index} />);
    }

    if (error) {
      return <p className={styles.message}>Error: {error}</p>;
    }

    if (results?.length === 0) {
      return <p className={styles.message}>No results found for "<strong>{searchTerm}</strong>". Try another search.</p>;
    }

    return results?.map((recipe) => (
      // updated recipe card
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
    <section className={styles.searchSection}>
      <div className="container">
        {searchTerm && !loading && !error && <h2>Results for "{searchTerm}"</h2>}
        <div className={styles.resultsGrid}>
          {renderContent()}
        </div>
      </div>
    </section>
  );
};