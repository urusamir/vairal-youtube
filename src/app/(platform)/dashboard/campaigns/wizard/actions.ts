'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveCampaignDraft(campaignId: string, payload: Record<string, unknown>, step: number) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('campaigns')
    .update({ 
      ...payload,
      last_step: step,
    })
    .eq('id', campaignId)
    .eq('brand_id', user.id);

  if (error) {
    console.error(error);
    return { error: 'Failed to sync draft to server' };
  }

  revalidatePath('/campaigns/wizard');
  return { success: true };
}

export async function publishCampaign(campaignId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Validate backend requirements synchronously before transition
  const { data: campaign } = await supabase
     .from('campaigns')
     .select('briefs')
     .eq('id', campaignId)
     .single();

  if (!campaign || !campaign.briefs || campaign.briefs.length === 0) {
     return { error: 'You must provide at least one brief before publishing.' };
  }

  const { error } = await supabase
    .from('campaigns')
    .update({ status: 'PUBLISHED' })
    .eq('id', campaignId)
    .eq('brand_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/campaigns');
  return { success: true };
}
