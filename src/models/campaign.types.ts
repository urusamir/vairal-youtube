import { relativeDate, relativeISO } from "./mock-dates";

export type Deliverable = {
  id: string;
  platform: string;
  contentType: string;
  quantity: number;
  formatNotes?: string;
};

export type CreatorDeliverable = {
  id: string;
  platform: string;
  contentType: string;
  contentDetails: string;
  status: "Confirmation" | "Shoot" | "Edit" | "Review & Changes" | "Approved & Scheduled" | "Live";
  submitShootBefore?: string | null;
  goLiveOn?: string | null;
  liveUrl?: string | null;
};

export type CampaignCreator = {
  creatorId: string;
  status: "Request Sent" | "Pending" | "Confirmed";
  deliverables: CreatorDeliverable[];
};

export type MoodboardItem = {
  id: string;
  url: string;
  thumbnailUrl?: string;
  note?: string;
};

export type CampaignBrief = {
  id: string;
  title: string;
  keyMessages: string[];
  dos: string[];
  donts: string[];
  hashtags: string[];
  mentions: string[];
  referenceLinks: string[];
  deliverables: Deliverable[];
  moodboard?: MoodboardItem[];
};



export type Campaign = {
  id: string;
  name: string;
  brand: string;
  product: string;
  goal: string;
  countries: string[];
  platforms: string[];
  startDate: string;
  endDate: string;
  totalBudget: number;
  currency: string;
  audienceAgeRanges: string[];
  keyMessages: string[];
  dos: string[];
  donts: string[];
  hashtags: string[];
  mentions: string[];
  referenceLinks: string[];
  deliverables: Deliverable[];
  briefs?: CampaignBrief[];
  selectedCreators: CampaignCreator[];
  status: "DRAFT" | "PUBLISHED" | "FINISHED";
  lastStep: number;
  paymentStatus?: "pending" | "completed";
  receiptData?: string | null;
  createdAt: string;
  updatedAt: string;

};

// No localStorage — Supabase is the single source of truth

export const goals = [
  "Brand Awareness",
  "Product Launch",
  "Lead Generation",
  "Sales / Conversions",
  "Content Creation",
  "Event Promotion",
  "App Installs",
  "Community Building",
];

export const platformOptions = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Twitter/X",
  "LinkedIn",
  "Snapchat",
];

export const countries = [
  "United Arab Emirates",
  "Saudi Arabia",
  "United States",
  "United Kingdom",
  "India",
  "Pakistan",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Egypt",
  "Kuwait",
  "Qatar",
  "Bahrain",
  "Oman",
  "Jordan",
];

export const ageRanges = [
  "13-17",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+",
];

export const currencies = [
  { code: "AED", symbol: "د.إ", label: "AED (د.إ)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "PKR", symbol: "₨", label: "PKR (₨)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "SAR", symbol: "﷼", label: "SAR (﷼)" },
];

export const contentTypes = [
  "Story",
  "Reel",
  "Post",
  "Video",
  "Live Stream",
  "Short",
  "Carousel",
  "Blog Post",
  "Podcast Mention",
];

export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function createDefaultCampaign(): Omit<Campaign, "id" | "createdAt" | "updatedAt"> {
  const today = getTodayString();
  return {
    name: "",
    brand: "",
    product: "",
    goal: "",
    countries: [],
    platforms: [],
    startDate: today,
    endDate: today,
    totalBudget: 0,
    currency: "USD",
    audienceAgeRanges: [],
    keyMessages: [""],
    dos: [],
    donts: [],
    hashtags: [],
    mentions: [],
    referenceLinks: [],
    deliverables: [],
    briefs: [
      {
        id: crypto.randomUUID(),
        title: "Brief 1",
        keyMessages: [""],
        dos: [],
        donts: [],
        hashtags: [],
        mentions: [],
        referenceLinks: [],
        deliverables: [],
        moodboard: [],
      }
    ],
    selectedCreators: [],
    status: "DRAFT",
    lastStep: 1,
    paymentStatus: "pending",
  };
}

// ─── LocalStorage helpers for user-created / duplicated campaigns ────────────

const LOCAL_CAMPAIGNS_KEY = "vairal-local-campaigns";

