import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();
  
  // Aggregate Metrics explicitly circumventing user-bound rules since they're admin
  const { count: campaignsCount } = await supabase.from('campaigns').select('*', { count: 'exact', head: true });
  const { count: activePaymentsCount } = await supabase.from('campaigns').select('*', { count: 'exact', head: true }).in('payment_status', ['PENDING', 'PROCESSING']);

  return (
    <main style={{ padding: '3rem', maxWidth: '1400px', margin: '0 auto' }}>
       <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>Global Command Core</h1>
       <p style={{ color: '#94a3b8', marginBottom: '3rem' }}>You are operating inside the deeply elevated Vairal pipeline. Proceed cautiously.</p>
       
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '1rem', border: '1px solid #334155' }}>
             <p style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>Total Global Campaigns</p>
             <p style={{ fontSize: '3rem', fontWeight: 700, marginTop: '0.5rem', color: '#f8fafc' }}>{campaignsCount || 0}</p>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '1rem', border: '1px solid #334155', borderTop: '4px solid #f59e0b' }}>
             <p style={{ color: '#fcd34d', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>Pending / Processing Payouts</p>
             <p style={{ fontSize: '3rem', fontWeight: 700, marginTop: '0.5rem', color: '#f8fafc' }}>{activePaymentsCount || 0}</p>
          </div>
       </div>
    </main>
  );
}
