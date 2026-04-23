export default function WizardStep1Details({ campaignId }: { campaignId?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--card)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
       <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>1. Core Details</h2>
       <p style={{ color: '#64748b' }}>Define the rigid boundary parameters of the campaign.</p>
       
       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Campaign Name</label>
             <input type="text" placeholder="e.g. Summer Awareness 2026" style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Goal</label>
             <select style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
               <option>Awareness</option>
               <option>Conversions</option>
             </select>
          </div>
       </div>
    </div>
  )
}
