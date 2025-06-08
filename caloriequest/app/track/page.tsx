// app/products/page.tsx
'use client'; // Required for client-side rendering in Next.js App Router

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // For redirection
import useAuthStatus from '@/hooks/useAuthStatus'; // Adjust path if needed
import { ProductOut } from '@/types/index'; // Ensure ProductOut type is correctly defined
import styles from './track.module.css'; // Create this CSS module

export default function ProductsPage() {
    const { user, isLoading: isLoadingAuth, error: authError } = useAuthStatus();
    const router = useRouter();

    const [userProducts, setUserProducts] = useState<ProductOut[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [errorProducts, setErrorProducts] = useState<string | null>(null);

    const API_BASE_URL = 'http://127.0.0.1:8000'; // Your FastAPI backend URL

    // Function to fetch products, wrapped in useCallback for stability
    const fetchUserProducts = useCallback(async () => {
        if (!user) {
            // If user is null, and not loading auth, it means they are not logged in.
            // The useEffect below will handle redirection.
            return;
        }

        setLoadingProducts(true);
        setErrorProducts(null);
        setUserProducts([]); // Clear previous products

        try {
            const res = await fetch(`${API_BASE_URL}/user/products`, {
                credentials: 'include', // VERY IMPORTANT: Ensures the session cookie is sent!
            });

            if (res.status === 401) {
                // If 401, clear user and redirect to login
                setErrorProducts("Not authenticated. Please log in.");
                router.push('/login');
                return;
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || `Failed to fetch products: ${res.statusText}`);
            }

            const data: ProductOut[] = await res.json();
            setUserProducts(data);
        } catch (err: any) {
            console.error("Error fetching user products:", err);
            setErrorProducts(err.message || "An unexpected error occurred while fetching products.");
        } finally {
            setLoadingProducts(false);
        }
    }, [user, router]); // Dependencies for useCallback: re-run if user or router changes

    // useEffect to trigger data fetching when user status is known
    useEffect(() => {
        if (!isLoadingAuth) { // Only proceed once authentication status is determined
            if (user) {
                fetchUserProducts();
            } else {
                // User is not logged in, redirect to login page
                router.push('/login');
            }
        }
    }, [user, isLoadingAuth, fetchUserProducts, router]);

    // --- Loading and Error States for UI ---
    if (isLoadingAuth || loadingProducts) {
        return (
            <main className="container">
                <div className={styles.productsPage}>
                    <p>Loading your products...</p>
                </div>
            </main>
        );
    }

    if (authError) {
        return (
            <main className="container">
                <div className={styles.productsPage}>
                    <p className={styles.errorMessage}>Authentication Error: {authError}</p>
                    <button onClick={() => router.push('/login')} className={styles.loginButton}>Go to Login</button>
                </div>
            </main>
        );
    }

    if (errorProducts) {
        return (
            <main className="container">
                <div className={styles.productsPage}>
                    <p className={styles.errorMessage}>Error: {errorProducts}</p>
                    <button onClick={fetchUserProducts} className={styles.retryButton}>Retry</button>
                </div>
            </main>
        );
    }

    if (!user) {
        // This case should ideally be caught by the router.push above,
        // but as a fallback/redundancy for clarity.
        return (
            <main className="container">
                <div className={styles.productsPage}>
                    <p className={styles.errorMessage}>You need to be logged in to view your products.</p>
                </div>
            </main>
        );
    }

    // --- Main Content Display ---
    return (
        <main className="container">
            <div className={styles.productsPage}>
                <h1>My Products</h1>

                {userProducts.length === 0 ? (
                    <p className={styles.noProductsMessage}>You haven't added any products yet. Go to the <a href="/scan">Scan page</a> to add some!</p>
                ) : (
                    <div className={styles.productListGrid}>
                        {userProducts.map((product) => (
                            <div key={product.id} className={styles.productCard}>
                                <h2>{product.name}</h2>
                                <p><strong>Brand:</strong> {product.brand}</p>
                                <p><strong>Quantity:</strong> {product.quantity} ml/g (Nutrients per this quantity)</p>
                                <div className={styles.nutritionFacts}>
                                    <p>Calories: <span>{product.calories} kcal</span></p>
                                    <p>Protein: <span>{product.protein} g</span></p>
                                    <p>Carbs: <span>{product.carbs} g</span></p>
                                    <p>Fat: <span>{product.fat} g</span></p>
                                </div>
                                <p className={styles.ownerInfo}>Added by User ID: {product.owner_id}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}