"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FeaturePageHeader } from "@/components/layout/feature-page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/providers/auth.provider";
import { useDummyData } from "@/providers/dummy-data.provider";
import { Campaign, mockCampaigns, readLocalCampaigns } from "@/models/campaign.types";
import { fetchCampaigns } from "@/services/api/campaigns";
import { useReportingOverrides } from "@/providers/reporting-overrides.provider";
import UIEditor from "./ui-editor";
import CSVImport from "./csv-import";

function SettingsContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "manual";
  const defaultCampaignId = searchParams.get("campaign");

  const { user } = useAuth();
  const { showDummy } = useDummyData();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(defaultCampaignId || "");

  const { loadOverrides } = useReportingOverrides();

  useEffect(() => {
    const loadCampaigns = async () => {
      const source = showDummy ? readLocalCampaigns() : await fetchCampaigns(user?.id || "");
      let combined = source;
      if (showDummy) {
        // Add mock campaigns if not present
        mockCampaigns.forEach((mc) => {
          if (!combined.find((c) => c.id === mc.id)) combined.push(mc as any);
        });
      }
      setCampaigns(combined);
      
      if (!selectedCampaignId && combined.length > 0) {
        setSelectedCampaignId(combined[0].id);
      }
    };
    loadCampaigns();
  }, [showDummy, user?.id, selectedCampaignId]);

  useEffect(() => {
    if (selectedCampaignId) {
      loadOverrides(selectedCampaignId);
    }
  }, [selectedCampaignId, loadOverrides]);

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  return (
    <>
      <FeaturePageHeader 
        title="Data Import & Overrides" 
        description="Manually input or upload CSV data to override campaign performance metrics." 
      />

      <div className="mt-8 mb-6 max-w-sm">
        <label className="text-sm font-medium text-slate-700 mb-2 block">Select Campaign</label>
        <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Select a campaign" />
          </SelectTrigger>
          <SelectContent>
            {campaigns.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCampaign ? (
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-6 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="manual" className="rounded-lg px-6 py-2 text-sm">
              Manual Editor
            </TabsTrigger>
            <TabsTrigger value="csv" className="rounded-lg px-6 py-2 text-sm">
              CSV Import
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <UIEditor campaign={selectedCampaign} />
          </TabsContent>
          
          <TabsContent value="csv">
            <CSVImport campaign={selectedCampaign} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-12 text-center text-slate-500 rounded-3xl bg-white border-slate-200">
          Please select a campaign to continue.
        </Card>
      )}
    </>
  );
}

export default function SettingsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <Suspense fallback={<div className="p-10 text-slate-500">Loading settings...</div>}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}


