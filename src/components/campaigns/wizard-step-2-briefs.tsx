export default function WizardStep2Briefs({ campaignId }: { campaignId?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--card)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
       <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>2. Campaign Brief (JSONB Engine)</h2>
       <p style={{ color: '#64748b' }}>Dynamically append deliverables constraints and guidelines.</p>
       
       <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Key Messages</h3>
            <input type="text" placeholder="Add a key message..." style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '0.5rem' }} />
          </div>
       </div>
    </div>
  )
}
