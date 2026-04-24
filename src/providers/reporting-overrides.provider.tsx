"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

import { fetchOverrides, upsertManyOverrides, clearAllOverrides } from "@/services/api/reporting-overrides";

export type ReportVideoOverride = {
  // Engagement
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  watchTimeHours?: number;
  // Reach
  reach?: number;
  impressions?: number;
  followsGained?: number;
  profileVisits?: number;
  linkClicks?: number;
  // Audience
  audience?: {
    ageBuckets?: Record<"13-17" | "18-24" | "25-34" | "35-44" | "45+", number>;
    gender?: { female?: number; male?: number; other?: number };
    geo?: Record<string, number>;
  };
};

export type OverridesByVideo = Record<string, ReportVideoOverride>;

type ReportingOverridesContextType = {
  overrides: OverridesByVideo;
  isLoading: boolean;
  
  // Local state modifiers (for drafts and optimistic UI)
  setOverride: (videoId: string, override: Partial<ReportVideoOverride>) => void;
  setManyOverrides: (newOverrides: OverridesByVideo) => void;
  clearOverride: (videoId: string) => void;
  clearAll: () => void;
  
  // Database synchronization
  loadOverrides: (campaignId: string) => Promise<void>;
  saveOverridesToDatabase: (campaignId: string, overridesToSave: OverridesByVideo) => Promise<boolean>;
  clearAllFromDatabase: (campaignId: string) => Promise<boolean>;
};

const ReportingOverridesContext = createContext<ReportingOverridesContextType | null>(null);

export function ReportingOverridesProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<OverridesByVideo>({});
  const [isLoading, setIsLoading] = useState(false);
  // Keep track of the currently loaded campaign to avoid redundant fetches
  const [loadedCampaignId, setLoadedCampaignId] = useState<string | null>(null);

  // Local State: Update a single override
  const setOverride = useCallback((videoId: string, override: Partial<ReportVideoOverride>) => {
    setOverrides((prev) => {
      const existing = prev[videoId] || {};
      
      // Shallow merge the main properties, but deeply merge audience if present
      let mergedAudience = existing.audience;
      if (override.audience) {
        mergedAudience = {
          ...existing.audience,
          ...override.audience,
        };
        // Deep merge sub-objects if they exist
        if (override.audience.ageBuckets) {
          mergedAudience.ageBuckets = { ...(existing.audience?.ageBuckets || {}), ...override.audience.ageBuckets };
        }
        if (override.audience.gender) {
          mergedAudience.gender = { ...(existing.audience?.gender || {}), ...override.audience.gender };
        }
        if (override.audience.geo) {
          mergedAudience.geo = { ...(existing.audience?.geo || {}), ...override.audience.geo };
        }
      }

      return {
        ...prev,
        [videoId]: {
          ...existing,
          ...override,
          audience: mergedAudience,
        },
      };
    });
  }, []);

  // Local State: Update multiple overrides
  const setManyOverrides = useCallback((newOverrides: OverridesByVideo) => {
    setOverrides((prev) => ({ ...prev, ...newOverrides }));
  }, []);

  // Local State: Clear single override
  const clearOverride = useCallback((videoId: string) => {
    setOverrides((prev) => {
      const copy = { ...prev };
      delete copy[videoId];
      return copy;
    });
  }, []);

  // Local State: Clear all overrides
  const clearAll = useCallback(() => {
    setOverrides({});
  }, []);

  // Database: Load overrides for a campaign
  const loadOverrides = useCallback(async (campaignId: string) => {
    if (!campaignId) return;
    
    // If we already loaded this campaign and it matches, we can optionally skip 
    // or we can force refresh. Let's always fetch to ensure freshness.
    setIsLoading(true);
    try {
      const data = await fetchOverrides(campaignId);
      setOverrides(data);
      setLoadedCampaignId(campaignId);
    } catch (error) {
      console.error("Failed to load overrides", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Database: Save overrides for a campaign
  const saveOverridesToDatabase = useCallback(async (campaignId: string, overridesToSave: OverridesByVideo) => {
    if (!campaignId) return false;
    
    setIsLoading(true);
    try {
      const success = await upsertManyOverrides(campaignId, overridesToSave);
      return success;
    } catch (error) {
      console.error("Failed to save overrides", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Database: Clear all overrides for a campaign
  const clearAllFromDatabase = useCallback(async (campaignId: string) => {
    if (!campaignId) return false;
    
    setIsLoading(true);
    try {
      const success = await clearAllOverrides(campaignId);
      if (success) {
        setOverrides({});
      }
      return success;
    } catch (error) {
      console.error("Failed to clear overrides", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ReportingOverridesContext.Provider value={{ 
      overrides, 
      isLoading,
      setOverride, 
      setManyOverrides, 
      clearOverride, 
      clearAll,
      loadOverrides,
      saveOverridesToDatabase,
      clearAllFromDatabase
    }}>
      {children}
    </ReportingOverridesContext.Provider>
  );
}

export function useReportingOverrides() {
  const context = useContext(ReportingOverridesContext);
  if (!context) {
    throw new Error("useReportingOverrides must be used within a ReportingOverridesProvider");
  }
  return context;
}
