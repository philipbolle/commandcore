"use client";
import { useEffect, useState } from "react";

export interface TrendingIdea {
  id: string;
  title: string;
  description: string;
  targetAudience?: string;
  monetizationStrategy?: string;
  validationScore: number;
  searchVolume?: number;
  competitionLevel?: string;
  estimatedRevenue?: number;
}

export function useTrendingIdeas() {
  const [ideas, setIdeas] = useState<TrendingIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const res = await fetch("/api/backend/ideas/trending");
        const json = await res.json();
        if (json.success) {
          setIdeas(json.data);
        } else {
          setError(json.error || "Failed to fetch ideas");
        }
      } catch (err) {
        setError("Failed to fetch ideas");
      } finally {
        setLoading(false);
      }
    };
    fetchIdeas();
  }, []);

  return { ideas, loading, error };
} 