import { createSupabaseServerClient } from '@/lib/supabase/server';
import CreatorBulkUploader from '@/components/admin/creator-uploader';

export default async function AdminCreatorsPage() {
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase.from('creators').select('*', { count: 'exact', head: true });

  return (
    <main style={{ padding: '3rem', maxWidth: '1400px', margin: '0 auto' }}>
       <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>Creator Pool Operations</h1>
       
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '1rem', border: '1px solid #334155', padding: '2rem' }}>
             <p style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>Total Processed Creator Nodes</p>
             <p style={{ fontSize: '3rem', fontWeight: 700, marginTop: '0.5rem', color: '#10b981' }}>{count || 0}</p>
          </div>
          
          <CreatorBulkUploader />
       </div>
    </main>
  );
}
