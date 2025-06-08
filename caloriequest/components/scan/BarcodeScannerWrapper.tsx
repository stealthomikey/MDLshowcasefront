// use client while developong
'use client';

import { useEffect, useRef } from 'react';
// import barcode scanner libary
import { Html5QrcodeScanner, QrcodeSuccessCallback, Html5QrcodeSupportedFormats } from 'html5-qrcode';

// define the props for the BarcodeScannerWrapper component
interface BarcodeScannerProps {
  onScanSuccess: QrcodeSuccessCallback;
}

// use the barcode scanner prop with the onScanSuccess callback
export const BarcodeScannerWrapper: React.FC<BarcodeScannerProps> = ({ onScanSuccess }) => {
  // useRef to hold the scanner instance
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // useEffect to initialize the scanner 
  useEffect(() => {
    if (!scannerRef.current) {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E
        ]
      };

      // create a new scanner
      const newScanner = new Html5QrcodeScanner('reader', config, false);

      // set the scanner sucess and error
      const handleSuccess: QrcodeSuccessCallback = (decodedText, decodedResult) => {
        // debug
        console.log(`Barcode scanned: ${decodedText}`);
        newScanner.clear();
        onScanSuccess(decodedText, decodedResult);
      };

      const handleError = (errorMessage: string) => {
        console.debug(`Scanner frame error: ${errorMessage}`);
      };

      newScanner.render(handleSuccess, handleError);
      scannerRef.current = newScanner;
    }

    // fallback
    return () => {
      scannerRef.current?.clear().catch(error => {
        console.error("Failed to clear scanner.", error);
      });
      scannerRef.current = null;
    };
    // sent onScanSuccess as a dependency to useEffect
  }, [onScanSuccess]);
  // render the scanner component
  return <div id="reader" />;
};
