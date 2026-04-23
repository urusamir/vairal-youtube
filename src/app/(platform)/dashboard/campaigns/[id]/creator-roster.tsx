"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CreatorAvatar } from "@/components/creators/creator-avatar";
import { MoreVertical, MessageSquare, ExternalLink, Trash2, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { creatorsData } from "@/models/creators.data";

export function CreatorRoster({ campaign, onManageCreators }: { campaign: any, onManageCreators: () => void }) {
  const sortedCreators = [...(campaign.selectedCreators || [])];

  return (
    <div className="w-full">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-xl">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Creator Roster</h3>
          <p className="text-sm text-slate-500 mt-1">View and manage all creators involved in the campaign.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onManageCreators} className="shadow-sm">
          Manage Creators
        </Button>
      </div>
      
      {sortedCreators.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-b-xl border border-t-0 border-slate-100">
          <p>No creators added yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-100 overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#FAF9F5]">
              <TableRow>
                <TableHead className="w-[300px] py-4 text-xs font-semibold text-slate-500 tracking-wider">CREATOR</TableHead>
                <TableHead className="py-4 text-xs font-semibold text-slate-500 tracking-wider">DELIVERABLES</TableHead>
                <TableHead className="w-[150px] py-4 text-xs font-semibold text-slate-500 tracking-wider text-right">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCreators.map((c: any, i: number) => {
                const deliverables = c.deliverables || [];
                
                return (
                  <TableRow key={i} className="hover:bg-slate-50/50 align-top">
                    <TableCell className="py-6 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <CreatorAvatar
                          username={c.creatorId || "creator"}
                          name={creatorsData.find(mc => mc.username === c.creatorId)?.fullname || c.creatorId || "Creator"}
                          className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-100"
                        />
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-slate-900">{creatorsData.find(mc => mc.username === c.creatorId)?.fullname || c.creatorId}</span>
                          <span className="text-sm text-slate-500">@{c.creatorId}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 border-b border-slate-100">
                      <div className="flex flex-col gap-3">
                        {deliverables.length === 0 ? (
                          <span className="text-sm text-slate-400">No deliverables assigned</span>
                        ) : (
                          deliverables.map((d: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between group">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#FF5722]" />
                                <span className="text-sm font-medium text-slate-900">
                                  {d.contentDetails || d.contentType} {d.platform && `(${d.platform})`}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {d.status && (
                                  <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                                    d.status === 'Live' ? 'border-green-200 bg-green-50 text-green-700' :
                                    d.status === 'Approved & Scheduled' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                                    'border-slate-200 bg-white text-slate-600'
                                  }`}>
                                    {d.status}
                                  </Badge>
                                )}
                                <span className="text-sm text-slate-500 w-[100px] text-right">
                                  {d.submitShootBefore ? new Date(d.submitShootBefore).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : "TBD"}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 border-b border-slate-100 text-right">
                      <Badge className="bg-[#EBE9E0] text-slate-800 hover:bg-[#EBE9E0]/80 rounded-full px-3 py-1 font-bold shadow-none">
                        {c.status || "Confirmed"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
