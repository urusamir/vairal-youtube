'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type RawCreatorNode = {
   name?: string;
   handle?: string;
   avatar_url?: string;
   profilePicture?: string;
   platform?: string;
   followers?: string | number;
   categories?: string[];
   tags?: string[];
   metrics?: Record<string, unknown>;
   averageCPV?: number;
   engagement?: number;
   rate_card?: Record<string, unknown>;
   baseRate?: number;
};

export async function runBulkCreatorIngest(creatorsArray: RawCreatorNode[]) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  
  const { data: userRole } = await supabase.from('user_roles').select('role').eq('id', user.id).single();
  if (!userRole || userRole.role !== 'admin') throw new Error("Terminal Denied");

  if (!Array.isArray(creatorsArray)) return { error: "Payload must be an array" };

  const parsedInsertions = creatorsArray.map(c => ({
    name: c.name || c.handle || 'Unknown Creator',
    handle: c.handle || String(Date.now()),
    avatar_url: c.avatar_url || c.profilePicture || '',
    platform: c.platform || 'Instagram',
    followers: Number(c.followers) || 0,
    categories: c.categories || c.tags || [],
    metrics: c.metrics || { engagement: c.engagement, cpv: c.averageCPV },
    rate_card: c.rate_card || { base: c.baseRate || 0 },
  }));

  const { error } = await supabase
     .from('creators')
     .upsert(parsedInsertions, { onConflict: 'handle' });
     
  if (error) return { error: error.message };

  revalidatePath('/admin/creators');
  return { success: true, count: parsedInsertions.length };
}
