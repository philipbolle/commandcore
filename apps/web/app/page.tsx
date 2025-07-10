import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">CommandCore</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary-600">
              Features
            </Link>
            <Link href="#workflow" className="text-sm font-medium hover:text-primary-600">
              Workflow
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary-600">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm font-medium hover:text-primary-600">
              Documentation
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Sign in
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-medium px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Build SaaS Products <span className="text-primary-600">Faster</span> with AI
              </h1>
              <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
                CommandCore SaaS Forge automates your development workflow from idea to deployment, 
                powered by advanced AI agents and LangGraph workflows.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/dashboard" 
                  className="px-8 py-3 bg-primary-600 text-white rounded-md text-center font-medium hover:bg-primary-700 transition-colors"
                >
                  Start Building
                </Link>
                <Link 
                  href="/docs" 
                  className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-center font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  View Documentation
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                  <div className="text-center p-8 bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Platform Demo</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Interactive preview coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Next.js 14 Frontend",
                description: "Modern, fast, and SEO-friendly React framework with server components and app router.",
                icon: "🚀"
              },
              {
                title: "FastAPI Backend",
                description: "High-performance Python 3.12 API with automatic OpenAPI documentation.",
                icon: "⚡"
              },
              {
                title: "LangGraph Workflows",
                description: "Powerful AI agent workflows for automating complex development tasks.",
                icon: "🧠"
              },
              {
                title: "Database Integration",
                description: "Prisma ORM with Postgres via Supabase for reliable data storage.",
                icon: "🗄️"
              },
              {
                title: "CI/CD Pipeline",
                description: "GitHub Actions for testing, building, and deploying to Vercel and Railway.",
                icon: "🔄"
              },
              {
                title: "Monorepo Structure",
                description: "Efficient code organization with pnpm workspaces for better development.",
                icon: "📦"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Development Workflow</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Define Your SaaS Concept",
                  description: "Specify your product requirements and target audience."
                },
                {
                  step: "2",
                  title: "AI-Powered Scaffolding",
                  description: "Our agents automatically generate the initial codebase structure."
                },
                {
                  step: "3",
                  title: "Customize & Extend",
                  description: "Modify the generated code to fit your specific business needs."
                },
                {
                  step: "4",
                  title: "Test & Deploy",
                  description: "Utilize our CI/CD pipeline for testing and seamless deployment."
                },
                {
                  step: "5",
                  title: "Monitor & Scale",
                  description: "Track performance and scale your SaaS product as it grows."
                }
              ].map((item, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                    {item.step}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Build Your SaaS Product?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
            Join CommandCore today and transform your ideas into production-ready SaaS applications faster than ever before.
          </p>
          <Link 
            href="/register" 
            className="px-8 py-3 bg-primary-600 text-white rounded-md text-center font-medium hover:bg-primary-700 transition-colors inline-block"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} CommandCore. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                Privacy
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
