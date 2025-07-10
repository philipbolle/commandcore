"use client";
import React, { useEffect, useState } from 'react'
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useSubscription } from "../../utils/useSubscription";

interface Idea {
  id: string
  title: string
  description: string
  targetAudience?: string
  monetizationStrategy?: string
  validationScore: number
  searchVolume?: number
  competitionLevel?: string
  estimatedRevenue?: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data: sub } = useSubscription();
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-black text-white p-8">
        <h1 className="text-3xl font-bold mb-4">Please sign in to access the dashboard</h1>
        <button
          onClick={() => signIn()}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Sign In
        </button>
      </div>
    );
  }

  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionResult, setActionResult] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/backend/ideas/trending')
        const data = await res.json()
        if (data.success) {
          setIdeas(data.data)
        } else {
          setError(data.error || 'Failed to fetch ideas')
        }
      } catch (err) {
        setError('Failed to fetch ideas')
      } finally {
        setLoading(false)
      }
    }
    fetchIdeas()
  }, [])

  const handleValidate = async (idea: Idea) => {
    setActionLoading(`validate-${idea.id}`)
    setActionResult(r => ({ ...r, [idea.id]: '' }))
    try {
      const res = await fetch('/api/backend/ideas/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: idea.title,
          description: idea.description,
          targetAudience: idea.targetAudience,
          monetizationStrategy: idea.monetizationStrategy,
        })
      })
      const data = await res.json()
      if (data.success) {
        setActionResult(r => ({ ...r, [idea.id]: `Validation Score: ${data.data.score}, Competition: ${data.data.competitionLevel}` }))
      } else {
        setActionResult(r => ({ ...r, [idea.id]: data.error || 'Validation failed' }))
      }
    } catch (err) {
      setActionResult(r => ({ ...r, [idea.id]: 'Validation failed' }))
    } finally {
      setActionLoading(null)
    }
  }

  const handleGenerateMVP = async (idea: Idea) => {
    setActionLoading(`mvp-${idea.id}`)
    setActionResult(r => ({ ...r, [idea.id]: '' }))
    try {
      const res = await fetch('/api/backend/products/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea.id,
          features: ['Job scraping', 'Auto-apply', 'Status tracking']
        })
      })
      const data = await res.json()
      if (data.success) {
        setActionResult(r => ({ ...r, [idea.id]: `MVP generated: ${data.data.name}` }))
      } else {
        setActionResult(r => ({ ...r, [idea.id]: data.error || 'MVP generation failed' }))
      }
    } catch (err) {
      setActionResult(r => ({ ...r, [idea.id]: 'MVP generation failed' }))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeploy = async (idea: Idea) => {
    setActionLoading(`deploy-${idea.id}`)
    setActionResult(r => ({ ...r, [idea.id]: '' }))
    try {
      const res = await fetch('/api/backend/deploy/vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: `prod_${idea.id}`,
          repoUrl: 'https://github.com/yourusername/your-mvp-repo'
        })
      })
      const data = await res.json()
      if (data.success) {
        setActionResult(r => ({ ...r, [idea.id]: `Deployed: ${data.data.url}` }))
      } else {
        setActionResult(r => ({ ...r, [idea.id]: data.error || 'Deployment failed' }))
      }
    } catch (err) {
      setActionResult(r => ({ ...r, [idea.id]: 'Deployment failed' }))
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarketing = async (idea: Idea) => {
    setActionLoading(`marketing-${idea.id}`)
    setActionResult(r => ({ ...r, [idea.id]: '' }))
    try {
      const res = await fetch('/api/backend/market/seo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: `prod_${idea.id}`,
          keywords: [idea.title, 'AI', 'automation']
        })
      })
      const data = await res.json()
      if (data.success) {
        setActionResult(r => ({ ...r, [idea.id]: `SEO articles generated: ${data.data.length}` }))
      } else {
        setActionResult(r => ({ ...r, [idea.id]: data.error || 'Marketing failed' }))
      }
    } catch (err) {
      setActionResult(r => ({ ...r, [idea.id]: 'Marketing failed' }))
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">CommandCore Dashboard</h1>
        {sub && (
          <span className="text-sm text-gray-400">Plan: <span className="text-green-400 font-semibold capitalize">{sub.plan}</span> {sub.currentPeriodEnd ? `(renews ${new Date(sub.currentPeriodEnd).toLocaleDateString()})` : null}</span>
        )}
      </header>
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <section>
          <h2 className="text-xl font-semibold mb-4">Discovered SaaS Ideas</h2>
          {loading && <div className="text-gray-400">Loading ideas...</div>}
          {error && <div className="text-red-400">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ideas.map(idea => (
              <div key={idea.id} className="bg-gray-900 rounded-lg p-6 shadow border border-gray-800">
                <h3 className="text-lg font-bold mb-2">{idea.title}</h3>
                <p className="text-gray-300 mb-2">{idea.description}</p>
                <div className="text-sm text-gray-400 mb-2">
                  Audience: {idea.targetAudience || 'N/A'}<br/>
                  Monetization: {idea.monetizationStrategy || 'N/A'}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-4">
                  <span>Validation: <span className="text-green-400 font-semibold">{idea.validationScore}</span></span>
                  <span>Search: {idea.searchVolume}</span>
                  <span>Competition: {idea.competitionLevel}</span>
                  <span>Revenue: ${idea.estimatedRevenue}</span>
                </div>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <button
                    className="px-3 py-1 bg-blue-700 rounded hover:bg-blue-800 text-xs font-semibold disabled:opacity-50"
                    onClick={() => handleValidate(idea)}
                    disabled={actionLoading === `validate-${idea.id}`}
                  >
                    {actionLoading === `validate-${idea.id}` ? 'Validating...' : 'Validate'}
                  </button>
                  <button
                    className="px-3 py-1 bg-purple-700 rounded hover:bg-purple-800 text-xs font-semibold disabled:opacity-50"
                    onClick={() => handleGenerateMVP(idea)}
                    disabled={actionLoading === `mvp-${idea.id}`}
                  >
                    {actionLoading === `mvp-${idea.id}` ? 'Generating...' : 'Generate MVP'}
                  </button>
                  <button
                    className="px-3 py-1 bg-green-700 rounded hover:bg-green-800 text-xs font-semibold disabled:opacity-50"
                    onClick={() => handleDeploy(idea)}
                    disabled={actionLoading === `deploy-${idea.id}`}
                  >
                    {actionLoading === `deploy-${idea.id}` ? 'Deploying...' : 'Deploy'}
                  </button>
                  <button
                    className="px-3 py-1 bg-yellow-700 rounded hover:bg-yellow-800 text-xs font-semibold disabled:opacity-50"
                    onClick={() => handleMarketing(idea)}
                    disabled={actionLoading === `marketing-${idea.id}`}
                  >
                    {actionLoading === `marketing-${idea.id}` ? 'Running...' : 'Marketing'}
                  </button>
                </div>
                {actionResult[idea.id] && (
                  <div className="text-xs text-cyan-400 mt-2 whitespace-pre-line">{actionResult[idea.id]}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
} 