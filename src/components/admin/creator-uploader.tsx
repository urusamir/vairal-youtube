'use client'

import React, { useState } from 'react';
import { runBulkCreatorIngest } from '@/app/(platform)/admin/creators/actions';

export default function CreatorBulkUploader() {
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState('');

   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
         try {
            setLoading(true);
            const text = event.target?.result as string;
            const jsonArray = JSON.parse(text);
            
            setMessage(`Parsing ${jsonArray.length} items...`);
            const res = await runBulkCreatorIngest(jsonArray);
            
            if (res.error) setMessage(`Error: ${res.error}`);
            else setMessage(`Successfully mapped ${res.count} creators natively to Postgres!`);
            
         } catch(ex) {
            setMessage('Failed to parse active JSON boundaries. Malformed array.');
         } finally {
            setLoading(false);
         }
      };
      reader.readAsText(file);
   };

   return (
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', padding: '2rem' }}>
         <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1rem' }}>Ingest JSON Array</h2>
         <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>Upload a JSON array mapped exactly to the verified Schema constraint format.</p>
         
         <input 
            type="file" 
            accept=".json" 
            onChange={handleFileUpload} 
            disabled={loading}
            style={{ color: '#cbd5e1' }}
         />
         
         {message && (
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#0f172a', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '0.5rem', fontWeight: 500 }}>
               System Log: {message}
            </div>
         )}
      </div>
   );
}
