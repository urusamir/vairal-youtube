"use client";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FeaturePageHeader } from "@/components/layout/feature-page-header";
import {
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Activity,
  Award,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  List
} from "lucide-react";
import { creatorsData } from "@/models/creators.data";
import { useAuth } from "@/providers/auth.provider";
import { useDummyData } from "@/providers/dummy-data.provider";
import { mockCampaigns } from "@/models/campaign.types";
import { useRouter } from "next/navigation";

// Stats reflect active campaigns from mockCampaigns
const activeCampaigns = mockCampaigns.filter((c) => c.status === "PUBLISHED");

const dummyStats = [
  { title: "Total Campaigns", value: String(mockCampaigns.length), change: "+100%", up: true, icon: Sparkles, color: "from-blue-500 to-indigo-600" },
  { title: "Active Creators", value: "2", change: "+2", up: true, icon: Users, color: "from-purple-500 to-fuchsia-600" },
  { title: "Total Spend", value: "$25,000", change: "+23%", up: true, icon: DollarSign, color: "from-emerald-400 to-emerald-600" },
  { title: "Avg. ROI", value: "340%", change: "+5%", up: true, icon: TrendingUp, color: "from-amber-400 to-orange-500" },
];

const dummyTopCreators = [
  { name: "Sherin Amara", platform: "Instagram", followers: "12.3M", engagement: "5.2%", avatar: "bg-pink-500" },
  { name: "Ossy Marwah", platform: "Instagram", followers: "9.1M", engagement: "10.1%", avatar: "bg-blue-600" },
  { name: "Al Rafaelo", platform: "Instagram", followers: "3.2M", engagement: "7.4%", avatar: "bg-purple-500" },
  { name: "Ghaith Marwan", platform: "YouTube", followers: "8.5M", engagement: "8.2%", avatar: "bg-rose-500" },
  { name: "Noor Stars", platform: "YouTube", followers: "20.1M", engagement: "6.5%", avatar: "bg-emerald-500" },
];

const STATUS_BADGE: Record<string, { badge: string; label: string }> = {
  PUBLISHED: { badge: "bg-emerald-100 text-emerald-700", label: "Active" },
  DRAFT: { badge: "bg-amber-100 text-amber-700", label: "Draft" },
  FINISHED: { badge: "bg-sky-100 text-sky-700", label: "Finished" },
};

export default function DashboardPage() {
  const { showDummy, setShowDummy } = useDummyData();
  const { profile } = useAuth();

  return (
    <div className="relative p-6 sm:p-10 w-full">

      <div className="relative max-w-7xl mx-auto z-10">
        <FeaturePageHeader
          title="Dashboard"
          description={`Welcome back${profile?.company_name ? `, ${profile.company_name}` : ""}. Track campaign performance, creators, and spend from one place.`}
          titleTestId="text-dashboard-title"
          className="animate-in fade-in slide-in-from-bottom-4 duration-700"
          actions={
            <div className="flex items-center gap-4 rounded-full border border-white/50 bg-white/75 px-5 py-3 shadow-sm backdrop-blur-xl">
              <Eye className="w-5 h-5 text-primary" />
              <Label htmlFor="dummy-toggle" className="cursor-pointer text-sm font-semibold text-slate-700" data-testid="label-dummy-toggle">
                Preview with data
              </Label>
              <Switch
                id="dummy-toggle"
                checked={showDummy}
                onCheckedChange={setShowDummy}
                className="data-[state=checked]:bg-primary"
                data-testid="switch-dummy-data"
              />
            </div>
          }
        />

        {showDummy ? (
          <DummyDataView />
        ) : (
          <EmptyStateView />
        )}
      </div>
    </div>
  );
}

