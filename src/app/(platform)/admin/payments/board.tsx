'use client'

import React from 'react';
import { advancePaymentStatus } from './actions';

export default function AdminPaymentsBoard({ campaigns }: { campaigns: Array<{id: string, name: string, brand: string, payment_status: string, status: string}> }) {
  const handleMarkProcessed = async (id: string, newStatus: string) => {
    const res = await advancePaymentStatus(id, newStatus);
    if (!res.success) alert("Failed to advance payment status structurally.");
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
       {['PENDING', 'PROCESSING', 'COMPLETED'].map(status => (
         <div key={status} style={{ backgroundColor: '#1e293b', borderRadius: '1rem', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #334155', fontWeight: 600, color: '#f8fafc' }}>
              {status}
            </div>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '500px', overflowY: 'auto' }}>
               {campaigns.filter(c => c.payment_status === status).map((camp, idx) => (
                 <div key={idx} style={{ padding: '1rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#38bdf8' }}>{camp.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Brand: {camp.brand}</div>
                    
                    {status === 'PENDING' && (
                      <button onClick={() => handleMarkProcessed(camp.id, 'PROCESSING')} style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 600, border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Begin Processing</button>
                    )}
                    {status === 'PROCESSING' && (
                      <button onClick={() => handleMarkProcessed(camp.id, 'COMPLETED')} style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', backgroundColor: '#10b981', color: 'white', fontWeight: 600, border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Mark Completed</button>
                    )}
                 </div>
               ))}
            </div>
         </div>
       ))}
    </div>
  )
}
