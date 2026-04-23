import type { CreatorList, CreatorListMember } from "@/services";
import { mockCampaigns } from "@/models/campaign.types";
import { relativeDate, relativeISO } from "@/models/mock-dates";

export const mockLists: CreatorList[] = mockCampaigns.map((campaign, index) => ({
  id: `mock-list-${campaign.id}`,
  name: campaign.name,
  created_at: relativeDate(-(14 - index * 5)),
  member_count: campaign.selectedCreators.length,
}));

export const mockListMembersById: Record<string, CreatorListMember[]> = Object.fromEntries(
  mockCampaigns.map((campaign, campaignIndex) => [
    `mock-list-${campaign.id}`,
    campaign.selectedCreators.map((creator, creatorIndex) => ({
      id: `mock-member-${campaign.id}-${creator.creatorId}`,
      list_id: `mock-list-${campaign.id}`,
      creator_username: creator.creatorId,
      added_at: relativeISO(-(13 - campaignIndex * 5 - creatorIndex)),
    })),
  ])
);

export const mockCampaignCreatorUsernames = Array.from(
  new Set(
    mockCampaigns.flatMap((campaign) =>
      campaign.selectedCreators.map((creator) => creator.creatorId)
    )
  )
);
