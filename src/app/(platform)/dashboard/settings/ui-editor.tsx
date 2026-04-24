"use client";

import React, { useState } from "react";
import { Campaign } from "@/models/campaign.types";
import { useReportingOverrides } from "@/providers/reporting-overrides.provider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UIEditor({ campaign }: { campaign: Campaign }) {
  const { overrides, setOverride, clearAll, saveOverridesToDatabase, clearAllFromDatabase, isLoading } = useReportingOverrides();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Extract all deliverables into a flat list
  const deliverables = campaign.selectedCreators?.flatMap(c => 
    c.deliverables?.map(d => ({ ...d, creatorId: c.creatorId })) || []
  ) || [];

  const handleInputChange = (videoId: string, field: string, value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    setOverride(videoId, { [field]: numValue });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Push only the overrides that pertain to the deliverables in this campaign
    // (Or we can push all local overrides, but it's cleaner to push all since they are filtered by videoId locally anyway)
    // Actually, to be perfectly clean, we can just push all overrides we currently hold. 
    // Wait, the API upserts based on campaign_id, so pushing all is fine.
    const success = await saveOverridesToDatabase(campaign.id, overrides);
    setIsSaving(false);
    
    if (success) {
      toast({
        title: "Overrides Saved",
        description: "Manual overrides have been permanently applied to the reporting dashboard.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save overrides to Supabase.",
        variant: "destructive",
      });
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    const success = await clearAllFromDatabase(campaign.id);
    setIsClearing(false);
    
    if (success) {
      clearAll();
      toast({
        title: "Overrides Cleared",
        description: "All manual metrics have been reset to dynamic defaults.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to clear overrides from Supabase.",
        variant: "destructive",
      });
    }
  };

  if (deliverables.length === 0) {
    return (
      <Card className="p-8 text-center text-slate-500 rounded-3xl bg-white border-slate-200">
        No deliverables found for this campaign.
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="font-semibold text-slate-900">Manual Data Entry</h3>
          <p className="text-sm text-slate-500">Edit metrics for individual deliverables.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClear} disabled={isClearing || isSaving} className="text-slate-600">
            {isClearing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />} 
            Reset All
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isClearing} className="bg-slate-900 hover:bg-slate-800 text-white">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
            Save Changes
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[200px]">Creator / Platform</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Shares</TableHead>
              <TableHead>Saves</TableHead>
              <TableHead>Reach</TableHead>
              <TableHead>Impressions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliverables.map(del => {
              const o = overrides[del.id] || {};
              return (
                <TableRow key={del.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{del.creatorId}</div>
                    <div className="text-xs text-slate-500 capitalize">{del.platform}</div>
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      placeholder="Auto" 
                      value={o.views ?? ""} 
                      onChange={(e) => handleInputChange(del.id, "views", e.target.value)}
                      className="w-24 bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      placeholder="Auto" 
                      value={o.likes ?? ""} 
                      onChange={(e) => handleInputChange(del.id, "likes", e.target.value)}
                      className="w-24 bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      placeholder="Auto" 
                      value={o.comments ?? ""} 
                      onChange={(e) => handleInputChange(del.id, "comments", e.target.value)}
                      className="w-24 bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      placeholder="Auto" 
                      value={o.shares ?? ""} 
                      onChange={(e) => handleInputChange(del.id, "shares", e.target.value)}
                      className="w-24 bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      placeholder="Auto" 
                      value={o.saves ?? ""} 
                      onChange={(e) => handleInputChange(del.id, "saves", e.target.value)}
                      className="w-24 bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      placeholder="Auto" 
                      value={o.reach ?? ""} 
                      onChange={(e) => handleInputChange(del.id, "reach", e.target.value)}
                      className="w-24 bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      placeholder="Auto" 
                      value={o.impressions ?? ""} 
                      onChange={(e) => handleInputChange(del.id, "impressions", e.target.value)}
                      className="w-24 bg-white"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
