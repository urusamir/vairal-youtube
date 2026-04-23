"use client";
import React, { useMemo, useState, memo, useCallback, Suspense } from "react";
import { createPortal } from "react-dom";
import { useRouter } from 'next/navigation';
// wouter imports originally here: useLocation
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { updateCampaign, mockCampaigns } from "@/models/campaign.types";
import { creatorsData } from "@/models/creators.data";
import { STATUS_COLUMNS, getStatusClasses, buildFlatDeliverables } from "@/lib/board-utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth.provider";
import { syncCampaignDeliverablesToCalendar } from "@/services/api/calendar";
import { upsertDeliverableTracking } from "@/services/api/tracking";
import { usePrefetchedData } from "@/providers/prefetch.provider";
import { useDummyData } from "@/providers/dummy-data.provider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle2, UserPlus, Users } from "lucide-react";
import { FeaturePageHeader } from "@/components/layout/feature-page-header";
import { CreatorAvatar } from "@/components/creators/creator-avatar";

// --- Memoized Components for Performance ---

const BoardCard = memo(({ item, statusCol, readOnly }: { item: any, statusCol: string, readOnly: boolean }) => {
  return (
    <Draggable draggableId={item.deliverable.id} index={0} isDragDisabled={readOnly}>
      {(dragProvided, dragSnapshot) => {
        const card = (
          <div
            ref={dragProvided.innerRef}
            {...dragProvided.draggableProps}
            {...dragProvided.dragHandleProps}
            className={`w-full max-w-[150px] flex items-center justify-center p-2 rounded-md text-[11px] font-medium leading-tight shadow-sm text-center select-none transition-shadow ${getStatusClasses(statusCol, dragSnapshot.isDragging, readOnly)}`}
            style={{
              ...dragProvided.draggableProps.style,
              ...(dragSnapshot.isDragging
                ? {
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.18), 0 10px 10px -5px rgba(0, 0, 0, 0.12)",
                    zIndex: 1000,
                  }
                : {}),
            }}
          >
            {item.deliverable.contentDetails || "No description"}
          </div>
        );

        if (dragSnapshot.isDragging && typeof document !== "undefined") {
          return createPortal(card, document.body);
        }

        return card;
      }}
    </Draggable>
  );
});

const BoardCell = memo(({ item, statusCol, index, readOnly }: { item: any, statusCol: string, index: number, readOnly: boolean }) => {
  const dropId = `${item.deliverable.id}__${statusCol}`;
  const isCurrentStatus = item.deliverable.status === statusCol;

  return (
    <Droppable droppableId={dropId} direction="vertical" type={`deliv_${item.deliverable.id}`}>
      {(provided, snapshot) => (
        <td 
          ref={provided.innerRef} 
          {...provided.droppableProps}
          className={`p-2 border-r last:border-r-0 border-border align-middle relative transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''} ${index % 2 === 0 ? 'bg-card' : 'bg-muted/5'}`}
        >
          {/* Using min-h to prevent height collapse and centering for visual stability */}
          <div className="flex flex-col gap-2 min-h-[70px] h-full items-center justify-center w-full relative">
            {isCurrentStatus && (
              <BoardCard item={item} statusCol={statusCol} readOnly={readOnly} />
            )}
            <div className="hidden">{provided.placeholder}</div>
          </div>
        </td>
      )}
    </Droppable>
  );
});

const CreatorRow = memo(({ item, readOnly }: { item: any, readOnly: boolean }) => {
  return (
    <tr key={item.deliverable.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors group h-24">
      <td className="px-4 py-3 border-r border-border align-middle font-medium w-56">
        <div className="flex items-center gap-3">
          <CreatorAvatar
            username={item.creatorId}
            name={item.creatorName}
            className="w-9 h-9 rounded-full object-cover bg-muted shrink-0"
            fallbackClassName="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0"
          />
          <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] uppercase font-bold text-primary">{item.campaignName}</span>
          <span className="text-[13px]">{item.creatorName}</span>
          <span className="text-[11px] font-normal text-muted-foreground">
            {item.deliverable.platform} • {item.deliverable.contentType}
          </span>
          {/* Creator status badge — shown when not yet confirmed */}
          {item.creatorStatus !== "Confirmed" && (
            <span className={`mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight ${
              item.creatorStatus === "Request Sent"
                ? "text-yellow-500"
                : "text-blue-500"
            }`}>
              <span className="shrink-0">⚠️</span>
              <span>{item.creatorStatus} — locked past Awaiting Shoot</span>
            </span>
          )}
          </div>
        </div>
      </td>
      {STATUS_COLUMNS.map((statusCol, index) => (
        <BoardCell key={statusCol} item={item} statusCol={statusCol} index={index} readOnly={readOnly} />
      ))}
    </tr>
  );
});

