"use client";
import Script from "next/script";
import { useEffect } from "react";

export default function PayButton() {
  useEffect(() => {
    // any window.FlutterwaveCheckout usage goes here
  }, []);

  return (
    <>
      <Script src="https://checkout.flutterwave.com/v3.js" strategy="afterInteractive" />
      <button onClick={() => {
        window.FlutterwaveCheckout({
          // ... your config here ...
        });
      }}>
        Pay with Flutterwave
      </button>
    </>
  );
}
