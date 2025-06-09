// app/scan/page.tsx
'use client';

import { useState, useCallback } from 'react';
import type { FoodProduct } from '@/types/index';
import { ProductDisplayCard } from '@/components/scan/ProductDisplayCard';
import { BarcodeScannerWrapper } from '@/components/scan/BarcodeScannerWrapper';
// Import your new hook (still keeping it, but its function won't be called for now)
import { useProductCreationAndLogging } from '@/hooks/useProductCreationAndLogging';
import styles from './scan.module.css';

// It's good practice to have a common place for your API base URL (can be moved to a config file)
const API_BASE_URL = 'http://127.0.0.1:8000'; // IMPORTANT: Update this to your Render API URL (e.g., https://your-api-name.onrender.com)

export default function ScanPage() {
    const [product, setProduct] = useState<FoodProduct | null>(null);
    const [loadingProductFetch, setLoadingProductFetch] = useState(false);
    const [error, setError] = useState<string | null>(null); // Error for fetching product data
    const [scanComplete, setScanComplete] = useState(false);

    // Use the new hook for product creation and meal logging (still keeping it, but its function won't be called directly for now)
    const { loading: loadingProductAction, error: productActionError } = useProductCreationAndLogging();

    // handleScan logic (remains mostly the same for fetching product info from barcode)
    const handleScan = useCallback(async (barcode: string) => {
        // Prevent new scan if already fetching or performing a database action
        if (loadingProductFetch || loadingProductAction) return;

        setScanComplete(true);
        setLoadingProductFetch(true);
        setError(null);
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
        } catch (err: unknown) {
            console.error("Error during product fetch:", err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setLoadingProductFetch(false);
        }
    }, [loadingProductFetch, loadingProductAction]);

    // Determine which error to display
    const displayError = error || productActionError;

    // Handler for the "Add Product & Log Meal" button click
    const onAddProductAndLogMealClick = useCallback(() => {
        // --- NEW ALERT HERE ---
        alert("Food logging is currently under construction. Please check back later!");
        // --- END NEW ALERT ---

        // The original logic to call createAndLogProduct is commented out for now
        // if (!product) {
        //     setError("No product data to process. Scan a product first.");
        //     return;
        // }
        // await createAndLogProduct(product, DEFAULT_MEAL_QUANTITY_GRAMS);
        // if (!productActionError) {
        //     setProduct(null);
        //     setScanComplete(false);
        // }
    }, [/* No dependencies needed for just an alert */]); // Dependencies simplified as no logic is called

    // Resets the scanner by reloading the page
    const resetScanner = useCallback(() => {
        window.location.reload();
    }, []);

    return (
        <main className="container">
            <div className={styles.scanPage}>
                <h1>Scan a Product Barcode</h1>
                <p className={styles.subtitle}>Hold a product&apos;s barcode up to the camera.</p>

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
                            // No longer checking loadingProductAction as we're just showing an alert
                            // disabled={loadingProductAction}
                        >
                            Add Product & Log Meal {/* Text remains the same for now */}
                        </button>
                        <button onClick={resetScanner} className={styles.scanAgainButton}>Scan Another Product</button>
                    </div>
                )}
            </div>
        </main>
    );
}