function DummyDataView() {
  const router = useRouter();
  
  // Derived Upcoming Deliverables
  const upcomingDeliverables = mockCampaigns
    .filter(c => c.status === "PUBLISHED" || c.status === "DRAFT")
    .flatMap(c => 
      (c.selectedCreators || []).flatMap(sc => {
        const creator = creatorsData.find(cd => cd.username === sc.creatorId);
        return (sc.deliverables || []).map(d => ({
          ...d,
          campaignName: c.name,
          creatorName: creator?.fullname || sc.creatorId,
          creatorAvatar: creator?.fullname ? creator.fullname.split(" ").map((n) => n[0]).join("").substring(0,2) : sc.creatorId.substring(0, 2).toUpperCase()
        }));
      })
    )
    .filter(d => !!d.submitShootBefore)
    .sort((a, b) => new Date(a.submitShootBefore || 0).getTime() - new Date(b.submitShootBefore || 0).getTime());

  // Derived Recent Activity
  const recentActivity = (() => {
    const activities = [];
    const recentCampaigns = [...mockCampaigns].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    for (let i = 0; i < Math.min(10, recentCampaigns.length); i++) {
      const c = recentCampaigns[i];
      const sc = c.selectedCreators?.[0];
      const creatorName = sc ? (creatorsData.find(cd => cd.username === sc.creatorId)?.fullname || sc.creatorId) : "A creator";
      
      let actionText = "";
      let timeText = "";
      if (i === 0) {
        actionText = `${creatorName} uploaded a new draft for '${c.name}'`;
        timeText = "2h ago";
      } else if (i === 1) {
        actionText = `Brand approved the ${c.name} integration`;
        timeText = "5h ago";
      } else if (i === 2) {
        actionText = `System: ${c.name} crossed milestone views`;
        timeText = "Today";
      } else if (i === 3) {
        actionText = `Agency sent revised contract to ${creatorName}`;
        timeText = "Yesterday";
      } else {
        actionText = `${c.name} status updated to ${c.status}`;
        timeText = "2 days ago";
      }
      
      activities.push({ text: actionText, time: timeText, id: `act-${i}` });
    }
    return activities;
  })();

  return (
    <div className="space-y-8 pb-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dummyStats.map((stat, i) => (
          <div key={stat.title} className={`animate-in fade-in slide-in-from-bottom-8 duration-700 delay-${i * 100}`}>
            <Card className="relative overflow-hidden p-6 bg-white/80 backdrop-blur-xl border-white/50 shadow-glass rounded-3xl group hover:shadow-float transition-all duration-500">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-20`} />
              
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-sm`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-4xl font-black text-slate-800 mb-2">{stat.value}</p>
              
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${stat.up ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {stat.change}
                </span>
                <span className="text-xs font-medium text-slate-400">vs last month</span>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-stretch">
        {/* Campaigns Table */}
        <div className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 flex flex-col">
          <Card className="p-7 bg-white/80 backdrop-blur-xl border-white/50 shadow-glass rounded-3xl flex flex-col flex-1" data-testid="card-campaigns-table">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Active Campaigns
              </h3>
              <button
                className="text-sm font-bold text-primary hover:text-blue-700 transition-colors"
                onClick={() => router.push("/dashboard/campaigns")}
              >
                View All
              </button>
            </div>
            
            <div className="overflow-hidden flex flex-col">
              <div className="overflow-y-auto pr-2 custom-scrollbar max-h-[210px]">
                <table className="w-full relative">
                  <thead className="sticky top-0 bg-white/95 backdrop-blur z-10">
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-4">Campaign</th>
                      <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-4">Status</th>
                      <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-4">Creators</th>
                      <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-4">Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50">
                    {activeCampaigns.map((c) => {
                      const { badge, label } = STATUS_BADGE[c.status] ?? { badge: "bg-slate-100 text-slate-600", label: c.status };
                      const creatorCount = (c.selectedCreators || []).length;
                      const budget = c.currency && c.totalBudget
                        ? `${c.currency === "USD" ? "$" : c.currency + " "}${c.totalBudget.toLocaleString()}`
                        : "—";
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-4 text-sm font-semibold text-slate-700 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white border border-border flex items-center justify-center text-slate-400 group-hover:border-primary group-hover:text-primary transition-colors shrink-0">
                              <MegaphoneIcon className="w-4 h-4" />
                            </div>
                            <span className="truncate max-w-[200px]">{c.name}</span>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${badge}`}>
                              {label}
                            </span>
                          </td>
                          <td className="py-4 text-sm font-medium text-slate-500">{creatorCount}</td>
                          <td className="py-4 text-sm font-medium text-slate-800">{budget}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Creators Sidebar */}
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500 flex flex-col">
          <Card className="p-7 bg-white/80 backdrop-blur-xl border-white/50 shadow-glass rounded-3xl flex flex-col flex-1 h-full" data-testid="card-top-creators">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-purple-500" />
              Top Performers
            </h3>
            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 max-h-[248px]">
              {dummyTopCreators.map((creator, i) => (
                <div key={i} className="flex items-center p-3 -mx-3 rounded-2xl hover:bg-slate-50/50 hover:shadow-sm transition-colors cursor-pointer group">
                  <div className={`w-12 h-12 shrink-0 rounded-2xl ${creator.avatar} flex items-center justify-center text-white text-lg font-bold shadow-sm relative overflow-hidden`}>
                    {creator.name.split(" ").map((n) => n[0]).join("").substring(0,2)}
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 min-w-0 ml-4">
                    <p className="text-sm font-bold text-slate-800 truncate">{creator.name}</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">{creator.platform} • {creator.followers}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-emerald-500">{creator.engagement}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Eng. Rate</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Upcoming Deliverables and Recent Activity Grid */}
      <div className="grid lg:grid-cols-2 gap-8 items-stretch animate-in fade-in slide-in-from-bottom-12 duration-700 delay-700">
        
        {/* Upcoming Deliverables */}
        <Card className="p-7 bg-white/80 backdrop-blur-xl border-white/50 shadow-glass rounded-3xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Upcoming Deliverables
              </h3>
              <p className="text-sm text-slate-500">Next 7 days, across active campaigns</p>
            </div>
          </div>
          
          <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 max-h-[224px]">
            {upcomingDeliverables.length > 0 ? upcomingDeliverables.map((d, i) => (
              <div key={i} className="flex items-center gap-4 p-3 -mx-3 rounded-2xl hover:bg-slate-50/50 hover:shadow-sm transition-colors cursor-pointer group">
                <div className="w-10 h-10 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                  {d.creatorAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{d.contentDetails}</p>
                  <p className="text-xs font-medium text-slate-500 truncate">{d.creatorName} • {d.campaignName}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs font-mono text-slate-500">
                    {d.submitShootBefore ? d.submitShootBefore.split("T")[0] : ""}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                    {d.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-sm text-slate-500 text-center py-6">No upcoming deliverables.</div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-7 bg-white/80 backdrop-blur-xl border-white/50 shadow-glass rounded-3xl flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-blue-500" />
            Recent Activity
          </h3>
          <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 max-h-[224px]">
            {recentActivity.map((act, i) => (
              <div key={act.id} className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">{act.text}</p>
                </div>
                <span className="text-xs font-medium text-slate-400 shrink-0 whitespace-nowrap">{act.time}</span>
              </div>
            ))}
          </div>
        </Card>
        
      </div>
    </div>
  );
}

function EmptyStateView() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {["Total Campaigns", "Active Creators", "Total Spend", "Avg. ROI"].map((title, i) => (
          <div key={title} className={`animate-in fade-in slide-in-from-bottom-8 duration-700 delay-${i * 100}`}>
            <Card className="p-6 bg-white/50 backdrop-blur-xl border-dashed border-2 border-slate-200 shadow-sm rounded-3xl" data-testid={`card-stat-empty-${title.toLowerCase().replace(/\s/g, "-")}`}>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
              <p className="text-3xl font-black text-slate-300">--</p>
            </Card>
          </div>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
        <Card className="p-16 bg-white/80 backdrop-blur-xl border-white/50 shadow-glass rounded-[40px] text-center max-w-3xl mx-auto" data-testid="card-empty-state">
          <div className="w-24 h-24 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-6 shadow-glow relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <BarChart3 className="w-10 h-10 text-primary relative z-10" />
          </div>
          <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Your canvas is blank</h3>
          <p className="text-lg text-slate-500 font-medium max-w-md mx-auto mb-8">
            Start discovering creators and launching your first high-impact campaign today.
          </p>
          <button className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-glow hover:scale-105 hover:bg-blue-600 transition-all duration-300">
            Launch New Campaign
          </button>
        </Card>
      </div>
    </div>
  );
}

// Inline helper icon since it wasn't imported at top
function MegaphoneIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}
