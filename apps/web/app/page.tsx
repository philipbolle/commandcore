// apps/web/app/page.tsx

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-black text-white">
            <h1 className="text-4xl font-bold mb-4">⚡ CommandCore is Live</h1>
            <p className="text-lg text-gray-300 mb-6">
                Your AI-powered automation system is deployed and operational.
            </p>
            <a
                href="/api/agents/ideaSpider"
                className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition"
            >
                Test IdeaSpider Agent
            </a>
        </main>
    );
}
