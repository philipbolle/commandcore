'use client'

import React, { useState, useEffect } from 'react'

const PRODUCTS = [
  { id: 1, name: 'MarsX IDE', description: 'Central dev platform for micro apps', price: '$49/mo' },
  { id: 2, name: 'ListingBott', description: 'Auto product listings on directories', price: '$19/mo' },
  { id: 3, name: 'SeoBotAI', description: 'AI SEO automation tool', price: '$29/mo' },
]

const AGENTS = [
  { id: 1, name: 'IdeaSpider', job: 'Finds new AI tool ideas from Reddit and HackerNews' },
  { id: 2, name: 'SEO Phantom', job: 'Creates and indexes SEO content' },
  { id: 3, name: 'ShadowPromoter', job: 'Distributes tools on social channels' },
]

const METRICS = {
  1: { traffic: 1500, revenue: 4000, seoRank: 3 },
  2: { traffic: 700, revenue: 900, seoRank: 12 },
  3: { traffic: 3000, revenue: 5000, seoRank: 1 },
}

export default function Home() {
  const [command, setCommand] = useState('')
  const [log, setLog] = useState<string[]>([])
  const [nextPriority, setNextPriority] = useState(PRODUCTS[0])
  const [loading, setLoading] = useState(false)
  const [ideaSpiderOutput, setIdeaSpiderOutput] = useState<string | null>(null)

  useEffect(() => {
    let lowest = PRODUCTS[0]
    PRODUCTS.forEach((p) => {
      if (METRICS[p.id].revenue < METRICS[lowest.id].revenue) {
        lowest = p
      }
    })
    setNextPriority(lowest)
  }, [])

const handleRunCommand = async () => {
  if (!command.trim()) return
  const userCommand = command.trim()
  setLog((prev) => [`> ${userCommand}`, ...prev])
  setCommand('')
  try {
    const res = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: userCommand }),
    })
    const data = await res.json()
    if (data.response) {
      setLog((prev) => [data.response, ...prev])
    } else if (data.error) {
      setLog((prev) => [`Error: ${data.error}`, ...prev])
    }
  } catch (err: any) {
    setLog((prev) => [`Fetch error: ${err.message || 'Unknown error'}`, ...prev])
  }
}


  const runIdeaSpider = async () => {
    setLoading(true)
    setIdeaSpiderOutput(null)
    try {
      const res = await fetch('/api/agents/ideaSpider')
      const data = await res.json()
      if (data.report) {
        setIdeaSpiderOutput(data.report)
      } else if (data.error) {
        setIdeaSpiderOutput(`Error: ${data.error}`)
      }
    } catch (err: any) {
      setIdeaSpiderOutput(`Error: ${err.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-6 bg-black text-white font-mono">
      <h1 className="text-3xl font-bold mb-6 text-center">⚡ CommandCore v1 Dashboard</h1>

      {/* Products */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">🛠️ Products</h2>
        <ul className="list-disc list-inside">
          {PRODUCTS.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong>: {p.description} — <em>{p.price}</em>
            </li>
          ))}
        </ul>
      </section>

      {/* AI Agents */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">🤖 AI Agents</h2>
        <ul className="list-disc list-inside">
          {AGENTS.map((a) => (
            <li key={a.id}>
              <strong>{a.name}</strong>: {a.job}
            </li>
          ))}
        </ul>
      </section>

      {/* Metrics */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">📊 Metrics</h2>
        <ul className="list-disc list-inside">
          {PRODUCTS.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong>: Traffic: {METRICS[p.id].traffic}, Revenue: ${METRICS[p.id].revenue}, SEO Rank: {METRICS[p.id].seoRank}
            </li>
          ))}
        </ul>
      </section>

      {/* Next Priority */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">🚀 Next Priority</h2>
        <p>Focus on: <strong>{nextPriority.name}</strong> — Revenue is lowest at ${METRICS[nextPriority.id].revenue}</p>
      </section>

      {/* Run Command Box */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">💻 Run Command</h2>
        <input
          type="text"
          className="w-full p-2 rounded bg-gray-800 text-white"
          placeholder="Type AI command..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRunCommand()}
        />
        <div className="mt-4 bg-gray-800 p-3 rounded max-h-48 overflow-y-auto">
          {log.map((line, idx) => (
            <div key={idx} className="whitespace-pre-wrap">{line}</div>
          ))}
        </div>
      </section>

      {/* IdeaSpider Agent */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-2">🕷️ IdeaSpider Agent</h2>
        <button
          onClick={runIdeaSpider}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          {loading ? 'Scanning...' : 'Run IdeaSpider Scan'}
        </button>
        {ideaSpiderOutput && (
          <pre className="mt-4 p-4 bg-gray-900 rounded whitespace-pre-wrap overflow-x-auto max-h-[70vh]">
            {ideaSpiderOutput}
          </pre>
        )}
      </section>
    </main>
  )
}
