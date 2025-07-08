// apps/web/app/page.tsx

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-black via-gray-900 to-black text-white">
            {/* Logo */}
            <div className="mb-8">
                <div className="text-6xl mb-4">⚡</div>
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                CommandCore: Your AI-Powered Automation Engine
            </h1>
            
            {/* Subhead */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 text-center max-w-3xl">
                Deploy autonomous agents to automate your workflows.
            </p>
            
            {/* CTA Button */}
            <a
                href="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
                Launch Your First Agent
            </a>
        </main>
    );
}
