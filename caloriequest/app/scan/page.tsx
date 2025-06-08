// app/scan/page.tsx
'use client';

import { useState, useCallback } from 'react';
import type { FoodProduct } from '@/types/index';
import { ProductDisplayCard } from '@/components/scan/ProductDisplayCard';
import { BarcodeScannerWrapper } from '@/components/scan/BarcodeScannerWrapper';
// Import your new hook
import { useProductCreationAndLogging } from '@/hooks/useProductCreationAndLogging'; 
import styles from './scan.module.css';

// It's good practice to have a common place for your API base URL (can be moved to a config file)
const API_BASE_URL = 'http://127.0.0.1:8000'; // IMPORTANT: Update this to your Render API URL (e.g., https://your-api-name.onrender.com)

export default function ScanPage() {
    const [product, setProduct] = useState<FoodProduct | null>(null);
    const [loadingProductFetch, setLoadingProductFetch] = useState(false);
    const [error, setError] = useState<string | null>(null); // Error for fetching product data
    const [scanComplete, setScanComplete] = useState(false);

    // Use the new hook for product creation and meal logging
    const { loading: loadingProductAction, error: productActionError, createAndLogProduct } = useProductCreationAndLogging();

    // Default quantity for logging a meal. You might want to allow user input here.
    const DEFAULT_MEAL_QUANTITY_GRAMS = 100; 

    // handleScan logic (remains mostly the same for fetching product info from barcode)
    const handleScan = useCallback(async (barcode: string) => {
        // Prevent new scan if already fetching or performing a database action
        if (loadingProductFetch || loadingProductAction) return;

        setScanComplete(true);
        setLoadingProductFetch(true);
        setError(null); // Clear previous errors (including those from database actions)
        setProduct(null);

        try {
            const res = await fetch(`${API_BASE_URL}/products/${barcode}`, {
                credentials: 'include',
            });

            if (res.status === 404) {
                throw new Error(`Product with barcode ${barcode} not found. You can add it, then log a meal.`);
            }
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Failed to fetch product data.');
            }
            const data: FoodProduct = await res.json();
            setProduct(data);
        } catch (err: any) {
            console.error("Error during product fetch:", err);
            setError(err.message);
        } finally {
            setLoadingProductFetch(false);
        }
    }, [loadingProductFetch, loadingProductAction]); // Dependencies updated to reflect changes

    // Determine which error to display
    const displayError = error || productActionError;

    // Handler for the "Add Product & Log Meal" button click
    const onAddProductAndLogMealClick = useCallback(async () => {
        if (!product) {
            setError("No product data to process. Scan a product first.");
            return;
        }

        // Call the hook's function to perform the combined actions
        await createAndLogProduct(product, DEFAULT_MEAL_QUANTITY_GRAMS);

        // Reset UI after actions, if no new error from the action itself
        if (!productActionError) { // Only reset product/scanner if database action was successful (or no new error emerged)
            setProduct(null);
            setScanComplete(false); // Show scanner again
        }
    }, [product, createAndLogProduct, DEFAULT_MEAL_QUANTITY_GRAMS, productActionError]); // Dependencies

    // Resets the scanner by reloading the page
    const resetScanner = useCallback(() => {
        window.location.reload();
    }, []);

    return (
        <main className="container">
            <div className={styles.scanPage}>
                <h1>Scan a Product Barcode</h1>
                <p className={styles.subtitle}>Hold a product's barcode up to the camera.</p>

                <div className={styles.scannerContainer}>
                    {!scanComplete && (
                        <div className={styles.scannerWrapper}>
                            <BarcodeScannerWrapper onScanSuccess={handleScan} />
                        </div>
                    )}

                    {loadingProductFetch && (
                        <div className={styles.overlay}>
                            <p className={styles.statusText}>Searching for product...</p>
                        </div>
                    )}

                    {displayError && (
                        <div className={styles.overlay}>
                            <div className={styles.statusText}>
                                <p><strong>Error:</strong> {displayError}</p>
                                <button onClick={resetScanner} className={styles.scanAgainButton}>Scan Again</button>
                            </div>
                        </div>
                    )}
                </div>

                {product && (
                    <div className={styles.resultsSection}>
                        <ProductDisplayCard product={product} />
                        <button
                            onClick={onAddProductAndLogMealClick}
                            className={styles.addProductButton}
                            disabled={loadingProductAction} // Use loading state from hook
                        >
                            {loadingProductAction ? 'Processing...' : 'Add Product & Log Meal'}
                        </button>
                        <button onClick={resetScanner} className={styles.scanAgainButton}>Scan Another Product</button>
                    </div>
                )}
            </div>
        </main>
    );
}