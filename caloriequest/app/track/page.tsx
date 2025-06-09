// src/components/FoodSearchPage.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';

// Define the type for the product structure we expect from the API
interface Product {
  product_name: string;
  nutriments?: {
    "energy-kcal_100g"?: number | null | string;
    proteins_100g?: number | null | string;
    carbohydrates_100g?: number | null | string;
    fat_100g?: number | null | string;
    fiber_100g?: number | null | string;
  };
  image_url?: string;
  brands?: string;
  quantity?: string;
  serving_size?: string;
}

const FoodSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [servingSize, setServingSize] = useState<number>(100); // Default serving size to 100g/ml
  const [logMessage, setLogMessage] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:8000'; // Make sure this matches your FastAPI backend URL

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setError(null);
    setLogMessage(null);
  };

  const handleServingSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setServingSize(Number(e.target.value));
    setLogMessage(null);
  };

  const handleSearchSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a product name to search.");
      setProduct(null);
      return;
    }

    setLoading(true);
    setProduct(null);
    setError(null);
    setLogMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/openfoodfacts/search-product?product_name=${encodeURIComponent(searchQuery)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data: Product = await response.json();
      setProduct(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during search.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNutrientValue = (value: number | null | string | undefined): number => {
      if (typeof value === 'string') {
          const parsed = parseFloat(value);
          return isNaN(parsed) ? 0 : parsed;
      }
      return value ?? 0;
  };

  const handleLogFood = async () => {
    if (product) {
      const caloriesPerServing = getNutrientValue(product.nutriments?.["energy-kcal_100g"]) * (servingSize / 100);
      const proteinsPerServing = getNutrientValue(product.nutriments?.proteins_100g) * (servingSize / 100);
      const carbsPerServing = getNutrientValue(product.nutriments?.carbohydrates_100g) * (servingSize / 100);
      const fatsPerServing = getNutrientValue(product.nutriments?.fat_100g) * (servingSize / 100);

      // Data to send to your backend
      const foodLogData = {
        product_name: product.product_name,
        serving_size_g: servingSize,
        calories: parseFloat(caloriesPerServing.toFixed(2)),
        proteins: parseFloat(proteinsPerServing.toFixed(2)),
        carbohydrates: parseFloat(carbsPerServing.toFixed(2)),
        fats: parseFloat(fatsPerServing.toFixed(2)),
      };

      setLoading(true);
      setLogMessage(null);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/food-logs/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${userToken}`, // No longer needed as user_id is hardcoded on backend
          },
          body: JSON.stringify(foodLogData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Failed to log food: HTTP status ${response.status}`);
        }

        const loggedItem = await response.json();
        setLogMessage(`Successfully logged ${foodLogData.serving_size_g}g of ${foodLogData.product_name}. Total Calories: ${loggedItem.calories}`);
        console.log('Logged food item:', loggedItem);

      } catch (err: any) {
        setError(err.message || 'An unknown error occurred while logging food.');
        console.error('Log food error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setLogMessage("No product selected to log.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Search and Log Food</h1>

      <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="e.g., Apple, Milk, Bread"
          style={styles.searchInput}
        />
        <button type="submit" disabled={loading} style={styles.searchButton}>
          {loading ? 'Searching...' : 'Search Food'}
        </button>
      </form>

      {error && <p style={styles.errorMessage}>{error}</p>}
      {logMessage && <p style={styles.successMessage}>{logMessage}</p>}

      {product && (
        <div style={styles.productCard}>
          <h2 style={styles.productName}>{product.product_name}</h2>
          {product.image_url && (
            <img src={product.image_url} alt={product.product_name} style={styles.productImage} />
          )}
          {product.brands && <p><strong>Brand:</strong> {product.brands}</p>}
          {product.quantity && <p><strong>Quantity:</strong> {product.quantity}</p>}
          {product.serving_size && <p><strong>Default Serving Size:</strong> {product.serving_size}</p>}
          {product.nutriments && (
            <div style={styles.nutriments}>
              <h3>Nutritional Information (per 100g):</h3>
              <ul>
                {product.nutriments["energy-kcal_100g"] !== undefined && product.nutriments["energy-kcal_100g"] !== null && (
                  <li>Calories: {getNutrientValue(product.nutriments["energy-kcal_100g"]).toFixed(2)} kcal</li>
                )}
                {product.nutriments.proteins_100g !== undefined && product.nutriments.proteins_100g !== null && (
                  <li>Proteins: {getNutrientValue(product.nutriments.proteins_100g).toFixed(2)} g</li>
                )}
                {product.nutriments.carbohydrates_100g !== undefined && product.nutriments.carbohydrates_100g !== null && (
                  <li>Carbohydrates: {getNutrientValue(product.nutriments.carbohydrates_100g).toFixed(2)} g</li>
                )}
                {product.nutriments.fat_100g !== undefined && product.nutriments.fat_100g !== null && (
                  <li>Fat: {getNutrientValue(product.nutriments.fat_100g).toFixed(2)} g</li>
                )}
                {product.nutriments.fiber_100g !== undefined && product.nutriments.fiber_100g !== null && (
                  <li>Fiber: {getNutrientValue(product.nutriments.fiber_100g).toFixed(2)} g</li>
                )}
              </ul>
            </div>
          )}

          <div style={styles.logSection}>
            <label htmlFor="servingSize" style={styles.servingSizeLabel}>
              Serving Size (in grams/ml):
            </label>
            <input
              type="number"
              id="servingSize"
              value={servingSize}
              onChange={handleServingSizeChange}
              min="1"
              style={styles.servingSizeInput}
            />
            <button onClick={handleLogFood} disabled={loading} style={styles.logButton}>
              {loading ? 'Logging...' : 'Log Food'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    backgroundColor: '#fff',
  },
  header: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  searchForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  searchInput: {
    flexGrow: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  searchButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
  searchButtonHover: {
    backgroundColor: '#0056b3',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '15px',
  },
  successMessage: {
    color: 'green',
    textAlign: 'center',
    marginBottom: '15px',
  },
  productCard: {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '30px',
    backgroundColor: '#f9f9f9',
  },
  productName: {
    color: '#007bff',
    marginBottom: '10px',
  },
  productImage: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '4px',
    marginBottom: '15px',
  },
  nutriments: {
    marginTop: '20px',
    borderTop: '1px solid #eee',
    paddingTop: '15px',
  },
  nutrimentsUl: {
    listStyleType: 'none',
    padding: 0,
  },
  nutrimentsLi: {
    marginBottom: '5px',
  },
  logSection: {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  servingSizeLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  servingSizeInput: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    width: '80px',
    fontSize: '16px',
  },
  logButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
  logButtonHover: {
    backgroundColor: '#218838',
  },
};

export default FoodSearchPage;