'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { getCampaigns, getSegments, getCampaign, createCampaign, draftMessage, launchCampaign, getSendTime, saveDraftCampaign } from '@/lib/api'

const CHANNELS = ['WhatsApp', 'SMS', 'Email', 'RCS']

function statusBadge(status) {
  const map = {
    sent: { label: 'Sent', cls: 'badge-blue' },
    delivered: { label: 'Delivered', cls: 'badge-green' },
    draft: { label: 'Draft', cls: 'badge-yellow' },
    pending: { label: 'Pending', cls: 'badge-yellow' },
    failed: { label: 'Failed', cls: 'badge-red' },
  }
  const s = map[status] || { label: status, cls: 'badge-blue' }
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

function commBadge(status) {
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

const BAR_HEIGHTS = [40, 65, 45, 90, 75, 35, 55]
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Skeleton Loader Components
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
      <td style={{ padding: '16px 24px' }}>
        <div style={{ 
          width: '50%', 
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
      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
        <div style={{ 
          width: 60, 
          height: 24, 
          marginLeft: 'auto',
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
      </td>
    </tr>
  )
}

function HeaderSkeleton() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
      <div style={{ 
        width: 150, 
        height: 28, 
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 8
      }} />
      <div style={{ 
        width: 120, 
        height: 36, 
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 40
      }} />
    </div>
  )
}

export default function Campaigns() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState([])
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedSegment, setSelectedSegment] = useState(null)
  const [message, setMessage] = useState('')
  const [channel, setChannel] = useState('WhatsApp')
  const [campaignName, setCampaignName] = useState('')
  const [drafting, setDrafting] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [campaignDetail, setCampaignDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [pollInterval, setPollInterval] = useState(null)
  const [sendTime, setSendTime] = useState(null)

  useEffect(() => {
    Promise.all([getCampaigns(), getSegments()]).then(([c, s]) => {
      setCampaigns(c)
      setSegments(s)
      setLoading(false)
    })
    getSendTime().then(data => setSendTime(data)).catch(() => { })
  }, [])

  // Filter out segments that already have campaigns
  const availableSegments = segments.filter(segment => {
    const hasCampaign = campaigns.some(campaign => campaign.segment_name === segment.name)
    return !hasCampaign
  })

  useEffect(() => {
    if (loading) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('fromInsight') !== '1') return

    const stored = sessionStorage.getItem('glow_insight_segment')
    if (!stored) return
    sessionStorage.removeItem('glow_insight_segment')

    try {
      const segment = JSON.parse(stored)
      setSelectedSegment(segment)
      setCreating(true)
      setStep(2)
      setDrafting(true)

      draftMessage({
        segment_name: segment.name,
        segment_description: segment.description,
        channel
      }).then(data => {
        setMessage(data.message)
      }).catch(e => {
        alert('Draft failed: ' + e.message)
      }).finally(() => {
        setDrafting(false)
      })

      // Clean the URL so a refresh doesn't re-trigger
      window.history.replaceState({}, '', '/campaigns')
    } catch (e) {
      console.error('Failed to parse insight segment:', e)
    }
  }, [loading])

  useEffect(() => {
    return () => { if (pollInterval) clearInterval(pollInterval) }
  }, [pollInterval])

  async function openAnalytics(campaign) {
    if (campaign.status === 'pending') {
      // Instead of alert, open the campaign in edit/launch mode
      setSelectedCampaign(campaign)
      setCreating(true)
      setSelectedSegment({
        id: campaign.segment_id,
        name: campaign.segment_name,
        customer_count: campaign.sent_count || 0
      })
      setMessage(campaign.message)
      setChannel(campaign.channel)
      setCampaignName(campaign.name)
      setStep(4)
      return
    }

    if (pollInterval) clearInterval(pollInterval)
    setSelectedCampaign(campaign)
    setDetailLoading(true)
    setCreating(false)
    try {
      const data = await getCampaign(campaign.id)
      setCampaignDetail(data)
    } finally {
      setDetailLoading(false)
    }
    const interval = setInterval(async () => {
      const data = await getCampaign(campaign.id)
      setCampaignDetail(data)
      const updated = await getCampaigns()
      setCampaigns(updated)
    }, 3000)
    setPollInterval(interval)
  }

  function closeAnalytics() {
    if (pollInterval) clearInterval(pollInterval)
    setSelectedCampaign(null)
    setCampaignDetail(null)
  }

  async function handleDraft() {
    if (!selectedSegment) return
    setDrafting(true)
    try {
      const data = await draftMessage({
        segment_name: selectedSegment.name,
        segment_description: selectedSegment.description,
        channel
      })
      setMessage(data.message)
      setStep(2)
    } catch (e) {
      alert('Draft failed: ' + e.message)
    } finally {
      setDrafting(false)
    }
  }

  async function handleRegenerate() {
    setDrafting(true)
    try {
      const data = await draftMessage({
        segment_name: selectedSegment.name,
        segment_description: selectedSegment.description,
        channel
      })
      setMessage(data.message)
    } finally {
      setDrafting(false)
    }
  }

  async function handleSaveDraft() {
    setSavingDraft(true)
    try {
      // Just use the campaign name or segment name - NO DATE
      const name = campaignName || selectedSegment.name

      const isRealSegment = segments.some(s => s.id === selectedSegment.id)

      await saveDraftCampaign({
        name,
        segment_id: isRealSegment ? selectedSegment.id : null,
        segment_name: selectedSegment.name,
        message,
        channel,
        status: 'pending'
      })

      const updated = await getCampaigns()
      setCampaigns(updated)
      setCreating(false)
      setStep(1)
      setSelectedSegment(null)
      setMessage('')
      setCampaignName('')
    } catch (e) {
      alert('Failed to save draft: ' + e.message)
    } finally {
      setSavingDraft(false)
    }
  }

  async function handleLaunch() {
    setLaunching(true)
    try {
      // Just use the campaign name or segment name - NO DATE
      const name = campaignName || selectedSegment.name
      const isRealSegment = segments.some(s => s.id === selectedSegment.id)

      const campaign = await createCampaign({
        name,
        segment_id: isRealSegment ? selectedSegment.id : null,
        segment_name: selectedSegment.name,
        message,
        channel
      })
      await launchCampaign(campaign.id)
      const updated = await getCampaigns()
      setCampaigns(updated)
      setCreating(false)
      setStep(1)
      setSelectedSegment(null)
      setMessage('')
      setCampaignName('')
      openAnalytics(campaign)
    } catch (e) {
      alert('Launch failed: ' + e.message)
    } finally {
      setLaunching(false)
    }
  }

  async function handleLaunchFromDraft() {
    setLaunching(true)
    try {
      if (selectedCampaign && selectedCampaign.status === 'pending') {
        await launchCampaign(selectedCampaign.id)
        const updated = await getCampaigns()
        setCampaigns(updated)
        setCreating(false)
        setSelectedCampaign(null)
        setStep(1)
        setSelectedSegment(null)
        setMessage('')
        setCampaignName('')
        const launchedCampaign = updated.find(c => c.id === selectedCampaign.id)
        if (launchedCampaign) {
          openAnalytics(launchedCampaign)
        }
      } else {
        // Just use the campaign name or segment name - NO DATE
        const name = campaignName || selectedSegment.name
        const isRealSegment = segments.some(s => s.id === selectedSegment.id)

        const campaign = await createCampaign({
          name,
          segment_id: isRealSegment ? selectedSegment.id : null,
          segment_name: selectedSegment.name,
          message,
          channel
        })
        await launchCampaign(campaign.id)
        const updated = await getCampaigns()
        setCampaigns(updated)
        setCreating(false)
        setStep(1)
        setSelectedSegment(null)
        setMessage('')
        setCampaignName('')
        openAnalytics(campaign)
      }
    } catch (e) {
      alert('Launch failed: ' + e.message)
    } finally {
      setLaunching(false)
    }
  }

  function resetFlow() {
    setCreating(false)
    setStep(1)
    setSelectedSegment(null)
    setMessage('')
    setCampaignName('')
    setSelectedCampaign(null)
  }

  // Loading state with light blue skeleton loaders
  if (loading) return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <HeaderSkeleton />
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Campaign Name', 'Segment', 'Channel', 'Sent', 'Delivered', 'Opened', 'Clicked', 'Status', ''].map((h, i) => (
                    <th key={i} style={{
                      textAlign: i >= 3 && i <= 6 ? 'right' : 'left',
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
      <main className="main-content" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", paddingBottom: creating ? 80 : 32 }}>

        {/* ── CAMPAIGN LIST VIEW ── */}
        {!creating && !selectedCampaign && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>Campaigns</h1>
              <button className="btn-orange" onClick={() => setCreating(true)}>+ New Campaign</button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Campaign Name</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Segment</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Channel</th>
                      <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Sent</th>
                      <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Delivered</th>
                      <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Opened</th>
                      <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Clicked</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.4px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: 48, color: 'var(--label)' }}>
                          No campaigns yet.{' '}
                          <button style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 600, cursor: 'pointer' }}
                            onClick={() => setCreating(true)}>Create your first →</button>
                        </td>
                      </tr>
                    ) : campaigns.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                        onClick={() => openAnalytics(c)}>
                        <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--navy)' }}>{c.name}</td>
                        <td style={{ padding: '16px 24px', color: 'var(--body)' }}>{c.segment_name || '—'}</td>
                        <td style={{ padding: '16px 24px', color: 'var(--body)' }}>{c.channel}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--body)' }}>{c.sent_count || 0}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--body)' }}>{c.delivered_count || 0}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--body)' }}>{c.opened_count || 0}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--body)' }}>{c.clicked_count || 0}</td>
                        <td style={{ padding: '16px 24px' }}>{statusBadge(c.status)}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button
                            className="btn-ghost"
                            style={{
                              padding: '4px 8px',
                              fontSize: 12
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              openAnalytics(c)
                            }}>
                            {c.status === 'pending' ? 'Edit →' : 'Analyse '}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── ANALYTICS VIEW (for sent campaigns) ── */}
        {selectedCampaign && !creating && campaignDetail && campaignDetail.status !== 'pending' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={closeAnalytics}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--body)' }}>←</button>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--navy)' }}>{selectedCampaign.name}</h1>
              </div>
              <button className="btn-orange" onClick={() => { closeAnalytics(); setCreating(true) }}>+ New Campaign</button>
            </div>

            {detailLoading ? (
              <p style={{ color: 'var(--label)' }}>Loading analytics...</p>
            ) : campaignDetail && (
              <>
                {/* Funnel */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                  {[
                    { label: 'Sent', value: campaignDetail.sent_count || 0, sub: 'Initial Audience', subBg: 'var(--blue-light)', subColor: 'var(--blue)' },
                    { label: 'Delivered', value: campaignDetail.delivered_count || 0, sub: `${campaignDetail.sent_count ? Math.round((campaignDetail.delivered_count / campaignDetail.sent_count) * 100) : 0}% Success`, subBg: '#DCFCE7', subColor: '#166534' },
                    { label: 'Opened', value: campaignDetail.opened_count || 0, sub: `${campaignDetail.sent_count ? Math.round((campaignDetail.opened_count / campaignDetail.sent_count) * 100) : 0}% Rate`, subBg: '#DBEAFE', subColor: '#1E40AF' },
                    { label: 'Clicked', value: campaignDetail.clicked_count || 0, sub: `${campaignDetail.sent_count ? Math.round((campaignDetail.clicked_count / campaignDetail.sent_count) * 100) : 0}% CTR`, subBg: '#FEF9C3', subColor: '#854D0E' },
                  ].map((item, i) => (
                    <div key={i} className="card" style={{ textAlign: 'center', borderLeft: i === 0 ? '3px solid var(--blue)' : 'none', position: 'relative', borderRadius: 16 }}>
                      <p style={{ fontSize: 13, color: 'var(--label)', marginBottom: 8 }}>{item.label}</p>
                      <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--blue)', lineHeight: 1.1 }}>{item.value.toLocaleString()}</p>
                      <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: item.subBg, color: item.subColor }}>{item.sub}</span>
                      {i < 3 && <span style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', color: 'var(--label)', fontSize: 20, zIndex: 1 }}>›</span>}
                    </div>
                  ))}
                </div>

                {/* Chart + AI */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
                  <div className="card" style={{ borderRadius: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>Delivery Performance</h3>
                        <p style={{ fontSize: 13, color: 'var(--label)', marginTop: 2 }}>Activity tracking for last 7 days</p>
                      </div>
                      <span style={{ padding: '4px 12px', borderRadius: 999, background: 'var(--blue)', color: 'white', fontSize: 11, fontWeight: 700 }}>Bar View</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                      {BAR_HEIGHTS.map((h, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}
                          onMouseEnter={e => e.currentTarget.querySelector('.bar-tooltip').style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.querySelector('.bar-tooltip').style.opacity = '0'}>
                          <div className="bar-tooltip" style={{ position: 'absolute', top: -28, background: 'var(--navy)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 4, opacity: 0, transition: 'opacity 0.15s', whiteSpace: 'nowrap' }}>
                            {Math.round(h * 1.2)} msgs
                          </div>
                          <div style={{ width: '100%', borderRadius: '4px 4px 0 0', height: `${h}%`, background: i === 3 ? 'var(--blue)' : 'rgba(23,70,212,0.15)', transition: 'background 0.2s', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = i === 3 ? '#1035b0' : 'rgba(23,70,212,0.35)'}
                            onMouseLeave={e => e.currentTarget.style.background = i === 3 ? 'var(--blue)' : 'rgba(23,70,212,0.15)'}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', marginTop: 8 }}>
                      {DAYS.map((d, i) => (
                        <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: i === 3 ? 'var(--blue)' : 'var(--label)', fontWeight: i === 3 ? 700 : 400 }}>{d}</span>
                      ))}
                    </div>
                  </div>

                  <div className="card" style={{ borderLeft: '3px solid var(--blue)', borderRadius: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <span style={{ fontSize: 20 }}>🤖</span>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>AI Analysis</h3>
                    </div>
                    <div style={{ background: '#DBEAFE', borderRadius: 8, padding: 12, marginBottom: 14 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#1E40AF', marginBottom: 4 }}>
                        {sendTime ? `Best Send Time: ${sendTime.best_day}s, ${sendTime.best_window}` : 'Optimal Delivery Window'}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--body)', lineHeight: 1.5 }}>
                        {sendTime
                          ? `Based on ${sendTime.total_engagements} engagement events across your campaigns.`
                          : 'Engagement peaked 12.4% higher between 8AM and 10AM.'}
                      </p>
                    </div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Recommendations</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span>✅</span>
                        <p style={{ fontSize: 12, color: 'var(--body)', lineHeight: 1.5 }}>
                          Retarget {((campaignDetail.sent_count || 0) - (campaignDetail.opened_count || 0)).toLocaleString()} non-openers with SMS.
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span>💡</span>
                        <p style={{ fontSize: 12, color: 'var(--body)', lineHeight: 1.5 }}>
                          Schedule follow-up for high-AOV customers who clicked.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipients */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>Recipient Activity</h3>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)' }}>Customer</th>
                          <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)' }}>Channel</th>
                          <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)' }}>Status</th>
                          <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)' }}>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(campaignDetail.communications || []).slice(0, 10).map(comm => (
                          <tr key={comm.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 24px', fontWeight: 500, color: 'var(--navy)' }}>{comm.customer_name}</td>
                            <td style={{ padding: '12px 24px', color: 'var(--body)' }}>{comm.channel}</td>
                            <td style={{ padding: '12px 24px' }}>{commBadge(comm.status)}</td>
                            <td style={{ padding: '12px 24px', color: 'var(--label)', fontSize: 12 }}>{new Date(comm.updated_at || comm.sent_at).toLocaleString()}</td>
                          </tr>
                        ))}
                        {!campaignDetail.communications?.length && (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--label)' }}>No recipients yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--label)' }}>
                    Showing {Math.min(10, campaignDetail.communications?.length || 0)} of {campaignDetail.communications?.length || 0} recipients • Updates every 3 seconds
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── CAMPAIGN CREATION / EDIT FLOW ── */}
        {creating && (
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {/* Progress Steps - Centered */}
            <div style={{ marginBottom: 48, marginTop: 20, display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', maxWidth: 600, width: '100%', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, left: 0, right: 0, height: 2, background: 'var(--border)', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: 16, left: 0, height: 2, background: 'var(--blue)', zIndex: 0, width: `${(step - 1) * 33.3}%`, transition: 'width 0.3s' }} />
                {['Segment', 'Message', 'Channel', 'Review'].map((label, i) => {
                  const n = i + 1
                  const done = step > n
                  const active = step === n
                  return (
                    <div key={n} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
                      <div style={{
                        width: active ? 40 : 32, height: active ? 40 : 32, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: done || active ? 'var(--blue)' : 'white',
                        border: done || active ? 'none' : '2px solid var(--border)',
                        color: done || active ? 'white' : 'var(--label)',
                        fontWeight: 700, fontSize: 14,
                        boxShadow: active ? '0 0 0 4px white, 0 0 0 6px var(--blue)' : 'none',
                        transition: 'all 0.2s'
                      }}>
                        {done ? '✓' : n}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: active ? 700 : 400, color: active ? 'var(--blue)' : 'var(--label)' }}>
                        {n} {label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Main Content - Centered */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 30, maxWidth: 1000, width: '100%' }}>
                <div>
                  {/* Step 1 */}
                  {step === 1 && (
                    <div className="card" style={{ borderRadius: 16 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>Select a Segment</h3>
                      <p style={{ fontSize: 14, color: 'var(--label)', marginBottom: 20 }}>Choose the audience for this campaign</p>
                      <input
                        placeholder="Campaign name (optional)"
                        value={campaignName}
                        onChange={e => setCampaignName(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, marginBottom: 16, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {availableSegments.length === 0 ? (
                          <div style={{ padding: 32, textAlign: 'center', borderRadius: 10, background: 'var(--blue-light)', color: 'var(--label)' }}>
                            ✨ All segments have been used! Create a new segment first.
                          </div>
                        ) : (
                          availableSegments.map(seg => (
                            <div key={seg.id} onClick={() => setSelectedSegment(seg)} style={{
                              padding: 16, borderRadius: 10, cursor: 'pointer',
                              border: `2px solid ${selectedSegment?.id === seg.id ? 'var(--blue)' : 'var(--border)'}`,
                              background: selectedSegment?.id === seg.id ? 'var(--blue-light)' : 'white',
                              transition: 'all 0.15s'
                            }}>
                              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>{seg.name}</p>
                              <p style={{ fontSize: 12, color: 'var(--label)', marginTop: 2 }}>{seg.customer_count?.toLocaleString()} customers</p>
                            </div>
                          ))
                        )}
                      </div>
                      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn-primary" disabled={!selectedSegment || drafting} onClick={handleDraft}>
                          {drafting ? 'Drafting with AI...' : 'Next: Draft Message →'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <div className="card" style={{ borderLeft: '3px solid var(--blue)', borderRadius: 16 }}>
                      <p style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600, marginBottom: 16 }}>✦ AI-drafted based on segment behaviour</p>
                      <label style={{ fontSize: 12, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Campaign Message Content</label>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        style={{ width: '100%', minHeight: 160, padding: 16, marginTop: 8, borderRadius: 8, border: '1px solid var(--border)', fontSize: 15, lineHeight: 1.7, resize: 'vertical', fontFamily: 'Inter, sans-serif', outline: 'none' }}
                      />
                      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button className="btn-ghost" onClick={handleRegenerate} disabled={drafting}>
                          {drafting ? 'Regenerating...' : '↺ Regenerate'}
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
                        <div style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)' }}>
                          <p style={{ fontSize: 12, color: 'var(--label)', marginBottom: 4 }}>Estimated Reach</p>
                          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--blue)' }}>{selectedSegment?.customer_count?.toLocaleString()} customers</p>
                        </div>
                        <div style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)' }}>
                          <p style={{ fontSize: 12, color: 'var(--label)', marginBottom: 4 }}>Best Send Time</p>
                          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>
                            {sendTime ? `${sendTime.best_day}s, ${sendTime.best_window}` : 'Calculating...'}
                          </p>
                        </div>
                      </div>
                      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn-primary" onClick={() => setStep(3)}>Next: Choose Channel →</button>
                      </div>
                    </div>
                  )}

                  {/* Step 3 */}
                  {step === 3 && (
                    <div className="card" style={{ borderRadius: 16 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 20 }}>Choose Channel</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                        {CHANNELS.map(ch => (
                          <div key={ch} onClick={() => setChannel(ch)} style={{
                            padding: '20px 16px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                            fontWeight: 600, fontSize: 14,
                            border: `2px solid ${channel === ch ? 'var(--blue)' : 'var(--border)'}`,
                            background: channel === ch ? 'var(--blue-light)' : 'white',
                            color: channel === ch ? 'var(--blue)' : 'var(--body)',
                            transition: 'all 0.15s'
                          }}>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>
                              {ch === 'WhatsApp' ? '💬' : ch === 'SMS' ? '📱' : ch === 'Email' ? '✉️' : '📡'}
                            </div>
                            {ch}
                          </div>
                        ))}
                      </div>

                      {/* Send-Time Intelligence Card */}
                      {sendTime && (
                        <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: 'var(--blue-light)', border: '1px solid rgba(23,70,212,0.15)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 16 }}>✦</span>
                            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>Send-Time Intelligence</p>
                            <span style={{
                              fontSize: 11, padding: '2px 8px', borderRadius: 999,
                              background: sendTime.confidence === 'high' ? '#DCFCE7' : sendTime.confidence === 'medium' ? '#FEF9C3' : '#F3F4F6',
                              color: sendTime.confidence === 'high' ? '#166534' : sendTime.confidence === 'medium' ? '#854D0E' : '#4A5568',
                              fontWeight: 600, textTransform: 'uppercase'
                            }}>
                              {sendTime.confidence} confidence
                            </span>
                          </div>
                          <p style={{ fontSize: 14, color: 'var(--navy)', fontWeight: 600, marginBottom: 4 }}>
                            Best time to send: {sendTime.best_day}s, {sendTime.best_window}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--label)', lineHeight: 1.5, marginBottom: 12 }}>
                            Based on {sendTime.total_engagements} engagement events. Clicks weighted 2× over opens.
                          </p>
                          {/* Mini 24h engagement chart */}
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 40 }}>
                            {sendTime.engagement_by_hour.map((h, i) => {
                              const max = Math.max(...sendTime.engagement_by_hour.map(x => x.count), 1)
                              const pct = (h.count / max) * 100
                              return (
                                <div key={i} title={`${h.label}: ${h.count} engagements`} style={{
                                  flex: 1, height: `${Math.max(pct, 4)}%`,
                                  borderRadius: '2px 2px 0 0', minHeight: 3,
                                  background: h.hour === sendTime.best_hour ? 'var(--blue)' : 'rgba(23,70,212,0.2)',
                                  cursor: 'pointer', transition: 'background 0.15s'
                                }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'var(--blue)'}
                                  onMouseLeave={e => e.currentTarget.style.background = h.hour === sendTime.best_hour ? 'var(--blue)' : 'rgba(23,70,212,0.2)'}
                                />
                              )
                            })}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--label)' }}>
                            <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
                          </div>
                        </div>
                      )}

                      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn-primary" onClick={() => setStep(4)}>Next: Review →</button>
                      </div>
                    </div>
                  )}

                  {/* Step 4 */}
                  {step === 4 && (
                    <div className="card" style={{ borderRadius: 16 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 20 }}>
                        {selectedCampaign?.status === 'pending' ? 'Review & Launch Draft' : 'Review & Launch'}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 24 }}>
                        {[
                          { label: 'Segment', value: selectedSegment?.name },
                          { label: 'Audience Size', value: `${selectedSegment?.customer_count?.toLocaleString()} customers` },
                          { label: 'Channel', value: channel },
                          { label: 'Recommended Send Time', value: sendTime ? `${sendTime.best_day}s, ${sendTime.best_window}` : '—' },
                          { label: 'Campaign Name', value: campaignName || `${selectedSegment?.name}` },
                        ].map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontSize: 13, color: 'var(--label)' }}>{item.label}</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: i === 3 ? 'var(--blue)' : 'var(--navy)' }}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: 16, borderRadius: 10, background: 'var(--blue-light)', border: '1px solid rgba(23,70,212,0.15)', marginBottom: 24 }}>
                        <p style={{ fontSize: 12, color: 'var(--label)', marginBottom: 6 }}>Message Preview</p>
                        <p style={{ fontSize: 14, color: 'var(--navy)', lineHeight: 1.6 }}>{message}</p>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: 12 }}>
                        {selectedCampaign?.status === 'pending' ? (
                          <button
                            className="btn-orange"
                            style={{ flex: 1, padding: 14, fontSize: 16 }}
                            onClick={handleLaunchFromDraft}
                            disabled={launching}>
                            {launching ? 'Launching...' : '🚀 Launch Campaign'}
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn-ghost"
                              style={{ flex: 1, padding: 14, fontSize: 16, border: '2px solid var(--border)' }}
                              onClick={handleSaveDraft}
                              disabled={savingDraft}>
                              {savingDraft ? 'Saving...' : '💾 Save as Draft'}
                            </button>
                            <button
                              className="btn-orange"
                              style={{ flex: 1, padding: 14, fontSize: 16 }}
                              onClick={handleLaunch}
                              disabled={launching}>
                              {launching ? 'Launching...' : '🚀 Launch Campaign'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Preview */}
                <div style={{ display: 'flex', justifyContent: 'center', position: 'sticky', top: 32 }}>
                  <div style={{ width: 280, background: '#f0f2f5', borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                    {/* Chat Header */}
                    <div style={{ padding: '14px 16px', background: '#075E54', color: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: channel === 'WhatsApp' ? '#25D366' : 'var(--blue)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: 'white'
                      }}>G</div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Glow Skincare</p>
                        <p style={{ fontSize: 10, opacity: 0.8, margin: 0 }}>Online</p>
                      </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div style={{ padding: 20, minHeight: 400, background: '#f0f2f5' }}>
                      {message ? (
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              background: 'white', borderRadius: '0px 16px 16px 16px',
                              padding: '12px 16px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                            }}>
                              <p style={{ fontSize: 14, color: '#111', lineHeight: 1.6, margin: 0 }}>{message}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, marginLeft: 4 }}>
                              <p style={{ fontSize: 10, color: '#999', margin: 0 }}>
                                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {channel === 'WhatsApp' && <span style={{ fontSize: 12, color: '#25D366' }}>✓✓</span>}
                            </div>

                            {/* Suggested reply chips */}
                            {channel === 'WhatsApp' && (
                              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {['Restock now 🛒', 'Remind me later', 'Show offers'].map(chip => (
                                  <span key={chip} style={{
                                    padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                                    background: 'white', border: '1px solid #ddd', color: '#555',
                                    cursor: 'default'
                                  }}>{chip}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
                          <Sparkles size={32} color="#ccc" />
                          <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500, margin: 0 }}>AI message will appear here</p>
                          <p style={{ fontSize: 11, color: '#ccc', margin: 0 }}>Select a segment to get started</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ position: 'fixed', bottom: 0, left: 240, right: 0, background: 'white', borderTop: '1px solid var(--border)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 40 }}>
              <button className="btn-ghost" onClick={() => step > 1 ? setStep(s => s - 1) : resetFlow()}>
                ← {step > 1 ? 'Back' : 'Cancel'}
              </button>
              <span style={{ fontSize: 13, color: 'var(--label)' }}>Saving draft...</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}