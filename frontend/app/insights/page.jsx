'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { getAIInsights } from '@/lib/api'

// Map insight tags to segment filters + counts for direct campaign creation
function buildSegmentFromInsight(insight, summary) {
  const tag = (insight.tag || '').toLowerCase()

  if (tag.includes('churn')) {
    return {
      id: 'insight-churn',
      name: 'High Churn Risk Customers',
      description: insight.body,
      filters: { churn_status: 'churn_risk' },
      customer_count: summary?.churn_risk || 0,
    }
  }
  if (tag.includes('overdue') || tag.includes('restock')) {
    return {
      id: 'insight-restock',
      name: 'Restock Window Customers',
      description: insight.body,
      filters: { replenishment_status: tag.includes('overdue') ? 'overdue' : 'due_soon' },
      customer_count: tag.includes('overdue') ? (summary?.overdue || 0) : (summary?.due_soon || 0),
    }
  }
  if (tag.includes('aov')) {
    return {
      id: 'insight-high-aov',
      name: 'High AOV Customers',
      description: insight.body,
      filters: { min_aov: 3000 },
      customer_count: summary?.high_aov_count || 0,
    }
  }
  if (tag.includes('product') || tag.includes('recommend')) {
    return {
      id: 'insight-product-rec',
      name: 'Product Recommendation Audience',
      description: insight.body,
      filters: {},
      customer_count: summary?.total || 0,
    }
  }
  // Fallback — generic segment from whatever the insight describes
  return {
    id: 'insight-generic',
    name: insight.title || 'AI Suggested Audience',
    description: insight.body,
    filters: {},
    customer_count: summary?.total || 0,
  }
}

// Helper function to get card color based on insight tag/severity
function getInsightColor(tag, priority) {
  const tagLower = (tag || '').toLowerCase()
  const priorityLower = (priority || '').toLowerCase()

  // High severity - Red/Warning
  if (tagLower.includes('churn') || tagLower.includes('overdue') || priorityLower.includes('high')) {
    return {
      tagBg: '#FEE2E2',
      tagColor: '#991B1B',
      priorityColor: '#EF4444',
      buttonColor: '#EF4444'
    }
  }

  // Medium severity - Yellow/Warning
  if (tagLower.includes('restock') || tagLower.includes('due_soon') || priorityLower.includes('medium')) {
    return {
      tagBg: '#FEF9C3',
      tagColor: '#854D0E',
      priorityColor: '#F59E0B',
      buttonColor: '#F59E0B'
    }
  }

  // Low severity / Opportunity - Green
  if (tagLower.includes('aov') || tagLower.includes('product') || tagLower.includes('recommend') || priorityLower.includes('low')) {
    return {
      tagBg: '#DCFCE7',
      tagColor: '#166534',
      priorityColor: '#10B981',
      buttonColor: '#10B981'
    }
  }

  // Default - Blue
  return {
    tagBg: '#DBEAFE',
    tagColor: '#1E40AF',
    priorityColor: '#3B82F6',
    buttonColor: '#3B82F6'
  }
}

export default function Insights() {
  const router = useRouter()
  const [insights, setInsights] = useState([])
  const [predictedRevenue, setPredictedRevenue] = useState(0)
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAIInsights()
      .then(data => {
        setInsights(data.insights || [])
        setPredictedRevenue(data.predictedRevenue || 0)
        setTotal(data.total || 0)
        setSummary(data.summary || null)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  function handleCreateCampaign(insight) {
    const segment = buildSegmentFromInsight(insight, summary)
    sessionStorage.setItem('glow_insight_segment', JSON.stringify(segment))
    router.push('/campaigns?fromInsight=1')
  }

  if (loading) return (
    <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}>
      <Sidebar />
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          {/* Rotating Black Logo */}
          <div style={{
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'spin 2s linear infinite'
          }}>
            <span style={{ fontSize: 64, color: '#000000' }}>✦</span>
          </div>
          <p style={{ color: 'var(--label)', fontSize: 14, marginTop: 16 }}>
            Groq (Llama 3.1) is analyzing your customer base...
          </p>
        </div>
      </main>
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content">
        <p style={{ color: 'red' }}>Error: {error}</p>
      </main>
    </div>
  )

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", paddingBottom: 60 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>✦</span>
            AI Insights
          </h1>
          <p style={{ fontSize: 14, color: 'var(--label)', marginTop: 4 }}>
            Opportunities identified across your customer base
          </p>
        </div>

        {/* Top Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>

          <div className="card" style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Restock Revenue Window
            </p>
            <p style={{ fontSize: 32, fontWeight: 700, color: '#3B82F6', marginBottom: 8 }}>
              ₹{Math.round(predictedRevenue).toLocaleString()}
            </p>
            <p style={{ fontSize: 12, color: 'var(--label)' }}>
              Sum of AOV · {summary?.due_soon || 0} customers in restock window
            </p>
          </div>

          <div className="card" style={{ borderRadius: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Insights Generated
            </p>
            <p style={{ fontSize: 32, fontWeight: 700, color: '#3B82F6', marginBottom: 8 }}>{insights.length}</p>
            <p style={{ fontSize: 12, color: 'var(--label)' }}>Based on {total} customer records · Updated just now</p>
          </div>

          <div className="card" style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Customer Health Breakdown
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--label)' }}>On Track</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{summary?.on_track || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--label)' }}>Due Soon</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>{summary?.due_soon || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--label)' }}>Overdue</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#EF4444' }}>{summary?.overdue || 0}</span>
              </div>
            </div>
            <span style={{ position: 'absolute', right: 16, bottom: 16, fontSize: 48, fontWeight: 900, color: 'rgba(23,70,212,0.06)' }}>⚡</span>
          </div>
        </div>

        {/* AI Insight Cards - Color coded by severity */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 32 }}>
          {insights.map((insight, i) => {
            const colors = getInsightColor(insight.tag, insight.priority)
            return (
              <div key={i} className="card" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                borderRadius: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    background: colors.tagBg,
                    color: colors.tagColor
                  }}>{insight.tag}</span>
                  <span style={{ fontSize: 12, color: colors.priorityColor, fontWeight: 500 }}>{insight.priority}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.4 }}>{insight.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--body)', lineHeight: 1.6 }}>{insight.body}</p>
                <button
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: 8,
                    background: colors.buttonColor,
                    color: 'white',
                    border: 'none',
                    borderRadius: 40,
                    padding: '8px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleCreateCampaign(insight)}>
                  Create Campaign →
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          position: 'fixed', bottom: 0, left: 240, right: 0,
          background: 'white', borderTop: '1px solid var(--border)',
          padding: '12px 32px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--body)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            Insights generated by Groq (Llama 3.1) · Based on {total} customer records · Replenishment computed live from purchase dates
          </div>

        </div>

      </main>
    </div>
  )
}