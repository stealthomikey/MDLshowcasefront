// use client to enable client-side rendering while developing
'use client';

import { useState } from 'react';
import type { FoodProduct } from '@/types/index';
import { ProductDisplayCard } from '@/components/scan/ProductDisplayCard';
import { BarcodeScannerWrapper } from '@/components/scan/BarcodeScannerWrapper';
import styles from './scan.module.css';


export default function ScanPage() {
  // create state to store the scanned product data.
  const [product, setProduct] = useState<FoodProduct | null>(null);
  // create state to manage the loading state
  const [loading, setLoading] = useState(false);
  // create a state to manage errors
  const [error, setError] = useState<string | null>(null);
  // create a state to check is the scan is complete
  const [scanComplete, setScanComplete] = useState(false);

  // send the scanned barcode to the backend to fetch product data
  const handleScan = async (barcode: string) => {
    // stop multiple concurrent scans.
    if (loading) return;
    
    // when scan is complete hide the camera view
    setScanComplete(true);
    // show the loading state
    setLoading(true);
    // remove all errors
    setError(null);
    // ensure no product data is there
    setProduct(null);

    try {
      // send request to the api to get product data by barcode
      const res = await fetch(`http://127.0.0.1:8000/products/${barcode}`);
      // if product doesnt exist give a 404 error
      if (res.status === 404) {
        throw new Error(`Product with barcode ${barcode} not found.`);
      }
      // other error handling
      if (!res.ok) {
        throw new Error('Failed to fetch product data from the server.');
      }
      // put the reponse data into the FoodProduct type
      const data: FoodProduct = await res.json();
      // Set the fetched product data to state.
      setProduct(data);
    } catch (err: any) {
      // get errors that may happen
      setError(err.message);
    } finally {
      // set loading to false on completion
      setLoading(false);
    }
  };

  // had issue with dual scanner so just gonna refresh the page to reset the scanner 
  const resetScanner = () => {
    // reload the window
    window.location.reload();
  };

  return (
    <main className="container">
      <div className={styles.scanPage}>
        <h1>Scan a Product Barcode</h1>
        <p className={styles.subtitle}>Hold a product's barcode up to the camera.</p>
        
        <div className={styles.scannerContainer}>
          {!scanComplete && (
            // while scanning keep window open
              <div className={styles.scannerWrapper}>
                <BarcodeScannerWrapper onScanSuccess={handleScan} />
              </div>
          )}
          
          {/* loading overlay */}
          {loading && <div className={styles.overlay}><p className={styles.statusText}>Searching for product...</p></div>}
          
          {/* error dispaly */}
          {error && (
            <div className={styles.overlay}>
              <div className={styles.statusText}>
                <p><strong>Error:</strong> {error}</p>
                {/* Button to scan new product*/}
                <button onClick={resetScanner} className={styles.scanAgainButton}>Scan Again</button>
              </div>
            </div>
          )}
        </div>
        
        {/* Display the ProductDisplayCard and button to scan again */}
        {product && (
          <div className={styles.resultsSection}>
            <ProductDisplayCard product={product} />
            {/* Button to scan again */}
            <button onClick={resetScanner} className={styles.scanAgainButton}>Scan Another Product</button>
          </div>
        )}
      </div>
    </main>
  );
}