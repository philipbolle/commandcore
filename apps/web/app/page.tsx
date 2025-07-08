// apps/web/app/page.tsx

import { getProducts } from "../utils/getProducts";

type Product = {
    id: string;
    name: string;
    link: string;
    price: number;
    goal: number;
    traffic: number;
    revenue: number;
    seo_rank: number;
};

export default async function Page() {
    const products: Product[] = await getProducts();

    return (
        <main className="p-8 text-white">
            <h1 className="text-2xl font-bold mb-4">CommandCore Metrics Dashboard</h1>
            {products.length === 0 ? (
                <p>No products found in Supabase.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {products.map((p) => (
                        <div key={p.id} className="bg-gray-800 p-4 rounded shadow">
                            <h2 className="text-xl font-semibold mb-2">{p.name}</h2>
                            <a href={p.link} className="text-blue-400 hover:underline" target="_blank">
                                {p.link}
                            </a>
                            <ul className="mt-2 text-sm">
                                <li><strong>Price:</strong> ${p.price}</li>
                                <li><strong>Goal:</strong> {p.goal}</li>
                                <li><strong>Traffic:</strong> {p.traffic}</li>
                                <li><strong>Revenue:</strong> {p.revenue}</li>
                                <li><strong>SEO Rank:</strong> {p.seo_rank}</li>
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
