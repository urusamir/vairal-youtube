"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Users, Clock, GripVertical, CalendarDays, MoreVertical } from "lucide-react";
import { CreatorAvatar } from "@/components/creators/creator-avatar";
import { creatorsData } from "@/models/creators.data";
import type { CreatorDeliverable } from "@/models/campaign.types";
import { updateCampaign } from "@/models/campaign.types";
import { toast } from "@/hooks/use-toast";

type ColumnStatus = "Confirmation" | "Shoot" | "Edit" | "Review & Changes" | "Approved & Scheduled" | "Live";

const COLUMNS: { id: ColumnStatus; title: string }[] = [
  { id: "Confirmation", title: "01 Confirmation" },
  { id: "Shoot", title: "02 Shoot" },
  { id: "Edit", title: "03 Edit" },
  { id: "Review & Changes", title: "04 Review & Changes" },
  { id: "Approved & Scheduled", title: "05 Approved & Scheduled" },
  { id: "Live", title: "Live" },
];

export function DeliverablesBoard({ campaign, onUpdate }: { campaign: any, onUpdate: () => void }) {
  // Flatten all deliverables into a single array with creator info attached
  const [deliverables, setDeliverables] = useState<any[]>([]);

  const initializedRef = React.useRef(false);

  useEffect(() => {
    if (!campaign) return;
    // Only reinitialise when the campaign ID changes, not on every object reference update.
    // This preserves optimistic drag-drop state while the save completes in the background.
    const all: any[] = [];
    for (const c of campaign.selectedCreators || []) {
      for (const d of c.deliverables || []) {
        all.push({ ...d, creatorId: c.creatorId });
      }
    }
    setDeliverables(all);
  }, [campaign?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    const destStatus = destination.droppableId as ColumnStatus;

    // Optimistic update
    setDeliverables((prev) => 
      prev.map((d) => 
        d.id === draggableId ? { ...d, status: destStatus } : d
      )
    );

    // Update in campaign selectedCreators
    try {
      const updatedCreators = (campaign.selectedCreators || []).map((c: any) => {
        return {
          ...c,
          deliverables: (c.deliverables || []).map((d: any) => {
            if (d.id === draggableId) {
              return { ...d, status: destStatus };
            }
            return d;
          })
        };
      });

      await updateCampaign(campaign.id, { selectedCreators: updatedCreators });
      onUpdate();
    } catch (e) {
      toast({ title: "Error", description: "Failed to update deliverable status." });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-[600px] items-start">
        {COLUMNS.map((col) => {
          const colItems = deliverables.filter((d) => d.status === col.id);
          
          return (
            <div key={col.id} className="w-80 shrink-0 rounded-xl bg-[#FAF9F5] border border-slate-200 p-4 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">{col.title}</h4>
                <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{colItems.length}</span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 overflow-y-auto space-y-3 min-h-[150px] transition-colors rounded-lg ${snapshot.isDraggingOver ? "bg-slate-100" : ""}`}
                  >
                    {colItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <Card className="p-4 shadow-sm border-slate-200 cursor-grab active:cursor-grabbing hover:border-slate-300 transition-colors bg-white rounded-xl">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <CreatorAvatar 
                                    username={item.creatorId} 
                                    name={creatorsData.find(c => c.username === item.creatorId)?.fullname || item.creatorId} 
                                    className="w-10 h-10 border border-slate-100"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">VOLT EV</span>
                                    <span className="text-[15px] font-bold text-slate-900 leading-tight">
                                      {creatorsData.find(c => c.username === item.creatorId)?.fullname || item.creatorId}
                                    </span>
                                  </div>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-4">
                                {item.platform === "Instagram" && <span className="text-[12px] font-semibold flex items-center gap-1 text-slate-700 bg-slate-50 px-2 py-0.5 rounded-sm"><img src="/instagram.svg" className="w-3.5 h-3.5" alt="IG" onError={(e) => e.currentTarget.style.display='none'}/>1x {item.contentType}</span>}
                                {item.platform === "YouTube" && <span className="text-[12px] font-semibold flex items-center gap-1 text-slate-700 bg-slate-50 px-2 py-0.5 rounded-sm"><img src="/youtube.svg" className="w-3.5 h-3.5" alt="YT" onError={(e) => e.currentTarget.style.display='none'}/>1x {item.contentType}</span>}
                                {item.platform === "TikTok" && <span className="text-[12px] font-semibold flex items-center gap-1 text-slate-700 bg-slate-50 px-2 py-0.5 rounded-sm"><img src="/tiktok.svg" className="w-3.5 h-3.5" alt="TK" onError={(e) => e.currentTarget.style.display='none'}/>1x {item.contentType}</span>}
                              </div>
                              
                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center text-[13px] font-medium text-slate-500">
                                  <CalendarDays className="h-3.5 w-3.5 mr-1.5"/>
                                  {item.submitShootBefore ? new Date(item.submitShootBefore).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : "TBD"}
                                </div>
                                <button className="text-[11px] font-bold text-slate-700 border border-slate-200 rounded-full px-3 py-1 hover:bg-slate-50 transition-colors">
                                  Edit
                                </button>
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