function canUseLs() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readLocalCampaigns(): Campaign[] {
  if (!canUseLs()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_CAMPAIGNS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalCampaigns(campaigns: Campaign[]) {
  if (!canUseLs()) return;
  window.localStorage.setItem(LOCAL_CAMPAIGNS_KEY, JSON.stringify(campaigns));
}

export function addLocalCampaign(campaign: Campaign) {
  const existing = readLocalCampaigns();
  writeLocalCampaigns([campaign, ...existing.filter((c) => c.id !== campaign.id)]);
}

export function removeLocalCampaign(id: string) {
  writeLocalCampaigns(readLocalCampaigns().filter((c) => c.id !== id));
}

export function updateLocalCampaign(id: string, patch: Partial<Campaign>) {
  writeLocalCampaigns(
    readLocalCampaigns().map((c) => (c.id === id ? { ...c, ...patch } : c))
  );
}

/**
 * Fetch a single campaign from Supabase (or mock data).
 * Used by the campaign wizard when editing an existing campaign.
 */
export async function getCampaignAsync(id: string, userId?: string): Promise<Campaign | undefined> {
  // 1. Check static mock campaigns first (for preview mode)
  const mock = mockCampaigns.find((c) => c.id === id);
  if (mock) return mock;

  // 2. Check user-created / duplicated campaigns in localStorage
  const localExtra = readLocalCampaigns().find((c) => c.id === id);
  if (localExtra) return localExtra;

  // Fetch from Supabase
  const { fetchCampaigns } = await import("@/services");
  // We don't know the userId here by default, so we query directly unless provided
  const { supabase } = await import("@/services/supabase");
  
  let query = supabase.from("campaigns").select("*").eq("id", id);
  if (userId) {
    query = query.eq("user_id", userId);
  }
  
  const { data, error } = await query.single();

  if (error || !data) return undefined;

  // Map DB row to Campaign type (reuse the mapper from supabase-data)
  return {
    id: data.id,
    name: data.name,
    brand: data.brand || "",
    product: data.product || "",
    goal: data.goal || "",
    countries: data.countries || [],
    platforms: data.platforms || [],
    startDate: data.start_date || "",
    endDate: data.end_date || "",
    totalBudget: Number(data.total_budget) || 0,
    currency: data.currency || "USD",
    audienceAgeRanges: data.audience_age_ranges || [],
    keyMessages: data.key_messages || [],
    dos: data.dos || [],
    donts: data.donts || [],
    hashtags: data.hashtags || [],
    mentions: data.mentions || [],
    referenceLinks: data.reference_links || [],
    deliverables: data.deliverables || [],
    briefs: data.briefs && Array.isArray(data.briefs) && data.briefs.length > 0 
      ? data.briefs 
      : [{
          id: crypto.randomUUID(),
          title: "Brief 1",
          keyMessages: data.key_messages || [],
          dos: data.dos || [],
          donts: data.donts || [],
          hashtags: data.hashtags || [],
          mentions: data.mentions || [],
          referenceLinks: data.reference_links || [],
          deliverables: data.deliverables || [],
          moodboard: data.moodboard || [],
        }],
    selectedCreators: (data.selected_creators || []).map((c: any) => {
      // Data migration on the fly: Map old status and old phase
      const statusMap: Record<string, any> = {
        "pending": "Pending",
        "confirmed": "Confirmed"
      };
      return {
        creatorId: c.creatorId,
        status: statusMap[c.status] || c.status || "Pending",
        deliverables: c.deliverables || []
      };
    }),
    status: data.status || "DRAFT",
    lastStep: data.last_step || 1,
    paymentStatus: data.payment_status || "pending",
    receiptData: data.receipt_data || null,
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
  };
}

/**
 * Synchronous getter for mock campaigns only (for backward compat).
 */
export function getCampaign(id: string): Campaign | undefined {
  return mockCampaigns.find((c) => c.id === id);
}

export async function createCampaign(data: Omit<Campaign, "id" | "createdAt" | "updatedAt">, userId: string): Promise<Campaign | null> {
  const now = new Date().toISOString();
  const campaign: Campaign = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  const { createCampaignInDb } = await import("@/services");
  const result = await createCampaignInDb(campaign, userId);
  if (!result) return null;

  if (typeof window !== "undefined") {
    if (typeof window !== "undefined") window.dispatchEvent(new Event("vairal-campaigns-updated"));
  }
  return campaign;
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<boolean> {
  const { updateCampaignInDb } = await import("@/services");
  const success = await updateCampaignInDb(id, data);
  if (!success) return false;

  if (typeof window !== "undefined") window.dispatchEvent(new Event("vairal-campaigns-updated"));
  return true;
}

export async function updateCampaignStatus(id: string, status: "DRAFT" | "PUBLISHED" | "FINISHED"): Promise<boolean> {
  const { updateCampaignInDb } = await import("@/services");
  const success = await updateCampaignInDb(id, { status });
  if (!success) return false;

  if (typeof window !== "undefined") window.dispatchEvent(new Event("vairal-campaigns-updated"));
  return true;
}

export async function deleteCampaign(id: string): Promise<boolean> {
  const { deleteCampaignInDb } = await import("@/services");
  const success = await deleteCampaignInDb(id);
  if (!success) return false;

  if (typeof window !== "undefined") window.dispatchEvent(new Event("vairal-campaigns-updated"));
  return true;
}


export const mockCampaigns: Campaign[] = [
  {
    id: "camp-001",
    name: "Summer Glow Collection Launch",
    brand: "Luminara Beauty",
    product: "Vitamin C Serum",
    goal: "Product Launch",
    countries: ["United States", "United Kingdom"],
    platforms: ["Instagram", "TikTok"],
    startDate: "2026-04-18",
    endDate: "2026-05-18",
    totalBudget: 45000,
    currency: "USD",
    audienceAgeRanges: ["18-24", "25-34"],
    keyMessages: ["Highlight the instant glow effect", "Emphasize 100% vegan ingredients", "Use the promo code GLOW20"],
    dos: ["Show the product texture clearly", "Film in natural sunlight", "Mention the 20% discount"],
    donts: ["Do not use filters that alter skin texture", "Do not mention competitor brands"],
    hashtags: ["#SummerGlow", "#LuminaraBeauty", "#VeganSkincare"],
    mentions: ["@luminarabeauty"],
    referenceLinks: ["https://example.com/moodboard/glow"],
    deliverables: [
      { id: "del-001", platform: "Instagram", contentType: "Reel", quantity: 1, formatNotes: "15-30s vertical" },
      { id: "del-002", platform: "TikTok", contentType: "Video", quantity: 1, formatNotes: "Trending audio" }
    ],
    briefs: [
      {
        id: "brief-001",
        title: "Summer Glow Launch Brief",
        keyMessages: ["Highlight the instant glow effect", "Emphasize 100% vegan ingredients", "Use the promo code GLOW20"],
        dos: ["Show the product texture clearly", "Film in natural sunlight", "Mention the 20% discount"],
        donts: ["Do not use filters that alter skin texture", "Do not mention competitor brands"],
        hashtags: ["#SummerGlow", "#LuminaraBeauty", "#VeganSkincare"],
        mentions: ["@luminarabeauty"],
        referenceLinks: ["https://example.com/moodboard/glow"],
        deliverables: [],
      }
    ],
    selectedCreators: [
      {
        creatorId: "sherinsbeauty",
        status: "Confirmed",
        deliverables: [
          { id: "cd-001", platform: "Instagram", contentType: "Reel", contentDetails: "1x Dedicated Reel (Instagram)", status: "Approved & Scheduled", submitShootBefore: "2026-04-10T00:00:00Z" }
        ]
      },
      {
        creatorId: "ossymarwah",
        status: "Confirmed",
        deliverables: [
          { id: "cd-002", platform: "TikTok", contentType: "Video", contentDetails: "1x Dedicated Video (TikTok)", status: "Review & Changes", submitShootBefore: "2026-04-12T00:00:00Z" }
        ]
      }
    ],
    status: "PUBLISHED",
    lastStep: 4,
    paymentStatus: "pending",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-15T12:00:00Z",
  },
  {
    id: "camp-002",
    name: "Tech Nomad Backpack",
    brand: "Nomad Gear",
    product: "V2 Pro Backpack",
    goal: "Sales / Conversions",
    countries: ["United States", "Canada"],
    platforms: ["YouTube", "Instagram"],
    startDate: "2026-05-01",
    endDate: "2026-06-01",
    totalBudget: 60000,
    currency: "USD",
    audienceAgeRanges: ["25-34", "35-44"],
    keyMessages: ["Showcase the 15 pocket organization", "Water-resistant material in action"],
    dos: ["Pack a laptop to show size", "Mention lifetime warranty"],
    donts: ["Do not call it a hiking bag"],
    hashtags: ["#NomadGear", "#TechBackpack"],
    mentions: ["@nomadgear"],
    referenceLinks: [],
    deliverables: [],
    briefs: [
      {
        id: "brief-002",
        title: "Nomad Gear V2 Brief",
        keyMessages: ["Showcase the 15 pocket organization", "Water-resistant material in action"],
        dos: ["Pack a laptop to show size", "Mention lifetime warranty"],
        donts: ["Do not call it a hiking bag"],
        hashtags: ["#NomadGear", "#TechBackpack"],
        mentions: ["@nomadgear"],
        referenceLinks: [],
        deliverables: [],
      }
    ],
    selectedCreators: [
      {
        creatorId: "alrafaelo",
        status: "Confirmed",
        deliverables: [
          { id: "cd-003", platform: "YouTube", contentType: "Video", contentDetails: "1x Integrated YouTube Video", status: "Live", submitShootBefore: "2026-04-25T00:00:00Z", liveUrl: "https://youtube.com/watch?v=123" }
        ]
      }
    ],
    status: "FINISHED",
    lastStep: 4,
    paymentStatus: "completed",
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-05-02T12:00:00Z",
  },
  {
    id: "camp-003",
    name: "Winter Fashion Lookbook",
    brand: "ChicStyle",
    product: "Winter 2026 Line",
    goal: "Brand Awareness",
    countries: ["United Kingdom", "France"],
    platforms: ["Instagram", "TikTok"],
    startDate: "2026-10-01",
    endDate: "2026-11-30",
    totalBudget: 35000,
    currency: "GBP",
    audienceAgeRanges: ["18-24", "25-34"],
    keyMessages: ["Stay warm without sacrificing style"],
    dos: ["Show multiple outfits", "Use trendy transitions"],
    donts: ["No summer backgrounds"],
    hashtags: ["#ChicWinter", "#WinterLookbook"],
    mentions: ["@chicstyle"],
    referenceLinks: [],
    deliverables: [],
    briefs: [
      {
        id: "brief-003",
        title: "Winter Fashion Brief",
        keyMessages: ["Stay warm without sacrificing style"],
        dos: ["Show multiple outfits", "Use trendy transitions"],
        donts: ["No summer backgrounds"],
        hashtags: ["#ChicWinter", "#WinterLookbook"],
        mentions: ["@chicstyle"],
        referenceLinks: [],
        deliverables: [],
      }
    ],
    selectedCreators: [
      {
        creatorId: "sherinsbeauty",
        status: "Confirmed",
        deliverables: [
          { id: "cd-004", platform: "Instagram", contentType: "Reel", contentDetails: "1x Dedicated Reel (Instagram)", status: "Edit", submitShootBefore: "2026-09-20T00:00:00Z" }
        ]
      }
    ],
    status: "PUBLISHED",
    lastStep: 4,
    paymentStatus: "pending",
    createdAt: "2026-04-01T10:00:00Z",
    updatedAt: "2026-04-15T12:00:00Z",
  },
  {
    id: "camp-004",
    name: "Fitness App Launch",
    brand: "FitPro",
    product: "FitPro App",
    goal: "App Installs",
    countries: ["United States", "Australia"],
    platforms: ["TikTok", "Instagram"],
    startDate: "2026-06-01",
    endDate: "2026-07-01",
    totalBudget: 55000,
    currency: "USD",
    audienceAgeRanges: ["18-24", "25-34", "35-44"],
    keyMessages: ["Personalized workout plans", "Track progress easily"],
    dos: ["Show the app UI", "Film a workout using the app"],
    donts: ["Do not mention other fitness apps"],
    hashtags: ["#FitPro", "#FitnessJourney"],
    mentions: ["@fitproapp"],
    referenceLinks: [],
    deliverables: [],
    briefs: [
      {
        id: "brief-004",
        title: "FitPro App Brief",
        keyMessages: ["Personalized workout plans", "Track progress easily"],
        dos: ["Show the app UI", "Film a workout using the app"],
        donts: ["Do not mention other fitness apps"],
        hashtags: ["#FitPro", "#FitnessJourney"],
        mentions: ["@fitproapp"],
        referenceLinks: [],
        deliverables: [],
      }
    ],
    selectedCreators: [
      {
        creatorId: "ossymarwah",
        status: "Confirmed",
        deliverables: [
          { id: "cd-005", platform: "TikTok", contentType: "Video", contentDetails: "1x Dedicated Video (TikTok)", status: "Shoot", submitShootBefore: "2026-05-15T00:00:00Z" }
        ]
      }
    ],
    status: "PUBLISHED",
    lastStep: 4,
    paymentStatus: "pending",
    createdAt: "2026-04-10T10:00:00Z",
    updatedAt: "2026-04-20T12:00:00Z",
  },
  {
    id: "camp-005",
    name: "Eco-Friendly Water Bottle",
    brand: "HydroEco",
    product: "HydroEco Bottle",
    goal: "Brand Awareness",
    countries: ["Germany", "France", "United Kingdom"],
    platforms: ["Instagram", "YouTube"],
    startDate: "2026-07-15",
    endDate: "2026-08-15",
    totalBudget: 25000,
    currency: "EUR",
    audienceAgeRanges: ["18-24", "25-34"],
    keyMessages: ["Keep drinks cold for 24 hours", "Reduce plastic waste"],
    dos: ["Show the bottle in nature", "Mention the insulation"],
    donts: ["No plastic bottles in frame"],
    hashtags: ["#HydroEco", "#EcoFriendly"],
    mentions: ["@hydroeco"],
    referenceLinks: [],
    deliverables: [],
    briefs: [
      {
        id: "brief-005",
        title: "HydroEco Brief",
        keyMessages: ["Keep drinks cold for 24 hours", "Reduce plastic waste"],
        dos: ["Show the bottle in nature", "Mention the insulation"],
        donts: ["No plastic bottles in frame"],
        hashtags: ["#HydroEco", "#EcoFriendly"],
        mentions: ["@hydroeco"],
        referenceLinks: [],
        deliverables: [],
      }
    ],
    selectedCreators: [
      {
        creatorId: "alrafaelo",
        status: "Confirmed",
        deliverables: [
          { id: "cd-006", platform: "YouTube", contentType: "Video", contentDetails: "1x Integrated YouTube Video", status: "Confirmation", submitShootBefore: "2026-06-30T00:00:00Z" }
        ]
      }
    ],
    status: "DRAFT",
    lastStep: 3,
    paymentStatus: "pending",
    createdAt: "2026-04-20T10:00:00Z",
    updatedAt: "2026-04-22T12:00:00Z",
  },
  {
    id: "camp-006",
    name: "Gamer Headset Promo",
    brand: "AudioX",
    product: "Pro G Headset",
    goal: "Sales / Conversions",
    countries: ["United States", "Canada", "United Kingdom"],
    platforms: ["Twitch", "YouTube", "Twitter/X"],
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    totalBudget: 80000,
    currency: "USD",
    audienceAgeRanges: ["18-24", "25-34"],
    keyMessages: ["Immersive 3D audio", "Crystal clear mic", "Use code AUDIOX20"],
    dos: ["Wear the headset during gameplay", "Do a mic test"],
    donts: ["No background noise during mic test"],
    hashtags: ["#AudioX", "#GamingHeadset"],
    mentions: ["@audiox"],
    referenceLinks: [],
    deliverables: [],
    briefs: [
      {
        id: "brief-006",
        title: "AudioX Pro G Brief",
        keyMessages: ["Immersive 3D audio", "Crystal clear mic", "Use code AUDIOX20"],
        dos: ["Wear the headset during gameplay", "Do a mic test"],
        donts: ["No background noise during mic test"],
        hashtags: ["#AudioX", "#GamingHeadset"],
        mentions: ["@audiox"],
        referenceLinks: [],
        deliverables: [],
      }
    ],
    selectedCreators: [
      {
        creatorId: "ossymarwah",
        status: "Confirmed",
        deliverables: [
          { id: "cd-007", platform: "YouTube", contentType: "Video", contentDetails: "1x Dedicated YouTube Video", status: "Shoot", submitShootBefore: "2026-07-15T00:00:00Z" }
        ]
      }
    ],
    status: "PUBLISHED",
    lastStep: 4,
    paymentStatus: "pending",
    createdAt: "2026-04-05T10:00:00Z",
    updatedAt: "2026-04-18T12:00:00Z",
  },
  {
    id: "camp-007",
    name: "Healthy Snacks Campaign",
    brand: "NutriBites",
    product: "Protein Bars",
    goal: "Brand Awareness",
    countries: ["United Arab Emirates", "Saudi Arabia"],
    platforms: ["Instagram", "TikTok"],
    startDate: "2026-05-15",
    endDate: "2026-06-15",
    totalBudget: 20000,
    currency: "AED",
    audienceAgeRanges: ["18-24", "25-34"],
    keyMessages: ["Guilt-free snacking", "High protein, low sugar"],
    dos: ["Show eating the bar", "Mention the nutritional benefits"],
    donts: ["Don't compare to candy bars"],
    hashtags: ["#NutriBites", "#HealthySnacks"],
    mentions: ["@nutribites"],
    referenceLinks: [],
    deliverables: [],
    briefs: [
      {
        id: "brief-007",
        title: "NutriBites Brief",
        keyMessages: ["Guilt-free snacking", "High protein, low sugar"],
        dos: ["Show eating the bar", "Mention the nutritional benefits"],
        donts: ["Don't compare to candy bars"],
        hashtags: ["#NutriBites", "#HealthySnacks"],
        mentions: ["@nutribites"],
        referenceLinks: [],
        deliverables: [],
      }
    ],
    selectedCreators: [
      {
        creatorId: "sherinsbeauty",
        status: "Confirmed",
        deliverables: [
          { id: "cd-008", platform: "Instagram", contentType: "Story", contentDetails: "3x IG Stories (Instagram)", status: "Approved & Scheduled", submitShootBefore: "2026-05-01T00:00:00Z" }
        ]
      }
    ],
    status: "PUBLISHED",
    lastStep: 4,
    paymentStatus: "pending",
    createdAt: "2026-04-12T10:00:00Z",
    updatedAt: "2026-04-19T12:00:00Z",
  },
  {
    id: "camp-008",
    name: "Travel Booking App",
    brand: "Wanderlust",
    product: "Wanderlust App",
    goal: "App Installs",
    countries: ["United States", "United Kingdom", "Australia"],
    platforms: ["TikTok", "Instagram", "YouTube"],
    startDate: "2026-09-01",
    endDate: "2026-10-31",
    totalBudget: 100000,
    currency: "USD",
    audienceAgeRanges: ["25-34", "35-44"],
    keyMessages: ["Book flights and hotels in one place", "Exclusive deals on the app"],
    dos: ["Show screen recording of the app", "Talk about a dream destination"],
    donts: ["Don't mention competitors like Expedia or Booking.com"],
    hashtags: ["#WanderlustApp", "#TravelHacks"],
    mentions: ["@wanderlustapp"],
    referenceLinks: [],
    deliverables: [],
    briefs: [
      {
        id: "brief-008",
        title: "Wanderlust App Brief",
        keyMessages: ["Book flights and hotels in one place", "Exclusive deals on the app"],
        dos: ["Show screen recording of the app", "Talk about a dream destination"],
        donts: ["Don't mention competitors like Expedia or Booking.com"],
        hashtags: ["#WanderlustApp", "#TravelHacks"],
        mentions: ["@wanderlustapp"],
        referenceLinks: [],
        deliverables: [],
      }
    ],
    selectedCreators: [
      {
        creatorId: "alrafaelo",
        status: "Confirmed",
        deliverables: [
          { id: "cd-009", platform: "TikTok", contentType: "Video", contentDetails: "1x Dedicated Video (TikTok)", status: "Confirmation", submitShootBefore: "2026-08-15T00:00:00Z" }
        ]
      }
    ],
    status: "DRAFT",
    lastStep: 2,
    paymentStatus: "pending",
    createdAt: "2026-04-22T10:00:00Z",
    updatedAt: "2026-04-23T12:00:00Z",
  },
  {
    id: "camp-009",
    name: "Smart Home Assistant",
    brand: "HomeAI",
    product: "Home Hub Max",
    goal: "Product Launch",
    countries: ["United States"],
    platforms: ["YouTube"],
    startDate: "2026-11-01",
    endDate: "2026-12-15",
    totalBudget: 150000,
    currency: "USD",
    audienceAgeRanges: ["25-34", "35-44", "45-54"],
    keyMessages: ["Control your entire home with your voice", "New large display"],
    dos: ["Demonstrate turning on lights/music", "Show the display clarity"],
    donts: ["Don't compare to Alexa or Google Home directly"],
    hashtags: ["#HomeAI", "#SmartHome"],
    mentions: ["@homeai"],
    referenceLinks: [],
    deliverables: [],
    briefs: [
      {
        id: "brief-009",
        title: "Home Hub Max Brief",
        keyMessages: ["Control your entire home with your voice", "New large display"],
        dos: ["Demonstrate turning on lights/music", "Show the display clarity"],
        donts: ["Don't compare to Alexa or Google Home directly"],
        hashtags: ["#HomeAI", "#SmartHome"],
        mentions: ["@homeai"],
        referenceLinks: [],
        deliverables: [],
      }
    ],
    selectedCreators: [
      {
        creatorId: "ossymarwah",
        status: "Confirmed",
        deliverables: [
          { id: "cd-010", platform: "YouTube", contentType: "Video", contentDetails: "1x Dedicated YouTube Video", status: "Confirmation", submitShootBefore: "2026-10-15T00:00:00Z" }
        ]
      }
    ],
    status: "DRAFT",
    lastStep: 1,
    paymentStatus: "pending",
    createdAt: "2026-04-23T08:00:00Z",
    updatedAt: "2026-04-23T09:00:00Z",
  },
  {
    id: "camp-010",
    name: "Luxury Watch Campaign",
    brand: "ChronoMaster",
    product: "Elegance Series",
    goal: "Brand Awareness",
    countries: ["United Arab Emirates", "Switzerland"],
    platforms: ["Instagram"],
    startDate: "2026-12-01",
    endDate: "2026-12-31",
    totalBudget: 40000,
    currency: "USD",
    audienceAgeRanges: ["35-44", "45-54", "55+"],
    keyMessages: ["Timeless elegance", "Swiss craftsmanship"],
    dos: ["Wear the watch with formal attire", "Take high-quality macro shots"],
    donts: ["No casual or sportswear outfits"],
    hashtags: ["#ChronoMaster", "#LuxuryWatch"],
    mentions: ["@chronomaster"],
    referenceLinks: [],
    deliverables: [],
    briefs: [
      {
        id: "brief-010",
        title: "Elegance Series Brief",
        keyMessages: ["Timeless elegance", "Swiss craftsmanship"],
        dos: ["Wear the watch with formal attire", "Take high-quality macro shots"],
        donts: ["No casual or sportswear outfits"],
        hashtags: ["#ChronoMaster", "#LuxuryWatch"],
        mentions: ["@chronomaster"],
        referenceLinks: [],
        deliverables: [],
      }
    ],
    selectedCreators: [
      {
        creatorId: "alrafaelo",
        status: "Confirmed",
        deliverables: [
          { id: "cd-011", platform: "Instagram", contentType: "Post", contentDetails: "1x Dedicated Post (Instagram)", status: "Confirmation", submitShootBefore: "2026-11-15T00:00:00Z" }
        ]
      }
    ],
    status: "DRAFT",
    lastStep: 2,
    paymentStatus: "pending",
    createdAt: "2026-04-23T10:00:00Z",
    updatedAt: "2026-04-23T11:00:00Z",
  }
];


export const mockCreatorResults = [
  { id: "creator-1", name: "Sara Al-Rashidi", handle: "@sara.beauty", platform: "Instagram", followers: "45K", engagement: "4.2%", niche: "Beauty", country: "United Arab Emirates" },
  { id: "creator-2", name: "Liam Chen", handle: "@liamcreates", platform: "TikTok", followers: "120K", engagement: "6.8%", niche: "Lifestyle", country: "United States" },
  { id: "creator-4", name: "Fatima Zahra", handle: "@fatimastyle", platform: "Instagram", followers: "32K", engagement: "7.3%", niche: "Fashion", country: "Saudi Arabia" },
  { id: "creator-5", name: "Noor Hijabi", handle: "@noor.modest", platform: "TikTok", followers: "67K", engagement: "5.9%", niche: "Fashion", country: "Kuwait" },
  { id: "creator-6", name: "Tech Wael", handle: "@techwael", platform: "YouTube", followers: "210K", engagement: "3.8%", niche: "Technology", country: "Egypt" },
  { id: "creator-7", name: "Rania Gourmet", handle: "@raniaeats", platform: "Instagram", followers: "55K", engagement: "4.5%", niche: "Food", country: "Jordan" },
  { id: "creator-8", name: "Omar Travels", handle: "@omartravels", platform: "YouTube", followers: "150K", engagement: "4.0%", niche: "Travel", country: "United Arab Emirates" },
];
export const mockTrackingData: Record<string, any> = {
  "del-101": {
    campaign_id: "mock-1",
    creator_id: "sherinsbeauty",
    deliverable_id: "del-101",
    url: "https://instagram.com/p/mock-1/",
    metrics: [
      { week: 1, views: 10500 },
      { week: 2, views: 15200 },
      { week: 3, views: 18000 },
      { week: 4, views: 19100 },
      { week: 5, views: 20500 },
      { week: 6, views: 21000 },
      { week: 7, views: 21500 },
      { week: 8, views: 22000 },
    ]
  },
  "del-201": {
    campaign_id: "mock-1",
    creator_id: "ossymarwah",
    deliverable_id: "del-201",
    url: "https://tiktok.com/@creator/video/mock-2",
    metrics: [
      { week: 1, views: 45000 },
      { week: 2, views: 80000 },
      { week: 3, views: 150000 },
      { week: 4, views: 200000 },
      { week: 5, views: 210000 },
      { week: 6, views: 215000 },
      { week: 7, views: 218000 },
      { week: 8, views: 220000 },
    ]
  },
  "del-301": {
    campaign_id: "mock-2",
    creator_id: "alrafaelo",
    deliverable_id: "del-301",
    url: "https://instagram.com/p/mock-ramadan-1/",
    metrics: [
      { week: 1, views: 18200 },
      { week: 2, views: 26500 },
      { week: 3, views: 31800 },
      { week: 4, views: 35500 },
      { week: 5, views: 37900 },
      { week: 6, views: 40100 },
      { week: 7, views: 42000 },
      { week: 8, views: 43800 },
    ]
  },
  "del-302": {
    campaign_id: "mock-2",
    creator_id: "alrafaelo",
    deliverable_id: "del-302",
    url: "",
    metrics: [
      { week: 1, views: 0 },
      { week: 2, views: 0 },
      { week: 3, views: 0 },
      { week: 4, views: 0 },
      { week: 5, views: 0 },
      { week: 6, views: 0 },
      { week: 7, views: 0 },
      { week: 8, views: 0 },
    ]
  },
  "del-303": {
    campaign_id: "mock-2",
    creator_id: "anas_alshayb",
    deliverable_id: "del-303",
    url: "",
    metrics: [
      { week: 1, views: 0 },
      { week: 2, views: 0 },
      { week: 3, views: 0 },
      { week: 4, views: 0 },
      { week: 5, views: 0 },
      { week: 6, views: 0 },
      { week: 7, views: 0 },
      { week: 8, views: 0 },
    ]
  },
  "del-304": {
    campaign_id: "mock-2",
    creator_id: "cedrabeauty",
    deliverable_id: "del-304",
    url: "",
    metrics: [
      { week: 1, views: 0 },
      { week: 2, views: 0 },
      { week: 3, views: 0 },
      { week: 4, views: 0 },
      { week: 5, views: 0 },
      { week: 6, views: 0 },
      { week: 7, views: 0 },
      { week: 8, views: 0 },
    ]
  }
};
