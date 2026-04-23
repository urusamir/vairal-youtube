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

// Mock data generator for the chart
const generateChartData = () => {
  const data = [];
  const platforms = ["youtube", "instagram", "tiktok"];
  let y = 30000;
  let i = 20000;
  let t = 50000;
  
  for (let day = 10; day <= 28; day++) {
    // adding some wave patterns
    y += Math.sin(day) * 10000 + 5000;
    i += Math.cos(day) * 8000 + 3000;
    t += Math.sin(day * 2) * 15000 + 8000;
    
    data.push({
      date: `Feb ${day}`,
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
        <p className="font-semibold text-slate-800 mb-3">{label}, 2026</p>
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
  const { isDummyDataEnabled } = useDummyData();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCampaign = async () => {
      // Find in mock first if dummy is enabled
      const localMocks = readLocalCampaigns();
      const source = isDummyDataEnabled ? localMocks : await fetchCampaigns(user?.id || "");
      
      const found = source.find(c => c.id === id);
      if (found) {
        setCampaign(found);
      }
      setIsLoading(false);
    };
    loadCampaign();
  }, [id, isDummyDataEnabled, user?.id]);

  const chartData = useMemo(() => generateChartData(), []);

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
    <div className="flex h-full w-full flex-col bg-[#fdfcfb] overflow-y-auto custom-scrollbar">
      <div className="p-6 lg:p-10 max-w-[1400px] w-full mx-auto">
        <Link href="/dashboard/reporting" className="text-sm text-slate-500 flex items-center mb-8 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> All reports
        </Link>

        {/* Hero Card */}
        <Card className="bg-[#FAF8F5] border-slate-200/60 shadow-sm rounded-3xl p-8 lg:p-12 mb-6 relative overflow-hidden">
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
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/50 border-slate-200 hover:bg-white text-slate-700">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white shadow-lg shadow-orange-500/20">
                <Download className="w-4 h-4 mr-2" /> Export PDF
              </Button>
            </div>
          </div>
        </Card>

        {/* Metrics Strip */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-2xl mb-12 flex items-center justify-between overflow-x-auto">
          <div className="p-6 px-8 min-w-[150px] border-r border-slate-100 last:border-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Total Reach</div>
            <div className="text-3xl font-light text-slate-800 mb-2">18M</div>
            <div className="text-xs font-medium text-emerald-600">+15% vs goal</div>
          </div>
          <div className="p-6 px-8 min-w-[150px] border-r border-slate-100 last:border-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Total Views</div>
            <div className="text-3xl font-light text-slate-800 mb-2">7.1M</div>
            <div className="text-xs font-medium text-emerald-600">+42% vs goal</div>
          </div>
          <div className="p-6 px-8 min-w-[150px] border-r border-slate-100 last:border-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Engagements</div>
            <div className="text-3xl font-light text-slate-800 mb-2">642K</div>
            <div className="text-xs font-medium text-emerald-600">+34% vs goal</div>
          </div>
          <div className="p-6 px-8 min-w-[150px] border-r border-slate-100 last:border-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Avg View Duration</div>
            <div className="text-3xl font-light text-slate-800 mb-2">9:42</div>
            <div className="text-xs font-medium text-transparent">_</div>
          </div>
          <div className="p-6 px-8 min-w-[150px] border-r border-slate-100 last:border-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">EMV</div>
            <div className="text-3xl font-light text-slate-800 mb-2">$2.8M</div>
            <div className="text-xs font-medium text-transparent">_</div>
          </div>
          <div className="p-6 px-8 min-w-[150px] border-r border-slate-100 last:border-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Effective CPM</div>
            <div className="text-3xl font-light text-slate-800 mb-2">$28</div>
            <div className="text-xs font-medium text-transparent">_</div>
          </div>
          <div className="p-6 px-8 min-w-[150px] border-r border-slate-100 last:border-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">ROAS</div>
            <div className="text-3xl font-light text-slate-800 mb-2">6.4×</div>
            <div className="text-xs font-medium text-emerald-600">+42% vs goal</div>
          </div>
        </Card>

        {/* Chart Section */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-8 mb-12">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h3 className="font-serif text-2xl text-slate-900 mb-1">Performance over time</h3>
              <p className="text-sm text-slate-500 font-medium">Daily views by platform</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#f97316] mr-2"></span>YouTube</div>
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#fb923c] mr-2"></span>Instagram</div>
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#3b82f6] mr-2"></span>TikTok</div>
            </div>
          </div>
          
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorYt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
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
                <Area type="monotone" dataKey="instagram" stroke="#fb923c" strokeWidth={2} fillOpacity={1} fill="url(#colorIg)" />
                <Area type="monotone" dataKey="youtube" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorYt)" />
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
            {[
              { title: `${campaign.name} — Hands-On`, creator: "Kenji Watari", views: "1.8M", likes: "96K", comments: "7.2K", avgDuration: "11:18", retention: 62 },
              { title: `The Product I'd Buy With My Own Money`, creator: "Noah Harlow", views: "2.6M", likes: "138K", comments: "11K", avgDuration: "9:54", retention: 58 },
              { title: `${campaign.name} — Cinematic Sequence`, creator: "Elio Romano", views: "1.4M", likes: "88K", comments: "4.8K", avgDuration: "12:42", retention: 66 },
              { title: `${campaign.name} — Reel`, creator: "Kenji Watari", views: "612K", likes: "38K", comments: "1.2K", avgDuration: "0:32", retention: 71 },
              { title: `Behind the scenes — Reel`, creator: "Noah Harlow", views: "588K", likes: "41K", comments: "1.8K", avgDuration: "0:38", retention: 74 }
            ].map((asset, i) => (
              <div key={i} className="p-6 px-8 flex items-center gap-8 hover:bg-slate-50/50 transition-colors">
                <div className="relative w-32 h-20 rounded-lg bg-slate-200 shrink-0 overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/80 to-transparent flex items-center justify-center">
                    <PlayCircle className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/60 rounded px-1.5 py-0.5 text-[9px] text-white font-bold">{asset.avgDuration}</div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate mb-1 text-base">{asset.title}</h4>
                  <p className="text-sm text-slate-500">{asset.creator}</p>
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
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${asset.retention}%` }}></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{asset.retention}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
          <Card className="bg-[#FAF8F5] border-slate-200/60 shadow-sm rounded-3xl p-8 lg:col-span-2">
            <h3 className="font-serif text-2xl text-slate-900 mb-8 flex items-center">
              <Award className="w-5 h-5 text-orange-500 mr-2" /> Creator leaderboard
            </h3>
            
            <div className="space-y-4">
              {[
                { name: "Noah Harlow", views: "3.2M", eng: "216K", assets: "2 assets", medal: "🥇" },
                { name: "Kenji Watari", views: "2.5M", eng: "159K", assets: "2 assets", medal: "🥈" },
                { name: "Elio Romano", views: "1.4M", eng: "102K", assets: "1 asset", medal: "🥉" }
              ].map((creator, i) => (
                <div key={i} className="flex items-center bg-white rounded-2xl p-4 px-6 border border-slate-100 shadow-sm">
                  <div className="text-2xl mr-4">{creator.medal}</div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 mr-4 flex items-center justify-center font-bold text-slate-600 shrink-0">
                    {creator.name.split(" ").map(n=>n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{creator.name}</div>
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
              ))}
            </div>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm rounded-3xl p-8">
            <h3 className="font-serif text-2xl text-slate-900 mb-6">Comment sentiment</h3>
            <p className="text-xs text-slate-500 mb-8 max-w-[200px]">Across the top 1,000 comments on campaign assets</p>
            
            <div className="space-y-6 mb-10">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-600">Positive</span>
                  <span className="font-bold text-slate-800">78%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: "78%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-600">Neutral</span>
                  <span className="font-bold text-slate-800">18%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 rounded-full" style={{ width: "18%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-600">Negative</span>
                  <span className="font-bold text-slate-800">4%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: "4%" }}></div>
                </div>
              </div>
            </div>

            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Top Themes</div>
            <div className="flex flex-wrap gap-2">
              {["craftsmanship", "design-led", "aspirational", "honest", "patient", "tasteful"].map((theme, i) => (
                <div key={i} className="px-3 py-1.5 bg-[#FAF8F5] border border-slate-200/60 rounded-full text-xs font-semibold text-slate-700">
                  {theme}
                </div>
              ))}
            </div>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
