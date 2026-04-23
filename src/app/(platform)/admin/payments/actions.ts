'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function advancePaymentStatus(campaignId: string, status: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  
  // Verify strictly if user is admin globally (Secondary secure lock)
  const { data: userRole } = await supabase.from('user_roles').select('role').eq('id', user.id).single();
  if (!userRole || userRole.role !== 'admin') throw new Error("Terminal Denied");

  const { error } = await supabase
     .from('campaigns')
     .update({ payment_status: status })
     .eq('id', campaignId);
     
  if (error) return { error: error.message };

  revalidatePath('/admin/payments');
  return { success: true };
}
