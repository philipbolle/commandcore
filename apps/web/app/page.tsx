"use client";

import { useState } from "react";

const PRODUCTS = [
  { id: 1, name: "Product 1" },
  { id: 2, name: "Product 2" },
  { id: 3, name: "Product 3" },
];

const METRICS: Record<number, { traffic: number; revenue: number; seoRank: number }> = {
  1: { traffic: 100, revenue: 200, seoRank: 3 },
  2: { traffic: 150, revenue: 150, seoRank: 2 },
  3: { traffic: 200, revenue: 100, seoRank: 1 },
};


export default function Home() {
  const [selected, setSelected] = useState(PRODUCTS[0].id);

  const handleSelect = (id: number) => {
    setSelected(id);
  };

  let lowest = PRODUCTS[0];
  PRODUCTS.forEach((p) => {
    if (METRICS[p.id].revenue < METRICS[lowest.id].revenue) {
      lowest = p;
    }
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-2xl font-bold mb-4">CommandCore Metrics Dashboard</h1>
      <ul className="mb-4">
        {PRODUCTS.map((product) => (
          <li key={product.id}>
            <button
              onClick={() => handleSelect(product.id)}
              className={`px-4 py-2 rounded ${
                selected === product.id ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {product.name}
            </button>
          </li>
        ))}
      </ul>

      <div className="border p-4 rounded bg-gray-100">
        <h2 className="text-xl font-semibold mb-2">Selected Product Metrics:</h2>
        <p>Traffic: {METRICS[selected].traffic}</p>
        <p>Revenue: {METRICS[selected].revenue}</p>
        <p>SEO Rank: {METRICS[selected].seoRank}</p>
      </div>

      <div className="mt-4 p-4 bg-green-100 rounded">
        <p>Lowest Revenue Product: {lowest.name} (${METRICS[lowest.id].revenue})</p>
      </div>
    </main>
  );
}
