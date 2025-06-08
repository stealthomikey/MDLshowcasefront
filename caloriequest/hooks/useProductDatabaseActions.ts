// @/hooks/useProductDatabaseActions.ts
import { useState, useCallback } from 'react';
import type { FoodProduct, ProductCreate, MealCreate } from '@/types/index';

// It's good practice to have a common place for your API base URL
const API_BASE_URL = 'http://127.0.0.1:8000'; // Or 'https://127.0.0.1:8000' if you set up HTTPS

// Define the return type of our hook
interface UseProductDatabaseActionsReturn {
    loadingAction: boolean;
    error: string | null;
    addProductAndLogMeal: (
        productToProcess: FoodProduct,
        mealQuantityGrams: number
    ) => Promise<void>;
    // You might want to expose setters for error, e.g., clearError
}

export const useProductDatabaseActions = (): UseProductDatabaseActionsReturn => {
    const [loadingAction, setLoadingAction] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // This function will be called by the component when it's ready to add/log
    const addProductAndLogMeal = useCallback(
        async (productToProcess: FoodProduct, mealQuantityGrams: number) => {
            setLoadingAction(true);
            setError(null); // Clear previous errors

            try {
                let productId: number | null = null;

                // --- STEP 1: Add/Create the Product ---
                // Construct payload conforming to ProductCreate schema
                const productCreatePayload: ProductCreate = {
                    name: productToProcess.product_name || productToProcess.name || 'Unnamed Product',
                    brand: productToProcess.brand || 'Unknown',
                    quantity: productToProcess.quantity || '100', // Ensure this is a string, fallback to '100'
                    // Map nutriments from FoodProduct to ProductCreate's flat structure
                    calories: productToProcess.nutriments?.energy_kcal_100g || 0,
                    protein: productToProcess.nutriments?.proteins_100g || 0,
                    carbs: productToProcess.nutriments?.carbohydrates_100g || 0,
                    fat: productToProcess.nutriments?.fat_100g || 0,
                    // If your ProductCreate schema has a barcode field, add it here:
                    // barcode: productToProcess.code || undefined
                };

                const addProductRes = await fetch(`${API_BASE_URL}/user/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productCreatePayload),
                    credentials: 'include', // Ensures cookies are sent
                });

                if (!addProductRes.ok) {
                    const errorData = await addProductRes.json();
                    throw new Error(`Failed to add product: ${errorData.detail || addProductRes.statusText}`);
                }
                const addedProduct = await addProductRes.json();
                productId = addedProduct.id;
                console.log(`Product "${addedProduct.name}" added successfully with ID: ${productId}`);

                // --- STEP 2: Log a Meal with the Newly Added Product ---
                if (productId) {
                    const mealLogPayload: MealCreate = {
                        product_id: productId,
                        quantity_grams: mealQuantityGrams,
                    };

                    const logMealRes = await fetch(`${API_BASE_URL}/user/meals/log`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(mealLogPayload),
                        credentials: 'include',
                    });

                    if (!logMealRes.ok) {
                        const errorData = await logMealRes.json();
                        throw new Error(`Failed to log meal: ${errorData.detail || logMealRes.statusText}`);
                    }
                    const loggedMeal = await logMealRes.json();
                    alert(`"${addedProduct.name}" added and a ${mealQuantityGrams}g meal logged successfully!`);
                    console.log('Meal logged:', loggedMeal);
                } else {
                    throw new Error("Product ID not obtained after adding product. Cannot log meal.");
                }
            } catch (err: any) {
                console.error("Error during product add/meal log:", err);
                setError(`Action failed: ${err.message}`);
            } finally {
                setLoadingAction(false);
            }
        },
        [] // No dependencies here, as productToProcess and mealQuantityGrams are passed as arguments
    );

    // Return the state and function from the hook
    return {
        loadingAction,
        error,
        addProductAndLogMeal,
    };
};