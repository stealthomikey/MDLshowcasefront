import Image from 'next/image';
import type { FoodProduct } from '@/types/index'; // Import our new type
import styles from './ProductDisplayCard.module.css';

// defome tje type
interface ProductDisplayCardProps {
  product: FoodProduct;
}

export const ProductDisplayCard: React.FC<ProductDisplayCardProps> = ({ product }) => {
  return (
    <div className={styles.card}>
      {product.image_url && (
        <div className={styles.imageWrapper}>
          <Image 
            src={product.image_url} 
            alt={product.product_name} 
            fill 
            sizes="500px" 
            style={{ objectFit: 'contain' }} 
          />
        </div>
      )}
      <div className={styles.content}>
        <h2 className={styles.title}>{product.product_name}</h2>
        {product.brand && <p className={styles.brand}>{product.brand}</p>}
        <div className={styles.details}>
            {product.quantity && <span><strong>Quantity:</strong> {product.quantity}</span>}
            {product.serving_size && <span><strong>Serving:</strong> {product.serving_size}</span>}
        </div>
        <h3>Nutrition per 100g</h3>
        <ul className={styles.nutrients}>
            <li><span>Calories</span><span>{product.nutriments['energy-kcal_100g'] ?? 'N/A'} kcal</span></li>
            <li><span>Protein</span><span>{product.nutriments.proteins_100g ?? 'N/A'} g</span></li>
            <li><span>Carbs</span><span>{product.nutriments.carbohydrates_100g ?? 'N/A'} g</span></li>
            <li><span>Fat</span><span>{product.nutriments.fat_100g ?? 'N/A'} g</span></li>
        </ul>
      </div>
    </div>
  );
};