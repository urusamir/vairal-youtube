"use client";
import { useMemo, useState, useEffect, memo, useCallback } from "react";
import { useRouter } from 'next/navigation';
// wouter imports originally here: useLocation
import { formatDisplayDate } from "@/utils/format";
import { usePrefetchedData } from "@/providers/prefetch.provider";
import { useDummyData } from "@/providers/dummy-data.provider";
import { updateCampaign, mockCampaigns, mockTrackingData } from "@/models/campaign.types";
import { creatorsData } from "@/models/creators.data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Check, X, Search, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCampaignTracking, upsertDeliverableTracking, DeliverableTracking } from "@/services/api/tracking";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FeaturePageHeader } from "@/components/layout/feature-page-header";
import { CreatorAvatar } from "@/components/creators/creator-avatar";

// --- START Track KPI Cell Component ---
function KPIWeekCell({ initialViews, onSave }: { initialViews: number, onSave: (val: number) => void }) {
  const [val, setVal] = useState(initialViews.toString());
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    if (isSaved) {
      setVal(initialViews.toString());
    }
  }, [initialViews, isSaved]);

  return (
    <div className="flex items-center gap-1 w-full justify-center">
      <Input
        value={val}
        onChange={(e) => {
          // Allow only numbers
          const newVal = e.target.value.replace(/[^0-9]/g, '');
          setVal(newVal);
          setIsSaved(false);
        }}
        className="h-8 w-16 rounded-md border-border bg-background px-1 text-center text-xs text-foreground"
        type="text"
        inputMode="numeric"
        placeholder="0"
      />
      {!isSaved && (
        <button
          onClick={() => {
            onSave(Number(val) || 0);
            setIsSaved(true);
          }}
          className="text-emerald-400 hover:text-emerald-300 rounded-full hover:bg-emerald-500/10 p-1 transition-colors"
          title="Save Views"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
// --- END Track KPI Cell Component ---

// --- Memoized Row Component ---
const TrackingRow = memo(({ 
  item, 
  trackingData, 
  handleLiveUrlUpdate, 
  updateLocalTracking, 
  handleUpdateKPI, 
  saveTrackingData,
  weeks
}: { 
  item: any, 
  trackingData: any, 
  handleLiveUrlUpdate: any, 
  updateLocalTracking: any, 
  handleUpdateKPI: any,
  saveTrackingData: any,
  weeks: string[]
}) => {
  const track = trackingData[item.deliverable.id];
  const url = item.deliverable.liveUrl || track?.url || "";
  const metrics = track?.metrics || Array.from({ length: 8 }).map((_, i) => ({ week: i + 1, views: 0 }));
  const scheduledDate = item.deliverable.goLiveOn ? formatDisplayDate(item.deliverable.goLiveOn) : "-";

  return (
    <tr className="border-b border-border hover:bg-white transition-colors">
      <td className="px-5 py-4 border-r border-white/5 align-middle font-medium w-56 truncate">
        <div className="flex items-center gap-3 min-w-0">
          <CreatorAvatar
            username={item.creatorId}
            name={item.creatorName}
            className="w-9 h-9 rounded-full object-cover bg-muted shrink-0"
            fallbackClassName="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0"
          />
          <span className="text-[13px] text-foreground truncate">{item.creatorName}</span>
        </div>
      </td>
      <td className="px-5 py-4 border-r border-white/5 align-middle font-medium w-56">
        <div className="flex flex-col gap-1 overflow-hidden">
          <span className="text-[11px] font-medium text-blue-300 uppercase tracking-wide truncate">
            {item.deliverable.platform} • {item.deliverable.contentType}
          </span>
          <span className="text-[12px] text-muted-foreground line-clamp-1 break-all">
            {item.deliverable.contentDetails || "No description"}
          </span>
        </div>
      </td>
      <td className="px-5 py-4 border-r border-white/5 align-middle w-32">
        <span className="text-[12px] text-muted-foreground">
          {scheduledDate}
        </span>
      </td>
      <td className="px-3 py-4 border-r border-white/5 align-middle w-48">
        <Input 
          placeholder="Paste URL..." 
          className="h-9 rounded-lg border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500"
          value={url}
          onBlur={(e) => {
            if (e.target.value !== item.deliverable.liveUrl) {
              handleLiveUrlUpdate(item.campaignRef, item.deliverable.id, e.target.value);
            }
            saveTrackingData(item.deliverable.id);
          }}
          onChange={(e) => updateLocalTracking(item.campaignId, item.creatorId, item.deliverable.id, { url: e.target.value })}
        />
      </td>
      {weeks.map((week, i) => {
        const views = metrics[i]?.views || 0;
        return (
          <td key={i} className="px-2 py-4 border-r last:border-r-0 border-white/5 align-middle w-28 text-center">
            <KPIWeekCell 
               initialViews={views}
               onSave={(newViews) => handleUpdateKPI(item.campaignId, item.creatorId, item.deliverable.id, i, newViews)}
            />
          </td>
        );
      })}
    </tr>
  );
});

export default function TrackingPage() {
  const prefetched = usePrefetchedData();
  const { showDummy, setShowDummy } = useDummyData();
  const router = useRouter();
  const setLocation = (path: string) => router.push(path);
  const { toast } = useToast();

  const realCampaigns = prefetched.campaigns.filter((c: any) => c.status === "PUBLISHED" || c.status === "DRAFT");
  const activeCampaigns = showDummy ? mockCampaigns.filter((c: any) => c.status === "PUBLISHED" || c.status === "DRAFT") : realCampaigns;
  
  // This controls the master-detail view
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const filteredCampaigns = useMemo(() => {
    if (!selectedCampaignId) return [];
    return activeCampaigns.filter((c: any) => c.id === selectedCampaignId);
  }, [activeCampaigns, selectedCampaignId]);

  const flatDeliverables = useMemo(() => {
    const arr: any[] = [];
    filteredCampaigns.forEach((camp: any) => {
      if (!camp.selectedCreators) return;
      camp.selectedCreators.forEach((c: any) => {
        const creatorObj = creatorsData.find((cr: any) => cr.username === c.creatorId);
        const name = creatorObj?.fullname || creatorObj?.username || c.creatorId;
        (c.deliverables || []).forEach((d: any) => {
          arr.push({
            campaignId: camp.id,
            campaignTitle: camp.name || "Untitled Campaign",
            campaignRef: camp,
            creatorId: c.creatorId,
            creatorName: name,
            deliverable: d,
          });
        });
      });
    });
    return arr;
  }, [filteredCampaigns]);

  const [trackingData, setTrackingData] = useState<Record<string, DeliverableTracking>>({});
  const [loadingTracking, setLoadingTracking] = useState(false);

  // Fetch tracking data only for the selected campaign
  useEffect(() => {
    if (selectedCampaignId) {
      if (showDummy) {
        setTrackingData(mockTrackingData);
        setLoadingTracking(false);
        return;
      }
      setLoadingTracking(true);
      getCampaignTracking(selectedCampaignId)
        .then(results => {
          const map: Record<string, DeliverableTracking> = {};
          results.forEach(item => {
            map[item.deliverable_id] = item;
          });
          setTrackingData(map);
          setLoadingTracking(false);
        })
        .catch(() => setLoadingTracking(false));
    }
  }, [selectedCampaignId, showDummy]);

  const saveTrackingData = async (deliverableId: string, customData?: DeliverableTracking) => {
    const data = customData || trackingData[deliverableId];
    if (data) {
      await upsertDeliverableTracking(data);
    }
  };

  const updateLocalTracking = (campaignId: string, creatorId: string, deliverableId: string, updates: Partial<DeliverableTracking>) => {
    const defaultMetrics = Array.from({ length: 8 }).map((_, i) => ({ week: i + 1, views: 0 }));
    const existing = trackingData[deliverableId] || {
      campaign_id: campaignId,
      creator_id: creatorId,
      deliverable_id: deliverableId,
      url: "",
      metrics: defaultMetrics
    };
    
    const nextItem = { ...existing, ...updates };
    setTrackingData(prev => ({ ...prev, [deliverableId]: nextItem }));
    return nextItem;
  };

  const handleUpdateKPI = (campaignId: string, creatorId: string, deliverableId: string, weekIndex: number, views: number) => {
    const defaultMetrics = Array.from({ length: 8 }).map((_, i) => ({ week: i + 1, views: 0 }));
    const existing = trackingData[deliverableId] || {
      campaign_id: campaignId,
      creator_id: creatorId,
      deliverable_id: deliverableId,
      url: "",
      metrics: defaultMetrics
    };

    const newMetrics = [...existing.metrics];
    if (!newMetrics[weekIndex]) {
       newMetrics[weekIndex] = { week: weekIndex + 1, views: 0 };
    }
    
    newMetrics[weekIndex] = { ...newMetrics[weekIndex], views };

    const updated = updateLocalTracking(campaignId, creatorId, deliverableId, { metrics: newMetrics });
    saveTrackingData(deliverableId, updated); 
  };
  
  const handleLiveUrlUpdate = async (campaignRef: any, deliverableId: string, url: string) => {
    if (!campaignRef) return;
    const updatedCreators = campaignRef.selectedCreators?.map((c: any) => {
      if (!c.deliverables?.some((d: any) => d.id === deliverableId)) return c;
      return {
        ...c,
        deliverables: c.deliverables.map((d: any) => 
          d.id === deliverableId ? { ...d, liveUrl: url } : d
        )
      };
    });
    const success = await updateCampaign(campaignRef.id, { selectedCreators: updatedCreators });
    if (success) {
      window.dispatchEvent(new Event("vairal-campaigns-updated"));
    }
  };

  const WEEKS = Array.from({ length: 8 }, (_, i) => `Week ${i + 1}`);
  const [searchQuery, setSearchQuery] = useState("");

  // ====== MASTER VIEW ======
  if (!selectedCampaignId) {
    const displayedCampaigns = activeCampaigns.filter(c => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="flex flex-col flex-1 h-screen overflow-hidden relative z-10 w-full">
        <div className="flex-none p-6 md:p-8 w-full mb-6">
          <div className="max-w-[1600px] mx-auto w-full">
            <FeaturePageHeader
              title="Tracking Hub"
              description="Track campaign deliverable performance week by week with a consistent reporting workspace."
              actions={
                <div className="flex items-center gap-4 relative w-full md:w-auto flex-wrap justify-end">
                  <div className="flex items-center space-x-2 rounded-xl border border-white/50 bg-white/75 px-5 py-3 shadow-sm backdrop-blur-xl">
                    <Switch
                      id="dummy-data-tracking"
                      checked={showDummy}
                      onCheckedChange={setShowDummy}
                    />
                    <Label htmlFor="dummy-data-tracking" className="text-sm font-medium text-slate-700 cursor-pointer">
                      Preview with data
                    </Label>
                  </div>

                  <div className="relative w-full md:w-80">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input 
                      className="h-11 w-full pl-10" 
                      placeholder="Search campaigns..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              }
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6 w-full max-w-[1600px] mx-auto space-y-4">
          {displayedCampaigns.length === 0 ? (
             <div className="p-12 text-center flex flex-col items-center justify-center rounded-xl bg-muted/10 border border-dashed border-border mt-8">
              <h3 className="text-lg font-medium text-foreground mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                There are no active or draft campaigns matching your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCampaigns.map((camp: any) => {
                const totalDelivs = camp.selectedCreators?.reduce((acc: number, creator: any) => acc + (creator.deliverables?.length || 0), 0) || 0;
                
                return (
                  <Card 
                    key={camp.id} 
                    className="relative flex flex-col overflow-hidden rounded-3xl border-white/50 bg-white/80 p-6 shadow-glass backdrop-blur-xl cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10"
                    onClick={() => setSelectedCampaignId(camp.id)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-emerald-500/0 group-hover:from-blue-500/5 group-hover:to-emerald-500/5 transition-colors duration-500" />
                    <div className="relative z-10 flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-bold text-lg text-foreground line-clamp-1">{camp.name || "Untitled"}</h3>
                        <p className="mt-0.5 text-sm font-medium text-slate-600">{camp.brand || "No Brand"}</p>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white transition-colors group-hover:border-primary group-hover:text-primary">
                         <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                    <div className="relative z-10 mt-auto grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Deliverables</p>
                          <p className="text-lg font-semibold text-foreground">{totalDelivs}</p>
                        </div>
                        <div>
                           <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Creators</p>
                           <p className="text-lg font-semibold text-foreground">{camp.selectedCreators?.length || 0}</p>
                        </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ====== DETAIL VIEW ======
  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden relative z-10 w-full">
      <div className="flex-none p-6 md:p-8 relative z-10 w-full mb-6">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto w-full gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSelectedCampaignId(null)} /* Returns to Master view! */
              className="shrink-0"
              title="Back to Campaigns"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground items-center flex gap-2 line-clamp-1">
                  8-Week Campaign Tracking
                </h1>
              </div>
              <p className="text-sm font-medium text-blue-400 mt-1 line-clamp-1">
                {filteredCampaigns[0]?.name || "Untitled Campaign"} • <span className="text-muted-foreground">{filteredCampaigns[0]?.brand || "No Brand"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 w-full max-w-[1600px] mx-auto">
        {flatDeliverables.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center rounded-xl bg-muted/10 border border-dashed border-border mt-8">
            <h3 className="text-lg font-medium text-foreground mb-2">No deliverables found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              There are no deliverables assigned to creators in this campaign.
            </p>
            <Button onClick={() => setLocation(`/dashboard/campaigns/wizard?id=${selectedCampaignId}&step=3`)}>
              Add Deliverables
            </Button>
          </div>
        ) : loadingTracking ? (
          <div className="flex flex-col items-center justify-center p-12 mt-8 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading campaign tracking data...</p>
          </div>
        ) : (
          <Card className="w-full min-w-[1200px] overflow-visible rounded-3xl border-white/50 bg-white/80 shadow-glass backdrop-blur-xl flex flex-col pb-4">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border bg-white text-[11px] uppercase tracking-wider text-slate-500 shadow-sm">
                  <th className="px-5 py-5 font-semibold text-slate-700 border-r border-border w-56">Creator</th>
                  <th className="px-5 py-5 font-semibold text-slate-700 border-r border-border w-56">Deliverable</th>
                  <th className="px-5 py-5 font-semibold text-slate-700 border-r border-border w-32">Scheduled</th>
                  <th className="px-5 py-5 font-semibold text-slate-700 border-r border-border w-48">Post URL</th>
                  {WEEKS.map(week => (
                    <th key={week} className="px-4 py-5 font-semibold text-slate-700 border-r last:border-r-0 border-slate-200/80 text-center overflow-hidden w-28">{week}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flatDeliverables.map(item => (
                  <TrackingRow 
                    key={item.deliverable.id}
                    item={item}
                    trackingData={trackingData}
                    handleLiveUrlUpdate={handleLiveUrlUpdate}
                    updateLocalTracking={updateLocalTracking}
                    handleUpdateKPI={handleUpdateKPI}
                    saveTrackingData={saveTrackingData}
                    weeks={WEEKS}
                  />
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
