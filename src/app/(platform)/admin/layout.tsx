export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'var(--font-sans)' }}>
      <nav style={{ padding: '1rem 3rem', borderBottom: '1px solid #1e293b', display: 'flex', gap: '3rem', alignItems: 'center' }}>
         <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.025em', color: '#38bdf8' }}>VAIRAL OPERATOR</div>
         <a href="/admin/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Dashboard</a>
         <a href="/admin/brands" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Brands Matrix</a>
         <a href="/admin/payments" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Payments Ledgers</a>
         <div style={{ flex: 1 }} />
         <a href="/dashboard" style={{ color: '#64748b', fontSize: '0.875rem', padding: '0.5rem 1rem', border: '1px solid #334155', borderRadius: '0.5rem' }}>Exit to Client</a>
      </nav>
      {children}
    </div>
  )
}
