'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { getCustomers } from '@/lib/api'

function repBadge(status) {
  const map = {
    on_track: { label: 'ON TRACK', cls: 'badge-green' },
    due_soon: { label: 'DUE SOON', cls: 'badge-yellow' },
    overdue: { label: 'OVERDUE', cls: 'badge-red' },
  }
  const s = map[status] || { label: status, cls: 'badge-blue' }
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

function churnBadge(status) {
  const map = {
    natural_gap: { label: 'NATURAL GAP', cls: 'badge-green' },
    at_risk: { label: 'AT RISK', cls: 'badge-yellow' },
    churn_risk: { label: 'CHURN RISK', cls: 'badge-red' },
  }
  const s = map[status] || { label: status || '—', cls: 'badge-blue' }
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

// Skeleton Loader Components
function TableRowSkeleton() {
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
      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
        <div style={{
          width: 40,
          height: 16,
          margin: '0 auto',
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
      </td>
      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
        <div style={{
          width: 50,
          height: 16,
          margin: '0 auto',
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
      </td>
      <td style={{ padding: '16px 24px' }}>
        <div style={{
          width: '50%',
          height: 14,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
      </td>
      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
        <div style={{
          width: 60,
          height: 24,
          margin: '0 auto',
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 12
        }} />
      </td>
      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
        <div style={{
          width: 20,
          height: 16,
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

function FilterCardSkeleton() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{
        width: '60%',
        height: 12,
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 4,
        marginBottom: 14
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite'
            }} />
            <div style={{
              width: '40%',
              height: 13,
              background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: 4
            }} />
            <div style={{
              width: 30,
              height: 11,
              marginLeft: 'auto',
              background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: 4
            }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SortCardSkeleton() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{
        width: '50%',
        height: 12,
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 4,
        marginBottom: 14
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ padding: '8px 12px', borderRadius: 8 }}>
            <div style={{
              width: '70%',
              height: 13,
              background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: 4
            }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function AOVRangeSkeleton() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{
        width: '50%',
        height: 12,
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 4,
        marginBottom: 6
      }} />
      <div style={{
        width: '40%',
        height: 20,
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 4,
        marginBottom: 14
      }} />
      <div style={{
        width: '100%',
        height: 4,
        background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 2
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <div style={{
          width: 30,
          height: 11,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
        <div style={{
          width: 40,
          height: 11,
          background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4
        }} />
      </div>
    </div>
  )
}

export default function Customers() {
  const router = useRouter()
  const [customers, setCustomers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const PER_PAGE = 8

  // Filter state
  const [repFilter, setRepFilter] = useState([])
  const [sortBy, setSortBy] = useState('recent')
  const [maxAov, setMaxAov] = useState(5000)
  const [aovCap, setAovCap] = useState(5000)

  useEffect(() => {
    getCustomers().then(data => {
      setCustomers(data)
      setFiltered(data)
      const cap = Math.max(...data.map(c => c.aov || 0), 1000)
      setAovCap(cap)
      setMaxAov(cap)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    let result = customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q)
    )

    if (repFilter.length > 0) {
      result = result.filter(c => repFilter.includes(c.replenishment_status))
    }

    result = result.filter(c => (c.aov || 0) <= maxAov)

    if (sortBy === 'aov_high') result = [...result].sort((a, b) => (b.aov || 0) - (a.aov || 0))
    else if (sortBy === 'aov_low') result = [...result].sort((a, b) => (a.aov || 0) - (b.aov || 0))
    else result = [...result].sort((a, b) => new Date(b.last_purchase_date) - new Date(a.last_purchase_date))

    setFiltered(result)
    setPage(0)
  }, [search, customers, repFilter, sortBy, maxAov])

  function toggleRep(status) {
    setRepFilter(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }

  function clearFilters() {
    setRepFilter([])
    setSortBy('recent')
    setMaxAov(aovCap)
    setSearch('')
  }

  const hasActiveFilters = repFilter.length > 0 || sortBy !== 'recent' || maxAov < aovCap

  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  // Loading state with light blue skeleton loaders
  if (loading) return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

        {/* Header Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{
            width: 150,
            height: 28,
            background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: 8
          }} />
          <div style={{
            width: 100,
            height: 13,
            background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: 4
          }} />
        </div>

        {/* Search Skeleton */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <div style={{
            width: '100%',
            height: 48,
            borderRadius: 40,
            background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }} />
        </div>

        {/* Main layout skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20, alignItems: 'start' }}>

          {/* Table Skeleton */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Name', 'Phone', 'Total Orders', 'AOV', 'Last Purchase', 'Replenishment', ''].map((h, i) => (
                      <th key={i} style={{
                        textAlign: i >= 2 && i <= 3 ? 'center' : i === 6 ? 'right' : 'left',
                        padding: '16px 24px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--label)'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <TableRowSkeleton key={i} />)}
                </tbody>
              </table>
            </div>

            {/* Pagination Skeleton */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{
                width: 200,
                height: 13,
                background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: 4
              }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  width: 70,
                  height: 32,
                  background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: 8
                }} />
                <div style={{
                  width: 70,
                  height: 32,
                  background: 'linear-gradient(90deg, #DBEAFE 25%, #BFDBFE 50%, #DBEAFE 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: 8
                }} />
              </div>
            </div>
          </div>

          {/* Filter Panel Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FilterCardSkeleton />
            <SortCardSkeleton />
            <AOVRangeSkeleton />
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
      <main className="main-content" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>Customers</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {hasActiveFilters && (
              <button onClick={clearFilters} style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 999, padding: '6px 14px', fontSize: 12,
                color: 'var(--label)', cursor: 'pointer', fontWeight: 600
              }}>
                ✕ Clear filters
              </button>
            )}
            <span style={{ fontSize: 13, color: 'var(--label)' }}>{filtered.length} customers</span>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Search size={18} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--label)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email..."
            style={{
              width: '100%', padding: '14px 20px 14px 48px',
              borderRadius: 40, border: 'none',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              fontSize: 14, background: 'white', outline: 'none',
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
            }}
          />
        </div>

        {/* Main layout: table + filter panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20, alignItems: 'start' }}>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Name', 'Phone', 'Total Orders', 'AOV', 'Last Purchase', 'Replenishment', ''].map((h, i) => (
                      <th key={i} style={{
                        textAlign: i >= 2 && i <= 3 ? 'center' : i === 6 ? 'right' : 'left',
                        padding: '16px 24px', fontSize: 12, fontWeight: 600, color: 'var(--label)',
                        textTransform: 'uppercase', letterSpacing: '0.4px'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--label)' }}>No customers match your filters.</td></tr>
                  ) : paginated.map(c => (
                    <>
                      <tr key={c.id} style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                        onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                        <td style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--navy)' }}>{c.name}</td>
                        <td style={{ padding: '16px 24px', color: 'var(--body)' }}>{c.phone}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--body)' }}>{c.total_orders}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--body)' }}>₹{c.aov?.toLocaleString()}</td>
                        <td style={{ padding: '16px 24px', color: 'var(--body)' }}>
                          {c.last_purchase_date ? new Date(c.last_purchase_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>{repBadge(c.replenishment_status)}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--label)' }}>⋮</td>
                      </tr>

                      {expanded === c.id && (
                        <tr key={`${c.id}-expanded`}>
                          <td colSpan={7} style={{ padding: 0, borderLeft: '3px solid var(--blue)' }}>
                            <div style={{ padding: 32, background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'var(--blue)' }}>{initials(c.name)}</div>
                                  <div>
                                    <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)' }}>{c.name}</h3>
                                    <p style={{ fontSize: 14, color: 'var(--label)' }}>{c.phone} • {c.email}</p>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button style={{ padding: '8px', borderRadius: '50%', border: '1px solid var(--border)', background: 'none', cursor: 'pointer' }}>✏️</button>
                                  <button style={{ padding: '8px', borderRadius: '50%', border: '1px solid var(--border)', background: 'none', cursor: 'pointer' }}>✉️</button>
                                </div>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                                {[
                                  { label: 'Total Spent', value: `₹${c.total_spent?.toLocaleString()}` },
                                  { label: 'Total Orders', value: c.total_orders },
                                  { label: 'Avg Order Value', value: `₹${c.aov?.toLocaleString()}` },
                                ].map((stat, i) => (
                                  <div key={i} style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                                    <p style={{ fontSize: 11, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{stat.label}</p>
                                    <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--blue)' }}>{stat.value}</p>
                                  </div>
                                ))}
                              </div>
                              <div style={{ background: '#EEF2FF', borderRadius: 12, padding: 20, border: '1px solid rgba(23,70,212,0.1)', display: 'flex', flexWrap: 'wrap', gap: 32 }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
                                  {[
                                    { label: 'Preferred Category', value: c.preferred_category, icon: '🎯', extra: null },
                                    { label: 'Days Until Restock', value: c.days_left != null ? `${c.days_left > 0 ? c.days_left : 0} days left` : '—', icon: '📅', extra: c.days_left != null && c.days_left < 0 ? `${Math.abs(c.days_left)}d overdue` : null },
                                    { label: 'Likely Next Product', value: c.likely_next_product, icon: '⚡', extra: null },
                                  ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
                                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                                      <div>
                                        <p style={{ fontSize: 11, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginTop: 2 }}>{item.value || '—'}</p>
                                        {item.extra && <p style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, marginTop: 2 }}>{item.extra}</p>}
                                      </div>
                                    </div>
                                  ))}
                                  <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
                                    <span style={{ fontSize: 20 }}>🔄</span>
                                    <div>
                                      <p style={{ fontSize: 11, color: 'var(--label)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Churn Status</p>
                                      <div style={{ marginTop: 4 }}>{churnBadge(c.churn_status)}</div>
                                    </div>
                                  </div>
                                </div>
                                <p style={{ fontSize: 11, color: 'var(--label)', marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)', width: '100%' }}>
                                  ✦ Status computed live: <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>days_left = lifespan({c.preferred_category}: {c.product_lifespan_days}d) − days_since_purchase({c.days_since_purchase}d)</code>
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--label)' }}>
                Showing {filtered.length === 0 ? 0 : page * PER_PAGE + 1} to {Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length} customers
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-ghost" style={{ padding: '6px 16px', fontSize: 13, opacity: page === 0 ? 0.4 : 1, cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                  disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
                <button className="btn-ghost" style={{ padding: '6px 16px', fontSize: 13, opacity: (page + 1) * PER_PAGE >= filtered.length ? 0.4 : 1, cursor: (page + 1) * PER_PAGE >= filtered.length ? 'not-allowed' : 'pointer' }}
                  disabled={(page + 1) * PER_PAGE >= filtered.length} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          </div>

          {/* ── FILTER PANEL ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* Replenishment Status */}
            <div className="card" style={{ padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
                Replenishment
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { key: 'on_track', label: 'On Track', color: '#166534', bg: '#DCFCE7', dot: '#22C55E' },
                  { key: 'due_soon', label: 'Due Soon', color: '#854D0E', bg: '#FEF9C3', dot: '#EAB308' },
                  { key: 'overdue', label: 'Overdue', color: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' },
                ].map(opt => (
                  <div key={opt.key} onClick={() => toggleRep(opt.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                      background: repFilter.includes(opt.key) ? opt.bg : 'transparent',
                      border: `1.5px solid ${repFilter.includes(opt.key) ? opt.dot : 'var(--border)'}`,
                      transition: 'all 0.15s'
                    }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: opt.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: repFilter.includes(opt.key) ? 600 : 400, color: repFilter.includes(opt.key) ? opt.color : 'var(--body)' }}>
                      {opt.label}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--label)', fontWeight: 600 }}>
                      {customers.filter(c => c.replenishment_status === opt.key).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="card" style={{ padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
                Sort By
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { key: 'recent', label: '🕐 Recent Purchase' },
                  { key: 'aov_high', label: '↓ Highest AOV' },
                  { key: 'aov_low', label: '↑ Lowest AOV' },
                ].map(opt => (
                  <div key={opt.key} onClick={() => setSortBy(opt.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                      background: sortBy === opt.key ? 'var(--blue-light)' : 'transparent',
                      border: `1.5px solid ${sortBy === opt.key ? 'var(--blue)' : 'var(--border)'}`,
                      transition: 'all 0.15s'
                    }}>
                    <span style={{ fontSize: 13, fontWeight: sortBy === opt.key ? 600 : 400, color: sortBy === opt.key ? 'var(--blue)' : 'var(--body)' }}>
                      {opt.label}
                    </span>
                    {sortBy === opt.key && <span style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--blue)' }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* AOV Range */}
            <div className="card" style={{ padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                Max AOV
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue)', marginBottom: 14 }}>
                ₹{maxAov.toLocaleString()}
              </p>
              <input
                type="range"
                min={0}
                max={aovCap}
                step={100}
                value={maxAov}
                onChange={e => setMaxAov(Number(e.target.value))}
                style={{
                  width: '100%', accentColor: 'var(--blue)',
                  cursor: 'pointer', height: 4
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--label)' }}>
                <span>₹0</span>
                <span>₹{aovCap.toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}