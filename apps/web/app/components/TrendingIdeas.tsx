"use client";
import React from "react";
import { useTrendingIdeas } from "../../utils/useTrendingIdeas";

const placeholders = [
  { icon: "💡", color: "blue-500" },
  { icon: "🚀", color: "green-500" },
  { icon: "⚡", color: "purple-500" },
];

export default function TrendingIdeas() {
  const { ideas, loading, error } = useTrendingIdeas();

  return (
    <section className="py-16 px-4 bg-gray-900 bg-opacity-90">
      <h2 className="text-3xl font-bold text-center mb-10">Trending SaaS Ideas</h2>
      {loading && <p className="text-center text-gray-400">Loading ideas...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {ideas.map((idea, idx) => (
          <div key={idea.id} className="bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 hover:scale-105 transition-transform">
            <div className={`text-4xl text-${placeholders[idx % placeholders.length].color}`}>{placeholders[idx % placeholders.length].icon}</div>
            <h3 className="text-xl font-semibold">{idea.title}</h3>
            <p className="text-gray-300 flex-1">{idea.description}</p>
            <div className="text-sm text-gray-400">Validation Score: <span className="text-green-400 font-semibold">{idea.validationScore}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
} 