'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  PieChart,
  Megaphone,
  Sparkles
} from 'lucide-react'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/segments', label: 'Segments', icon: PieChart },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/insights', label: 'AI Insights', icon: Sparkles },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="sidebar" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--blue)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'white'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#000000' }}>Glow</div>
            <div style={{ fontSize: 11, color: '#666666', fontWeight: 400 }}>AI-Native CRM</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '20px 12px', flex: 1 }}>
        {nav.map((item) => {
          const active = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', margin: '4px 0', borderRadius: 40,
                background: active ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                color: active ? 'var(--blue)' : '#000000',
                fontWeight: active ? 600 : 500,
                fontSize: 14, cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}>
                <Icon size={18} strokeWidth={active ? 2 : 1.75} />
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 40,
            background: 'rgba(59, 130, 246, 0.12)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 600, color: 'var(--blue)'
          }}>PS</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#000000' }}>Priya Sharma</div>
            <div style={{ fontSize: 11, color: '#666666', fontWeight: 400 }}>Marketing Lead</div>
          </div>
        </div>
      </div>
    </div>
  )
}