import { createSupabaseServerClient } from '@/lib/supabase/server';
import AdminPaymentsBoard from './board';

export default async function AdminPayments() {
  const supabase = await createSupabaseServerClient();
  
  // Natively circumventing user-bound rules since they're admin
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, brand, payment_status, status')
    .neq('status', 'DRAFT')
    .order('created_at', { ascending: false });

  return (
    <main style={{ padding: '3rem', maxWidth: '1400px', margin: '0 auto' }}>
       <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>Payments Matrix</h1>
       <p style={{ color: '#94a3b8', marginBottom: '3rem' }}>Global overview of Active campaign executions requiring capital disbursement.</p>
       <AdminPaymentsBoard campaigns={campaigns || []} />
    </main>
  )
}
