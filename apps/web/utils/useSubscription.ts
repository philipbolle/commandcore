"use client";
import { useEffect, useState } from "react";

export interface SubscriptionInfo {
  plan: string;
  status: string;
  currentPeriodEnd?: string;
}

export function useSubscription() {
  const [data, setData] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await fetch("/api/subscription");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch subscription", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSub();
  }, []);

  return { data, loading };
} 