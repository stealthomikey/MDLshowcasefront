// @/hooks/useProductCreationAndLogging.ts
import { useState, useCallback } from 'react';
// Assuming you have these types defined in your @/types/index.ts
import type { FoodProduct, ProductCreate, MealCreate } from '@/types/index';

// It's good practice to have a common place for your API base URL
// IMPORTANT: Update this to your Render API URL (e.g., https://your-api-name.onrender.com)
const API_BASE_URL = 'http://127.0.0.1:8000'; 

// Define the return type of our hook
interface UseProductCreationAndLoggingReturn {
    loading: boolean; // Indicates if the action (create product + log meal) is in progress
    error: string | null; // Stores any error from the action
    createAndLogProduct: (
        productData: FoodProduct,
        mealQuantity: number
    ) => Promise<void>; // The function to call from the component
}

export const useProductCreationAndLogging = (): UseProductCreationAndLoggingReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createAndLogProduct = useCallback(
        async (productData: FoodProduct, mealQuantity: number) => {
            setLoading(true);
            setError(null); // Clear previous errors

            try {
                let createdProductId: number | null = null;

                // --- STEP 1: Create/Add the Product Definition ---
                // Map the FoodProduct data (from barcode scan) to your backend's ProductCreate schema
                const productCreatePayload: ProductCreate = {
                    // Use product_name from FoodProduct if available, fallback to name or default
                    name: productData.product_name || (productData as any).name || 'Unnamed Product', 
                    brand: productData.brand || 'Unknown',
                    // Ensure 'quantity' is a string as per your backend schema
                    quantity: productData.quantity || '100', 
                    // Map nutriments from FoodProduct to ProductCreate's flat structure
                    calories: productData.nutriments?.energy_kcal_100g || 0,
                    protein: productData.nutriments?.proteins_100g || 0,
                    carbs: productData.nutriments?.carbohydrates_100g || 0,
                    fat: productData.nutriments?.fat_100g || 0,
                    // If your ProductCreate schema also has a barcode field, add it here:
                    // barcode: productData.code || undefined 
                };

                const addProductRes = await fetch(`${API_BASE_URL}/user/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productCreatePayload),
                    credentials: 'include', // Ensure session cookie is sent
                });

                if (!addProductRes.ok) {
                    const errorData = await addProductRes.json();
                    throw new Error(`Failed to add product: ${errorData.detail || addProductRes.statusText}`);
                }
                const addedProduct = await addProductRes.json();
                createdProductId = addedProduct.id;
                console.log(`Product "${addedProduct.name}" added successfully with ID: ${createdProductId}`);

                // --- STEP 2: Log a Meal with the Newly Created Product's ID ---
                if (createdProductId) {
                    const mealLogPayload: MealCreate = {
                        product_id: createdProductId,
                        quantity_grams: mealQuantity, // Use the quantity provided to the hook
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
                    alert(`"${addedProduct.name}" added to your account and a ${mealQuantity}g meal logged successfully!`);
                    console.log('Meal logged:', loggedMeal);
                } else {
                    throw new Error("Product ID not obtained after adding product. Cannot log meal.");
                }

            } catch (err: any) {
                console.error("Error during product creation/meal logging:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        },
        [] // Dependencies for useCallback. The 'productData' and 'mealQuantity' are arguments, not state dependencies.
    );

    return {
        loading,
        error,
        createAndLogProduct,
    };
};