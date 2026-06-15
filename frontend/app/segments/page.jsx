'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  RefreshCw,
  Star,
  ShoppingCart,
  Mail,
  Droplet,
  Sun,
  Users,
  TrendingUp,
  Clock,
  X,
  Sparkles
} from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { getSegments, generateSegment, saveSegment } from '@/lib/api'

const segmentIcons = [
  <RefreshCw size={20} key="refresh" />,
  <Star size={20} key="star" />,
  <ShoppingCart size={20} key="cart" />,
  <Mail size={20} key="mail" />,
  <Droplet size={20} key="droplet" />,
  <Sun size={20} key="sun" />
]

const segmentColors = ['#DBEAFE', '#DCFCE7', '#FEF9C3', '#F3E8FF', '#FEE2E2', '#EEF2FF']

// Suggestion prompts
const suggestionPrompts = [
  {
    id: 1,
    text: "Customers who haven't purchased in last 45 days with AOV above ₹2000",
    icon: <Clock size={14} />
  },
  {
    id: 2,
    text: "Skincare enthusiasts who bought sunscreens in the last 30 days",
    icon: <Users size={14} />
  },
  {
    id: 3,
    text: "customers who moisturizer and are almost gonna complete the cycle",
    icon: <TrendingUp size={14} />
  }
]

// Skeleton Loader Components
function HeaderSkeleton() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }} />
        <div style={{
          width: 100,
          height: 28,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 8
        }} />
        <div style={{
          width: 40,
          height: 16,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 12
        }} />
      </div>
    </div>
  )
}

