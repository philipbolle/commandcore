"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";

/**
 * Inner component containing the logic that relies on `useSearchParams`.
 * This component is wrapped in a Suspense boundary to satisfy the
 * Next.js requirement for client-side hooks during prerendering.
 */
function StripeSuccessContent() {
  const params = useSearchParams();
  const sessionId = params?.get("session_id");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Processing your subscription...");

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setMessage("Missing session ID");
      return;
    }
    // Optional: verify session on server.
    setLoading(false);
    setMessage("Subscription successful! Welcome to CommandCore Pro.");
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">
        {loading ? "Loading" : "Thank you!"}
      </h1>
      <p className="text-lg text-gray-300 max-w-lg">{message}</p>
    </div>
  );
}

/**
 * Top-level page component wrapped in a Suspense boundary.
 */
export default function StripeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          Loading...
        </div>
      }
    >
      <StripeSuccessContent />
    </Suspense>
  );
}