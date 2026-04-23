"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth.provider";
import { useDummyData } from "@/providers/dummy-data.provider";
import { usePrefetchedData } from "@/providers/prefetch.provider";
import { Campaign, mockCampaigns, readLocalCampaigns } from "@/models/campaign.types";
import { fetchCampaigns } from "@/services";
import { FeaturePageHeader } from "@/components/layout/feature-page-header";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BarChart2, ArrowRight } from "lucide-react";

export default function ReportingPage() {
  const { user } = useAuth();
  const { showDummy, setShowDummy } = useDummyData();
  const { campaigns: prefetchedCampaigns } = usePrefetchedData();
  
  const [realCampaigns, setRealCampaigns] = useState<Campaign[]>(prefetchedCampaigns);
  const [localMocks, setLocalMocks] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(prefetchedCampaigns.length === 0 && !!user);

  useEffect(() => {
    setLocalMocks(readLocalCampaigns());
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const data = await fetchCampaigns(user.id);
      setRealCampaigns(data);
      setIsLoading(false);
    };
    load();
  }, [user?.id]);

  const source = showDummy ? localMocks : realCampaigns;
  const isActuallyLoading = isLoading && !showDummy;
  
  // Filter out Drafts, Pending, and Request Sent campaigns.
  const displayCampaigns = useMemo(() => {
    const filtered = source.filter(c => c.status !== "DRAFT" && c.status !== "Pending" && c.status !== "Request Sent");
    // If dummy data is ON but the user's localStorage has no valid campaigns (e.g. they deleted them),
    // we fallback to the raw mockCampaigns so the UI can still be previewed.
    if (showDummy && filtered.length === 0) {
      return mockCampaigns.filter(c => c.status !== "DRAFT" && c.status !== "Pending" && c.status !== "Request Sent");
    }
    return filtered;
  }, [source, showDummy]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <FeaturePageHeader
        title="POST-CAMPAIGN REPORTING"
        description="Every active or wrapped up campaign generates a client-ready report exportable as a PDF."
        actions={
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="flex items-center gap-3 rounded-full border border-white/50 bg-white/75 px-5 py-3 shadow-sm backdrop-blur-xl">
              <Label htmlFor="dummy-toggle-reporting" className="text-sm font-medium text-slate-700">
                Preview with data
              </Label>
              <Switch
                id="dummy-toggle-reporting"
                checked={showDummy}
                onCheckedChange={(val) => setShowDummy(val)}
              />
            </div>
          </div>
        }
      />
      <div className="mt-6">
        {isActuallyLoading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            Loading reports...
          </div>
        ) : displayCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <BarChart2 className="h-16 w-16 mb-4 text-slate-300" />
            <h3 className="text-xl font-bold text-slate-800">No reports available yet</h3>
            <p className="mt-2 text-sm text-center max-w-sm">
              Reports will appear here for your active and finished campaigns. 
              {showDummy ? "" : " Turn on Preview with Data to see examples."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCampaigns.map((c) => {
              const initials = c.name.split(" ").slice(0,2).map(n => n[0]).join("").toUpperCase();
              return (
                <Card key={c.id} className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white font-bold tracking-widest text-sm shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1">{c.name.split(" ")[0] || "BRAND"}</div>
                      <h3 className="font-serif text-lg font-medium text-slate-900 leading-tight truncate">{c.name}</h3>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-500 mb-6 border-b border-slate-100 pb-6">
                    {c.startDate ? new Date(c.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jan 10"} 
                    {" – "}
                    {c.endDate ? new Date(c.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Mar 15, 2026"}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">VIEWS</div>
                      <div className="text-xl font-light text-slate-800">{(Math.random() * 10).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">EMV</div>
                      <div className="text-xl font-light text-slate-800">${(Math.random() * 5).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">ROAS</div>
                      <div className="text-xl font-light text-orange-500">{(Math.random() * 8 + 2).toFixed(1)}x</div>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center text-xs font-medium text-slate-400">
                      <BarChart2 className="w-4 h-4 mr-2" />
                      {c.selectedCreators?.length || 3} assets
                    </div>
                    <Link 
                      href={`/dashboard/reporting/${c.id}`} 
                      className="text-sm font-semibold text-slate-900 flex items-center hover:text-[#4f46e5] transition-colors"
                    >
                      Open report <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
