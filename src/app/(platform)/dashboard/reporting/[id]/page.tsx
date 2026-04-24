"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth.provider";
import { useDummyData } from "@/providers/dummy-data.provider";
import { Campaign, mockCampaigns, readLocalCampaigns } from "@/models/campaign.types";
import { fetchCampaigns } from "@/services";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Download, PlayCircle, Award } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { useReportingOverrides } from "@/providers/reporting-overrides.provider";

// Simple deterministic hash from string
const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Seeded random number between 0 and 1
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return Math.floor(num).toString();
};

const formatCurrency = (num: number) => {
  if (num >= 1000000) return "$" + (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return "$" + (num / 1000).toFixed(1) + "K";
  return "$" + Math.floor(num).toString();
};

// Mock data generator for the chart
const generateChartData = (campaignId: string, startDate?: string) => {
  const seed = hashCode(campaignId);
  const data = [];
  let y = 30000 + seededRandom(seed) * 20000;
  let i = 20000 + seededRandom(seed + 1) * 10000;
  let t = 50000 + seededRandom(seed + 2) * 30000;
  
  const start = startDate ? new Date(startDate) : new Date("2026-02-10");
  
  for (let week = 1; week <= 8; week++) {
    y += Math.sin(week + seededRandom(seed + week)) * 10000 + 5000;
    i += Math.cos(week + seededRandom(seed + week + 1)) * 8000 + 3000;
    t += Math.sin(week * 2 + seededRandom(seed + week + 2)) * 15000 + 8000;
    
    const weekDate = new Date(start);
    weekDate.setDate(weekDate.getDate() + (week - 1) * 7);
    const dateLabel = weekDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    data.push({
      date: dateLabel,
      youtube: Math.max(0, Math.floor(y)),
      instagram: Math.max(0, Math.floor(i)),
      tiktok: Math.max(0, Math.floor(t)),
    });
  }
  return data;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl text-sm">
        <p className="font-semibold text-slate-800 mb-3">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2 mb-1">
            <span className="capitalize text-slate-500 w-20" style={{ color: entry.color }}>{entry.name} :</span>
            <span className="font-semibold" style={{ color: entry.color }}>{(entry.value / 1000).toFixed(0)}K</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { showDummy } = useDummyData();
  const { overrides, loadOverrides, isLoading: isOverridesLoading } = useReportingOverrides();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOverrides(id);
    }
  }, [id, loadOverrides]);

  useEffect(() => {
    const loadCampaign = async () => {
      // Find in mock first if dummy is enabled
      const localMocks = readLocalCampaigns();
      const source = showDummy ? localMocks : await fetchCampaigns(user?.id || "");
      
      let found = source.find(c => c.id === id);
      if (showDummy && !found) {
        found = mockCampaigns.find(c => c.id === id);
      }

      if (found) {
        setCampaign(found);
      }
      setIsLoading(false);
    };
    loadCampaign();
  }, [id, showDummy, user?.id]);

  const chartData = useMemo(() => {
    if (!campaign) return [];
    return generateChartData(campaign.id, campaign.startDate);
  }, [campaign]);

  // Dynamic metrics derived from campaign + overrides
  const dynamicMetrics = useMemo(() => {
    if (!campaign) return null;
    const seed = hashCode(campaign.id);
    const budget = campaign.totalBudget || 50000;
    
    // Scale things by budget (baseline)
    const roas = 2.5 + seededRandom(seed) * 5; // 2.5x to 7.5x
    const emv = budget * roas;
    const baseViews = budget * (10 + seededRandom(seed + 1) * 50);
    const cpm = (budget / baseViews) * 1000;
    
    const thumbnails = [
      "/images/mock/thumbnails/thumbnail_fashion.png",
      "/images/mock/thumbnails/thumbnail_skincare.png",
      "/images/mock/thumbnails/thumbnail_lifestyle.png"
    ];
    let thumbIndex = 0;

    const titleTemplates = [
      "Hands-On: [Campaign]",
      "The Truth About [Campaign]",
      "I Tried [Campaign] So You Don't Have To",
      "[Campaign] — Full Review & Unboxing",
      "Why I Love [Campaign] (Honest Thoughts)",
      "Behind the Scenes: [Campaign]",
      "[Campaign] Test Drive!",
      "My Final Verdict on [Campaign]"
    ];

    // Generate dynamic assets based on selectedCreators
    const assets: any[] = [];
    let totalViews = 0;
    let totalEngagements = 0;
    let totalReach = 0;

    campaign.selectedCreators?.forEach(creator => {
      creator.deliverables?.forEach((del, i) => {
        const dSeed = hashCode(del.id + i);
        const template = titleTemplates[thumbIndex % titleTemplates.length];
        const videoTitle = template.replace("[Campaign]", campaign.name);
        
        // Base numbers
        const baseAViews = baseViews * (0.1 + seededRandom(dSeed) * 0.3); // share of views
        
        // Apply Overrides
        const o = overrides[del.id] || {};
        const aViews = o.views !== undefined ? o.views : baseAViews;
        const aLikes = o.likes !== undefined ? o.likes : aViews * 0.05;
        const aComments = o.comments !== undefined ? o.comments : aViews * 0.005;
        const aShares = o.shares !== undefined ? o.shares : aViews * 0.012;
        const aSaves = o.saves !== undefined ? o.saves : aViews * 0.008;
        const aReach = o.reach !== undefined ? o.reach : aViews * 1.2;
        const aEngagements = aLikes + aComments + aShares + aSaves;

        totalViews += aViews;
        totalEngagements += aEngagements;
        totalReach += aReach;

        assets.push({
          videoId: del.id,
          platform: del.platform,
          title: videoTitle,
          creator: creator.creatorId,
          thumbnail: thumbnails[thumbIndex % thumbnails.length],
          views: formatNumber(aViews),
          likes: formatNumber(aLikes),
          comments: formatNumber(aComments),
          shares: formatNumber(aShares),
          saves: formatNumber(aSaves),
          reach: formatNumber(aReach),
          avgDuration: o.watchTimeHours !== undefined 
            ? `${Math.floor(o.watchTimeHours)}:${Math.floor((o.watchTimeHours % 1) * 60).toString().padStart(2, '0')}`
            : `${Math.floor(2 + seededRandom(dSeed + 1) * 10)}:${Math.floor(10 + seededRandom(dSeed + 2) * 40).toString().padStart(2, '0')}`,
          retention: Math.floor(40 + seededRandom(dSeed + 3) * 40),
          rawViews: aViews,
          rawEng: aEngagements,
          
          // Original values to make UI simpler
          numViews: aViews,
          numLikes: aLikes,
          numComments: aComments,
          numShares: aShares,
          numSaves: aSaves,
          numReach: aReach,
          numImpressions: o.impressions !== undefined ? o.impressions : aReach * 1.5,
          numFollowsGained: o.followsGained !== undefined ? o.followsGained : aViews * 0.001,
          numProfileVisits: o.profileVisits !== undefined ? o.profileVisits : aViews * 0.005,
          numLinkClicks: o.linkClicks !== undefined ? o.linkClicks : aViews * 0.002,
          numWatchTimeHours: o.watchTimeHours !== undefined ? o.watchTimeHours : (aViews * 3) / 60,
          audience: o.audience || {},
        });
        thumbIndex++;
      });
    });

    // Generate dynamic leaderboard
    const leaderMap: Record<string, { views: number, eng: number, count: number }> = {};
    assets.forEach(a => {
      if (!leaderMap[a.creator]) leaderMap[a.creator] = { views: 0, eng: 0, count: 0 };
      leaderMap[a.creator].views += a.rawViews;
      leaderMap[a.creator].eng += a.rawEng;
      leaderMap[a.creator].count += 1;
    });
    
    const leaderboard = Object.keys(leaderMap)
      .map(k => ({
        name: k,
        views: formatNumber(leaderMap[k].views),
        eng: formatNumber(leaderMap[k].eng),
        assets: `${leaderMap[k].count} asset${leaderMap[k].count > 1 ? 's' : ''}`,
        rawViews: leaderMap[k].views
      }))
      .sort((a, b) => b.rawViews - a.rawViews)
      .slice(0, 3)
      .map((item, i) => ({ ...item, medal: ["🥇", "🥈", "🥉"][i] || "" }));

    // Generate Themes
    const allThemes = ["craftsmanship", "design-led", "aspirational", "honest", "patient", "tasteful", "luxury", "accessible", "fun", "innovative", "fresh"];
    const shuffledThemes = [...allThemes].sort((a, b) => 0.5 - seededRandom(seed + hashCode(a)));
    
    const positive = Math.floor(70 + seededRandom(seed + 4) * 20);
    const negative = Math.floor(2 + seededRandom(seed + 5) * 8);
    const neutral = 100 - positive - negative;

    return {
      reach: formatNumber(totalReach),
      views: formatNumber(totalViews),
      engagements: formatNumber(totalEngagements),
      emv: formatCurrency(emv),
      cpm: formatCurrency(cpm),
      roas: roas.toFixed(1) + "×",
      assets: assets.sort((a, b) => b.rawViews - a.rawViews),
      leaderboard,
      sentiment: { positive, neutral, negative },
      themes: shuffledThemes.slice(0, 6)
    };
  }, [campaign, overrides]);

  if (isLoading) {
    return <div className="p-10 text-slate-500">Loading report...</div>;
  }

  if (!campaign) {
    return (
      <div className="p-10">
        <Link href="/dashboard/reporting" className="text-sm text-slate-500 flex items-center mb-8 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> All reports
        </Link>
        <h2 className="text-xl font-medium text-slate-800">Report not found</h2>
      </div>
    );
  }

  const initials = campaign.name.split(" ").slice(0,2).map(n => n[0]).join("").toUpperCase();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <Link href="/dashboard/reporting" className="text-sm text-slate-500 flex items-center mb-8 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> All reports
      </Link>

        {/* Hero Card */}
        <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl p-8 lg:p-12 mb-6 relative overflow-hidden print:break-inside-avoid">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white font-bold tracking-widest text-sm shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                    {campaign.name.split(" ")[0]} · CAMPAIGN REPORT
                  </div>
                  <div className="text-xs text-slate-400">
                    {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jan 10"} 
                    {" – "}
                    {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Mar 15, 2026"}
                  </div>
                </div>
              </div>
              
              <h1 className="font-serif text-4xl lg:text-5xl text-slate-900 mb-4">{campaign.name}</h1>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#10b981] text-white text-xs font-bold uppercase tracking-wider">
                Wrapped
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-3">
                <Button variant="outline" className="bg-white/50 border-slate-200 hover:bg-white text-slate-700">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                <Button 
                  onClick={() => window.print()}
                  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-lg shadow-[#4f46e5]/20"
                >
                  <Download className="w-4 h-4 mr-2" /> Export PDF
                </Button>
              </div>
              <Button variant="ghost" asChild className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 h-8">
                <Link href={`/dashboard/settings?tab=manual&campaign=${campaign.id}`}>
                  Enter data manually
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Metrics Strip */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-2xl mb-12 flex items-center justify-between overflow-x-auto">
          <div className="p-6 px-8 min-w-[150px] border-r border-slate-100 last:border-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Total Reach</div>
            <div className="text-3xl font-light text-slate-800 mb-2">{dynamicMetrics?.reach}</div>
            <div className="text-xs font-medium text-emerald-600">+15% vs goal</div>
          </div>
          <div className="p-6 px-8 min-w-[150px] border-r border-slate-100 last:border-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Total Views</div>
            <div className="text-3xl font-light text-slate-800 mb-2">{dynamicMetrics?.views}</div>
            <div className="text-xs font-medium text-emerald-600">+42% vs goal</div>
          </div>
          <div className="p-6 px-8 min-w-[150px] border-r border-slate-100 last:border-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Engagements</div>
            <div className="text-3xl font-light text-slate-800 mb-2">{dynamicMetrics?.engagements}</div>
            <div className="text-xs font-medium text-emerald-600">+34% vs goal</div>
          </div>
          <div className="p-6 px-8 min-w-[150px] border-r border-slate-100 last:border-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Avg View Duration</div>
            <div className="text-3xl font-light text-slate-800 mb-2">9:42</div>
            <div className="text-xs font-medium text-transparent">_</div>
          </div>
          <div className="p-6 px-8 min-w-[150px] border-r border-slate-100 last:border-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">EMV</div>
            <div className="text-3xl font-light text-slate-800 mb-2">{dynamicMetrics?.emv}</div>
            <div className="text-xs font-medium text-transparent">_</div>
          </div>
          <div className="p-6 px-8 min-w-[150px] border-r border-slate-100 last:border-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Effective CPM</div>
            <div className="text-3xl font-light text-slate-800 mb-2">{dynamicMetrics?.cpm}</div>
            <div className="text-xs font-medium text-transparent">_</div>
          </div>
          <div className="p-6 px-8 min-w-[150px] border-r border-slate-100 last:border-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">ROAS</div>
            <div className="text-3xl font-light text-slate-800 mb-2">{dynamicMetrics?.roas}</div>
            <div className="text-xs font-medium text-emerald-600">+42% vs goal</div>
          </div>
        </Card>

        {/* Chart Section */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-8 mb-12 print:break-inside-avoid">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h3 className="font-serif text-2xl text-slate-900 mb-1">Performance over time</h3>
              <p className="text-sm text-slate-500 font-medium">Daily views by platform</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#ef4444] mr-2"></span>YouTube</div>
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#ec4899] mr-2"></span>Instagram</div>
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#3b82f6] mr-2"></span>TikTok</div>
            </div>
          </div>
          
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorYt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${(val/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tiktok" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTt)" />
                <Area type="monotone" dataKey="instagram" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorIg)" />
                <Area type="monotone" dataKey="youtube" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorYt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Per Asset Performance */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl mb-12 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h3 className="font-serif text-2xl text-slate-900 mb-1">Per-asset performance</h3>
            <p className="text-sm text-slate-500 font-medium">Pulled directly from each platform's analytics API</p>
          </div>
          
          <div className="divide-y divide-slate-100">
            {dynamicMetrics?.assets.length ? dynamicMetrics.assets.map((asset, i) => (
              <div key={i} className="p-6 px-8 flex items-center gap-8 hover:bg-slate-50/50 transition-colors print:break-inside-avoid">
                <div className="relative w-32 h-20 rounded-lg bg-slate-900 shrink-0 overflow-hidden group cursor-pointer">
                  <img src={asset.thumbnail} alt={asset.title} className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/60 via-transparent to-transparent flex items-center justify-center">
                    <PlayCircle className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-md" />
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 bg-black/80 rounded px-1.5 py-0.5 text-[9px] text-white font-bold tracking-wider">{asset.avgDuration}</div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate mb-1 text-base">{asset.title}</h4>
                  <p className="text-sm text-slate-500">@{asset.creator}</p>
                </div>
                
                <div className="w-24 shrink-0">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Views</div>
                  <div className="font-semibold text-slate-800">{asset.views}</div>
                </div>
                
                <div className="w-24 shrink-0">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Likes</div>
                  <div className="font-semibold text-slate-800">{asset.likes}</div>
                </div>
                
                <div className="w-24 shrink-0">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Comments</div>
                  <div className="font-semibold text-slate-800">{asset.comments}</div>
                </div>
                
                <div className="w-24 shrink-0">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Avg Duration</div>
                  <div className="font-semibold text-slate-800">{asset.avgDuration}</div>
                </div>
                
                <div className="w-48 shrink-0">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Retention</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#4f46e5] rounded-full" style={{ width: `${asset.retention}%` }}></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{asset.retention}%</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">No assets reported yet.</div>
            )}
          </div>
        </Card>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
          <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl p-8 lg:col-span-2 print:break-inside-avoid">
            <h3 className="font-serif text-2xl text-slate-900 mb-8 flex items-center">
              <Award className="w-5 h-5 text-[#4f46e5] mr-2" /> Creator leaderboard
            </h3>
            
            <div className="space-y-4">
              {dynamicMetrics?.leaderboard.length ? dynamicMetrics.leaderboard.map((creator, i) => (
                <div key={i} className="flex items-center bg-white rounded-2xl p-4 px-6 border border-slate-100 shadow-sm">
                  <div className="text-2xl mr-4">{creator.medal}</div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 mr-4 flex items-center justify-center font-bold text-slate-600 shrink-0 uppercase">
                    {creator.name.substring(0,2)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">@{creator.name}</div>
                    <div className="text-xs text-slate-500">{creator.assets}</div>
                  </div>
                  <div className="text-right mr-8">
                    <div className="font-bold text-slate-800">{creator.views}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Views</div>
                  </div>
                  <div className="text-right w-16">
                    <div className="font-bold text-slate-800">{creator.eng}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Eng.</div>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-slate-500">No creators found.</div>
              )}
            </div>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-8 print:break-inside-avoid">
            <h3 className="font-serif text-2xl text-slate-900 mb-6">Comment sentiment</h3>
            <p className="text-xs text-slate-500 mb-8 max-w-[200px]">Across the top 1,000 comments on campaign assets</p>
            
            <div className="space-y-6 mb-10">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-600">Positive</span>
                  <span className="font-bold text-slate-800">{dynamicMetrics?.sentiment.positive}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${dynamicMetrics?.sentiment.positive}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-600">Neutral</span>
                  <span className="font-bold text-slate-800">{dynamicMetrics?.sentiment.neutral}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 rounded-full" style={{ width: `${dynamicMetrics?.sentiment.neutral}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-600">Negative</span>
                  <span className="font-bold text-slate-800">{dynamicMetrics?.sentiment.negative}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${dynamicMetrics?.sentiment.negative}%` }}></div>
                </div>
              </div>
            </div>

            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Top Themes</div>
            <div className="flex flex-wrap gap-2">
              {dynamicMetrics?.themes.map((theme, i) => (
                <div key={i} className="px-3 py-1.5 bg-[#FAF8F5] border border-slate-200/60 rounded-full text-xs font-semibold text-slate-700 capitalize">
                  {theme}
                </div>
              ))}
            </div>
          </Card>
        </div>
    </div>
  );
}
