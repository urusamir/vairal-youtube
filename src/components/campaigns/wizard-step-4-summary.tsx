export default function WizardStep4Summary({ campaignId }: { campaignId?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
       <div style={{ backgroundColor: 'var(--card)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>4. Executive Summary</h2>
           <p style={{ color: '#64748b' }}>Operations dashboard and pipeline algorithmic overview.</p>
       </div>

       <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
         <div style={{ backgroundColor: 'var(--card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Overall Health</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: '#64748b' }}>Deliverables Requested</span>
              <span style={{ fontWeight: 600 }}>0</span>
            </div>
         </div>
         <div style={{ backgroundColor: '#fff1f2', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid #fecdd3' }}>
            <h3 style={{ color: '#be123c', fontWeight: 600, marginBottom: '0.5rem' }}>Alerts & Overdue Pipeline</h3>
            <p style={{ color: '#9f1239', fontSize: '0.875rem' }}>No deliverables have breached the execution deadline constraint natively.</p>
         </div>
       </div>

       <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
         <form action="/api/actions/publish">
            <button style={{ padding: '0.75rem 2rem', backgroundColor: '#10b981', color: 'white', borderRadius: 'var(--radius)', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              Publish Operations Model
            </button>
         </form>
       </div>
    </div>
  )
}
