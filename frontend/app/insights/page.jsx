'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { getAIInsights } from '@/lib/api'

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
  return {
    id: 'insight-generic',
    name: insight.title || 'AI Suggested Audience',
    description: insight.body,
    filters: {},
    customer_count: summary?.total || 0,
  }
}

function getInsightColor(tag, priority) {
  const tagLower = (tag || '').toLowerCase()
  const priorityLower = (priority || '').toLowerCase()

  if (tagLower.includes('churn') || tagLower.includes('overdue') || priorityLower.includes('high')) {
    return { tagBg: '#FEE2E2', tagColor: '#991B1B', priorityColor: '#EF4444', buttonColor: '#EF4444' }
  }
  if (tagLower.includes('restock') || tagLower.includes('due_soon') || priorityLower.includes('medium')) {
    return { tagBg: '#FEF9C3', tagColor: '#854D0E', priorityColor: '#F59E0B', buttonColor: '#F59E0B' }
  }
  if (tagLower.includes('aov') || tagLower.includes('product') || tagLower.includes('recommend') || priorityLower.includes('low')) {
    return { tagBg: '#DCFCE7', tagColor: '#166534', priorityColor: '#10B981', buttonColor: '#10B981' }
  }
  return { tagBg: '#DBEAFE', tagColor: '#1E40AF', priorityColor: '#3B82F6', buttonColor: '#3B82F6' }
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
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 24px',
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
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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

        {/* Top Stats — 3 cards: Revenue Window, Overdue, Due Soon */}
       {/* Top Stats — 4 cards */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 36 }}>
  {[
    {
      label: 'Restock Revenue Window',
      value: `₹${Math.round(predictedRevenue).toLocaleString()}`,
      sub: `${summary?.due_soon || 0} customers in restock window`,
      subColor: 'var(--label)'
    },
    {
      label: 'On Track',
      value: summary?.on_track || 0,
      sub: 'Customers within their purchase cycle',
      subColor: '#059669'
    },
    {
      label: 'Due Soon',
      value: summary?.due_soon || 0,
      sub: 'Within 7 days of restock window — act now',
      subColor: '#F59E0B'
    },
    {
      label: 'Overdue',
      value: summary?.overdue || 0,
      sub: 'Past their product lifespan — restock missed',
      subColor: '#EF4444'
    },
  ].map((stat, i) => (
    <div key={i} className="card" style={{ borderRadius: 25 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{stat.label}</p>
      <p className="stat-number">{stat.value}</p>
      <p style={{ fontSize: 13, color: stat.subColor, marginTop: 12, fontWeight: 500 }}>{stat.sub}</p>
    </div>
  ))}
</div>

        {/* Insight cards label */}
        <p style={{ fontSize: 13, color: 'var(--label)', marginBottom: 16 }}>
          {insights.length} insights generated by Groq (Llama 3.1) · Based on {total} customer records
        </p>

        {/* AI Insight Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 32 }}>
          {insights.map((insight, i) => {
            const colors = getInsightColor(insight.tag, insight.priority)
            return (
              <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    background: colors.tagBg, color: colors.tagColor
                  }}>{insight.tag}</span>
                  <span style={{ fontSize: 12, color: colors.priorityColor, fontWeight: 500 }}>{insight.priority}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.4 }}>{insight.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--body)', lineHeight: 1.6 }}>{insight.body}</p>
                <button
                  style={{
                    alignSelf: 'flex-start', marginTop: 8,
                    background: colors.buttonColor, color: 'white',
                    border: 'none', borderRadius: 40, padding: '8px 20px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease'
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
            Replenishment computed live from purchase dates · Powered by Groq (Llama 3.1)
          </div>
        </div>

      </main>
    </div>
  )
}