const CampaignStatsHeader = memo(({ campaigns, selectedId }: { campaigns: any[], selectedId: string | null }) => {
  const stats = useMemo(() => {
    const creatorsToStat = selectedId 
      ? campaigns.find((c: any) => c.id === selectedId)?.selectedCreators || []
      : campaigns.flatMap((c: any) => c.selectedCreators || []);

    const total = creatorsToStat.length;
    const confirmed = creatorsToStat.filter((c: any) => (c.status === "Confirmed" || c.status === "confirmed")).length;
    const requestSent = creatorsToStat.filter((c: any) => (c.status === "Request Sent" || c.status === "request_sent")).length;
    const pending = total - confirmed - requestSent;
    return { total, confirmed, requestSent, pending };
  }, [campaigns, selectedId]);

  if (stats.total === 0) return null;

  return (
    <Card className="mb-6 rounded-3xl border-white/50 bg-white/80 p-6 shadow-glass backdrop-blur-xl">
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5">
          <Users className="w-3 h-3" /> {selectedId ? "Campaign Creators" : "Total Active Creators"}
        </span>
        <span className="text-xl font-bold text-foreground leading-none">{stats.total}</span>
      </div>
      <div className="hidden sm:block h-8 w-px bg-white/10 mx-2" />
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-widest text-[#EAB308] font-bold flex items-center gap-1.5">
          <UserPlus className="w-3 h-3" /> Request Sent
        </span>
        <span className="text-xl font-bold text-[#EAB308] leading-none">{stats.requestSent}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-widest text-[#F97316] font-bold flex items-center gap-1.5">
          <Clock className="w-3 h-3" /> Pending
        </span>
        <span className="text-xl font-bold text-[#F97316] leading-none">{stats.pending}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-widest text-[#10B981] font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3" /> Confirmed
        </span>
        <span className="text-xl font-bold text-[#10B981] leading-none">{stats.confirmed}</span>
      </div>
    </div>
    </Card>
  );
});

function BoardPageContent() {
  const prefetched = usePrefetchedData();
  const { showDummy, setShowDummy } = useDummyData();
  const router = useRouter();
  const setLocation = (path: string) => router.push(path);
  const { toast } = useToast();

  const realCampaigns = prefetched.campaigns.filter((c: any) => c.status === "PUBLISHED" || c.status === "DRAFT" || c.status === "FINISHED");
  const displayCampaigns = showDummy ? mockCampaigns.filter((c: any) => c.status === "PUBLISHED" || c.status === "DRAFT" || c.status === "FINISHED") : realCampaigns;
  
  const { user } = useAuth();
  
  const [urlPrompt, setUrlPrompt] = useState<{
    isOpen: boolean;
    deliverableId: string;
    campaign: any;
    updatedCreators: any;
  } | null>(null);
  
  const [liveUrl, setLiveUrl] = useState("");

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const updateCampaignStatus = async (campaignToUpdate: any, updatedCreators: any): Promise<boolean> => {
    if (showDummy) {
      toast({ title: "Mock Mode", description: "Changes are not saved in preview mode" });
      return true;
    }
    const success = await updateCampaign(campaignToUpdate.id, { selectedCreators: updatedCreators });
    if (!success) {
      toast({ title: "Error", description: "Failed to update campaign", variant: "destructive" });
      return false;
    } else {
      if (user?.id) {
         await syncCampaignDeliverablesToCalendar({ ...campaignToUpdate, selectedCreators: updatedCreators }, user.id);
      }
      // Dispatch an event so prefetch state picks it up
      window.dispatchEvent(new Event("vairal-campaigns-updated"));
      return true;
    }
  };

  const flatDeliverables = useMemo(() => {
    const campaignsToUse = selectedCampaignId 
      ? displayCampaigns.filter(c => c.id === selectedCampaignId)
      : displayCampaigns;
    return buildFlatDeliverables(campaignsToUse, creatorsData);
  }, [displayCampaigns, selectedCampaignId]);

  const onDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const destStatus = destination.droppableId.split('__')[1];
    
    const targetItem = flatDeliverables.find(d => d.deliverable.id === draggableId);
    if (!targetItem) return;
    const campaign = targetItem.campaignRef;
    if (campaign.status === "FINISHED") return;
    
    const creatorStatus = campaign.selectedCreators?.find((c: any) => c.creatorId === targetItem.creatorId)?.status;
    if (creatorStatus !== "Confirmed" && destStatus !== "Not Started" && destStatus !== "Awaiting Shoot") {
      toast({
        title: "Action Restricted",
        description: "Creator must be 'Confirmed' before deliverables can proceed past 'Awaiting Shoot'.",
        variant: "destructive",
      });
      return;
    }

    // --- Optimistic Update ---
    // Update local state immediately via dispatching events or triggers
    const updatedCreators = campaign.selectedCreators?.map((c: any) => {
      if (!c.deliverables?.some((d: any) => d.id === draggableId)) return c;
      return {
        ...c,
        deliverables: c.deliverables.map((d: any) => 
          d.id === draggableId ? { ...d, status: destStatus } : d
        )
      };
    });

    if (destStatus === "Live") {
      setUrlPrompt({
        isOpen: true,
        deliverableId: draggableId,
        campaign: campaign,
        updatedCreators: updatedCreators
      });
    } else {
      // Fire and forget (Optimistic)
      updateCampaignStatus(campaign, updatedCreators).catch(err => {
        toast({ title: "Sync Failed", description: "Your changes couldn't be saved to the database. Please refresh.", variant: "destructive" });
      });
    }
  }, [flatDeliverables, updateCampaignStatus, toast]);

  const submitLiveUrl = async () => {
    if (!urlPrompt) return;
    const { campaign, updatedCreators, deliverableId } = urlPrompt;
    
    let validUrl = liveUrl;
    if (validUrl && !validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }
    
    try {
      new URL(validUrl);
      if (validUrl.trim() === "http://" || validUrl.trim() === "https://") throw new Error("Invalid URL");
    } catch(e) {
      toast({ title: "Validation Error", description: "Please enter a valid URL.", variant: "destructive" });
      return;
    }

    // Add the URL to the deliverable
    const finalCreators = updatedCreators.map((c: any) => {
      return {
        ...c,
        deliverables: c.deliverables.map((d: any) => 
          d.id === deliverableId ? { ...d, liveUrl: validUrl } : d
        )
      };
    });
    
    // B1 Fix: Atomic updates - save campaign first before tracking
    const updateSuccess = await updateCampaignStatus(campaign, finalCreators);
    if (!updateSuccess) return;

    const targetItem = flatDeliverables.find(d => d.deliverable.id === deliverableId);
    if (targetItem) {
      await upsertDeliverableTracking({
        campaign_id: campaign.id,
        creator_id: targetItem.creatorId,
        deliverable_id: deliverableId,
        url: validUrl,
        metrics: [],
      });
    }

    setUrlPrompt(null);
    setLiveUrl("");
  };

  // ====== MASTER VIEW ======
  if (!selectedCampaignId) {
    const displayedCampaigns = displayCampaigns.filter((c: any) => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="flex flex-col flex-1 h-screen overflow-hidden relative z-10 w-full">
        <div className="flex-none p-6 md:p-8 w-full mb-6">
          <div className="max-w-[1600px] mx-auto w-full">
            <FeaturePageHeader
              title="Manage"
              description="Manage deliverable status across campaigns with a consistent board view and fast filtering."
              actions={
                <div className="flex items-center gap-4 relative w-full md:w-auto flex-wrap justify-end">
                  <div className="flex items-center space-x-2 rounded-xl border border-white/50 bg-white/75 px-5 py-3 shadow-sm backdrop-blur-xl">
                    <Switch
                      id="dummy-data-execution-master"
                      checked={showDummy}
                      onCheckedChange={setShowDummy}
                    />
                    <Label htmlFor="dummy-data-execution-master" className="text-sm font-medium text-slate-700 cursor-pointer">
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
                There are no active campaigns matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
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
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-blue-600 transition-colors">{camp.name || "Untitled"}</h3>
                           {camp.status === "DRAFT" && (
                             <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 border-blue-500/30 text-blue-400 bg-blue-500/5 uppercase tracking-tighter">Draft</Badge>
                           )}
                        </div>
                        <p className="text-xs text-blue-400/80 font-semibold uppercase tracking-wider">{camp.brand || "No Brand"}</p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/20 transition-all duration-300">
                         <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    
                    <div className="relative z-10 mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/80">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">Deliverables</p>
                          <div className="flex items-end gap-1.5">
                            <span className="text-xl font-bold text-foreground leading-none">{totalDelivs}</span>
                            <span className="text-[10px] text-muted-foreground mb-0.5">Assigned</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">Creators</p>
                           <div className="flex items-end gap-1.5">
                             <span className="text-xl font-bold text-foreground leading-none">{camp.selectedCreators?.length || 0}</span>
                             <span className="text-[10px] text-muted-foreground mb-0.5">Vetted</span>
                           </div>
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
      {/* Header */}
      <div className="flex-none p-6 md:p-8 relative z-10 w-full mb-6">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto w-full gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSelectedCampaignId(null)}
              className="shrink-0"
              title="Back to Campaigns"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground items-center flex gap-2">
                  Manage
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop deliverables to update tracking status
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rounded-xl border border-white/50 bg-white/75 px-5 py-3 shadow-sm backdrop-blur-xl">
            <Switch
              id="dummy-data-execution"
              checked={showDummy}
              onCheckedChange={setShowDummy}
            />
            <Label htmlFor="dummy-data-execution" className="text-sm font-medium text-slate-700 cursor-pointer">
              Preview with data
            </Label>
          </div>
        </div>
      </div>

      {/* Board Scroll Area */}
      <div className="flex-1 overflow-auto p-4 md:p-6 w-full max-w-[1600px] mx-auto">
        {flatDeliverables.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center rounded-xl bg-muted/10 border border-dashed border-border mt-8">
            <h3 className="text-lg font-medium text-foreground mb-2">No deliverables found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              There are no deliverables assigned to creators in any of the active campaigns.
            </p>
            <Button onClick={() => setLocation(`/dashboard/campaigns`)}>
              Go to Campaigns
            </Button>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <CampaignStatsHeader campaigns={displayCampaigns} selectedId={selectedCampaignId} />
            <Card className="w-full h-full min-w-[1000px] overflow-visible rounded-3xl border-white/50 bg-white/80 shadow-glass backdrop-blur-xl flex flex-col">
              <table className="w-full text-left border-collapse text-sm bg-card flex-1 table-fixed">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border bg-white text-[11px] uppercase tracking-wider text-slate-500 shadow-sm">
                    <th className="px-4 py-4 font-semibold border-r border-border w-56 shadow-r shadow-border">Campaign & Creator</th>
                    {STATUS_COLUMNS.map(col => (
                      <th key={col} className="px-4 py-4 font-semibold border-r last:border-r-0 border-border text-center">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {flatDeliverables.map(item => (
                    <CreatorRow key={item.deliverable.id} item={item} readOnly={item.campaignRef.status === "FINISHED"} />
                  ))}
                </tbody>
              </table>
            </Card>

          </DragDropContext>
        )}
      </div>
      
      <Dialog 
        open={urlPrompt?.isOpen || false} 
        onOpenChange={(open) => {
          if (!open) {
            setUrlPrompt(null);
            setLiveUrl("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Live URL</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="live-url">Live Asset URL</Label>
            <Input 
              id="live-url"
              placeholder="https://..." 
              value={liveUrl} 
              onChange={(e) => setLiveUrl(e.target.value)} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This URL will be populated in the tracking page for this deliverable.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUrlPrompt(null)}>Cancel</Button>
            <Button onClick={submitLiveUrl} disabled={!liveUrl}>Save & Go Live</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


export default function BoardPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center p-12"><div className="w-8 h-8 animate-spin border-4 border-blue-500 border-t-transparent rounded-full" /></div>}>
      <BoardPageContent />
    </Suspense>
  );
}
