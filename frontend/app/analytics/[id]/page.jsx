'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { getCampaign } from '@/lib/api'

function statusBadge(status) {
  const map = {
    sent: { label: 'Sent', cls: 'badge-blue' },
    delivered: { label: 'Delivered', cls: 'badge-green' },
    opened: { label: 'Opened', cls: 'badge-blue' },
    clicked: { label: 'Clicked', cls: 'badge-purple' },
    failed: { label: 'Failed', cls: 'badge-red' },
  }
  const s = map[status] || { label: status, cls: 'badge-blue' }
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

function initials(name) {
  if (!name) return '??'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

const BAR_HEIGHTS = [40, 65, 45, 90, 75, 35, 55]
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Analytics() {
  const router = useRouter()
  const params = useParams()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return
    getCampaign(params.id).then(data => {
      setCampaign(data)
      setLoading(false)
    })

    // Poll every 3 seconds to catch incoming receipts
    const interval = setInterval(() => {
      getCampaign(params.id).then(data => setCampaign(data))
    }, 3000)
    return () => clearInterval(interval)
  }, [params?.id])

  if (loading) return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--label)' }}>Loading...</div>
      </main>
    </div>
  )

  if (!campaign) return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content"><p>Campaign not found.</p></main>
    </div>
  )

  const deliveryRate = campaign.sent_count > 0
    ? Math.round((campaign.delivered_count / campaign.sent_count) * 100) : 0
  const openRate = campaign.sent_count > 0
    ? Math.round((campaign.opened_count / campaign.sent_count) * 100) : 0
  const ctr = campaign.sent_count > 0
    ? Math.round((campaign.clicked_count / campaign.sent_count) * 100) : 0
  const nonOpeners = (campaign.sent_count || 0) - (campaign.opened_count || 0)

  const funnel = [
    { label: 'Sent', value: campaign.sent_count || 0, sub: 'Initial Audience', subColor: null },
    { label: 'Delivered', value: campaign.delivered_count || 0, sub: `${deliveryRate}% Success`, subColor: '#166534' },
    { label: 'Opened', value: campaign.opened_count || 0, sub: `${openRate}% Rate`, subColor: '#1E40AF' },
    { label: 'Clicked', value: campaign.clicked_count || 0, sub: `${ctr}% CTR`, subColor: '#854D0E' },
  ]

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => router.push('/campaigns')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--body)' }}>←</button>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--navy)' }}>{campaign.name}</h1>
          </div>

        </div>

        {/* Funnel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {funnel.map((item, i) => (
            <div key={i} className="card" style={{
              textAlign: 'center',
              borderLeft: i === 0 ? '3px solid var(--blue)' : 'none',
              position: 'relative'
            }}>
              <p style={{ fontSize: 13, color: 'var(--label)', marginBottom: 8 }}>{item.label}</p>
              <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--blue)', lineHeight: 1.1 }}>
                {item.value.toLocaleString()}
              </p>
              {item.sub && (
                <span style={{
                  display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 999,
                  background: item.subColor ? (item.subColor === '#166534' ? '#DCFCE7' : item.subColor === '#1E40AF' ? '#DBEAFE' : '#FEF9C3') : 'var(--blue-light)',
                  color: item.subColor || 'var(--blue)'
                }}>{item.sub}</span>
              )}
              {i < 3 && (
                <span style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', color: 'var(--label)', fontSize: 20, zIndex: 1 }}>›</span>
              )}
            </div>
          ))}
        </div>

        {/* Chart + AI Analysis */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>Delivery Performance</h3>
                <p style={{ fontSize: 13, color: 'var(--label)', marginTop: 2 }}>Hourly activity tracking for last 7 days</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ padding: '4px 12px', borderRadius: 999, background: 'var(--blue)', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Bar View</span>
                <span style={{ padding: '4px 12px', borderRadius: 999, background: 'var(--blue-light)', color: 'var(--label)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Line View</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: 200, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
              {BAR_HEIGHTS.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{
                    width: '100%', borderRadius: '4px 4px 0 0',
                    height: `${h}%`,
                    background: i === 3 ? 'var(--blue)' : 'rgba(23,70,212,0.15)',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingInline: 4 }}>
              {DAYS.map((d, i) => (
                <span key={i} style={{ fontSize: 11, color: i === 3 ? 'var(--blue)' : 'var(--label)', fontWeight: i === 3 ? 700 : 400, flex: 1, textAlign: 'center' }}>{d}</span>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="card" style={{ borderLeft: '3px solid var(--blue)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>AI Analysis</h3>
            </div>
            <div style={{ background: '#DBEAFE', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1E40AF', marginBottom: 4 }}>Optimal Delivery Window</p>
              <p style={{ fontSize: 13, color: 'var(--body)', lineHeight: 1.5 }}>Engagement peaked 12.4% higher between 8AM and 10AM EST.</p>
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Recommendations</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'start' }}>
                <span style={{ color: '#166534', fontSize: 18 }}>✅</span>
                <p style={{ fontSize: 13, color: 'var(--body)', lineHeight: 1.5 }}>Retarget {nonOpeners.toLocaleString()} non-openers with SMS channel.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'start' }}>
                <span style={{ fontSize: 18 }}>💡</span>
                <p style={{ fontSize: 13, color: 'var(--body)', lineHeight: 1.5 }}>Increase {campaign.segment_name} inventory for VIP segment.</p>
              </div>
            </div>
            <button className="btn-ghost" style={{ width: '100%', marginTop: 20, padding: '10px' }}>
              Generate Full Report
            </button>
          </div>
        </div>

        {/* Recipient Activity */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>Recipient Activity</h3>
            <input placeholder="Search recipients..." style={{ padding: '8px 16px', borderRadius: 999, border: '1px solid var(--border)', fontSize: 13, outline: 'none', width: 220 }} />
          </div>
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {(campaign.communications || []).slice(0, 10).map(comm => (
                <tr key={comm.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--blue)' }}>
                        {initials(comm.customer_name)}
                      </div>
                      {comm.customer_name}
                    </div>
                  </td>
                  <td>{comm.channel}</td>
                  <td>{statusBadge(comm.status)}</td>
                  <td style={{ color: 'var(--label)' }}>{new Date(comm.sent_at).toLocaleString()}</td>
                </tr>
              ))}
              {(!campaign.communications || campaign.communications.length === 0) && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--label)' }}>No recipients yet. Launch the campaign to see activity.</td></tr>
              )}
            </tbody>
          </table>
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--label)' }}>
            Showing {Math.min(10, campaign.communications?.length || 0)} of {campaign.communications?.length || 0} recipients
          </div>
        </div>

      </main>
    </div>
  )
}