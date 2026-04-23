export default function WizardStep3Creators({ campaignId }: { campaignId?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--card)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
         <div>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>3. Creator Matrix</h2>
           <p style={{ color: '#64748b' }}>Attach specific atomic deliverables seamlessly into the creator pipeline.</p>
         </div>
         <button style={{ padding: '0.6rem 1.2rem', backgroundColor: 'var(--foreground)', color: 'var(--background)', borderRadius: 'var(--radius)', fontWeight: 500, border: 'none', cursor: 'pointer' }}>+ Assign Creator</button>
       </div>
       
       <div style={{ width: '100%', minWidth: '800px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginTop: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
             <thead>
               <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
                 <th style={{ padding: '1rem', fontWeight: 500, color: '#475569' }}>Creator Name</th>
                 <th style={{ padding: '1rem', fontWeight: 500, color: '#475569' }}>Funnel Status</th>
                 <th style={{ padding: '1rem', fontWeight: 500, color: '#475569' }}>Platform</th>
                 <th style={{ padding: '1rem', fontWeight: 500, color: '#475569' }}>Expected Asset</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                 <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                   No creators mapped to this draft natively.
                 </td>
               </tr>
             </tbody>
          </table>
       </div>
    </div>
  )
}
