import { supabase } from "../supabase";
import { ReportVideoOverride, OverridesByVideo } from "@/providers/reporting-overrides.provider";

/**
 * Fetches all overrides for a specific campaign.
 */
export async function fetchOverrides(campaignId: string): Promise<OverridesByVideo> {
  if (!campaignId) return {};

  const { data, error } = await supabase
    .from("reporting_overrides")
    .select("*")
    .eq("campaign_id", campaignId);

  if (error) {
    console.error("Error fetching overrides:", error);
    return {};
  }

  const overrides: OverridesByVideo = {};
  
  for (const row of data || []) {
    overrides[row.video_id] = {
      views: row.views,
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      saves: row.saves,
      reach: row.reach,
      impressions: row.impressions,
      audience: row.audience_data,
    };
  }

  return overrides;
}

/**
 * Upserts a single override.
 */
export async function upsertOverride(campaignId: string, videoId: string, override: Partial<ReportVideoOverride>): Promise<boolean> {
  const { error } = await supabase
    .from("reporting_overrides")
    .upsert(
      {
        campaign_id: campaignId,
        video_id: videoId,
        views: override.views,
        likes: override.likes,
        comments: override.comments,
        shares: override.shares,
        saves: override.saves,
        reach: override.reach,
        impressions: override.impressions,
        audience_data: override.audience,
        updated_at: new Date().toISOString()
      },
      { onConflict: "campaign_id, video_id" }
    );

  if (error) {
    console.error("Error upserting override:", error);
    return false;
  }
  return true;
}

/**
 * Upserts multiple overrides for a campaign.
 */
export async function upsertManyOverrides(campaignId: string, overrides: OverridesByVideo): Promise<boolean> {
  const rows = Object.entries(overrides).map(([videoId, override]) => ({
    campaign_id: campaignId,
    video_id: videoId,
    views: override.views,
    likes: override.likes,
    comments: override.comments,
    shares: override.shares,
    saves: override.saves,
    reach: override.reach,
    impressions: override.impressions,
    audience_data: override.audience,
    updated_at: new Date().toISOString()
  }));

  if (rows.length === 0) return true;

  const { error } = await supabase
    .from("reporting_overrides")
    .upsert(rows, { onConflict: "campaign_id, video_id" });

  if (error) {
    console.error("Error upserting multiple overrides:", error);
    return false;
  }
  return true;
}

/**
 * Clears all overrides for a campaign.
 */
export async function clearAllOverrides(campaignId: string): Promise<boolean> {
  const { error } = await supabase
    .from("reporting_overrides")
    .delete()
    .eq("campaign_id", campaignId);

  if (error) {
    console.error("Error clearing overrides:", error);
    return false;
  }
  return true;
}