function AICardSkeleton() {
  return (
    <div className="card" style={{ marginBottom: 24, borderRadius: 16, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }} />
        <div style={{
          width: 150,
          height: 18,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
      </div>
      <div style={{
        width: '100%',
        height: 120,
        borderRadius: 12,
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <div style={{
          width: 120,
          height: 36,
          borderRadius: 40,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }} />
      </div>
    </div>
  )
}

function ResultCardSkeleton() {
  return (
    <div className="card" style={{ borderLeft: '4px solid #DBEAFE', marginBottom: 32, borderRadius: 16, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
        <div>
          <div style={{
            width: 100,
            height: 11,
            background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: 4,
            marginBottom: 8
          }} />
          <div style={{
            width: 200,
            height: 28,
            background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: 4,
            marginBottom: 8
          }} />
          <div style={{
            width: 250,
            height: 14,
            background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: 4
          }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            width: 90,
            height: 36,
            borderRadius: 40,
            background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }} />
          <div style={{
            width: 130,
            height: 36,
            borderRadius: 40,
            background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            width: 100,
            height: 32,
            borderRadius: 999,
            background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <div style={{
          width: 120,
          height: 12,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
        <div style={{
          width: 150,
          height: 12,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
      </div>
    </div>
  )
}

function SavedSegmentCardSkeleton() {
  return (
    <div className="card" style={{ padding: 16, borderRadius: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }} />
      </div>
      <div style={{
        width: '80%',
        height: 14,
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 4,
        marginBottom: 8
      }} />
      <div style={{
        width: '50%',
        height: 24,
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 4,
        marginBottom: 8
      }} />
      <div style={{
        width: 60,
        height: 13,
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 4
      }} />
    </div>
  )
}

export default function Segments() {
  const router = useRouter()
  const [segments, setSegments] = useState([])
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [creatingCampaign, setCreatingCampaign] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [activeSuggestions, setActiveSuggestions] = useState(suggestionPrompts)

  useEffect(() => {
    getSegments().then(data => {
      setSegments(data)
      setPageLoading(false)
    })
  }, [])

  async function handleGenerate() {
    if (!prompt.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const data = await generateSegment(prompt)
      setResult(data)
    } catch (e) {
      alert('AI generation failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!result) return
    setSaving(true)
    try {
      await saveSegment({
        name: result.filters.segment_name,
        description: result.filters.description,
        filters: result.filters.filters,
        customer_count: result.count
      })
      const updated = await getSegments()
      setSegments(updated)
      setResult(null)
      setPrompt('')
    } catch (e) {
      alert('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  function handleSuggestionClick(suggestionText) {
    setPrompt(suggestionText)
  }

  function handleRemoveSuggestion(id) {
    setActiveSuggestions(prev => prev.filter(s => s.id !== id))
  }

  // Auto-saves the AI-generated segment, then navigates straight to
  // Campaigns step 2 (message draft) for this segment.
  async function handleCreateCampaign() {
    if (!result) return
    setCreatingCampaign(true)
    try {
      const saved = await saveSegment({
        name: result.filters.segment_name,
        description: result.filters.description,
        filters: result.filters.filters,
        customer_count: result.count
      })

      // Refresh segments list so Campaigns page has it too
      const updated = await getSegments()
      setSegments(updated)

      // Pass the saved segment to the campaigns page via sessionStorage,
      // reusing the same "fromInsight" flow that already auto-drafts step 2.
      sessionStorage.setItem('glow_insight_segment', JSON.stringify({
        id: saved.id,
        name: saved.name,
        description: saved.description,
        customer_count: saved.customer_count
      }))

      setResult(null)
      setPrompt('')
      router.push('/campaigns?fromInsight=1')
    } catch (e) {
      alert('Failed to create campaign: ' + e.message)
    } finally {
      setCreatingCampaign(false)
    }
  }

  // Loading state with light blue skeleton loaders
  if (pageLoading) return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <HeaderSkeleton />
        <AICardSkeleton />
        <ResultCardSkeleton />
        <div style={{
          width: 150,
          height: 18,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4,
          marginBottom: 16
        }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[1, 2, 3, 4].map(i => <SavedSegmentCardSkeleton key={i} />)}
        </div>

        {/* Shimmer Animation CSS */}
        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}</style>
      </main>
    </div>
  )

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>Segments</h1>
          </div>
        </div>

        {/* AI Input */}
        <div className="card" style={{ marginBottom: 24, borderRadius: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--blue)',
                flexShrink: 0
              }}
            >
              <Sparkles size={14} />
            </div>

            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--navy)',
                margin: 0,
                lineHeight: 1
              }}
            >
              Describe your audience
            </h3>
          </div>

          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Type something..."
            style={{
              width: '100%', height: 120, padding: 16,
              borderRadius: 12, border: '1px solid var(--border)',
              fontSize: 14, resize: 'none', outline: 'none',
              background: '#FAFBFF', lineHeight: 1.6,
              fontFamily: 'Inter, sans-serif'
            }}
            onKeyDown={e => e.key === 'Enter' && e.metaKey && handleGenerate()}
          />

          {/* Suggestion Chips - Below textarea, above generate button */}
          {activeSuggestions.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 16,
              marginBottom: 16,
              padding: '4px 0',
              alignItems: 'center'
            }}>
              {/* Try label */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--label)',
                fontWeight: 500
              }}>
                <Sparkles size={14} color="var(--blue)" />
                <span>Try:</span>
              </div>
              {activeSuggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 8px 6px 14px',
                    borderRadius: 40,
                    background: 'var(--blue-light)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    fontSize: 12,
                    color: 'var(--blue)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: 500
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#DBEAFE'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--blue-light)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <span
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {suggestion.icon}
                    <span>{suggestion.text}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveSuggestion(suggestion.id)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--blue)',
                      opacity: 0.6,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: activeSuggestions.length > 0 ? 0 : 12 }}>
            <button className="btn-primary" onClick={handleGenerate} disabled={loading || !prompt.trim()}>
              {loading ? 'Generating...' : 'Generate Segment →'}
            </button>
          </div>
        </div>

        {/* AI Result Card */}
        {result && (
          <div className="card" style={{ borderLeft: '4px solid var(--blue)', marginBottom: 32, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>AI PROPOSAL READY</p>
                <h3 style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>
                  <span style={{ color: 'var(--blue)' }}>{result.count}</span> customers match
                </h3>
                <p style={{ fontSize: 14, color: 'var(--body)', marginTop: 4 }}>{result.filters.description}</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-ghost" onClick={handleSave} disabled={saving || creatingCampaign}>
                  {saving ? 'Saving...' : 'Save Segment'}
                </button>
                <button className="btn-orange" onClick={handleCreateCampaign} disabled={creatingCampaign || saving}>
                  {creatingCampaign ? 'Setting up...' : 'Create Campaign →'}
                </button>
              </div>
            </div>

            {/* Filter chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {Object.entries(result.filters.filters || {}).filter(([, v]) => v !== null).map(([k, v]) => (
                <span key={k} style={{
                  padding: '6px 12px', borderRadius: 999,
                  background: 'var(--blue-light)', border: '1px solid rgba(23,70,212,0.15)',
                  fontSize: 13, color: 'var(--body)'
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--blue)', marginRight: 4 }}>{k.replace(/_/g, ' ')}:</span>
                  {String(v)}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--label)' }}>+{Math.max(0, result.count - 3)} more in this segment</span>
              <span style={{ fontSize: 12, color: 'var(--label)', fontStyle: 'italic' }}>
                AI-generated illustrative estimate
              </span>
            </div>
          </div>
        )}

        {/* Saved Segments */}
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>Saved Segments</h3>
        {segments.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', borderRadius: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--label)', marginBottom: 12 }}>No segments saved yet.</p>
            <p style={{ fontSize: 12, color: 'var(--label)' }}>Use the AI generator above to create your first segment.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {segments.map((seg, i) => (
              <div key={seg.id} className="card" style={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderRadius: 16
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: segmentColors[i % segmentColors.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#1E40AF'
                  }}>
                    {segmentIcons[i % segmentIcons.length]}
                  </div>
                </div>
                <h5 style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)', marginBottom: 8 }}>{seg.name}</h5>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--blue)' }}>{seg.customer_count?.toLocaleString()}</span>
                  <span style={{ fontSize: 12, color: 'var(--label)' }}>profiles</span>
                </div>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--blue)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: 0
                }}
                  onClick={() => router.push('/campaigns')}>Launch →</button>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}