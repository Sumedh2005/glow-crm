'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Droplets, Sun, Heart, Sparkles } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { getCampaigns, getCustomers, getSegments } from '@/lib/api'
import Link from 'next/link'

// Skeleton Loader Components
function StatCardSkeleton() {
  return (
    <div className="card" style={{ borderRadius: 25, padding: '20px' }}>
      <div style={{
        width: '60%',
        height: 12,
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 4,
        marginBottom: 12
      }} />
      <div style={{
        width: '40%',
        height: 32,
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 4,
        marginBottom: 12
      }} />
      <div style={{
        width: '50%',
        height: 10,
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 4
      }} />
    </div>
  )
}

function CampaignRowSkeleton() {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '16px 24px' }}>
        <div style={{
          width: '70%',
          height: 16,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
      </td>
      <td style={{ padding: '16px 24px' }}>
        <div style={{
          width: '60%',
          height: 16,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
      </td>
      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
        <div style={{
          width: 40,
          height: 16,
          marginLeft: 'auto',
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
      </td>
      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
        <div style={{
          width: 40,
          height: 16,
          marginLeft: 'auto',
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
      </td>
      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
        <div style={{
          width: 40,
          height: 16,
          marginLeft: 'auto',
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
      </td>
      <td style={{ padding: '16px 24px' }}>
        <div style={{
          width: 60,
          height: 24,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 12
        }} />
      </td>
    </tr>
  )
}

function SegmentCardSkeleton() {
  return (
    <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12, borderRadius: 40 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 40,
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }} />
      <div style={{ flex: 1 }}>
        <div style={{
          width: '60%',
          height: 14,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4,
          marginBottom: 8
        }} />
        <div style={{
          width: '40%',
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

function BottomCardSkeleton() {
  return (
    <div className="card" style={{ height: 160, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 16 }}>
      <div>
        <div style={{
          width: '60%',
          height: 18,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4,
          marginBottom: 8
        }} />
        <div style={{
          width: '80%',
          height: 13,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4,
          marginTop: 4
        }} />
      </div>
      <div>
        <div style={{
          width: '30%',
          height: 36,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [customers, setCustomers] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [c, camp, seg] = await Promise.all([
          getCustomers(), getCampaigns(), getSegments()
        ])
        setCustomers(c)
        setCampaigns(camp)
        setSegments(seg)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalCustomers = customers.length
  const activeCampaigns = campaigns.filter(c => c.status === 'sent').length
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0)
  const avgOpenRate = campaigns.length > 0
    ? Math.round(campaigns.reduce((sum, c) => {
      const rate = c.sent_count > 0 ? (c.opened_count / c.sent_count) * 100 : 0
      return sum + rate
    }, 0) / campaigns.length)
    : 42
  const recentCampaigns = campaigns.slice(0, 5)
  const topSegments = segments.slice(0, 3)

  // Icon mapping for different segment types
  const getSegmentIcon = (segmentName, index) => {
    const name = segmentName?.toLowerCase() || ''
    if (name.includes('hydrat') || name.includes('moistur')) return <Droplets size={20} />
    if (name.includes('sun') || name.includes('spf')) return <Sun size={20} />
    if (name.includes('vip') || name.includes('premium')) return <Sparkles size={20} />
    if (name.includes('loyal') || name.includes('frequent')) return <Heart size={20} />
    // Fallback based on index
    const icons = [<Droplets size={20} />, <Sun size={20} />, <Heart size={20} />, <Sparkles size={20} />]
    return icons[index % icons.length]
  }

  const getSegmentColor = (segmentName, index) => {
    const name = segmentName?.toLowerCase() || ''
    if (name.includes('hydrat') || name.includes('moistur')) return '#DBEAFE'
    if (name.includes('sun') || name.includes('spf')) return '#FEF9C3'
    if (name.includes('vip') || name.includes('premium')) return '#F3E8FF'
    if (name.includes('loyal') || name.includes('frequent')) return '#FEE2E2'
    // Fallback based on index
    const colors = ['#DBEAFE', '#FEF9C3', '#FEE2E2', '#F3E8FF']
    return colors[index % colors.length]
  }

  function statusBadge(status) {
    const map = {
      sent: { label: 'Sent', cls: 'badge-blue' },
      delivered: { label: 'Delivered', cls: 'badge-green' },
      draft: { label: 'Draft', cls: 'badge-yellow' },
      failed: { label: 'Failed', cls: 'badge-red' },
    }
    const s = map[status] || { label: status, cls: 'badge-blue' }
    return <span className={`badge ${s.cls}`}>{s.label}</span>
  }

  // Loading state with light blue skeleton loaders
  if (loading) return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

        {/* Header Skeleton */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: '40%',
            height: 32,
            background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: 8,
            marginBottom: 8
          }} />
          <div style={{
            width: '60%',
            height: 16,
            background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: 4
          }} />
        </div>

        {/* Stat Cards Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 36 }}>
          {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
        </div>

        {/* Main Grid Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: 24, marginBottom: 24 }}>

          {/* Recent Campaigns Table Skeleton */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: 150,
                height: 18,
                background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: 4
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
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Campaign Name', 'Segment', 'Sent', 'Delivered', 'Opened', 'Status'].map((h, i) => (
                      <th key={i} style={{
                        textAlign: i >= 2 && i <= 4 ? 'right' : 'left',
                        padding: '16px 24px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--label)'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map(i => <CampaignRowSkeleton key={i} />)}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Segments Skeleton */}
          <div>
            <div style={{
              width: 120,
              height: 18,
              background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: 4,
              marginBottom: 16
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => <SegmentCardSkeleton key={i} />)}
              <div style={{
                padding: 16, borderRadius: 20,
                border: '1.5px dashed var(--border)',
                background: 'white', textAlign: 'center'
              }}>
                <div style={{
                  width: '80%',
                  height: 12,
                  margin: '0 auto 10px',
                  background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: 4
                }} />
                <div style={{
                  width: 100,
                  height: 28,
                  margin: '0 auto',
                  background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: 20
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Cards Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {[1, 2].map(i => <BottomCardSkeleton key={i} />)}
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
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>Good morning, Priya 👋</h1>
            <p style={{ color: 'var(--body)', marginTop: 4 }}>Here's what's happening with your skincare customers today.</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 36 }}>
          {[
            { label: 'Total Customers', value: totalCustomers.toLocaleString(), sub: '+12% from last month', subColor: '#059669' },
            { label: 'Active Campaigns', value: activeCampaigns, sub: `${campaigns.filter(c => c.status === 'draft').length} currently in draft`, subColor: 'var(--label)' },
            { label: 'Avg Open Rate', value: `${avgOpenRate}%`, sub: '5.2% above benchmark', subColor: '#059669' },
            { label: 'Revenue Influenced', value: `₹${totalRevenue.toLocaleString()}`, sub: '24% attributed to CRM', subColor: '#059669' },
          ].map((stat, i) => (
            <div key={i} className="card" style={{ borderRadius: 25 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{stat.label}</p>
              <p className="stat-number">{stat.value}</p>
              <p style={{ fontSize: 13, color: stat.subColor, marginTop: 12, fontWeight: 500 }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: 24, marginBottom: 24 }}>

          {/* Recent Campaigns */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>Recent Campaigns</h3>
              <Link href="/campaigns" style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>View all </Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)' }}>Campaign Name</th>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)' }}>Segment</th>
                    <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)' }}>Sent</th>
                    <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)' }}>Delivered</th>
                    <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)' }}>Opened</th>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--label)', padding: 32 }}>
                        No campaigns yet. <Link href="/campaigns" style={{ color: 'var(--blue)' }}>Create one →</Link>
                      </td>
                    </tr>
                  ) : (
                    recentCampaigns.map(c => (
                      <tr key={c.id} style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)' }} onClick={() => router.push(`/analytics/${c.id}`)}>
                        <td style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--navy)' }}>{c.name}</td>
                        <td style={{ padding: '16px 24px', color: 'var(--body)' }}>{c.segment_name || '—'}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--body)' }}>{c.sent_count || 0}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--body)' }}>{c.delivered_count || 0}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--body)' }}>{c.opened_count || 0}</td>
                        <td style={{ padding: '16px 24px' }}>{statusBadge(c.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Segments */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>Top Segments</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topSegments.length === 0 ? (
                <div className="card" style={{ padding: 32, textAlign: 'center', borderRadius: 40 }}>
                  <p style={{ fontSize: 14, color: 'var(--label)' }}>No segments yet.</p>
                  <button className="btn-ghost" style={{ marginTop: 12, fontSize: 12 }}
                    onClick={() => router.push('/segments')}>
                    Create your first segment →
                  </button>
                </div>
              ) : (
                topSegments.map((seg, i) => (
                  <div key={seg.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderRadius: 40 }}
                    onClick={() => router.push('/segments')}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 40,
                      background: getSegmentColor(seg.name, i), display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'var(--navy)'
                    }}>
                      {getSegmentIcon(seg.name, i)}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>{seg.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--label)' }}>{seg.customer_count?.toLocaleString()} customers</p>
                    </div>
                  </div>
                ))
              )}

              {/* AI suggestion card */}
              {topSegments.length > 0 && (
                <div style={{
                  padding: 16, borderRadius: 20,
                  border: '1.5px dashed var(--border)',
                  background: 'white', textAlign: 'center'
                }}>
                  <p style={{ fontSize: 12, color: 'var(--label)', marginBottom: 10 }}>
                    ✦ AI suggests creating a segment for 'High LTV Hydration Fans' based on recent purchase velocity.
                  </p>
                  <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 14px' }}
                    onClick={() => router.push('/segments')}>
                    Create Segment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{
            borderRadius: 16, padding: 32, background: 'var(--blue)',
            color: 'white', position: 'relative', overflow: 'hidden', height: 160,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 700 }}>Campaign Performance</h4>
              <p style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Overall ROI across all channels this quarter.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: 36, fontWeight: 800 }}>3.8x</span>
              <span style={{ fontSize: 13, opacity: 0.8 }}>↑ 0.4x vs last Q</span>
            </div>
          </div>

          <div className="card" style={{ height: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>Customer Health</h4>
                <p style={{ fontSize: 13, color: 'var(--label)', marginTop: 4 }}>Engagement levels across your database.</p>
              </div>
              <span className="badge badge-green">Excellent</span>
            </div>
            <div>
              <div style={{ background: 'var(--blue-light)', borderRadius: 999, height: 10, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ background: 'var(--blue)', width: '82%', height: '100%', borderRadius: 999 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--label)', fontWeight: 500 }}>
                <span>82% High Engagement</span>
                <span>18% At Risk</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}