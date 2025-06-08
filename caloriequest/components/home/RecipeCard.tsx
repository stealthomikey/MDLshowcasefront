import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import styles from './RecipeCard.module.css';

// define the type for the recipecard prop
interface RecipeCardProps {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ id, imageUrl, title, description }) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          alt={`Image of ${title}`}
          src={imageUrl}
          fill
          // fill images to ignore error
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className={styles.cardImage}
        />
      </div>
      <div className={styles.cardContent}>
        <h3>{title}</h3>
        <p>{description}</p>
        <div className={styles.cardActions}>
          <Link href={`/recipes/${id}`} className={styles.viewButton}>
            View Recipe
          </Link>
          <button className={styles.favoriteButton} aria-label="Favorite this recipe">
            <Heart size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;