import { createSupabaseServerClient } from '@/lib/supabase/server';

type AdminBrandView = {
  id: string;
  email: string;
  brand_name: string;
  created_at: string;
};

export default async function AdminBrandsDirectory() {
  const supabase = await createSupabaseServerClient();
  
  // Natively intercept profile directory explicitly bypassing RLS via Admin tokens if configured
  const { data: users } = await supabase
    .from('users')
    .select('id, email, brand_name, created_at')
    .order('created_at', { ascending: false });

  const renderUsers = (users as AdminBrandView[]) || [];

  return (
    <main style={{ padding: '3rem', maxWidth: '1400px', margin: '0 auto' }}>
       <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>Brands Matrix</h1>
       <p style={{ color: '#94a3b8', marginBottom: '3rem' }}>Global directory of all platform entities mapped natively across executing bounds.</p>
       
       <div style={{ backgroundColor: '#1e293b', borderRadius: '1rem', border: '1px solid #334155' }}>
         <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '0.875rem' }}>
                 <th style={{ padding: '1rem 2rem' }}>Brand Segment</th>
                 <th style={{ padding: '1rem 2rem' }}>Administrator</th>
                 <th style={{ padding: '1rem 2rem' }}>System Onboarding Date</th>
              </tr>
            </thead>
            <tbody>
              {renderUsers.map((user, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                   <td style={{ padding: '1.5rem 2rem', fontWeight: 600 }}>{user.brand_name || 'Unregistered Title'}</td>
                   <td style={{ padding: '1.5rem 2rem', color: '#cbd5e1' }}>{user.email}</td>
                   <td style={{ padding: '1.5rem 2rem', color: '#94a3b8', fontSize: '0.875rem' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
         </table>
       </div>
    </main>
  );
}
